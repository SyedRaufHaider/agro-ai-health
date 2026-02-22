import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { DetailedFeatures } from "@/components/DetailedFeatures";
import { Benefits } from "@/components/Benefits";
import { Stats } from "@/components/Stats";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <DetailedFeatures />
      <Benefits />
      <Stats />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
