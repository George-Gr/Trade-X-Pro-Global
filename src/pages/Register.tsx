import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { TrendingUp, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { validationRules } from "@/components/ui/form";

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-4 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TradePro</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Start Trading Today</h1>
          <p className="text-muted-foreground">Create your free trading account</p>
        </div>

        <Card className="p-6 md:p-6">
          <Form {...form}>
            <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={() => (
                  <FormItem>
                    <FormLabel htmlFor="fullName">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        {...register("fullName", validationRules.fullName)}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={() => (
                  <FormItem>
                    <FormLabel htmlFor="email">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        {...register("email", validationRules.email)}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={() => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register("password", validationRules.password)}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Minimum 8 characters
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={() => (
                  <FormItem>
                    <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            {/* Benefits */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>$10,000 virtual capital to start</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Access to 10,000+ trading instruments</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Real-time market data and analytics</span>
              </div>
            </div>

<Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>        <p className="text-center text-xs text-muted-foreground mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Register;
