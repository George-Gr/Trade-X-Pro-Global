/**
 * Test Suite: Risk Dashboard Calculations
 * Comprehensive tests for risk metrics, portfolio metrics, and position analysis
 */

import { describe, it, expect } from "vitest";
import {
  calculateMarginLevel,
  calculateFreeMargin,
  calculateMarginUsagePercentage,
  classifyRiskLevel,
  calculateCapitalAtRisk,
  calculateCapitalAtRiskPercentage,
  calculateWorstCaseLoss,
  calculateLiquidationPrice,
  calculateMovementToLiquidation,
  calculateRiskMetrics,
  isCloseOnlyMode,
  isLiquidationRisk,
  formatMarginLevel,
} from "@/lib/risk/riskMetrics";
import {
  calculateTotalPnL,
  calculatePnLPercentage,
  calculateROI,
  calculateWinRate,
  calculateProfitFactor,
  calculateAverageWin,
  calculateAverageLoss,
  calculateRiskRewardRatio,
  calculateExpectancy,
  calculateDrawdown,
  calculateDrawdownPercentage,
  calculateMaxDrawdown,
  calculateRecoveryFactor,
  analyzeDrawdown,
  breakdownByAssetClass,
  calculatePortfolioMetrics,
} from "@/lib/risk/portfolioMetrics";
import {
  calculateConcentration,
  classifyConcentrationRisk,
  calculateHerfindahlIndex,
  analyzeConcentration,
  calculateCorrelation,
  classifyHedgingPotential,
  calculateEffectiveNumberOfPositions,
  assessDiversification,
  runStressTests,
} from "@/lib/risk/positionAnalysis";

// ============================================================================
// RISK METRICS TESTS
// ============================================================================

describe("Risk Metrics Calculations", () => {
  describe("Margin Level", () => {
    it("should calculate margin level correctly", () => {
      const marginLevel = calculateMarginLevel(10000, 5000);
      expect(marginLevel).toBe(200);
    });

    it("should handle zero margin used", () => {
      const marginLevel = calculateMarginLevel(10000, 0);
      expect(marginLevel).toBe(10000);
    });

    it("should classify SAFE risk level", () => {
      const riskLevel = classifyRiskLevel(300);
      expect(riskLevel).toBe("safe");
    });

    it("should classify WARNING risk level", () => {
      const riskLevel = classifyRiskLevel(150);
      expect(riskLevel).toBe("warning");
    });

    it("should classify CRITICAL risk level", () => {
      const riskLevel = classifyRiskLevel(75);
      expect(riskLevel).toBe("critical");
    });

    it("should classify LIQUIDATION risk level", () => {
      const riskLevel = classifyRiskLevel(25);
      expect(riskLevel).toBe("liquidation");
    });
  });

  describe("Free and Used Margin", () => {
    it("should calculate free margin correctly", () => {
      const freeMargin = calculateFreeMargin(10000, 3000);
      expect(freeMargin).toBe(7000);
    });

    it("should not return negative free margin", () => {
      const freeMargin = calculateFreeMargin(2000, 5000);
      expect(freeMargin).toBe(0);
    });

    it("should calculate margin usage percentage", () => {
      const usage = calculateMarginUsagePercentage(5000, 10000);
      expect(usage).toBe(50);
    });

    it("should cap margin usage at 100%", () => {
      const usage = calculateMarginUsagePercentage(15000, 10000);
      expect(usage).toBe(100);
    });
  });

  describe("Capital at Risk", () => {
    it("should calculate total capital at risk", () => {
      const positions = [
        { positionValue: 5000, marginRequired: 2500 },
        { positionValue: 3000, marginRequired: 1500 },
      ];
      const car = calculateCapitalAtRisk(positions);
      expect(car).toBe(8000);
    });

    it("should handle empty positions array", () => {
      const car = calculateCapitalAtRisk([]);
      expect(car).toBe(0);
    });

    it("should calculate capital at risk percentage", () => {
      const carPercentage = calculateCapitalAtRiskPercentage(8000, 10000);
      expect(carPercentage).toBe(80);
    });
  });

  describe("Liquidation Price", () => {
    it("should calculate liquidation price for long positions", () => {
      const liquidationPrice = calculateLiquidationPrice(100, "long", 2);
      expect(liquidationPrice).toBe(50);
    });

    it("should calculate liquidation price for short positions", () => {
      const liquidationPrice = calculateLiquidationPrice(100, "short", 2);
      expect(liquidationPrice).toBe(200);
    });

    it("should calculate movement to liquidation for long", () => {
      const movement = calculateMovementToLiquidation(100, 50, "long");
      expect(movement).toBe(50); // 50% movement
    });

    it("should calculate movement to liquidation for short", () => {
      const movement = calculateMovementToLiquidation(100, 200, "short");
      expect(movement).toBe(100); // 100% movement
    });
  });

  describe("Close-only and Liquidation Risk", () => {
    it("should detect close-only mode", () => {
      const closeOnly = isCloseOnlyMode(80);
      expect(closeOnly).toBe(true);
    });

    it("should not be in close-only mode", () => {
      const closeOnly = isCloseOnlyMode(200);
      expect(closeOnly).toBe(false);
    });

    it("should detect liquidation risk", () => {
      const risk = isLiquidationRisk(30);
      expect(risk).toBe(true);
    });

    it("should not have liquidation risk", () => {
      const risk = isLiquidationRisk(150);
      expect(risk).toBe(false);
    });
  });

  describe("Margin Level Formatting", () => {
    it("should format finite margin level", () => {
      const formatted = formatMarginLevel(150.25);
      expect(formatted).toBe("150.25%");
    });

    it("should format infinite margin level", () => {
      const formatted = formatMarginLevel(15000);
      expect(formatted).toBe("∞%");
    });
  });

  describe("Comprehensive Risk Metrics", () => {
    it("should calculate complete risk metrics", () => {
      const positions = [
        { positionValue: 5000, marginRequired: 2500 },
      ];
      const metrics = calculateRiskMetrics(10000, 2500, positions);

      expect(metrics.currentMarginLevel).toBe(400);
      expect(metrics.freeMargin).toBe(7500);
      expect(metrics.usedMargin).toBe(2500);
      expect(metrics.riskLevel).toBe("safe");
      expect(metrics.capitalAtRisk).toBe(5000);
    });
  });
});

// ============================================================================
// PORTFOLIO METRICS TESTS
// ============================================================================

describe("Portfolio Metrics Calculations", () => {
  describe("P&L Calculations", () => {
    it("should calculate total P&L", () => {
      const totalPnL = calculateTotalPnL(5000, 2000);
      expect(totalPnL).toBe(7000);
    });

    it("should calculate P&L percentage", () => {
      const pnlPercentage = calculatePnLPercentage(1000, 10000);
      expect(pnlPercentage).toBe(10);
    });

    it("should calculate ROI", () => {
      const roi = calculateROI(2000, 10000);
      expect(roi).toBe(20);
    });
  });

  describe("Trade Statistics", () => {
    it("should calculate win rate", () => {
      const winRate = calculateWinRate(70, 100);
      expect(winRate).toBe(70);
    });

    it("should handle zero total trades", () => {
      const winRate = calculateWinRate(0, 0);
      expect(winRate).toBe(0);
    });

    it("should calculate profit factor", () => {
      const profitFactor = calculateProfitFactor(10000, 5000);
      expect(profitFactor).toBe(2);
    });

    it("should max out profit factor on zero loss", () => {
      const profitFactor = calculateProfitFactor(5000, 0);
      expect(profitFactor).toBe(999.99);
    });

    it("should calculate average win", () => {
      const avgWin = calculateAverageWin(5000, 50);
      expect(avgWin).toBe(100);
    });

    it("should calculate average loss", () => {
      const avgLoss = calculateAverageLoss(2000, 40);
      expect(avgLoss).toBe(50);
    });

    it("should calculate risk-reward ratio", () => {
      const ratio = calculateRiskRewardRatio(200, 100);
      expect(ratio).toBe(2);
    });

    it("should calculate expectancy", () => {
      const expectancy = calculateExpectancy(60, 100, -50);
      // Win prob 60% * 100 - Loss prob 40% * 50 = 60 - 20 = 40
      expect(expectancy).toBe(40);
    });
  });

  describe("Drawdown Analysis", () => {
    it("should calculate drawdown", () => {
      const drawdown = calculateDrawdown(8000, 10000);
      expect(drawdown).toBe(2000);
    });

    it("should not calculate negative drawdown", () => {
      const drawdown = calculateDrawdown(12000, 10000);
      expect(drawdown).toBe(0);
    });

    it("should calculate drawdown percentage", () => {
      const percentage = calculateDrawdownPercentage(8000, 10000);
      expect(percentage).toBe(20);
    });

    it("should calculate max drawdown from history", () => {
      const history = [10000, 9000, 8500, 9500, 8000, 9000];
      const maxDrawdown = calculateMaxDrawdown(history);
      expect(maxDrawdown.maxDrawdown).toBe(2000);
      expect(maxDrawdown.maxDrawdownPercentage).toBe(20);
    });

    it("should calculate recovery factor", () => {
      const recoveryFactor = calculateRecoveryFactor(5000, 1000);
      expect(recoveryFactor).toBe(5);
    });

    it("should max out recovery factor on zero drawdown", () => {
      const recoveryFactor = calculateRecoveryFactor(1000, 0);
      expect(recoveryFactor).toBe(999.99);
    });

    it("should analyze drawdown details", () => {
      const analysis = analyzeDrawdown(9000, 10000, 2000);
      expect(analysis.currentDrawdown).toBe(1000);
      expect(analysis.maxDrawdown).toBe(2000);
      expect(analysis.isRecovering).toBe(true);
    });
  });

  describe("Asset Class Breakdown", () => {
    it("should breakdown portfolio by asset class", () => {
      const positions = [
        { symbol: "EURUSD", assetClass: "Forex", quantity: 100, currentPrice: 1.1, unrealizedPnL: 50 },
        { symbol: "AAPL", assetClass: "Stocks", quantity: 10, currentPrice: 150, unrealizedPnL: 100 },
      ];
      const breakdown = breakdownByAssetClass(positions, 2600);

      expect(breakdown["Forex"]).toBeDefined();
      expect(breakdown["Stocks"]).toBeDefined();
      expect(breakdown["Forex"].positions).toBe(1);
      expect(breakdown["Stocks"].positions).toBe(1);
    });
  });

  describe("Comprehensive Portfolio Metrics", () => {
    it("should calculate complete portfolio metrics", () => {
      const trades = [
        { pnl: 500, isProfit: true },
        { pnl: -200, isProfit: false },
        { pnl: 300, isProfit: true },
      ];
      const equityHistory = [10000, 10500, 10300, 10600];

      const metrics = calculatePortfolioMetrics(
        10600,
        10000,
        500,
        200,
        trades,
        equityHistory
      );

      expect(metrics.totalRealizedPnL).toBe(500);
      expect(metrics.totalUnrealizedPnL).toBe(200);
      expect(metrics.totalTrades).toBe(3);
      expect(metrics.profitableTrades).toBe(2);
      expect(metrics.losingTrades).toBe(1);
      expect(metrics.winRate).toBe(66.67);
      expect(metrics.profitFactor).toBeGreaterThan(1);
    });
  });
});

// ============================================================================
// POSITION ANALYSIS TESTS
// ============================================================================

describe("Position Analysis Calculations", () => {
  describe("Concentration Analysis", () => {
    it("should calculate position concentration", () => {
      const concentration = calculateConcentration(5000, 10000);
      expect(concentration).toBe(50);
    });

    it("should classify low concentration risk", () => {
      const risk = classifyConcentrationRisk(3);
      expect(risk).toBe("low");
    });

    it("should classify medium concentration risk", () => {
      const risk = classifyConcentrationRisk(7);
      expect(risk).toBe("medium");
    });

    it("should classify high concentration risk", () => {
      const risk = classifyConcentrationRisk(15);
      expect(risk).toBe("high");
    });

    it("should classify critical concentration risk", () => {
      const risk = classifyConcentrationRisk(60);
      expect(risk).toBe("critical");
    });
  });

  describe("Herfindahl Index", () => {
    it("should calculate Herfindahl Index", () => {
      const concentrations = [25, 25, 25, 25]; // Perfect diversification
      const hi = calculateHerfindahlIndex(concentrations);
      expect(hi).toBe(2500); // 4 × 25² = 2500
    });

    it("should detect high concentration", () => {
      const concentrations = [90, 5, 3, 2]; // Highly concentrated
      const hi = calculateHerfindahlIndex(concentrations);
      expect(hi).toBeGreaterThan(8000);
    });
  });

  describe("Correlation Analysis", () => {
    it("should calculate perfect correlation", () => {
      const prices1 = [100, 101, 102, 103, 104];
      const prices2 = [100, 101, 102, 103, 104];
      const correlation = calculateCorrelation(prices1, prices2);
      expect(correlation).toBeCloseTo(1, 0.1);
    });

    it("should calculate negative correlation", () => {
      const prices1 = [100, 101, 102, 103, 104];
      const prices2 = [104, 103, 102, 101, 100];
      const correlation = calculateCorrelation(prices1, prices2);
      expect(correlation).toBeLessThan(0);
    });

    it("should classify high hedging potential", () => {
      const potential = classifyHedgingPotential(-0.7);
      expect(potential).toBe("high");
    });

    it("should classify low hedging potential", () => {
      const potential = classifyHedgingPotential(0.8);
      expect(potential).toBe("low");
    });
  });

  describe("Effective Number of Positions", () => {
    it("should calculate ENP for equal weight positions", () => {
      const concentrations = [25, 25, 25, 25]; // 4 equal positions
      const enp = calculateEffectiveNumberOfPositions(concentrations);
      expect(enp).toBeCloseTo(4, 1);
    });

    it("should detect single position concentration", () => {
      const concentrations = [100]; // Single position
      const enp = calculateEffectiveNumberOfPositions(concentrations);
      expect(enp).toBeLessThan(2);
    });
  });

  describe("Diversification Assessment", () => {
    it("should assess reasonably diversified portfolio", () => {
      const positions = [
        { symbol: "EUR", assetClass: "Forex", quantity: 100, currentPrice: 1.1 },
        { symbol: "GBP", assetClass: "Forex", quantity: 100, currentPrice: 1.3 },
        { symbol: "JPY", assetClass: "Forex", quantity: 1000, currentPrice: 0.01 },
        { symbol: "AAPL", assetClass: "Stocks", quantity: 10, currentPrice: 150 },
        { symbol: "MSFT", assetClass: "Stocks", quantity: 10, currentPrice: 300 },
      ];
      const diversification = assessDiversification(positions, 5000);

      expect(diversification.numberOfSymbols).toBe(5);
      expect(diversification.numberOfAssetClasses).toBe(2);
      expect(diversification.numberOfSymbols).toBeGreaterThanOrEqual(5); // At least 5 positions
    });

    it("should detect poorly diversified portfolio", () => {
      const positions = [
        { symbol: "SINGLE", assetClass: "Stocks", quantity: 1000, currentPrice: 100 },
      ];
      const diversification = assessDiversification(positions, 100000);

      expect(diversification.numberOfSymbols).toBe(1);
      expect(diversification.isWellDiversified).toBe(false);
      expect(diversification.largestPosition).toBe(100);
    });
  });

  describe("Stress Testing", () => {
    it("should run stress tests", () => {
      const positions = [
        {
          symbol: "EURUSD",
          side: "long" as const,
          quantity: 100,
          currentPrice: 1.1,
          liquidationPrice: 1.05,
          marginRequired: 550,
          unrealizedPnL: 50,
        },
      ];

      const results = runStressTests(positions, 10000, 550);

      expect(results.scenarios.length).toBeGreaterThan(0);
      expect(results.mostSevereScenario).toBeDefined();
      expect(results.maxPossibleLoss).toBeGreaterThanOrEqual(0);
      expect(results.survivalRate).toBeGreaterThanOrEqual(0);
      expect(results.survivalRate).toBeLessThanOrEqual(100);
    });
  });

  describe("Comprehensive Concentration Analysis", () => {
    it("should provide complete concentration analysis", () => {
      const positions = [
        {
          symbol: "EUR",
          assetClass: "Forex",
          quantity: 100,
          currentPrice: 1.1,
          marginRequired: 550,
          unrealizedPnL: 50,
        },
        {
          symbol: "AAPL",
          assetClass: "Stocks",
          quantity: 50,
          currentPrice: 150,
          marginRequired: 7500,
          unrealizedPnL: 200,
        },
      ];

      const analysis = analyzeConcentration(positions, 10000);

      expect(analysis.totalPositions).toBe(2);
      expect(analysis.herfindahlIndex).toBeGreaterThan(0);
      expect(analysis.concentrationLevel).toBeDefined();
      expect(analysis.topPositions.length).toBeGreaterThan(0);
      expect(analysis.diversificationScore).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe("Risk Dashboard Integration", () => {
  it("should calculate metrics for realistic portfolio scenario", () => {
    // Setup realistic portfolio
    const profiles = {
      equity: 15000,
      balance: 10000,
      marginUsed: 5000,
      realizedPnL: 2000,
    };

    const positions = [
      { positionValue: 3000, marginRequired: 1500 },
      { positionValue: 2000, marginRequired: 1000 },
      { positionValue: 1500, marginRequired: 750 },
    ];

    const trades = [
      { pnl: 500, isProfit: true },
      { pnl: 300, isProfit: true },
      { pnl: -100, isProfit: false },
      { pnl: 200, isProfit: true },
      { pnl: -50, isProfit: false },
    ];

    // Calculate all metrics
    const riskMetrics = calculateRiskMetrics(
      profiles.equity,
      profiles.marginUsed,
      positions
    );

    const portfolioMetrics = calculatePortfolioMetrics(
      profiles.equity,
      profiles.balance,
      profiles.realizedPnL,
      500,
      trades
    );

    // Verify results make sense
    expect(riskMetrics.riskLevel).toBe("safe");
    expect(portfolioMetrics.winRate).toBeGreaterThan(50);
    expect(portfolioMetrics.profitFactor).toBeGreaterThan(1);
    expect(portfolioMetrics.totalPnL).toBeGreaterThan(0);
  });

  it("should handle edge cases correctly", () => {
    // Zero positions
    const riskMetrics1 = calculateRiskMetrics(10000, 0, []);
    expect(riskMetrics1.capitalAtRisk).toBe(0);

    // High leverage (margin level 50% = critical, not yet liquidation)
    const riskMetrics2 = calculateRiskMetrics(5000, 10000, []);
    expect(riskMetrics2.riskLevel).toBe("critical");

    // No trades
    const portfolioMetrics = calculatePortfolioMetrics(10000, 10000, 0, 0, []);
    expect(portfolioMetrics.winRate).toBe(0);
    expect(portfolioMetrics.totalTrades).toBe(0);
  });
});
