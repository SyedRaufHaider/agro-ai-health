import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Agro AI Logo" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Advanced AI-powered plant disease detection and treatment recommendations. 
              Helping farmers protect their crops with cutting-edge technology.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/benefits" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Benefits
                </Link>
              </li>
              <li>
                <Link to="/scan" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Scan Plant
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/demo" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Demo
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@agroai.com" className="hover:text-primary transition-colors">
                  info@agroai.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="tel:+1234567890" className="hover:text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>123 Farm Road, Agriculture City, AC 12345</span>
              </li>
            </ul>

            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Newsletter</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Subscribe to get updates on new features and tips
              </p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="h-9 text-sm"
                />
                <Button size="sm" className="px-4">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Agro AI. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
              <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
