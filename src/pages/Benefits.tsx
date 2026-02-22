import { Navigation } from "@/components/Navigation";
import { Benefits as BenefitsSection } from "@/components/Benefits";
import { Footer } from "@/components/Footer";

const Benefits = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20">
        <BenefitsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Benefits;
