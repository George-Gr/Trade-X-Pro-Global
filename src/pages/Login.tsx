import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { validationRules } from "@/lib/validationRules";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { TrendingUp, AlertCircle, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, isAdmin } = useAuth();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Check localStorage for demo banner preference
  useEffect(() => {
    const bannerDismissed = localStorage.getItem('demoBannerDismissed');
    if (bannerDismissed === 'true') {
      setShowDemoBanner(false);
    }
  }, []);

  // Demo credentials
  const demoCredentials = {
    email: "demo@tradingpro.com",
    password: "Demo123!"
  };

  // Handle demo login
  const handleDemoLogin = () => {
    form.setValue('email', demoCredentials.email);
    form.setValue('password', demoCredentials.password);
    toast({
      title: "Demo credentials filled",
      description: "Click login to access the demo account",
    });
  };

  // Dismiss demo banner
  const handleDismissBanner = () => {
    setShowDemoBanner(false);
    localStorage.setItem('demoBannerDismissed', 'true');
  };

  const { register, handleSubmit, formState: { errors } } = form;

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back to TradePro",
        });
        // Navigation handled by useEffect
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Demo Info Banner */}
        {showDemoBanner && (
          <div className="bg-[hsl(var(--status-info))] border border-[hsl(var(--status-info-border))] dark:bg-[hsl(var(--status-info-dark))] dark:border-[hsl(var(--status-info-dark-border))] rounded-lg p-4 relative">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-[hsl(var(--status-info-foreground))] mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--status-info-foreground))]">
                  Try our demo account to explore all features
                </p>
                <p className="text-xs text-[hsl(var(--status-info-foreground))] opacity-80 mt-1">
                  Experience the full platform with our demo credentials
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDemoLogin}
                className="ml-2 text-[hsl(var(--status-info-foreground))] hover:bg-[hsl(var(--status-info-foreground)/0.1)]"
                aria-label="Fill demo account credentials"
              >
                Try Demo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissBanner}
                className="ml-2 text-[hsl(var(--status-info-foreground))] hover:bg-[hsl(var(--status-info-foreground)/0.1)]"
                aria-label="Dismiss this banner"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="typography-h1 text-primary-contrast">TradePro</h1>
          <p className="text-secondary-contrast">Login to your account</p>
        </div>

        <Card>
          <div className="space-y-4 p-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={() => (
                    <FormItem>
                      <FormLabel htmlFor="email" className="text-primary-contrast">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="text-primary-contrast"
                          {...register("email", validationRules.email)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription className="text-secondary-contrast">Enter your registered email address</FormDescription>
                      <FormMessage className="text-danger-contrast" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={() => (
                    <FormItem>
                      <FormLabel htmlFor="password" className="text-primary-contrast">Password</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          className="text-primary-contrast"
                          {...register("password", validationRules.password)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription className="text-secondary-contrast">Enter your account password</FormDescription>
                      <FormMessage className="text-danger-contrast" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                  aria-label="Sign in to your trading account"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>

            <div className="text-center space-y-2">
              <Link to="/register" className="text-sm text-primary-contrast hover:underline font-medium">
                Don't have an account? Sign up
              </Link>
              <div className="text-xs text-secondary-contrast">
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleDemoLogin}
                  className="text-secondary-contrast hover:text-primary-contrast p-0"
                  aria-label="Fill demo account credentials for testing"
                >
                  Try demo account
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
