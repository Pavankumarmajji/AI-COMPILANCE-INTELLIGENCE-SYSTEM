import { Navbar } from "@/components/Navbar";
import { UpdatesMarquee } from "@/components/UpdatesMarquee";
import { Hero } from "@/components/Hero";
import { Regulators } from "@/components/Regulators";
import { Features } from "@/components/Features";
import { DashboardPreview } from "@/components/DashboardPreview";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <UpdatesMarquee />
    <main>
      <Hero />
      <Regulators />
      <Features />
      <DashboardPreview />
      <CTA />
    </main>
    <Footer />
  </div>
);

export default Index;
