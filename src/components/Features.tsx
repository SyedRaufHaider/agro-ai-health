import { Camera, Brain, Pill, Nfc } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import cameraImg from "@/assets/feature-camera.jpg";
import aiImg from "@/assets/feature-ai.jpg";
import medicineImg from "@/assets/feature-medicine.jpg";
import nfcImg from "@/assets/feature-nfc.jpg";

const features = [
  {
    icon: Camera,
    title: "Smart Camera Detection",
    description: "Capture clear photos of affected plant parts. Our AI processes images instantly to identify issues.",
    image: cameraImg,
  },
  {
    icon: Brain,
    title: "Advanced AI Analysis",
    description: "Machine learning models trained on millions of plant images provide accurate disease identification.",
    image: aiImg,
  },
  {
    icon: Pill,
    title: "Treatment Recommendations",
    description: "Get specific medicine suggestions and treatment plans tailored to your plant's condition.",
    image: medicineImg,
  },
  {
    icon: Nfc,
    title: "NFC Field Identification",
    description: "Scan NFC tags in your fields to instantly access previous scan history and track plant health over time.",
    image: nfcImg,
  },
];

export const Features = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-muted/50 to-background">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How Agro AI Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to protect your plants and maximize your harvest
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">Step {index + 1}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
