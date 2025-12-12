import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RegistrationFormData } from "./MultiStepRegistration";

interface StepTwoProps {
  formData: RegistrationFormData;
  updateFormData: (data: Partial<RegistrationFormData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const StepTwo: React.FC<StepTwoProps> = ({ formData, updateFormData, onBack, onSubmit, isLoading }) => {
  const form = useForm({
    defaultValues: {
      tradingExperience: formData.tradingExperience,
      occupation: formData.occupation,
      financialCapability: formData.financialCapability,
      reasonForJoining: formData.reasonForJoining,
      tradingGoals: formData.tradingGoals,
    },
  });

  const { handleSubmit } = form;

  const handleFormSubmit = (data: typeof formData) => {
    updateFormData(data);
    onSubmit();
  };

  const selectClass = "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground";
  const textareaClass = "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-gold focus:ring-gold/20 min-h-[80px]";

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tradingExperience"
          rules={{ required: "Please select your trading experience" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary-foreground">Trading Experience</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={selectClass}>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No Experience</SelectItem>
                  <SelectItem value="beginner">Beginner (Less than 1 year)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="experienced">Experienced (3-5 years)</SelectItem>
                  <SelectItem value="expert">Expert (5+ years)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="occupation"
          rules={{ required: "Please select your occupation" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary-foreground">What do you do?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={selectClass}>
                    <SelectValue placeholder="Select your occupation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="self-employed">Self-Employed</SelectItem>
                  <SelectItem value="business-owner">Business Owner</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="trader">Full-time Trader</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="financialCapability"
          rules={{ required: "Please select your financial capability" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary-foreground">Financial Capability</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={selectClass}>
                    <SelectValue placeholder="Select your investment budget" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="under-1000">Under $1,000</SelectItem>
                  <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                  <SelectItem value="5000-25000">$5,000 - $25,000</SelectItem>
                  <SelectItem value="25000-100000">$25,000 - $100,000</SelectItem>
                  <SelectItem value="over-100000">Over $100,000</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reasonForJoining"
          rules={{ required: "Please tell us why you're joining" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary-foreground">Reason for Joining Trade X Pro</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What attracted you to our platform? What are you looking for in a trading platform?"
                  className={textareaClass}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tradingGoals"
          rules={{ required: "Please share your trading goals" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary-foreground">Your Trading Goals</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What do you hope to achieve with Trade X Pro? Short-term or long-term goals?"
                  className={textareaClass}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <Button 
            type="submit" 
            className="flex-1 btn-glow bg-gold text-gold-foreground hover:bg-gold-hover py-6 text-lg font-bold shadow-lg hover:shadow-gold/25 transition-all duration-300 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StepTwo;
