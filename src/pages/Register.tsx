import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingUp, Upload, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    country: "",
    tradingExperience: "",
    annualIncome: "",
    poiFile: null as File | null,
    poaFile: null as File | null,
    agreeTerms: false,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNext = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 2) {
      if (!formData.tradingExperience || !formData.annualIncome || !formData.country) {
        toast({
          title: "Missing Information",
          description: "Please complete all fields.",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 3) {
      if (!formData.poiFile || !formData.poaFile || !formData.agreeTerms) {
        toast({
          title: "Missing Documents",
          description: "Please upload both documents and agree to terms.",
          variant: "destructive",
        });
        return;
      }
      // Submit registration
      toast({
        title: "Registration Submitted",
        description: "Your KYC documents are under review. You'll receive an email once approved.",
      });
      setTimeout(() => navigate("/"), 2000);
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TradeX Pro</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">
            Step {step} of 3 • {step === 1 ? "Account Details" : step === 2 ? "Trading Profile" : "KYC Verification"}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Card className="p-6 md:p-8">
          {/* Step 1: Account Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Trading Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country of Residence</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Trading Experience</Label>
                <Select value={formData.tradingExperience} onValueChange={(value) => setFormData({ ...formData, tradingExperience: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Experience</SelectItem>
                    <SelectItem value="beginner">Beginner (Less than 1 year)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income">Annual Income</Label>
                <Select value={formData.annualIncome} onValueChange={(value) => setFormData({ ...formData, annualIncome: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-25k">$0 - $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100k+">$100,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: KYC Documents */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Proof of Identity (POI)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="poi"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({ ...formData, poiFile: e.target.files?.[0] || null })}
                  />
                  <label htmlFor="poi" className="cursor-pointer">
                    {formData.poiFile ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>{formData.poiFile.name}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Upload passport, driver's license, or national ID
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Proof of Address (POA)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="poa"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({ ...formData, poaFile: e.target.files?.[0] || null })}
                  />
                  <label htmlFor="poa" className="cursor-pointer">
                    {formData.poaFile ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>{formData.poaFile.name}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Upload utility bill, bank statement (less than 3 months old)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                  I agree to the Terms of Service and acknowledge this is a simulated trading platform with no real funds at risk.
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="ml-auto">
              {step === 3 ? "Submit Application" : "Continue"}
            </Button>
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/trade" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
