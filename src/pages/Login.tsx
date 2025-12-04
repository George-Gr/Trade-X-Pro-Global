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
import { TrustBadge } from "@/components/trust/TrustBadge";
import { SocialProof } from "@/components/trust/SocialProof";

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
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[#F5F5DC]">
      {/* Luxury Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFD700]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0A1628]/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md space-y-10 relative z-10">
        {/* Demo Info Banner */}
        {showDemoBanner && (
          <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl p-4 relative shadow-lg">
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

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-10 w-10" style={{ color: '#FFD700', filter: 'drop-shadow(0 2px 8px #FFD70044)' }} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" style={{ color: '#0A1628', letterSpacing: '-0.02em' }}>Welcome Back</h1>
            <p className="text-lg" style={{ color: '#1a2d42' }}>Enter your credentials to access your account</p>
          </div>

          <div className="flex justify-center pt-2">
            <SocialProof />
          </div>
        </div>

        <Card style={{ background: '#FFFFFF', border: '1px solid #FFD70022', boxShadow: '0 8px 32px #FFD70022', borderRadius: '1rem' }} className="shadow-2xl">
          <div className="space-y-4 p-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
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
                  className="w-full py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0A1628] focus:ring-2 focus:ring-[#FFD700]"
                  disabled={isLoading}
                  aria-label="Sign in to your trading account"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>

            <div className="text-center space-y-4 pt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#FFD700]/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-[#0A1628]">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full rounded-xl border-[#FFD700]/30 text-[#0A1628] hover:bg-[#FFD700]/10">
                  Google
                </Button>
                <Button variant="outline" className="w-full rounded-xl border-[#FFD700]/30 text-[#0A1628] hover:bg-[#FFD700]/10">
                  Apple
                </Button>
              </div>

              <div className="pt-4 text-center">
                <Link to="/register" className="text-sm font-medium" style={{ color: '#FFD700' }}>
                  Don't have an account? Sign up
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-center">
          <TrustBadge className="opacity-80 scale-90" />
        </div>
      </div>
    </div>
  );
};

export default Login;
