/**
 * Risk Dashboard Export Utilities
 * Export portfolio metrics and risk analysis data to CSV and PDF
 */

import type { PortfolioMetrics, DrawdownAnalysis, AssetClassMetrics } from "@/lib/risk/portfolioMetrics";
import type { RiskMetrics, PortfolioRiskAssessment } from "@/lib/risk/riskMetrics";
import type { ConcentrationAnalysis, StressTestResults } from "@/lib/risk/positionAnalysis";

/**
 * Export risk dashboard data to CSV format
 */
export function exportRiskDashboardToCSV(
  riskMetrics: RiskMetrics | null,
  portfolioMetrics: PortfolioMetrics | null,
  drawdownAnalysis: DrawdownAnalysis | null,
  assetClassMetrics: AssetClassMetrics,
  concentration: ConcentrationAnalysis | null,
  stressTests: StressTestResults | null,
  fileName: string = "risk-dashboard.csv"
): void {
  const rows: string[] = [];
  const timestamp = new Date().toISOString();

  // Header
  rows.push("Risk Dashboard Export");
  rows.push(`Generated: ${timestamp}`);
  rows.push("");

  // Risk Metrics Section
  if (riskMetrics) {
    rows.push("RISK METRICS");
    rows.push("Metric,Value");
    rows.push(`Margin Level,${riskMetrics.currentMarginLevel.toFixed(2)}%`);
    rows.push(`Free Margin,$${riskMetrics.freeMargin.toFixed(2)}`);
    rows.push(`Used Margin,$${riskMetrics.usedMargin.toFixed(2)}`);
    rows.push(`Margin Call Threshold,${riskMetrics.marginCallThreshold}%`);
    rows.push(`Liquidation Threshold,${riskMetrics.liquidationThreshold}%`);
    rows.push(`Risk Level,${riskMetrics.riskLevel.toUpperCase()}`);
    rows.push(`Capital at Risk,$${riskMetrics.capitalAtRisk.toFixed(2)}`);
    rows.push(`Capital at Risk %,${riskMetrics.capitalAtRiskPercentage.toFixed(2)}%`);
    rows.push("");
  }

  // Portfolio Metrics Section
  if (portfolioMetrics) {
    rows.push("PORTFOLIO METRICS");
    rows.push("Metric,Value");
    rows.push(`Total Capital,$${portfolioMetrics.totalCapital.toFixed(2)}`);
    rows.push(`Current Equity,$${portfolioMetrics.currentEquity.toFixed(2)}`);
    rows.push(`Total Realized P&L,$${portfolioMetrics.totalRealizedPnL.toFixed(2)}`);
    rows.push(`Total Unrealized P&L,$${portfolioMetrics.totalUnrealizedPnL.toFixed(2)}`);
    rows.push(`Total P&L,$${portfolioMetrics.totalPnL.toFixed(2)}`);
    rows.push(`Total P&L %,${portfolioMetrics.totalPnLPercentage.toFixed(2)}%`);
    rows.push(`ROI,${portfolioMetrics.roi.toFixed(2)}%`);
    rows.push("");

    // Trade Statistics
    rows.push("TRADE STATISTICS");
    rows.push("Metric,Value");
    rows.push(`Total Trades,${portfolioMetrics.totalTrades}`);
    rows.push(`Profitable Trades,${portfolioMetrics.profitableTrades}`);
    rows.push(`Losing Trades,${portfolioMetrics.losingTrades}`);
    rows.push(`Win Rate,${portfolioMetrics.winRate.toFixed(2)}%`);
    rows.push(`Profit Factor,${portfolioMetrics.profitFactor.toFixed(2)}`);
    rows.push(`Largest Win,$${portfolioMetrics.largestWin.toFixed(2)}`);
    rows.push(`Largest Loss,$${portfolioMetrics.largestLoss.toFixed(2)}`);
    rows.push(`Average Win,$${portfolioMetrics.averageWin.toFixed(2)}`);
    rows.push(`Average Loss,$${portfolioMetrics.averageLoss.toFixed(2)}`);
    rows.push(`Expectancy,$${portfolioMetrics.expectancy.toFixed(2)}`);
    rows.push("");

    // Drawdown Analysis
    if (drawdownAnalysis) {
      rows.push("DRAWDOWN ANALYSIS");
      rows.push("Metric,Value");
      rows.push(`Current Drawdown,$${drawdownAnalysis.currentDrawdown.toFixed(2)}`);
      rows.push(`Current Drawdown %,${drawdownAnalysis.drawdownPercentage.toFixed(2)}%`);
      rows.push(`Max Drawdown,$${drawdownAnalysis.maxDrawdown.toFixed(2)}`);
      rows.push(`Max Drawdown %,${drawdownAnalysis.maxDrawdownPercentage.toFixed(2)}%`);
      rows.push(`Peak Equity,$${drawdownAnalysis.peakEquity.toFixed(2)}`);
      rows.push(`Trough Equity,$${drawdownAnalysis.troughEquity.toFixed(2)}`);
      rows.push("");
    }
  }

  // Asset Class Metrics Section
  if (Object.keys(assetClassMetrics).length > 0) {
    rows.push("ASSET CLASS BREAKDOWN");
    rows.push("Asset Class,Positions,Total Value,Unrealized P&L,Portfolio %,P&L %");
    for (const [assetClass, metrics] of Object.entries(assetClassMetrics)) {
      rows.push(
        `${assetClass},${metrics.positions},$${metrics.totalValue.toFixed(2)},$${metrics.unrealizedPnL.toFixed(2)},${metrics.percentageOfPortfolio.toFixed(2)}%,${metrics.pnlPercentage.toFixed(2)}%`
      );
    }
    rows.push("");
  }

  // Concentration Analysis Section
  if (concentration && concentration.totalPositions > 0) {
    rows.push("TOP POSITIONS BY CONCENTRATION");
    rows.push("Symbol,Asset Class,Concentration %,Position Value,Unrealized P&L,Risk Level");
    for (const position of concentration.topPositions) {
      rows.push(
        `${position.symbol},${position.assetClass},${position.percentageOfPortfolio.toFixed(2)}%,$${position.positionValue.toFixed(2)},$${position.unrealizedPnL.toFixed(2)},${position.risk}`
      );
    }
    rows.push("");

    rows.push("CONCENTRATION METRICS");
    rows.push("Metric,Value");
    rows.push(`Total Positions,${concentration.totalPositions}`);
    rows.push(`Herfindahl Index,${concentration.herfindahlIndex.toFixed(2)}`);
    rows.push(`Concentration Level,${concentration.concentrationLevel}`);
    rows.push(`Diversification Score,${concentration.diversificationScore}%`);
    rows.push("");
  }

  // Stress Test Results Section
  if (stressTests && stressTests.scenarios.length > 0) {
    rows.push("STRESS TEST RESULTS");
    rows.push("Price Movement %,Estimated Loss,$,Margin Level,Risk Level");
    for (const scenario of stressTests.scenarios) {
      rows.push(
        `${scenario.priceMovement}%,$${scenario.estimatedLoss.toFixed(2)},${scenario.marginLevel.toFixed(2)}%,${scenario.riskLevel}`
      );
    }
    rows.push("");

    rows.push("STRESS TEST SUMMARY");
    rows.push("Metric,Value");
    rows.push(`Max Possible Loss,$${stressTests.maxPossibleLoss.toFixed(2)}`);
    rows.push(`Survival Rate,${stressTests.survivalRate.toFixed(2)}%`);
    rows.push("");
  }

  // Download CSV
  const csvContent = rows.join("\n");
  downloadFile(csvContent, fileName, "text/csv");
}

/**
 * Export risk dashboard summary to PDF (placeholder - actual PDF generation would require a library)
 * For now, exports formatted text that can be converted to PDF
 */
export function exportRiskDashboardToPDF(
  riskMetrics: RiskMetrics | null,
  portfolioMetrics: PortfolioMetrics | null,
  drawdownAnalysis: DrawdownAnalysis | null,
  assetClassMetrics: AssetClassMetrics,
  concentration: ConcentrationAnalysis | null,
  stressTests: StressTestResults | null,
  fileName: string = "risk-dashboard.txt"
): void {
  const lines: string[] = [];
  const timestamp = new Date().toISOString();
  const formattedDate = new Date().toLocaleDateString();

  // Header
  lines.push("═".repeat(80));
  lines.push("RISK DASHBOARD REPORT".padEnd(40) + formattedDate.padStart(40));
  lines.push("═".repeat(80));
  lines.push("");

  // Risk Metrics Section
  if (riskMetrics) {
    lines.push("RISK METRICS".padEnd(40) + "─".repeat(40));
    lines.push(
      `  Margin Level: ${riskMetrics.currentMarginLevel.toFixed(2)}%`.padEnd(50) +
      `Risk Level: ${riskMetrics.riskLevel.toUpperCase()}`
    );
    lines.push(
      `  Free Margin: $${riskMetrics.freeMargin.toFixed(2)}`.padEnd(50) +
      `Capital at Risk: $${riskMetrics.capitalAtRisk.toFixed(2)}`
    );
    lines.push(
      `  Used Margin: $${riskMetrics.usedMargin.toFixed(2)}`.padEnd(50) +
      `Capital at Risk %: ${riskMetrics.capitalAtRiskPercentage.toFixed(2)}%`
    );
    lines.push("");
  }

  // Portfolio Performance Section
  if (portfolioMetrics) {
    lines.push("PORTFOLIO PERFORMANCE".padEnd(40) + "─".repeat(40));
    lines.push(
      `  Current Equity: $${portfolioMetrics.currentEquity.toFixed(2)}`.padEnd(50) +
      `Total Capital: $${portfolioMetrics.totalCapital.toFixed(2)}`
    );
    lines.push(
      `  Total P&L: $${portfolioMetrics.totalPnL.toFixed(2)}`.padEnd(50) +
      `P&L %: ${portfolioMetrics.totalPnLPercentage.toFixed(2)}%`
    );
    lines.push(
      `  ROI: ${portfolioMetrics.roi.toFixed(2)}%`.padEnd(50) +
      `Total Trades: ${portfolioMetrics.totalTrades}`
    );
    lines.push("");

    // Trade Statistics
    lines.push("TRADE STATISTICS".padEnd(40) + "─".repeat(40));
    lines.push(
      `  Win Rate: ${portfolioMetrics.winRate.toFixed(2)}%`.padEnd(50) +
      `Profit Factor: ${portfolioMetrics.profitFactor.toFixed(2)}`
    );
    lines.push(
      `  Largest Win: $${portfolioMetrics.largestWin.toFixed(2)}`.padEnd(50) +
      `Largest Loss: $${portfolioMetrics.largestLoss.toFixed(2)}`
    );
    lines.push(
      `  Average Win: $${portfolioMetrics.averageWin.toFixed(2)}`.padEnd(50) +
      `Average Loss: $${portfolioMetrics.averageLoss.toFixed(2)}`
    );
    lines.push("");

    // Drawdown
    if (drawdownAnalysis) {
      lines.push("DRAWDOWN ANALYSIS".padEnd(40) + "─".repeat(40));
      lines.push(
        `  Current Drawdown: $${drawdownAnalysis.currentDrawdown.toFixed(2)} (${drawdownAnalysis.drawdownPercentage.toFixed(2)}%)`
      );
      lines.push(
        `  Max Drawdown: $${drawdownAnalysis.maxDrawdown.toFixed(2)} (${drawdownAnalysis.maxDrawdownPercentage.toFixed(2)}%)`
      );
      lines.push(
        `  Peak Equity: $${drawdownAnalysis.peakEquity.toFixed(2)}`.padEnd(50) +
        `Trough Equity: $${drawdownAnalysis.troughEquity.toFixed(2)}`
      );
      lines.push("");
    }
  }

  // Asset Class Breakdown
  if (Object.keys(assetClassMetrics).length > 0) {
    lines.push("ASSET CLASS ALLOCATION".padEnd(40) + "─".repeat(40));
    for (const [assetClass, metrics] of Object.entries(assetClassMetrics)) {
      lines.push(
        `  ${assetClass}:`.padEnd(50) +
        `${metrics.percentageOfPortfolio.toFixed(1)}% (${metrics.positions} position${metrics.positions > 1 ? "s" : ""})`
      );
    }
    lines.push("");
  }

  // Concentration Analysis
  if (concentration && concentration.totalPositions > 0) {
    lines.push("CONCENTRATION ANALYSIS".padEnd(40) + "─".repeat(40));
    lines.push(
      `  Diversification Score: ${concentration.diversificationScore}%`.padEnd(50) +
      `Concentration Level: ${concentration.concentrationLevel}`
    );
    lines.push(
      `  Total Positions: ${concentration.totalPositions}`.padEnd(50) +
      `Herfindahl Index: ${concentration.herfindahlIndex.toFixed(2)}`
    );
    lines.push("");

    if (concentration.topPositions.length > 0) {
      lines.push("  Top Positions:");
      for (const position of concentration.topPositions.slice(0, 5)) {
        lines.push(
          `    • ${position.symbol} (${position.assetClass}): ${position.percentageOfPortfolio.toFixed(2)}% - ${position.risk} risk`
        );
      }
    }
    lines.push("");
  }

  // Stress Test Summary
  if (stressTests) {
    lines.push("STRESS TEST SUMMARY".padEnd(40) + "─".repeat(40));
    lines.push(
      `  Max Possible Loss: $${stressTests.maxPossibleLoss.toFixed(2)}`.padEnd(50) +
      `Survival Rate: ${stressTests.survivalRate.toFixed(2)}%`
    );
    lines.push(
      `  Most Severe Scenario: ${stressTests.mostSevereScenario.name}`.padEnd(50) +
      `Est. Loss: $${stressTests.mostSevereScenario.estimatedLoss.toFixed(2)}`
    );
    lines.push("");
  }

  // Footer
  lines.push("═".repeat(80));
  lines.push(`Generated: ${timestamp}`);
  lines.push("═".repeat(80));

  // Download as text file (can be printed to PDF from browser)
  const content = lines.join("\n");
  downloadFile(content, fileName, "text/plain");
}

/**
 * Generate HTML report for risk dashboard
 */
export function generateRiskDashboardHTMLReport(
  riskMetrics: RiskMetrics | null,
  portfolioMetrics: PortfolioMetrics | null,
  drawdownAnalysis: DrawdownAnalysis | null,
  assetClassMetrics: AssetClassMetrics,
  concentration: ConcentrationAnalysis | null,
  stressTests: StressTestResults | null
): string {
  const timestamp = new Date().toISOString();
  const formattedDate = new Date().toLocaleDateString();

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Dashboard Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header-meta {
            color: #666;
            font-size: 12px;
            margin-top: 10px;
        }
        .section {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .section h2 {
            margin-top: 0;
            color: #222;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .metric-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #007bff;
        }
        .metric-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        .metric-value {
            font-size: 18px;
            font-weight: bold;
            color: #222;
        }
        .risk-safe { border-left-color: #28a745; }
        .risk-warning { border-left-color: #ffc107; }
        .risk-critical { border-left-color: #fd7e14; }
        .risk-liquidation { border-left-color: #dc3545; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .footer {
            text-align: center;
            color: #999;
            font-size: 11px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        @media print {
            body { background: white; }
            .section { box-shadow: none; border: 1px solid #ddd; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Risk Dashboard Report</h1>
        <div class="header-meta">
            <strong>Generated:</strong> ${formattedDate} at ${new Date().toLocaleTimeString()}
        </div>
    </div>
  `;

  // Risk Metrics Section
  if (riskMetrics) {
    const riskClass = `risk-${riskMetrics.riskLevel}`;
    html += `
    <div class="section">
        <h2>Risk Metrics</h2>
        <div class="metric-grid">
            <div class="metric-card ${riskClass}">
                <div class="metric-label">Margin Level</div>
                <div class="metric-value">${riskMetrics.currentMarginLevel.toFixed(2)}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Risk Level</div>
                <div class="metric-value">${riskMetrics.riskLevel.toUpperCase()}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Free Margin</div>
                <div class="metric-value">$${riskMetrics.freeMargin.toFixed(2)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Capital at Risk</div>
                <div class="metric-value">$${riskMetrics.capitalAtRisk.toFixed(2)}</div>
            </div>
        </div>
    </div>
    `;
  }

  // Portfolio Metrics Section
  if (portfolioMetrics) {
    html += `
    <div class="section">
        <h2>Portfolio Performance</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-label">Current Equity</div>
                <div class="metric-value">$${portfolioMetrics.currentEquity.toFixed(2)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total P&L</div>
                <div class="metric-value" style="color: ${portfolioMetrics.totalPnL >= 0 ? '#28a745' : '#dc3545'}">
                    $${portfolioMetrics.totalPnL.toFixed(2)}
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">ROI</div>
                <div class="metric-value">${portfolioMetrics.roi.toFixed(2)}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Win Rate</div>
                <div class="metric-value">${portfolioMetrics.winRate.toFixed(2)}%</div>
            </div>
        </div>
        <table>
            <tr>
                <th>Metric</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>Total Realized P&L</td>
                <td>$${portfolioMetrics.totalRealizedPnL.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Total Unrealized P&L</td>
                <td>$${portfolioMetrics.totalUnrealizedPnL.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Total Trades</td>
                <td>${portfolioMetrics.totalTrades}</td>
            </tr>
            <tr>
                <td>Profitable Trades</td>
                <td>${portfolioMetrics.profitableTrades}</td>
            </tr>
            <tr>
                <td>Losing Trades</td>
                <td>${portfolioMetrics.losingTrades}</td>
            </tr>
            <tr>
                <td>Profit Factor</td>
                <td>${portfolioMetrics.profitFactor.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Largest Win</td>
                <td style="color: #28a745">$${portfolioMetrics.largestWin.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Largest Loss</td>
                <td style="color: #dc3545">$${portfolioMetrics.largestLoss.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Average Win</td>
                <td>$${portfolioMetrics.averageWin.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Average Loss</td>
                <td>$${portfolioMetrics.averageLoss.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Expectancy per Trade</td>
                <td>$${portfolioMetrics.expectancy.toFixed(2)}</td>
            </tr>
        </table>
    </div>
    `;
  }

  // Drawdown Analysis
  if (drawdownAnalysis) {
    html += `
    <div class="section">
        <h2>Drawdown Analysis</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-label">Current Drawdown</div>
                <div class="metric-value">$${drawdownAnalysis.currentDrawdown.toFixed(2)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Max Drawdown</div>
                <div class="metric-value">$${drawdownAnalysis.maxDrawdown.toFixed(2)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Max Drawdown %</div>
                <div class="metric-value">${drawdownAnalysis.maxDrawdownPercentage.toFixed(2)}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Recovery Status</div>
                <div class="metric-value">${drawdownAnalysis.isRecovering ? 'Recovering' : 'Drawdown'}</div>
            </div>
        </div>
    </div>
    `;
  }

  // Asset Class Breakdown
  if (Object.keys(assetClassMetrics).length > 0) {
    html += `
    <div class="section">
        <h2>Asset Class Allocation</h2>
        <table>
            <tr>
                <th>Asset Class</th>
                <th>Positions</th>
                <th>Total Value</th>
                <th>Portfolio %</th>
                <th>Unrealized P&L</th>
                <th>P&L %</th>
            </tr>
    `;
    for (const [assetClass, metrics] of Object.entries(assetClassMetrics)) {
      html += `
            <tr>
                <td>${assetClass}</td>
                <td>${metrics.positions}</td>
                <td>$${metrics.totalValue.toFixed(2)}</td>
                <td>${metrics.percentageOfPortfolio.toFixed(2)}%</td>
                <td>$${metrics.unrealizedPnL.toFixed(2)}</td>
                <td style="color: ${metrics.pnlPercentage >= 0 ? '#28a745' : '#dc3545'}">
                    ${metrics.pnlPercentage.toFixed(2)}%
                </td>
            </tr>
      `;
    }
    html += `
        </table>
    </div>
    `;
  }

  html += `
    <div class="footer">
        <p>This report is generated automatically and should be reviewed by the account holder.</p>
        <p>Generated at: ${timestamp}</p>
    </div>
</body>
</html>
  `;

  return html;
}

/**
 * Download file utility
 */
function downloadFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Open HTML report in new window for printing
 */
export function openRiskDashboardReport(html: string): void {
  const newWindow = window.open();
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
  }
}
