import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { validationRules } from "@/lib/validationRules";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { TrendingUp, AlertCircle, X, ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
    const bannerDismissed = localStorage.getItem("demoBannerDismissed");
    if (bannerDismissed === "true") {
      setShowDemoBanner(false);
    }
  }, []);

  // Demo credentials
  const demoCredentials = {
    email: "demo@tradingpro.com",
    password: "Demo123!",
  };

  // Handle demo login
  const handleDemoLogin = () => {
    form.setValue("email", demoCredentials.email);
    form.setValue("password", demoCredentials.password);
    toast({
      title: "Demo credentials filled",
      description: "Click login to access the demo account",
    });
  };

  // Dismiss demo banner
  const handleDismissBanner = () => {
    setShowDemoBanner(false);
    localStorage.setItem("demoBannerDismissed", "true");
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

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
    <div className="min-h-screen bg-primary relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 z-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 pattern-grid opacity-30" />

        {/* Gradient mesh overlay */}
        <div className="absolute inset-0 pattern-mesh" />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-gold/30 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-accent/30 to-transparent blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
            x: [0, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary-glow/20 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 pattern-dots opacity-20" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Demo Info Banner */}
        {showDemoBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card border border-gold/30 rounded-xl p-4 relative backdrop-blur-xl bg-primary-foreground/10"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle
                className="h-5 w-5 text-gold mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-foreground">
                  Try our demo account to explore all features
                </p>
                <p className="text-xs text-primary-foreground/70 mt-1">
                  Experience the full platform with our demo credentials
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDemoLogin}
                className="ml-2 text-gold hover:bg-gold/10"
                aria-label="Fill demo account credentials"
              >
                Try Demo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissBanner}
                className="ml-2 text-primary-foreground/70 hover:bg-primary-foreground/10"
                aria-label="Dismiss this banner"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gold/20 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-gold" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">
              TradePro
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-primary-foreground/70">
            Login to your trading account
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card border border-primary-foreground/20 backdrop-blur-xl bg-primary-foreground/10 shadow-2xl">
            <div className="space-y-4 p-6">
              <Form {...form}>
                <form
                  onSubmit={handleSubmit(handleLogin)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={() => (
                      <FormItem>
                        <FormLabel
                          htmlFor="email"
                          className="text-primary-foreground"
                        >
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            {...register("email", validationRules.email)}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-primary-foreground/60">
                          Enter your registered email address
                        </FormDescription>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={() => (
                      <FormItem>
                        <FormLabel
                          htmlFor="password"
                          className="text-primary-foreground"
                        >
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            {...register("password", validationRules.password)}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-primary-foreground/60">
                          Enter your account password
                        </FormDescription>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full btn-glow bg-gold text-gold-foreground hover:bg-gold-hover py-6 text-lg font-bold shadow-lg hover:shadow-gold/25 transition-all duration-300 group"
                    disabled={isLoading}
                    aria-label="Sign in to your trading account"
                  >
                    {isLoading ? "Logging in..." : "Login"}
                    {!isLoading && (
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center space-y-3 pt-4 border-t border-primary-foreground/10">
                <Link
                  to="/register"
                  className="text-sm text-gold hover:text-gold-hover font-medium transition-colors"
                >
                  Don't have an account? Sign up
                </Link>
                <div className="text-xs">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleDemoLogin}
                    className="text-primary-foreground/60 hover:text-gold p-0"
                    aria-label="Fill demo account credentials for testing"
                  >
                    Try demo account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Badge className="bg-primary-foreground/10 text-primary-foreground/80 border border-primary-foreground/20 px-4 py-2">
            <Sparkles className="mr-2 h-4 w-4 text-gold" />
            Trusted by 50,000+ traders worldwide
          </Badge>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
