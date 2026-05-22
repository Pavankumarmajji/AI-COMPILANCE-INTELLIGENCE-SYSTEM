-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'head', 'member', 'viewer');
CREATE TYPE public.severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.regulator AS ENUM ('RBI', 'SEBI', 'DPDP', 'MCA', 'IRDAI', 'CERT-In', 'GDPR', 'HIPAA', 'OTHER');

-- Companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  country TEXT DEFAULT 'IN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles (separate, per security best practice)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id, role)
);

-- Regulatory updates (PUBLIC regulator data, visible to all signed-in users)
CREATE TABLE public.regulatory_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulator regulator NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  ai_summary TEXT,
  source_url TEXT UNIQUE NOT NULL,
  severity severity DEFAULT 'medium',
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reg_updates_published ON public.regulatory_updates(published_at DESC);
CREATE INDEX idx_reg_updates_regulator ON public.regulatory_updates(regulator);

-- Policies (per company)
CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  ai_analysis JSONB,
  compliance_score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  regulatory_update_id UUID REFERENCES public.regulatory_updates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity severity DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security definer helpers (avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_company(_user_id UUID)
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.profiles WHERE id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND company_id = _company_id AND role = 'admin'
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS: companies
CREATE POLICY "users view own company" ON public.companies FOR SELECT TO authenticated
  USING (id = public.get_user_company(auth.uid()));
CREATE POLICY "authenticated can create company" ON public.companies FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "admins update own company" ON public.companies FOR UPDATE TO authenticated
  USING (public.is_company_admin(auth.uid(), id));

-- RLS: profiles
CREATE POLICY "users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR company_id = public.get_user_company(auth.uid()));
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- RLS: user_roles
CREATE POLICY "users view roles in their company" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR company_id = public.get_user_company(auth.uid()));
CREATE POLICY "admins manage company roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_company_admin(auth.uid(), company_id))
  WITH CHECK (public.is_company_admin(auth.uid(), company_id));
CREATE POLICY "first admin role for new company" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS: regulatory_updates (public to all signed in users; writes via service role only)
CREATE POLICY "all signed-in users read regulatory updates" ON public.regulatory_updates FOR SELECT TO authenticated
  USING (true);

-- RLS: policies
CREATE POLICY "company members view policies" ON public.policies FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "company members create policies" ON public.policies FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "company members update policies" ON public.policies FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "admins delete policies" ON public.policies FOR DELETE TO authenticated
  USING (public.is_company_admin(auth.uid(), company_id));

-- RLS: alerts
CREATE POLICY "company members view alerts" ON public.alerts FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "company members update alerts" ON public.alerts FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.regulatory_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;