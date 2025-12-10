import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { TrendingUp, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { validationRules } from "@/lib/validationRules";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, user } = useAuth();

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const password = watch("password");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const { error } = await signUp(data.email, data.password, data.fullName);

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Successful!",
          description: "Your account has been created. You can now log in.",
        });
        setTimeout(() => navigate("/login"), 2000);
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

  const benefits = [
    "$50,000 virtual capital to start",
    "Access to 500+ trading instruments",
    "Real-time market data and analytics"
  ];

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
            x: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-accent/30 to-transparent blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
            x: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary-glow/20 to-transparent blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 pattern-dots opacity-20" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
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
            <span className="text-2xl font-bold text-primary-foreground">TradePro</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">Start Trading Today</h1>
          <p className="text-primary-foreground/70">Create your free trading account</p>
        </motion.div>

        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card border border-primary-foreground/20 backdrop-blur-xl bg-primary-foreground/10 shadow-2xl p-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={() => (
                    <FormItem>
                      <FormLabel htmlFor="fullName" className="text-primary-foreground">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-gold focus:ring-gold/20"
                          {...register("fullName", validationRules.fullName)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={() => (
                    <FormItem>
                      <FormLabel htmlFor="email" className="text-primary-foreground">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-gold focus:ring-gold/20"
                          {...register("email", validationRules.email)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={() => (
                    <FormItem>
                      <FormLabel htmlFor="password" className="text-primary-foreground">Password</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-gold focus:ring-gold/20"
                          {...register("password", validationRules.password)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription className="text-primary-foreground/60">At least 8 characters with letters and numbers</FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={() => (
                    <FormItem>
                      <FormLabel htmlFor="confirmPassword" className="text-primary-foreground">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-gold focus:ring-gold/20"
                          {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value) =>
                              value === password || "Passwords do not match",
                          })}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Benefits */}
                <motion.div 
                  className="glass-card border border-gold/30 rounded-xl p-4 space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {benefits.map((benefit, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center gap-3 text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    >
                      <CheckCircle className="h-4 w-4 text-gold flex-shrink-0" />
                      <span className="text-primary-foreground/90">{benefit}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <Button 
                  type="submit" 
                  className="w-full btn-glow bg-gold text-gold-foreground hover:bg-gold-hover py-6 text-lg font-bold shadow-lg hover:shadow-gold/25 transition-all duration-300 group" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                  {!isLoading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center pt-4 border-t border-primary-foreground/10">
              <p className="text-sm text-primary-foreground/70">
                Already have an account?{" "}
                <Link to="/login" className="text-gold hover:text-gold-hover font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Terms and Trust Badge */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-xs text-primary-foreground/50">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-gold hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
          </p>
          <Badge className="bg-primary-foreground/10 text-primary-foreground/80 border border-primary-foreground/20 px-4 py-2">
            <Sparkles className="mr-2 h-4 w-4 text-gold" />
            100% Free • No Credit Card Required
          </Badge>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
