import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import heroImage from "@/assets/hero-agro-ai.jpg";
import mobileScanning from "@/assets/mobile-scanning.jpg";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(var(--primary) / 0.95) 0%, hsl(var(--secondary) / 0.9) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container relative z-10 px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6">
              <Camera className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">AI-Powered Plant Health</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
              Detect Plant Diseases
              <span className="block mt-2 bg-gradient-to-r from-primary-foreground to-primary-foreground/80 bg-clip-text text-transparent">
                Instantly with AI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-foreground/90 leading-relaxed">
              Simply snap a photo of your plant, and our advanced AI will identify diseases and recommend the best treatments in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center pt-4">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all" asChild>
                <Link to="/scan">
                  Try Free Now
                  <Camera className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-primary-foreground bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 font-semibold px-8 py-6 text-lg backdrop-blur-sm" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-8 text-primary-foreground/80">
              <div className="text-center md:text-left">
                <div className="text-3xl font-bold">95%</div>
                <div className="text-sm">Accuracy Rate</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm">Plants Analyzed</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-sm">Disease Database</div>
              </div>
            </div>
          </div>
          
          <div className="relative hidden md:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-primary-foreground/20 backdrop-blur-sm">
              <img 
                src={mobileScanning} 
                alt="Mobile phone scanning plant for disease detection"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
