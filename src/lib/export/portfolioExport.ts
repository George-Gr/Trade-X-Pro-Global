/**
 * Export utilities for portfolio data (CSV, PDF)
 */

export interface PortfolioExportData {
  balance: number;
  equity: number;
  marginLevel: number;
  totalPnL: number;
  roi: number;
  positions: Array<{
    symbol: string;
    quantity: number;
    entryPrice: number;
    currentPrice: number;
    side: 'buy' | 'sell';
    pnl: number;
  }>;
  timestamp: Date;
}

/**
 * Export portfolio data to CSV format
 */
export const exportToCSV = (data: PortfolioExportData): string => {
  const lines: string[] = [];

  // Header section
  lines.push('PORTFOLIO SNAPSHOT REPORT');
  lines.push(`Exported: ${data.timestamp.toISOString()}`);
  lines.push('');

  // Summary section
  lines.push('ACCOUNT SUMMARY');
  lines.push('Field,Value');
  lines.push(`Balance,$${data.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}`);
  lines.push(`Total Equity,$${data.equity.toLocaleString('en-US', { maximumFractionDigits: 2 })}`);
  lines.push(`Margin Level,${data.marginLevel.toFixed(2)}%`);
  lines.push(`Total P&L,$${data.totalPnL.toLocaleString('en-US', { maximumFractionDigits: 2 })}`);
  lines.push(`ROI,${data.roi.toFixed(2)}%`);
  lines.push('');

  // Positions section
  lines.push('OPEN POSITIONS');
  lines.push('Symbol,Quantity,Entry Price,Current Price,Side,P&L');
  data.positions.forEach((pos) => {
    lines.push(
      `${pos.symbol},${pos.quantity},${pos.entryPrice.toFixed(5)},${pos.currentPrice.toFixed(5)},${pos.side},$${pos.pnl.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    );
  });

  return lines.join('\n');
};

/**
 * Download CSV file to browser
 */
export const downloadCSV = (data: PortfolioExportData, filename = 'portfolio-export.csv'): void => {
  const csv = exportToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate a simple HTML representation for PDF conversion
 * (In production, would use jsPDF or similar library)
 */
export const generatePDFHTML = (data: PortfolioExportData): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Portfolio Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: white; }
          h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0; }
          .summary-item { padding: 10px; background: #f8f9fa; border-radius: 6px; }
          .summary-label { font-weight: bold; color: #666; }
          .summary-value { font-size: 18px; color: #333; margin-top: 5px; }
          .positive { color: #28a745; }
          .negative { color: #dc3545; }
          .timestamp { color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Portfolio Report</h1>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Account Balance</div>
            <div class="summary-value">$${data.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Equity</div>
            <div class="summary-value">$${data.equity.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Margin Level</div>
            <div class="summary-value">${data.marginLevel.toFixed(2)}%</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total P&L</div>
            <div class="summary-value ${data.totalPnL >= 0 ? 'positive' : 'negative'}">
              $${data.totalPnL.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">ROI</div>
            <div class="summary-value ${data.roi >= 0 ? 'positive' : 'negative'}">
              ${data.roi.toFixed(2)}%
            </div>
          </div>
        </div>

        <h2>Open Positions</h2>
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Entry Price</th>
              <th>Current Price</th>
              <th>Side</th>
              <th>P&L</th>
            </tr>
          </thead>
          <tbody>
            ${data.positions
              .map(
                (pos) => `
              <tr>
                <td>${pos.symbol}</td>
                <td>${pos.quantity}</td>
                <td>${pos.entryPrice.toFixed(5)}</td>
                <td>${pos.currentPrice.toFixed(5)}</td>
                <td>${pos.side}</td>
                <td class="${pos.pnl >= 0 ? 'positive' : 'negative'}">
                  $${pos.pnl.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="timestamp">
          Generated: ${data.timestamp.toLocaleString()}
        </div>
      </body>
    </html>
  `;
};

/**
 * Trigger browser print dialog for PDF generation
 */
export const downloadPDF = (data: PortfolioExportData, filename = 'portfolio-export.pdf'): void => {
  const html = generatePDFHTML(data);
  const printWindow = window.open('', '', 'width=800,height=600');

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    // In a real app, you might use jsPDF here instead:
    // setTimeout(() => printWindow.print(), 250);
  }
};
