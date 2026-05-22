import { Shield } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/50 mt-12">
    <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <span>LexGuard.AI · © 2026 · Built for regulated businesses.</span>
      </div>
      <div className="flex gap-6">
        <a href="#" className="hover:text-foreground">Privacy</a>
        <a href="#" className="hover:text-foreground">Security</a>
        <a href="#" className="hover:text-foreground">Docs</a>
        <a href="#" className="hover:text-foreground">Status</a>
      </div>
    </div>
  </footer>
);
