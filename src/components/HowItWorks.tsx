import { Camera, Scan, FileCheck, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Capture Image",
    description: "Take a clear photo of the affected plant part using your smartphone camera. Make sure the diseased area is visible and well-lit.",
    details: ["Natural lighting preferred", "Close-up of affected area", "Multiple angles if needed"]
  },
  {
    number: "02",
    icon: Scan,
    title: "AI Analysis",
    description: "Our advanced machine learning model analyzes the image in real-time, comparing it against thousands of disease patterns.",
    details: ["95% accuracy rate", "Instant processing", "Deep learning algorithms"]
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Get Diagnosis",
    description: "Receive detailed information about the identified disease, including severity level and potential causes.",
    details: ["Disease identification", "Severity assessment", "Spread risk analysis"]
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Treatment Plan",
    description: "Get personalized treatment recommendations including specific medicines, application methods, and prevention tips.",
    details: ["Medicine recommendations", "Application guidelines", "Prevention strategies"]
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple Process, Powerful Results
          </h2>
          <p className="text-lg text-muted-foreground">
            From image capture to treatment plan in just 4 easy steps
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={index}
                  className="relative group"
                >
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-4"></div>
                  )}
                  
                  <div className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full">
                    {/* Number Badge */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-semibold text-card-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Details List */}
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
