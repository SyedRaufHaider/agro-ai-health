import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Leaf,
  Brain,
  Shield,
  Users,
  Camera,
  Scan,
  ArrowRight,
  Globe,
  Zap,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import featureAiImg from "@/assets/feature-ai.jpg";
import featureCameraImg from "@/assets/feature-camera.jpg";
import featureMedicineImg from "@/assets/feature-medicine.jpg";

const About = () => {
  const isLoggedIn = !!localStorage.getItem("token");

  const stats = [
    { icon: Leaf, value: "200+", label: "Diseases Detected" },
    { icon: Users, value: "5M+", label: "Active Users" },
    { icon: Brain, value: "97.5%", label: "Accuracy Rate" },
    { icon: Shield, value: "150+", label: "Countries Served" },
  ];

  const values = [
    {
      icon: Zap,
      title: "Speed",
      desc: "Get instant results in under 5 seconds with our optimized AI pipeline.",
    },
    {
      icon: Shield,
      title: "Accuracy",
      desc: "Industry-leading 97.5% accuracy powered by deep learning models trained on millions of images.",
    },
    {
      icon: Globe,
      title: "Accessibility",
      desc: "Available worldwide — works on any device with a camera, even with low bandwidth.",
    },
    {
      icon: Heart,
      title: "Impact",
      desc: "Helping farmers save crops, reduce chemical usage, and improve food security globally.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="py-24 md:py-32">
        <div className="container px-4">
          {/* Hero */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                About Us
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Protecting Crops with{" "}
              <span className="text-primary">Artificial Intelligence</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to empower farmers worldwide with cutting-edge
              AI technology for early plant disease detection.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Our Story */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Agro AI was founded by a team of agricultural scientists and
                  AI researchers who witnessed firsthand the devastating impact
                  of plant diseases on global food security.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  After years of research and development, we've created an
                  AI-powered solution that makes plant disease detection
                  accessible to everyone — from small-scale farmers to large
                  agricultural operations.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today, we serve millions of users across 150+ countries,
                  helping them protect their crops and increase yields through
                  early detection and expert recommendations.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
                <img
                  src={featureAiImg}
                  alt="AI Technology"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
              {stats.map(({ icon: Icon, value, label }) => (
                <Card
                  key={label}
                  className="hover:shadow-lg hover:border-primary/20 transition-all"
                >
                  <CardContent className="pt-6 text-center">
                    <Icon className="w-10 h-10 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold mb-1">{value}</div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Values */}
            <div className="mb-24">
              <h2 className="text-3xl font-bold mb-3 text-center">
                What Drives Us
              </h2>
              <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
                Our core values shape every decision we make
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map(({ icon: Icon, title, desc }) => (
                  <Card
                    key={title}
                    className="hover:shadow-lg hover:border-primary/20 transition-all"
                  >
                    <CardContent className="pt-6">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Technology */}
            <div className="mb-24">
              <h2 className="text-3xl font-bold mb-3 text-center">
                Our Technology
              </h2>
              <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
                Built on cutting-edge research and real-world expertise
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="overflow-hidden hover:shadow-lg transition-all">
                  <img
                    src={featureCameraImg}
                    alt="Camera Technology"
                    className="w-full h-52 object-cover"
                  />
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-3">
                      Advanced Computer Vision
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Our proprietary computer vision algorithms analyze
                      thousands of visual markers to identify diseases with
                      exceptional accuracy using deep neural networks.
                    </p>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden hover:shadow-lg transition-all">
                  <img
                    src={featureMedicineImg}
                    alt="Treatment Recommendations"
                    className="w-full h-52 object-cover"
                  />
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-3">
                      Expert-Backed Recommendations
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Every treatment recommendation is vetted by agricultural
                      experts and backed by peer-reviewed research for reliable
                      results.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* CTA — login-aware */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-12 text-center">
                {isLoggedIn ? (
                  <>
                    <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-3">
                      Ready to Scan?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
                      Upload an image of your plant and get an instant AI-powered diagnosis.
                    </p>
                    <Link to="/scan">
                      <Button size="lg" className="gap-2 px-8">
                        <Scan className="h-5 w-5" />
                        Start Scanning
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Leaf className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-3">
                      Join Our Mission
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
                      Help us build a future where no crop is lost to
                      preventable diseases. Start using Agro AI today.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Link to="/signup">
                        <Button size="lg" className="gap-2 px-8">
                          Get Started
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to="/login">
                        <Button size="lg" variant="outline" className="px-8">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
