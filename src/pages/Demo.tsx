import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import mobileScanningImg from "@/assets/mobile-scanning.jpg";

const Demo = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container px-4 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              See Agro AI in Action
            </h1>
            <p className="text-xl text-muted-foreground">
              Watch how our AI technology identifies plant diseases in seconds
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden mb-12">
            <div className="aspect-video bg-muted relative group">
              <img 
                src={mobileScanningImg} 
                alt="Demo preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                <Button size="lg" className="gap-2">
                  <Play className="w-6 h-6" />
                  Watch Demo Video
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card border border-border rounded-lg p-8">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Success Rate</h3>
              <p className="text-4xl font-bold text-primary mb-2">97.5%</p>
              <p className="text-muted-foreground">
                Our AI accurately identifies over 200 plant diseases with industry-leading precision
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <AlertCircle className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Response Time</h3>
              <p className="text-4xl font-bold text-primary mb-2">&lt; 3 sec</p>
              <p className="text-muted-foreground">
                Get instant disease detection and treatment recommendations in under 3 seconds
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-2xl font-semibold mb-6 text-center">How the Demo Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold mb-2">Upload Image</h4>
                <p className="text-sm text-muted-foreground">
                  Select a photo of your plant showing any symptoms or issues
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our advanced AI scans and identifies potential diseases instantly
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold mb-2">Get Results</h4>
                <p className="text-sm text-muted-foreground">
                  Receive detailed diagnosis and treatment recommendations
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="px-12" asChild>
              <Link to="/scan">Try It Yourself</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Demo;
