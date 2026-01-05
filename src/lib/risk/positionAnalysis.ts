/**
 * Position Analysis Engine
 * Detailed analysis of position composition, concentration, and risk
 *
 * Provides calculations for:
 * - Position concentration by symbol and asset class
 * - Correlation analysis
 * - Stress testing scenarios
 * - Diversification metrics
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PositionConcentration {
  symbol: string;
  assetClass: string;
  quantity: number;
  positionValue: number;
  percentageOfPortfolio: number;
  marginRequired: number;
  unrealizedPnL: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
}

export interface ConcentrationAnalysis {
  totalPositions: number;
  symbolConcentration: Record<string, number>; // % of portfolio
  assetClassConcentration: Record<string, number>;
  herfindahlIndex: number; // 0-10000, higher = more concentrated
  concentrationLevel: 'low' | 'moderate' | 'high' | 'critical';
  topPositions: PositionConcentration[];
  diversificationScore: number; // 0-100
}

export interface CorrelationPair {
  symbol1: string;
  symbol2: string;
  correlation: number; // -1 to 1
  hedgingPotential: 'high' | 'moderate' | 'low';
}

export interface CorrelationMatrix {
  symbols: string[];
  matrix: number[][];
  averageCorrelation: number;
  correlationPairs: CorrelationPair[];
}

export interface StressTestScenario {
  name: string;
  description: string;
  priceMovement: number; // percentage
  liquidatedPositions: string[];
  estimatedLoss: number;
  marginLevel: number;
  riskLevel: 'safe' | 'warning' | 'critical' | 'liquidation';
}

export interface StressTestResults {
  scenarios: StressTestScenario[];
  mostSevereScenario: StressTestScenario;
  maxPossibleLoss: number;
  survivalRate: number; // percentage of scenarios survived
}

export interface DiversificationMetrics {
  numberOfSymbols: number;
  numberOfAssetClasses: number;
  largestPosition: number; // % of portfolio
  topThreePositions: number; // % of portfolio
  effectiveNumberOfPositions: number; // ENP
  diversificationScore: number; // 0-100
  isWellDiversified: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const CONCENTRATION_THRESHOLDS = {
  LOW: 5, // Each position < 5% of portfolio
  MODERATE: 10, // Each position < 10% of portfolio
  HIGH: 20, // Each position < 20% of portfolio
  CRITICAL: 50, // Any position > 50% of portfolio
} as const;

export const HERFINDAHL_THRESHOLDS = {
  PERFECT_COMPETITION: 1500, // Very well diversified
  MODERATE_CONCENTRATION: 2500, // Acceptable
  HIGH_CONCENTRATION: 5000, // Concentrated
  VERY_HIGH_CONCENTRATION: 10000, // Very concentrated
} as const;

// ============================================================================
// CONCENTRATION ANALYSIS
// ============================================================================

/**
 * Calculate position concentration as percentage of portfolio
 *
 * @param positionValue - Value of individual position
 * @param totalPortfolioValue - Total portfolio value
 * @returns Concentration percentage
 */
export function calculateConcentration(
  positionValue: number,
  totalPortfolioValue: number
): number {
  if (totalPortfolioValue === 0) return 0;
  const concentration = (positionValue / totalPortfolioValue) * 100;
  return Math.round(concentration * 100) / 100;
}

/**
 * Classify concentration risk level
 *
 * @param concentration - Position concentration percentage
 * @returns Risk level
 */
export function classifyConcentrationRisk(
  concentration: number
): 'low' | 'medium' | 'high' | 'critical' {
  if (concentration <= CONCENTRATION_THRESHOLDS.LOW) {
    return 'low';
  } else if (concentration <= CONCENTRATION_THRESHOLDS.MODERATE) {
    return 'medium';
  } else if (concentration <= CONCENTRATION_THRESHOLDS.HIGH) {
    return 'high';
  } else {
    return 'critical';
  }
}

/**
 * Calculate Herfindahl Index for concentration
 * HI = Sum of (each position % squared) × 10000
 * Perfect competition: < 1500
 * Moderate concentration: 1500-2500
 * High concentration: > 2500
 *
 * @param concentrations - Array of position concentration percentages
 * @returns Herfindahl Index (0-10000)
 */
export function calculateHerfindahlIndex(concentrations: number[]): number {
  if (concentrations.length === 0) return 0;

  const sumOfSquares = concentrations.reduce((sum, conc) => {
    return sum + Math.pow(conc, 2);
  }, 0);

  return Math.round(sumOfSquares * 100) / 100;
}

/**
 * Classify portfolio concentration level
 *
 * @param herfindahlIndex - Herfindahl Index value
 * @returns Concentration level
 */
export function classifyConcentrationLevel(
  herfindahlIndex: number
): 'low' | 'moderate' | 'high' | 'critical' {
  if (herfindahlIndex < HERFINDAHL_THRESHOLDS.PERFECT_COMPETITION) {
    return 'low';
  } else if (herfindahlIndex < HERFINDAHL_THRESHOLDS.MODERATE_CONCENTRATION) {
    return 'moderate';
  } else if (herfindahlIndex < HERFINDAHL_THRESHOLDS.HIGH_CONCENTRATION) {
    return 'high';
  } else {
    return 'critical';
  }
}

/**
 * Analyze portfolio concentration
 *
 * @param positions - Array of positions with values
 * @param totalPortfolioValue - Total portfolio value
 * @returns Concentration analysis
 */
export function analyzeConcentration(
  positions: Array<{
    symbol: string;
    assetClass?: string;
    quantity: number;
    currentPrice: number;
    marginRequired: number;
    unrealizedPnL: number;
  }>,
  totalPortfolioValue: number
): ConcentrationAnalysis {
  if (positions.length === 0) {
    return {
      totalPositions: 0,
      symbolConcentration: {},
      assetClassConcentration: {},
      herfindahlIndex: 0,
      concentrationLevel: 'low',
      topPositions: [],
      diversificationScore: 100,
    };
  }

  const symbolConcentration: Record<string, number> = {};
  const assetClassConcentration: Record<string, number> = {};
  const concentrations: PositionConcentration[] = [];

  // Calculate concentrations
  for (const position of positions) {
    const positionValue = position.quantity * position.currentPrice;
    const concentration = calculateConcentration(
      positionValue,
      totalPortfolioValue
    );
    const assetClass = position.assetClass || 'Other';
    const risk = classifyConcentrationRisk(concentration);

    symbolConcentration[position.symbol] = concentration;

    if (!assetClassConcentration[assetClass]) {
      assetClassConcentration[assetClass] = 0;
    }
    assetClassConcentration[assetClass] += concentration;

    concentrations.push({
      symbol: position.symbol,
      assetClass,
      quantity: position.quantity,
      positionValue,
      percentageOfPortfolio: concentration,
      marginRequired: position.marginRequired,
      unrealizedPnL: position.unrealizedPnL,
      risk,
    });
  }

  // Calculate Herfindahl Index
  const concentrationValues = Object.values(symbolConcentration);
  const herfindahlIndex = calculateHerfindahlIndex(concentrationValues);
  const concentrationLevel = classifyConcentrationLevel(herfindahlIndex);

  // Get top positions
  const topPositions = concentrations
    .sort((a, b) => b.percentageOfPortfolio - a.percentageOfPortfolio)
    .slice(0, 5);

  // Calculate diversification score (0-100)
  // Perfect diversification (equal weight) = 100
  // Single position = 0
  const perfectDiversificationIndex =
    (10000 / positions.length) * positions.length;
  const diversificationScore = Math.max(
    0,
    Math.round(
      ((perfectDiversificationIndex - herfindahlIndex) /
        perfectDiversificationIndex) *
        100
    )
  );

  return {
    totalPositions: positions.length,
    symbolConcentration,
    assetClassConcentration,
    herfindahlIndex,
    concentrationLevel,
    topPositions,
    diversificationScore,
  };
}

// ============================================================================
// CORRELATION ANALYSIS
// ============================================================================

/**
 * Calculate correlation between two price series
 *
 * @param pricesSeries1 - Price history for first asset
 * @param pricesSeries2 - Price history for second asset
 * @returns Correlation coefficient (-1 to 1)
 */
export function calculateCorrelation(
  pricesSeries1: number[],
  pricesSeries2: number[]
): number {
  if (
    pricesSeries1.length !== pricesSeries2.length ||
    pricesSeries1.length < 2
  ) {
    return 0;
  }

  const n = pricesSeries1.length;

  // Calculate means
  const mean1 = pricesSeries1.reduce((a, b) => a + b) / n;
  const mean2 = pricesSeries2.reduce((a, b) => a + b) / n;

  // Calculate standard deviations
  const variance1 =
    pricesSeries1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / n;
  const variance2 =
    pricesSeries2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / n;
  const std1 = Math.sqrt(variance1);
  const std2 = Math.sqrt(variance2);

  if (std1 === 0 || std2 === 0) return 0;

  // Calculate covariance
  const covariance =
    pricesSeries1.reduce((sum, val, i) => {
      if (i < pricesSeries2.length) {
        const price2 = pricesSeries2[i]!;
        return sum + (val - mean1) * (price2 - mean2);
      }
      return sum;
    }, 0) / n;

  // Calculate correlation
  const correlation = covariance / (std1 * std2);
  return Math.round(correlation * 10000) / 10000; // -1 to 1
}

/**
 * Classify hedging potential based on correlation
 *
 * @param correlation - Correlation coefficient
 * @returns Hedging potential
 */
export function classifyHedgingPotential(
  correlation: number
): 'high' | 'moderate' | 'low' {
  if (correlation < -0.5) {
    return 'high'; // Negative correlation = good hedge
  } else if (correlation < 0.3) {
    return 'moderate';
  } else {
    return 'low'; // Positive correlation = poor hedge
  }
}

/**
 * Build correlation matrix from symbol prices
 *
 * @param symbolPrices - Map of symbol to price history
 * @returns Correlation matrix
 */
export function buildCorrelationMatrix(
  symbolPrices: Map<string, number[]>
): CorrelationMatrix {
  const symbols = Array.from(symbolPrices.keys());
  const n = symbols.length;
  const matrix: number[][] = [];
  const correlationPairs: CorrelationPair[] = [];

  // Initialize matrix
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        row[j] = 1; // Perfect correlation with self
      } else {
        row[j] = 0;
      }
    }
    matrix[i] = row;
  }

  // Calculate correlations
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const symbol1 = symbols[i];
      const symbol2 = symbols[j];

      if (!symbol1 || !symbol2) continue;

      const prices1 = symbolPrices.get(symbol1) || [];
      const prices2 = symbolPrices.get(symbol2) || [];

      const correlation = calculateCorrelation(prices1, prices2);
      const rowI = matrix[i];
      const rowJ = matrix[j];

      if (rowI && rowJ) {
        rowI[j] = correlation;
        rowJ[i] = correlation;
      }

      correlationPairs.push({
        symbol1,
        symbol2,
        correlation,
        hedgingPotential: classifyHedgingPotential(correlation),
      });
    }
  }

  // Calculate average correlation
  const allCorrelations = correlationPairs.map((p) => p.correlation);
  const averageCorrelation =
    allCorrelations.length > 0
      ? Math.round(
          (allCorrelations.reduce((a, b) => a + b) / allCorrelations.length) *
            10000
        ) / 10000
      : 0;

  return {
    symbols,
    matrix,
    averageCorrelation,
    correlationPairs,
  };
}

// ============================================================================
// STRESS TESTING
// ============================================================================

/**
 * Simulate scenario with price movement
 *
 * @param positions - Array of positions
 * @param priceMovement - Percentage price change
 * @param equity - Current equity
 * @param marginUsed - Current margin used
 * @returns Scenario results
 */
export function simulateStressScenario(
  positions: Array<{
    symbol: string;
    side: 'long' | 'short';
    quantity: number;
    currentPrice: number;
    liquidationPrice: number;
    marginRequired: number;
    unrealizedPnL: number;
  }>,
  priceMovement: number,
  equity: number,
  marginUsed: number
): StressTestScenario {
  let totalPnLChange = 0;
  const liquidatedPositions: string[] = [];

  for (const position of positions) {
    const newPrice = position.currentPrice * (1 + priceMovement / 100);

    // Check if position is liquidated
    if (position.side === 'long' && newPrice < position.liquidationPrice) {
      liquidatedPositions.push(position.symbol);
      totalPnLChange -= position.unrealizedPnL; // Realize loss
    } else if (
      position.side === 'short' &&
      newPrice > position.liquidationPrice
    ) {
      liquidatedPositions.push(position.symbol);
      totalPnLChange -= position.unrealizedPnL; // Realize loss
    } else {
      // Calculate new P&L
      const pnlChange =
        position.side === 'long'
          ? (newPrice - position.currentPrice) * position.quantity
          : (position.currentPrice - newPrice) * position.quantity;
      totalPnLChange += pnlChange;
    }
  }

  const newEquity = equity + totalPnLChange;
  const newMarginLevel =
    marginUsed > 0 ? (newEquity / marginUsed) * 100 : 10000;
  const estimatedLoss = Math.max(0, -totalPnLChange);

  // Determine risk level
  let riskLevel: 'safe' | 'warning' | 'critical' | 'liquidation';
  if (newMarginLevel >= 200) {
    riskLevel = 'safe';
  } else if (newMarginLevel >= 100) {
    riskLevel = 'warning';
  } else if (newMarginLevel >= 50) {
    riskLevel = 'critical';
  } else {
    riskLevel = 'liquidation';
  }

  return {
    name: `${priceMovement > 0 ? '+' : ''}${priceMovement}% Movement`,
    description: `All positions move ${
      priceMovement > 0 ? 'up' : 'down'
    } by ${Math.abs(priceMovement)}%`,
    priceMovement,
    liquidatedPositions,
    estimatedLoss: Math.round(estimatedLoss * 100) / 100,
    marginLevel: Math.round(newMarginLevel * 100) / 100,
    riskLevel,
  };
}

/**
 * Run comprehensive stress tests
 *
 * @param positions - Array of positions
 * @param equity - Current equity
 * @param marginUsed - Current margin used
 * @returns Stress test results
 */
export function runStressTests(
  positions: Array<{
    symbol: string;
    side: 'long' | 'short';
    quantity: number;
    currentPrice: number;
    liquidationPrice: number;
    marginRequired: number;
    unrealizedPnL: number;
  }>,
  equity: number,
  marginUsed: number
): StressTestResults {
  const priceMovements = [-20, -10, -5, 5, 10, 20]; // Percentage
  const scenarios = priceMovements.map((movement) =>
    simulateStressScenario(positions, movement, equity, marginUsed)
  );

  const mostSevereScenario = scenarios.reduce((prev, current) =>
    current.estimatedLoss > prev.estimatedLoss ? current : prev
  );

  const survivalRate =
    (scenarios.filter((s) => s.riskLevel !== 'liquidation').length /
      scenarios.length) *
    100;

  return {
    scenarios,
    mostSevereScenario,
    maxPossibleLoss: Math.round(mostSevereScenario.estimatedLoss * 100) / 100,
    survivalRate: Math.round(survivalRate * 100) / 100,
  };
}

// ============================================================================
// DIVERSIFICATION METRICS
// ============================================================================

/**
 * Calculate effective number of positions
 * ENP = 1 / Sum(weight squared)
 * ENP ranges from 1 (single position) to n (perfect diversification)
 *
 * @param concentrations - Array of position concentration percentages
 * @returns Effective number of positions
 */
export function calculateEffectiveNumberOfPositions(
  concentrations: number[]
): number {
  if (concentrations.length === 0) return 0;

  const weightSquaredSum = concentrations.reduce((sum, conc) => {
    const weight = conc / 100;
    return sum + Math.pow(weight, 2);
  }, 0);

  return Math.round((1 / weightSquaredSum) * 100) / 100;
}

/**
 * Assess diversification of portfolio
 *
 * @param positions - Array of positions
 * @param totalPortfolioValue - Total portfolio value
 * @returns Diversification metrics
 */
export function assessDiversification(
  positions: Array<{
    symbol: string;
    assetClass?: string;
    quantity: number;
    currentPrice: number;
  }>,
  totalPortfolioValue: number
): DiversificationMetrics {
  if (positions.length === 0) {
    return {
      numberOfSymbols: 0,
      numberOfAssetClasses: 0,
      largestPosition: 0,
      topThreePositions: 0,
      effectiveNumberOfPositions: 0,
      diversificationScore: 100,
      isWellDiversified: true,
    };
  }

  const assetClasses = new Set(positions.map((p) => p.assetClass || 'Other'));

  const concentrations = positions.map((p) => {
    const value = p.quantity * p.currentPrice;
    return calculateConcentration(value, totalPortfolioValue);
  });

  const sortedConcentrations = [...concentrations].sort((a, b) => b - a);
  const largestPosition = sortedConcentrations[0] || 0;
  const topThreePositions = (sortedConcentrations.slice(0, 3) || []).reduce(
    (a, b) => a + b,
    0
  );
  const enp = calculateEffectiveNumberOfPositions(concentrations);

  // Calculate diversification score
  // Well diversified: < 5 positions concentrated in single asset class
  // 50+ positions = excellent diversification
  const diversificationScore = Math.min(
    100,
    Math.round((enp / positions.length) * 100 * 80) + 20
  );

  return {
    numberOfSymbols: positions.length,
    numberOfAssetClasses: assetClasses.size,
    largestPosition: Math.round(largestPosition * 100) / 100,
    topThreePositions: Math.round(topThreePositions * 100) / 100,
    effectiveNumberOfPositions: enp,
    diversificationScore,
    isWellDiversified: largestPosition < 30 && positions.length >= 5,
  };
}
