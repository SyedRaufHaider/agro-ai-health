import { Users, Leaf, Award, Globe2 } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Active Users",
    description: "Farmers and gardeners trust us"
  },
  {
    icon: Leaf,
    value: "2M+",
    label: "Plants Scanned",
    description: "Successfully analyzed"
  },
  {
    icon: Award,
    value: "95%",
    label: "Accuracy Rate",
    description: "In disease detection"
  },
  {
    icon: Globe2,
    value: "120+",
    label: "Countries",
    description: "Worldwide coverage"
  }
];

export const Stats = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'var(--gradient-hero)',
        }}
      />
      
      <div className="container relative z-10 px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Trusted by Thousands Worldwide
          </h2>
          <p className="text-xl text-primary-foreground/90">
            Join our growing community of plant health enthusiasts
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="text-center space-y-4 p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-primary-foreground">
                  {stat.value}
                </div>
                <div>
                  <div className="text-lg font-semibold text-primary-foreground">
                    {stat.label}
                  </div>
                  <div className="text-sm text-primary-foreground/80">
                    {stat.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
