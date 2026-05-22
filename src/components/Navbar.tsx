import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar = () => (
  <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
    <nav className="container flex items-center justify-between h-16">
      <a href="#" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-card-gradient border-gradient flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <span className="font-semibold text-lg">LexGuard<span className="text-primary">.AI</span></span>
      </a>
      <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        <a href="#dashboard" className="hover:text-foreground transition-colors">Dashboard</a>
        <a href="#regulators" className="hover:text-foreground transition-colors">Regulators</a>
        <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
      </div>
      <div className="flex items-center gap-2">
        <a href="/auth"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button></a>
        <a href="/auth"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
          Get started
        </Button></a>
      </div>
    </nav>
  </header>
);
