import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Sparkles } from "lucide-react";

export const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 grid-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
    <div className="container relative pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="max-w-4xl mx-auto text-center animate-float-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/50 text-xs text-muted-foreground mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Live: Tracking 1,284 RBI · SEBI · DPDP updates this month
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
          The AI Compliance Officer
          <br />
          <span className="text-gradient">that never sleeps.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Voice-first legal AI that ingests every regulator update, audits your policies in seconds,
          predicts violations before they happen, and drafts compliant docs on demand.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 px-6">
            Start free audit <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-6 border-border bg-card/50">
            <Mic className="mr-2 w-4 h-4 text-primary" /> Try voice advisor
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-border/50">
          {[
            { v: "98.7%", l: "Audit accuracy" },
            { v: "<2 sec", l: "Violation detection" },
            { v: "₹4.2 Cr", l: "Avg fines avoided" },
            { v: "25+", l: "Regulators tracked" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-2xl md:text-3xl font-bold text-gradient">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice prompt mock */}
      <div className="max-w-2xl mx-auto mt-16 relative">
        <div className="rounded-2xl bg-card-gradient border-gradient shadow-elegant p-6 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse-glow shrink-0">
              <Mic className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">You asked</div>
              <div className="text-sm md:text-base mb-4">"What changed in RBI's KYC master direction last week and what do we need to update?"</div>
              <div className="flex items-center gap-2 text-xs text-primary mb-2">
                <Sparkles className="w-3 h-3" /> LexGuard AI · 1.2s
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                3 amendments detected. Most critical: <span className="text-foreground">Video-KYC retention extended to 10 yrs</span>.
                You have <span className="text-warning">2 policies</span> conflicting. Estimated penalty if unresolved by Jun 30: <span className="text-destructive font-medium">₹25L</span>.
                Auto-draft updated SOP ready.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
