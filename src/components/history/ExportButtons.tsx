import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TradeHistoryItem, LedgerEntry, OrderHistoryItem } from "@/hooks/useTradingHistory";

interface ExportButtonsProps {
  trades: TradeHistoryItem[];
  orders: OrderHistoryItem[];
  ledger: LedgerEntry[];
}

const ExportButtons = ({ trades, orders, ledger }: ExportButtonsProps) => {
  const { toast } = useToast();

  const exportToCSV = (data: unknown[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available to export",
        variant: "destructive",
      });
      return;
    }

    // Get headers from first object (cast to a string-indexed record)
    const first = data[0] as Record<string, unknown>;
    const headers = Object.keys(first);
    const csvContent = [
      headers.join(","),
      ...data.map((row) => {
        const r = row as Record<string, unknown>;
        return headers.map((header) => JSON.stringify(r[header] ?? "")).join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `${filename} has been downloaded`,
    });
  };

  const exportTradesToPDF = () => {
    // For a simple implementation, we'll create a printable HTML version
    // In production, you'd use a library like jsPDF or pdfmake
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Pop-up blocked",
        description: "Please allow pop-ups to export PDF",
        variant: "destructive",
      });
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Trading History Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .profit { color: green; }
            .loss { color: red; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Trading History Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Quantity</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              ${trades
                .map(
                  (trade) => `
                <tr>
                  <td>${new Date(trade.closed_at).toLocaleString()}</td>
                  <td>${trade.symbol}</td>
                  <td>${trade.side.toUpperCase()}</td>
                  <td>${trade.quantity.toFixed(2)}</td>
                  <td>${trade.entry_price.toFixed(5)}</td>
                  <td>${trade.exit_price.toFixed(5)}</td>
                  <td class="${trade.realized_pnl >= 0 ? "profit" : "loss"}">
                    $${trade.realized_pnl.toFixed(2)}
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">
            Print / Save as PDF
          </button>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    toast({
      title: "PDF preview opened",
      description: "Use the print dialog to save as PDF",
    });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => exportToCSV(trades, "trades_history")}>
        <Download className="h-4 w-4 mr-2" />
        Export Trades CSV
      </Button>
      <Button variant="outline" onClick={() => exportToCSV(orders, "orders_history")}>
        <Download className="h-4 w-4 mr-2" />
        Export Orders CSV
      </Button>
      <Button variant="outline" onClick={() => exportToCSV(ledger, "ledger_history")}>
        <Download className="h-4 w-4 mr-2" />
        Export Ledger CSV
      </Button>
      <Button variant="outline" onClick={exportTradesToPDF}>
        <FileText className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
    </div>
  );
};

export default ExportButtons;
