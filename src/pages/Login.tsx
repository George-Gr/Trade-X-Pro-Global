import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { validationRules } from "@/lib/validationRules";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { TrendingUp } from "lucide-react";
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, isAdmin } = useAuth();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="typography-h1">TradePro</h1>
          <p className="text-muted-foreground">Login to your account</p>
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
                      <FormLabel htmlFor="email">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          {...register("email", validationRules.email)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>Enter your registered email address</FormDescription>
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
                          placeholder="Enter your password"
                          {...register("password", validationRules.password)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>Enter your account password</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>

            <div className="text-center space-y-2">
              <Link to="/register" className="text-sm text-primary hover:underline">
                Don't have an account? Sign up
              </Link>
              <div className="text-xs text-muted-foreground">
                Demo Account: demo@tradingpro.com | Password: Demo123!
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
