import { AlertTriangle, Sparkles, FileWarning, Bell, TrendingUp, Globe } from "lucide-react";

const updates = [
  { icon: AlertTriangle, reg: "RBI", text: "KYC Master Direction amended — Video-KYC retention extended to 10 years", time: "2h ago", sev: "high" },
  { icon: Bell, reg: "SEBI", text: "ESG disclosure deadline for top 1000 listed entities — Jun 30", time: "5h ago", sev: "med" },
  { icon: FileWarning, reg: "DPDP", text: "Consent Manager rules notified — re-verification required", time: "1d ago", sev: "high" },
  { icon: Sparkles, reg: "MCA", text: "CSR-2 filing window opens for FY25-26", time: "1d ago", sev: "low" },
  { icon: Globe, reg: "GDPR", text: "EU SCC update for cross-border transfers published", time: "2d ago", sev: "low" },
  { icon: TrendingUp, reg: "IRDAI", text: "Bima Sugam onboarding mandatory for all insurers Q3", time: "3d ago", sev: "med" },
  { icon: AlertTriangle, reg: "CERT-In", text: "New incident reporting timeline reduced to 4 hours", time: "4d ago", sev: "high" },
];

const sevClass = (s: string) =>
  s === "high" ? "text-destructive" : s === "med" ? "text-warning" : "text-muted-foreground";

export const UpdatesMarquee = () => {
  // Duplicate for seamless loop
  const items = [...updates, ...updates];
  return (
    <div className="relative w-full bg-card/60 border-b border-border/60 backdrop-blur-xl overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="flex items-center">
        <div className="flex items-center gap-2 px-4 py-2 border-r border-border/60 shrink-0 bg-background/40 z-20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Live Feed</span>
        </div>

        <div className="flex-1 overflow-hidden py-2">
          <div className="flex gap-10 animate-marquee whitespace-nowrap">
            {items.map((u, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs">
                <u.icon className={`w-3.5 h-3.5 ${sevClass(u.sev)}`} />
                <span className="font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px]">
                  {u.reg}
                </span>
                <span className="text-foreground/90">{u.text}</span>
                <span className="text-muted-foreground">· {u.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
