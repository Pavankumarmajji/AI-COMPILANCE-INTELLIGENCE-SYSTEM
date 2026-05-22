import { TrendingUp, AlertTriangle, CheckCircle2, FileWarning, Activity } from "lucide-react";

const departments = [
  { name: "Finance", risk: 92, color: "bg-success" },
  { name: "HR", risk: 78, color: "bg-success" },
  { name: "Operations", risk: 64, color: "bg-warning" },
  { name: "Data & IT", risk: 41, color: "bg-destructive" },
  { name: "Legal", risk: 88, color: "bg-success" },
  { name: "Marketing", risk: 70, color: "bg-warning" },
];

const alerts = [
  { reg: "RBI", title: "KYC Master Direction · Amendment 2026-04", sev: "High", time: "2h ago" },
  { reg: "SEBI", title: "ESG disclosure deadline approaching", sev: "Medium", time: "5h ago" },
  { reg: "DPDP", title: "Consent flow needs re-verification", sev: "High", time: "1d ago" },
  { reg: "GDPR", title: "EU data transfer SCC update", sev: "Low", time: "2d ago" },
];

export const DashboardPreview = () => (
  <section id="dashboard" className="container py-24">
    <div className="text-center max-w-2xl mx-auto mb-12">
      <div className="text-xs uppercase tracking-widest text-primary mb-3">Inside the platform</div>
      <h2 className="text-4xl md:text-5xl font-bold mb-4">Your compliance war-room.</h2>
      <p className="text-muted-foreground">A real-time view of risk, alerts, and deadlines across every business unit.</p>
    </div>

    <div className="rounded-2xl bg-card-gradient border-gradient shadow-elegant overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background/40">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
          <span className="ml-3">app.lexguard.ai / dashboard</span>
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">Acme FinServ · Banking</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-px bg-border">
        {/* Score */}
        <div className="bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Overall compliance score</div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-5xl font-bold text-gradient">87</span>
                <span className="text-sm text-success flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +4.2 this week</span>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              {[
                { l: "Resolved", v: "142", i: CheckCircle2, c: "text-success" },
                { l: "Open risks", v: "8", i: AlertTriangle, c: "text-warning" },
                { l: "Critical", v: "2", i: FileWarning, c: "text-destructive" },
              ].map((m) => (
                <div key={m.l} className="px-3 py-2 rounded-lg bg-secondary border border-border min-w-[90px]">
                  <div className={`flex items-center gap-1.5 text-xs ${m.c}`}><m.i className="w-3 h-3" />{m.l}</div>
                  <div className="text-xl font-semibold mt-0.5">{m.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Department heatmap
            </div>
            <div className="space-y-2.5">
              {departments.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-muted-foreground shrink-0">{d.name}</div>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.risk}%` }} />
                  </div>
                  <div className="w-10 text-right text-sm font-medium tabular-nums">{d.risk}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-card p-6">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Live regulator alerts</div>
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.title} className="rounded-lg border border-border p-3 hover:border-primary/40 transition-smooth">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{a.reg}</span>
                  <span className={`text-[10px] ${a.sev === "High" ? "text-destructive" : a.sev === "Medium" ? "text-warning" : "text-muted-foreground"}`}>{a.sev}</span>
                </div>
                <div className="text-sm leading-snug mb-1">{a.title}</div>
                <div className="text-[11px] text-muted-foreground">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
