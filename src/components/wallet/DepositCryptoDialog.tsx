import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, Controller } from "react-hook-form";
import { validationRules } from "@/components/ui/form";

interface DepositCryptoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const SUPPORTED_CRYPTOS = [
  { value: 'BTC', label: 'Bitcoin (BTC)', icon: '₿' },
  { value: 'ETH', label: 'Ethereum (ETH)', icon: 'Ξ' },
  { value: 'USDT', label: 'Tether (USDT)', icon: '₮' },
  { value: 'USDC', label: 'USD Coin (USDC)', icon: '$' },
  { value: 'LTC', label: 'Litecoin (LTC)', icon: 'Ł' },
  { value: 'BNB', label: 'Binance Coin (BNB)', icon: 'BNB' },
];

export function DepositCryptoDialog({ open, onOpenChange, onSuccess }: DepositCryptoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [amountPreview, setAmountPreview] = useState("");
  const [currencyPreview, setCurrencyPreview] = useState("BTC");
  const [loadingState, setLoadingState] = useState(false);
  const [paymentData, setPaymentData] = useState<{ amount?: number; currency?: string; payment_address?: string; payment_url?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      amount: '',
      currency: 'BTC',
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const watchedAmount = watch('amount');
  const watchedCurrency = watch('currency') || 'BTC';

  const handleCreatePayment = async (data?: any) => {
    const amt = data?.amount ?? watchedAmount;
    const curr = data?.currency ?? watchedCurrency;

    if (!amt || parseFloat(amt) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid deposit amount", variant: "destructive" });
      return;
    }

    setLoadingState(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: {
          amount: parseFloat(amt),
          currency: curr,
        },
      });

      if (error) throw error;

      setPaymentData(data);
      setAmountPreview(String(data?.amount ?? amt));
      setCurrencyPreview(String(data?.currency ?? curr));
      toast({
        title: "Payment Created",
        description: "Send crypto to the address below to complete your deposit",
      });
    } catch (err: unknown) {
      console.error('Error creating payment:', err);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Payment Failed",
        description: message || "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingState(false);
    }
  };

  const handleCopyAddress = () => {
    if (paymentData?.payment_address) {
      navigator.clipboard.writeText(paymentData.payment_address);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Payment address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setAmount("");
    setCurrency("BTC");
    setPaymentData(null);
    setCopied(false);
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[90vw] md:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit Cryptocurrency</DialogTitle>
          <DialogDescription>
            {paymentData 
              ? "Send cryptocurrency to the address below"
              : "Choose your cryptocurrency and amount to deposit"
            }
          </DialogDescription>
        </DialogHeader>

        {!paymentData ? (
          <div className="space-y-4">
            <form onSubmit={handleSubmit(handleCreatePayment)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100.00"
                  {...register('amount', validationRules.amount)}
                  min="1"
                  step="0.01"
                />
                {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Cryptocurrency</Label>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CRYPTOS.map((crypto) => (
                          <SelectItem key={crypto.value} value={crypto.value}>
                            <span className="flex items-center gap-4">
                              <span className="text-lg">{crypto.icon}</span>
                              {crypto.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <Alert>
                <AlertDescription>
                  Minimum deposit: $10 USD. Deposits are usually confirmed within 15-30 minutes.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                disabled={loadingState}
                className="w-full"
              >
                {loadingState && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Payment
              </Button>
            </form>

            <Alert>
              <AlertDescription>
                Minimum deposit: $10 USD. Deposits are usually confirmed within 15-30 minutes.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleCreatePayment}
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Payment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="border-primary">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Payment request created successfully! Send exactly <strong>{paymentData.amount} {paymentData.currency}</strong> to the address below.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Payment Address</Label>
              <div className="flex gap-4">
                <Input
                  value={paymentData.payment_address}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAddress}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-buy" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount to Send</Label>
              <div className="text-2xl font-bold gradient-text">
                {paymentData.amount} {paymentData.currency}
              </div>
              <p className="text-sm text-muted-foreground">
                ≈ ${amountPreview || watchedAmount} USD
              </p>
            </div>

            {paymentData.payment_url && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(paymentData.payment_url, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Payment Page
              </Button>
            )}

            <Alert>
              <AlertDescription className="text-xs">
                <strong>Important:</strong> Send only {paymentData.currency} to this address. Sending any other currency may result in permanent loss of funds.
              </AlertDescription>
            </Alert>

            <Button onClick={handleClose} variant="secondary" className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
