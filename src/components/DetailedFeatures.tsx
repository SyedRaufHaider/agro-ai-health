import { Zap, Database, Shield, Globe, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const detailedFeatures = [
  {
    icon: Zap,
    title: "Lightning Fast Detection",
    description: "Get results in under 3 seconds with our optimized AI models running on powerful cloud infrastructure.",
    stats: "< 3s response time"
  },
  {
    icon: Database,
    title: "Extensive Disease Database",
    description: "Access information on over 1000+ plant diseases across hundreds of plant species from our comprehensive database.",
    stats: "1000+ diseases"
  },
  {
    icon: Shield,
    title: "High Accuracy AI",
    description: "Our models are trained on millions of images and achieve 95%+ accuracy in disease identification.",
    stats: "95% accuracy"
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Available in 15+ languages to serve farmers and gardeners worldwide, breaking language barriers.",
    stats: "15+ languages"
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Get instant diagnoses anytime, anywhere. No need to wait for expert consultations or lab results.",
    stats: "Always online"
  },
  {
    icon: TrendingUp,
    title: "Continuous Learning",
    description: "Our AI constantly improves through machine learning, getting smarter with every scan performed.",
    stats: "Daily updates"
  }
];

export const DetailedFeatures = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Advanced Features Built for You
          </h2>
          <p className="text-lg text-muted-foreground">
            Cutting-edge technology made simple and accessible for everyone
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {detailedFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {feature.stats}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-card-foreground">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
