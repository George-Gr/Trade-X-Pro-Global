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
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BTC");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<{ amount?: number; currency?: string; payment_address?: string; payment_url?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCreatePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: {
          amount: parseFloat(amount),
          currency: currency,
        },
      });

      if (error) throw error;

      setPaymentData(data);
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
      setLoading(false);
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
      <DialogContent className="sm:max-w-md">
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
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Cryptocurrency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CRYPTOS.map((crypto) => (
                    <SelectItem key={crypto.value} value={crypto.value}>
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{crypto.icon}</span>
                        {crypto.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              <div className="flex gap-2">
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
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
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
                ≈ ${amount} USD
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
