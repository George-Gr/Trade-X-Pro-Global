import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

interface Transaction {
  id: string;
  transaction_type: string;
  currency: string;
  amount: number;
  usd_amount: number | null;
  status: string;
  payment_address: string | null;
  confirmations: number;
  created_at: string;
  completed_at: string | null;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function TransactionHistory({
  transactions,
  isLoading,
}: TransactionHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No transactions yet</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        icon: React.ReactNode;
      }
    > = {
      pending: {
        label: 'Pending',
        variant: 'secondary',
        icon: <Clock className="h-3 w-3 mr-2" />,
      },
      confirming: {
        label: 'Confirming',
        variant: 'default',
        icon: <AlertCircle className="h-3 w-3 mr-2" />,
      },
      completed: {
        label: 'Completed',
        variant: 'default',
        icon: <CheckCircle2 className="h-3 w-3 mr-2" />,
      },
      failed: {
        label: 'Failed',
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3 mr-2" />,
      },
      expired: {
        label: 'Expired',
        variant: 'outline',
        icon: <XCircle className="h-3 w-3 mr-2" />,
      },
    };

    const config =
      statusConfig[status] ?? statusConfig['pending'] ?? statusConfig.pending;

    if (!config) return null;

    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>USD Value</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Confirmations</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              <div className="flex items-center gap-4">
                {transaction.transaction_type === 'deposit' ? (
                  <ArrowDownRight className="h-4 w-4 text-buy" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-sell" />
                )}
                <span className="capitalize">
                  {transaction.transaction_type}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span className="font-mono font-semibold">
                {transaction.currency}
              </span>
            </TableCell>
            <TableCell className="font-mono">
              {transaction.amount.toFixed(8)}
            </TableCell>
            <TableCell>
              ${transaction.usd_amount?.toFixed(2) || '0.00'}
            </TableCell>
            <TableCell>{getStatusBadge(transaction.status)}</TableCell>
            <TableCell>
              <Badge variant="outline">{transaction.confirmations}/3</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
