import { useEffect } from "react";
import { Header } from "@/components/client/Header";
import { Hero } from "@/components/client/Hero";
import { FeaturesSection } from "@/components/client/FeaturesSection";
import { SolutionSection } from "@/components/client/SolutionSection";
import { Testimonials } from "@/components/client/Testimonials";
import { CtaSection } from "@/components/client/CtaSection";
import { LatestNewsSection } from "@/components/client/LatestNewsSection";
import { ContactForm } from "@/components/client/ContactForm";
import { Footer } from "@/components/client/Footer";

const Index = () => {
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");
    return () => {
      if (wasDark) root.classList.add("dark");
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <Header variant="home" />
      <Hero />
      <main>
        <FeaturesSection />
        <SolutionSection />
        <Testimonials />
        <LatestNewsSection />
        <ContactForm />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
