import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Demo credentials for testing without backend
  const DEMO_EMAIL = "demo@agroai.com";
  const DEMO_PASSWORD = "demo123";

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo mode - check for demo credentials (works without backend)
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem("token", "demo-token-123");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "demo-user-001",
          username: "demo_farmer",
          email: DEMO_EMAIL,
          role: "farmer",
          profilePicture: "",
        })
      );
      toast({
        title: "Login successful",
        description: "Welcome back to Agro AI! (Demo Mode)",
      });
      navigate("/dashboard");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.login(email, password);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      toast({
        title: "Login successful",
        description: "Welcome back to Agro AI!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your Agro AI account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={fillDemo}
              disabled={isLoading}
            >
              Use Demo Account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </form>

          {/* Test credentials hint */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">
              🧪 Test Credentials
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Demo (no backend):</span>{" "}
                <code className="bg-muted px-1 rounded">demo@agroai.com</code> /{" "}
                <code className="bg-muted px-1 rounded">demo123</code>
              </p>
              <p>
                <span className="font-medium">Farmer:</span>{" "}
                <code className="bg-muted px-1 rounded">farmer@test.com</code> /{" "}
                <code className="bg-muted px-1 rounded">password123</code>
              </p>
              <p>
                <span className="font-medium">Expert:</span>{" "}
                <code className="bg-muted px-1 rounded">expert@test.com</code> /{" "}
                <code className="bg-muted px-1 rounded">password123</code>
              </p>
              <p>
                <span className="font-medium">Admin:</span>{" "}
                <code className="bg-muted px-1 rounded">admin@test.com</code> /{" "}
                <code className="bg-muted px-1 rounded">password123</code>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;

