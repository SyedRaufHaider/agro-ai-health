import { CheckCircle2, TrendingUp, Clock, Shield, History } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Increase Crop Yield",
    description: "Early disease detection means healthier plants and better harvests.",
  },
  {
    icon: Clock,
    title: "Save Time & Money",
    description: "No need for expensive consultations or lab tests. Get instant results.",
  },
  {
    icon: Shield,
    title: "Prevent Spread",
    description: "Catch diseases before they spread to your entire crop.",
  },
  {
    icon: CheckCircle2,
    title: "Expert Knowledge",
    description: "Access agricultural expertise powered by cutting-edge AI technology.",
  },
  {
    icon: History,
    title: "NFC Field History",
    description: "Scan NFC tags to instantly view previous scan records and track field health over time.",
  },
];

export const Benefits = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose Agro AI?
          </h2>
          <p className="text-lg text-muted-foreground">
            Trusted by farmers and gardeners worldwide to protect their plants
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index}
                className="text-center space-y-4 p-6 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
