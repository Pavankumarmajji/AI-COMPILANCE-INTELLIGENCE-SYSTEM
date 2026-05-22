import {
  Mic, FileSearch, Zap, GitCompare, Calculator, TrendingUp, LayoutDashboard, Search,
  FileText, Bot, Building2, Users, Mail, Lock, Activity, Tag,
  Radio, Bell, CalendarClock, Globe, AlertTriangle,
  UploadCloud, Flame, Plug, Smartphone, Languages,
} from "lucide-react";

const groups = [
  {
    title: "Core AI",
    accent: "from-primary/20 to-transparent",
    items: [
      { icon: Mic, t: "Voice AI Legal Advisor", d: "Ask aloud. Get spoken, cited answers in 1.2s." },
      { icon: FileSearch, t: "Auto-Document Analysis", d: "Drop any policy — AI extracts rules, gaps, risks." },
      { icon: Zap, t: "Instant Violation Detection", d: "Real-time compliance scoring as policies change." },
      { icon: GitCompare, t: "Regulatory Change Impact", d: "What changed, what breaks, what to do — diffed." },
      { icon: Calculator, t: "Auto Penalty Calculator", d: "Severity-weighted fines per RBI/SEBI/DPDP matrices." },
      { icon: TrendingUp, t: "Predictive Risk Intelligence", d: "Forecast future violations before they happen." },
      { icon: LayoutDashboard, t: "Executive Dashboard", d: "Real-time scorecards for the C-suite." },
      { icon: Search, t: "Semantic Smart Search", d: "Find rules by meaning across 50k+ documents." },
      { icon: FileText, t: "Auto Compliance Reports", d: "PDF + Excel with full audit trail, in seconds." },
      { icon: Bot, t: "AI Policy Drafting", d: "Draft compliant policies that match your industry." },
    ],
  },
  {
    title: "Company Management",
    accent: "from-accent/20 to-transparent",
    items: [
      { icon: Building2, t: "Multi-Company Onboarding", d: "Workspaces with confidential data isolation." },
      { icon: Users, t: "Role-Based Access", d: "Admin · Head · Member · Viewer permissions." },
      { icon: Mail, t: "Email Verification + OTP", d: "SMTP-grade auth with one-tap verification." },
      { icon: Lock, t: "End-to-End Encryption", d: "AES-256 at rest, TLS 1.3 in transit." },
      { icon: Activity, t: "Employee Activity Logger", d: "Immutable audit trail of every action." },
      { icon: Tag, t: "Industry Rule Packs", d: "Banking · Healthcare · Tech · Insurance · Manufacturing." },
    ],
  },
  {
    title: "Government & Regulatory",
    accent: "from-warning/20 to-transparent",
    items: [
      { icon: Radio, t: "Auto Government Fetch", d: "Daily ingest from RBI, SEBI, GDPR, MCA, CERT-In." },
      { icon: Bell, t: "Smart Alert System", d: "Email · in-app · Slack notifications, prioritized." },
      { icon: CalendarClock, t: "Deadline Tracker", d: "Never miss a filing window again." },
      { icon: Globe, t: "Multi-Regulation Support", d: "India · US · EU jurisdictions in one workspace." },
      { icon: AlertTriangle, t: "Auto Conflict Resolution", d: "Detects contradictions across your policy stack." },
    ],
  },
  {
    title: "Advanced",
    accent: "from-success/20 to-transparent",
    items: [
      { icon: UploadCloud, t: "Bulk Document Upload", d: "Process 100+ PDFs in parallel." },
      { icon: Flame, t: "Compliance Heatmap", d: "Department-wise risk visualization." },
      { icon: Plug, t: "Public API Access", d: "Plug into HRMS, ERP, ticketing systems." },
      { icon: Smartphone, t: "Mobile-Ready Design", d: "Pixel-perfect on every device." },
      { icon: Languages, t: "Multilingual Voice", d: "English · Hindi today. 12 more coming." },
    ],
  },
];

export const Features = () => (
  <section id="features" className="container py-24">
    <div className="text-center max-w-2xl mx-auto mb-16">
      <div className="text-xs uppercase tracking-widest text-primary mb-3">Platform · 25+ capabilities</div>
      <h2 className="text-4xl md:text-5xl font-bold mb-4">Every compliance workflow, <span className="text-gradient">automated</span>.</h2>
      <p className="text-muted-foreground">From voice queries to bulk audits — one workspace replaces a team of consultants.</p>
    </div>

    <div className="space-y-16">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="flex items-baseline justify-between mb-6">
            <h3 className="text-xl font-semibold">{g.title}</h3>
            <span className="text-xs text-muted-foreground">{g.items.length} features</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {g.items.map((f) => (
              <div key={f.t} className="group relative rounded-xl bg-card-gradient border border-border p-5 hover:border-primary/40 transition-smooth overflow-hidden">
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${g.accent} opacity-0 group-hover:opacity-100 transition-opacity blur-2xl`} />
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center mb-4 group-hover:border-primary/40 transition-smooth">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-medium mb-1.5">{f.t}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);
