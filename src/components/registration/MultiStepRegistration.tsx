import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import RegistrationSuccess from "./RegistrationSuccess";

export interface RegistrationFormData {
  // Step 1 - Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  
  // Step 2 - Trading Profile
  tradingExperience: string;
  occupation: string;
  financialCapability: string;
  reasonForJoining: string;
  tradingGoals: string;
}

const initialFormData: RegistrationFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
  tradingExperience: "",
  occupation: "",
  financialCapability: "",
  reasonForJoining: "",
  tradingGoals: "",
};

const MultiStepRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateFormData = (data: Partial<RegistrationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Call edge function to create user and lead
      const { data, error } = await supabase.functions.invoke('create-user-with-lead', {
        body: {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          tradingExperience: formData.tradingExperience,
          occupation: formData.occupation,
          financialCapability: formData.financialCapability,
          reasonForJoining: formData.reasonForJoining,
          tradingGoals: formData.tradingGoals,
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setIsComplete(true);
      toast({
        title: "Registration Successful!",
        description: "Your account has been created. Please check your email to verify your account.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return <RegistrationSuccess email={formData.email} />;
  }

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 pattern-grid opacity-30" />
        <div className="absolute inset-0 pattern-mesh" />
        <motion.div 
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-gold/30 to-transparent blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-accent/30 to-transparent blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 pattern-dots opacity-20" />
      </div>

      <div className="w-full max-w-lg space-y-6 relative z-10">
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
            <span className="text-2xl font-bold text-primary-foreground">Trade X Pro</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">Create Your Account</h1>
          <p className="text-primary-foreground/70">Step {currentStep} of 2</p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              currentStep >= 1 ? 'bg-gold text-gold-foreground' : 'bg-primary-foreground/20 text-primary-foreground/50'
            }`}>
              {currentStep > 1 ? <Check className="h-5 w-5" /> : '1'}
            </div>
            <span className="ml-2 text-sm text-primary-foreground/70">Personal Info</span>
          </div>
          <div className="w-12 h-0.5 bg-primary-foreground/20">
            <div className={`h-full bg-gold transition-all duration-300 ${currentStep > 1 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              currentStep >= 2 ? 'bg-gold text-gold-foreground' : 'bg-primary-foreground/20 text-primary-foreground/50'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm text-primary-foreground/70">Trading Profile</span>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card border border-primary-foreground/20 backdrop-blur-xl bg-primary-foreground/10 shadow-2xl p-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StepOne 
                    formData={formData} 
                    updateFormData={updateFormData}
                    onNext={handleNext}
                  />
                </motion.div>
              )}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StepTwo 
                    formData={formData} 
                    updateFormData={updateFormData}
                    onBack={handleBack}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Login Link */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-sm text-primary-foreground/70">
            Already have an account?{" "}
            <Link to="/login" className="text-gold hover:text-gold-hover font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MultiStepRegistration;
