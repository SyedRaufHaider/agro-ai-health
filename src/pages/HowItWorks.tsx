import { Navigation } from "@/components/Navigation";
import { HowItWorks as HowItWorksSection } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20">
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
