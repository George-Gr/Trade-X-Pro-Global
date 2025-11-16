import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertTriangle, CheckCircle2, Clock, DollarSign, TrendingDown, Shield } from "lucide-react";

interface WithdrawalFormProps {
  onSuccess?: () => void;
  balance: number;
}

const SUPPORTED_CRYPTOS = [
  { value: 'BTC', label: 'Bitcoin (BTC)', min: '0.001', networkFee: '0.0001', avgTime: '10-30 min' },
  { value: 'ETH', label: 'Ethereum (ETH)', min: '0.01', networkFee: '0.005', avgTime: '5-15 min' },
  { value: 'USDT', label: 'Tether (USDT)', min: '10', networkFee: '1', avgTime: '5-15 min' },
  { value: 'USDC', label: 'USD Coin (USDC)', min: '10', networkFee: '1', avgTime: '5-15 min' },
  { value: 'LTC', label: 'Litecoin (LTC)', min: '0.1', networkFee: '0.001', avgTime: '5-30 min' },
  { value: 'BNB', label: 'Binance Coin (BNB)', min: '0.01', networkFee: '0.005', avgTime: '1-3 min' },
];

const WITHDRAWAL_LIMITS = {
  daily: 10000,
  perTransaction: 5000,
  monthly: 50000,
};

export function WithdrawalForm({ onSuccess, balance }: WithdrawalFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currency, setCurrency] = useState("BTC");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [estimatedFee, setEstimatedFee] = useState(0);

  // Fetch user profile for KYC status and withdrawal limits
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch today's withdrawal total
  const { data: todayWithdrawals } = useQuery({
    queryKey: ['today_withdrawals', user?.id],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('crypto_transactions')
        .select('usd_amount')
        .eq('user_id', user?.id)
        .eq('transaction_type', 'withdrawal')
        .in('status', ['completed', 'confirming'])
        .gte('created_at', today.toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const selectedCrypto = SUPPORTED_CRYPTOS.find(c => c.value === currency);
  const networkFee = parseFloat(selectedCrypto?.networkFee || '0');
  const totalWithdrawal = parseFloat(amount) + networkFee;
  const todayTotal = todayWithdrawals?.reduce((sum, t) => sum + (t.usd_amount || 0), 0) || 0;
  const remainingDailyLimit = WITHDRAWAL_LIMITS.daily - todayTotal;

  const validateAddress = (addr: string, curr: string): boolean => {
    // Basic address validation patterns
    const patterns: Record<string, RegExp> = {
      'BTC': /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
      'ETH': /^0x[a-fA-F0-9]{40}$/,
      'USDT': /^0x[a-fA-F0-9]{40}$/,
      'USDC': /^0x[a-fA-F0-9]{40}$/,
      'LTC': /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
      'BNB': /^0x[a-fA-F0-9]{40}$/,
    };
    return patterns[curr]?.test(addr) || false;
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!address.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a withdrawal address",
        variant: "destructive",
      });
      return;
    }

    if (!validateAddress(address, currency)) {
      toast({
        title: "Invalid Address Format",
        description: `Please enter a valid ${currency} address`,
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);

    // Check balance
    if (withdrawAmount > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have $${balance.toFixed(2)} available`,
        variant: "destructive",
      });
      return;
    }

    // Check transaction limit
    if (withdrawAmount > WITHDRAWAL_LIMITS.perTransaction) {
      toast({
        title: "Amount Exceeds Limit",
        description: `Maximum per transaction: $${WITHDRAWAL_LIMITS.perTransaction}`,
        variant: "destructive",
      });
      return;
    }

    // Check daily limit
    if (todayTotal + withdrawAmount > WITHDRAWAL_LIMITS.daily) {
      toast({
        title: "Daily Limit Exceeded",
        description: `Remaining today: $${remainingDailyLimit.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    // Check KYC status
    if (profile?.kyc_status !== 'approved') {
      toast({
        title: "KYC Required",
        description: "Please complete KYC verification before withdrawing",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmWithdrawal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('initiate-withdrawal', {
        body: {
          currency,
          address,
          amount: parseFloat(amount),
          twoFACode,
        },
      });

      if (error) throw error;

      toast({
        title: "Withdrawal Initiated",
        description: `Your withdrawal of ${amount} ${currency} has been requested. It will be processed shortly.`,
      });

      // Reset form
      setAddress("");
      setAmount("");
      setTwoFACode("");
      setShowConfirmation(false);
      setCurrency("BTC");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error initiating withdrawal:', err);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Withdrawal Failed",
        description: message || "Failed to initiate withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isKYCVerified = profile?.kyc_status === 'approved';
  const canWithdraw = balance > 0 && isKYCVerified;

  return (
    <div className="space-y-6">
      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">${balance.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Today's Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">${remainingDailyLimit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Daily limit: ${WITHDRAWAL_LIMITS.daily}</p>
          </CardContent>
        </Card>
      </div>

      {/* KYC Status Warning */}
      {!isKYCVerified && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            KYC verification required to withdraw. Please complete verification first.
          </AlertDescription>
        </Alert>
      )}

      {/* Withdrawal Form */}
      {isKYCVerified && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Cryptocurrency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CRYPTOS.map((crypto) => (
                  <SelectItem key={crypto.value} value={crypto.value}>
                    {crypto.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCrypto && (
              <p className="text-xs text-muted-foreground">
                Min: {selectedCrypto.min} {currency} • Network Fee: {selectedCrypto.networkFee} {currency} (~${(parseFloat(selectedCrypto.networkFee) * 1000).toFixed(0)}) • Est. Time: {selectedCrypto.avgTime}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Withdrawal Address</Label>
            <Input
              id="address"
              placeholder={`Enter your ${currency} address`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter a valid {currency} address. This cannot be changed after submission.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({currency})</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                min="0"
                step="0.01"
                disabled={!canWithdraw}
              />
            </div>
            {amount && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Network Fee: {networkFee} {currency}</span>
                <span>Total: {(parseFloat(amount) + networkFee).toFixed(8)} {currency}</span>
              </div>
            )}
          </div>

          {/* Fee Breakdown */}
          {amount && (
            <Card className="bg-muted/50 border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Fee Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Withdrawal Amount:</span>
                  <span className="font-semibold">{amount} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee:</span>
                  <span className="font-semibold">{networkFee} {currency}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">You'll receive:</span>
                  <span className="font-bold text-primary">{(parseFloat(amount) - networkFee).toFixed(8)} {currency}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Important:</strong> Double-check the address. Funds sent to an incorrect address cannot be recovered.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleSubmit}
            disabled={!canWithdraw || loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Request Withdrawal
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Withdrawal</AlertDialogTitle>
            <AlertDialogDescription>
              Please review the withdrawal details below
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-semibold">{currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">{amount} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee:</span>
                <span className="font-semibold">{networkFee} {currency}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">You'll receive:</span>
                <span className="font-bold text-primary">{(parseFloat(amount) - networkFee).toFixed(8)} {currency}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twofa">2FA Code (Email)</Label>
              <Input
                id="twofa"
                placeholder="Enter 6-digit code"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.slice(0, 6))}
                maxLength={6}
                pattern="[0-9]*"
              />
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Withdrawal will be sent to address ending in {address.slice(-10)}
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmWithdrawal}
              disabled={loading || twoFACode.length !== 6}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Withdrawal
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
