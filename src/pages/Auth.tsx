import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { lovable } from "@/integrations/lovable/index";

const signupSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  companyName: z.string().trim().min(2).max(100),
  industry: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (session) return <Navigate to="/app" replace />;

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error("Please check the form fields"); return; }
    setLoading(true);
    const { fullName, companyName, industry, email, password } = parsed.data;

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/app`, data: { full_name: fullName } },
    });
    if (error) { toast.error(error.message); setLoading(false); return; }

    const userId = data.user?.id;
    if (userId) {
      const { data: company, error: cErr } = await supabase
        .from("companies")
        .insert({ name: companyName, industry, country: "IN" })
        .select().single();
      if (cErr) { toast.error(cErr.message); setLoading(false); return; }

      await supabase.from("profiles").update({ company_id: company.id, full_name: fullName }).eq("id", userId);
      await supabase.from("user_roles").insert({ user_id: userId, company_id: company.id, role: "admin" });
    }

    toast.success("Welcome to LexGuard!");
    navigate("/app");
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")), password: String(fd.get("password")),
    });
    if (error) toast.error(error.message);
    else navigate("/app");
    setLoading(false);
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/app` });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card-gradient border-gradient">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">LexGuard.AI</span>
        </div>
        <Tabs defaultValue="login">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="login">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Get started</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div><Label>Email</Label><Input name="email" type="email" required /></div>
              <div><Label>Password</Label><Input name="password" type="password" required /></div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Sign in
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-3">
              <div><Label>Your name</Label><Input name="fullName" required /></div>
              <div><Label>Company name</Label><Input name="companyName" required /></div>
              <div><Label>Industry</Label><Input name="industry" placeholder="Banking, Healthcare..." required /></div>
              <div><Label>Work email</Label><Input name="email" type="email" required /></div>
              <div><Label>Password</Label><Input name="password" type="password" minLength={6} required /></div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create workspace
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogle}>Continue with Google</Button>
      </Card>
    </div>
  );
};

export default Auth;
