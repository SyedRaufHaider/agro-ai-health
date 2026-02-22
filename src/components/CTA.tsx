import { Button } from "@/components/ui/button";
import { Camera, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const CTA = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'var(--gradient-hero)',
        }}
      />
      
      <div className="container relative z-10 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground">
            Ready to Protect Your Plants?
          </h2>
          
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of farmers and gardeners using Agro AI to keep their plants healthy and thriving.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link to="/scan">
                Start Free Trial
                <Camera className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-primary-foreground bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 font-semibold px-8 py-6 text-lg backdrop-blur-sm"
              asChild
            >
              <Link to="/demo">
                View Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-primary-foreground/70 pt-4">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};
