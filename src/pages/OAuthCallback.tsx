import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

/**
 * OAuthCallback
 * -----------
 * The backend OAuth callback redirects here with:
 *   /oauth-callback?token=JWT&user=ENCODED_JSON
 *
 * This page stores the credentials and redirects to the dashboard.
 */
const OAuthCallback = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const userRaw = params.get("user");
        const error = params.get("error");

        if (error || !token || !userRaw) {
            toast({
                title: "Login failed",
                description: "Social login was cancelled or failed. Please try again.",
                variant: "destructive",
            });
            navigate("/login");
            return;
        }

        try {
            const user = JSON.parse(decodeURIComponent(userRaw));
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            toast({
                title: "Login successful",
                description: `Welcome, ${user.username}! 🌿`,
            });
            navigate("/dashboard");
        } catch {
            toast({
                title: "Login error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
            navigate("/login");
        }
    }, [navigate, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Completing sign-in…</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
