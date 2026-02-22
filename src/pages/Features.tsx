import { Navigation } from "@/components/Navigation";
import { Features as FeaturesSection } from "@/components/Features";
import { DetailedFeatures } from "@/components/DetailedFeatures";
import { Footer } from "@/components/Footer";

const Features = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20">
        <FeaturesSection />
        <DetailedFeatures />
      </main>
      <Footer />
    </div>
  );
};

export default Features;
