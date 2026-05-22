const regulators = ["RBI", "SEBI", "IRDAI", "MCA", "CERT-In", "DPDP", "GDPR", "HIPAA", "SOC 2", "ISO 27001", "PCI-DSS", "FATF"];

export const Regulators = () => (
  <section id="regulators" className="container py-16 border-y border-border/50">
    <div className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8">
      Continuously synced with regulators across India · US · EU
    </div>
    <div className="flex flex-wrap items-center justify-center gap-3">
      {regulators.map((r) => (
        <div key={r} className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-smooth">
          {r}
        </div>
      ))}
    </div>
  </section>
);
