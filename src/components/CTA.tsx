import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTA = () => (
  <section id="pricing" className="container py-24">
    <div className="relative rounded-3xl overflow-hidden border-gradient bg-card-gradient p-12 md:p-16 text-center shadow-elegant">
      <div className="absolute inset-0 grid-pattern opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Ship compliant. <span className="text-gradient">Sleep peacefully.</span>
        </h2>
        <p className="text-muted-foreground mb-8">
          Join 200+ regulated startups using LexGuard to stay ahead of every notification, every deadline, every fine.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 px-6">
            Start free 14-day audit <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-6 border-border bg-card/50">
            Talk to compliance expert
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-6">No credit card · SOC 2 Type II · ISO 27001 certified</div>
      </div>
    </div>
  </section>
);
