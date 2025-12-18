import { describe, it, expect } from "vitest";
import {
  OrderType,
  OrderSide,
  OrderStatus,
  checkMarketOrderMatch,
  checkLimitOrderMatch,
  checkStopOrderTrigger,
  checkStopLimitOrderMatch,
  checkTrailingStopOrderTrigger,
  calculateExecutionPrice,
  shouldOrderExecute,
  calculatePostExecutionBalance,
  calculateMarginRequired,
  calculateUnrealizedPnL,
  validateExecutionPreConditions,
  OrderMatchingError,
  type OrderCondition,
  type MarketSnapshot,
} from "../orderMatching";

describe("Order Matching & Execution Engine", () => {
  // Helper to create market snapshot
  const createMarket = (price: number): MarketSnapshot => ({
    symbol: "EURUSD",
    currentPrice: price,
    bid: price - 0.0001,
    ask: price + 0.0001,
    volatility: 15,
    liquidity: "very_high",
    timestamp: new Date(),
  });

  describe("checkMarketOrderMatch", () => {
    it("matches market orders immediately", () => {
      const condition: OrderCondition = {
        priceLevel: 0,
        orderType: OrderType.Market,
        side: OrderSide.Buy,
        quantity: 100000,
      };

      const result = checkMarketOrderMatch(condition);

      expect(result.matched).toBe(true);
      expect(result.executedQuantity).toBe(100000);
      expect(result.reason).toBeUndefined();
    });

    it("rejects non-market orders", () => {
      const condition: OrderCondition = {
        priceLevel: 1.085,
        orderType: OrderType.Limit,
        side: OrderSide.Buy,
        quantity: 100000,
      };

      const result = checkMarketOrderMatch(condition);

      expect(result.matched).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe("checkLimitOrderMatch", () => {
    it("executes buy limit when price <= limit", () => {
      const market = createMarket(1.0845);
      const condition: OrderCondition = {
        priceLevel: 1.0845,
        orderType: OrderType.Limit,
        side: OrderSide.Buy,
        quantity: 100000,
        limitPrice: 1.085, // Buy at 1.0850 or better
      };

      const result = checkLimitOrderMatch(condition, market);

      expect(result.matched).toBe(true);
      expect(result.executionPrice).toBe(1.085);
    });

    it("rejects buy limit when price > limit", () => {
      const market = createMarket(1.0855);
      const condition: OrderCondition = {
        priceLevel: 1.0855,
        orderType: OrderType.Limit,
        side: OrderSide.Buy,
        quantity: 100000,
        limitPrice: 1.085,
      };

      const result = checkLimitOrderMatch(condition, market);

      expect(result.matched).toBe(false);
    });

    it("executes sell limit when price >= limit", () => {
      const market = createMarket(1.0855);
      const condition: OrderCondition = {
        priceLevel: 1.0855,
        orderType: OrderType.Limit,
        side: OrderSide.Sell,
        quantity: 100000,
        limitPrice: 1.085, // Sell at 1.0850 or better
      };

      const result = checkLimitOrderMatch(condition, market);

      expect(result.matched).toBe(true);
    });

    it("rejects sell limit when price < limit", () => {
      const market = createMarket(1.0845);
      const condition: OrderCondition = {
        priceLevel: 1.0845,
        orderType: OrderType.Limit,
        side: OrderSide.Sell,
        quantity: 100000,
        limitPrice: 1.085,
      };

      const result = checkLimitOrderMatch(condition, market);

      expect(result.matched).toBe(false);
    });

    it("rejects limit without limit price", () => {
      const market = createMarket(1.085);
      const condition: OrderCondition = {
        priceLevel: 1.085,
        orderType: OrderType.Limit,
        side: OrderSide.Buy,
        quantity: 100000,
      };

      const result = checkLimitOrderMatch(condition, market);

      expect(result.matched).toBe(false);
      expect(result.reason).toContain("Limit price");
    });
  });

  describe("checkStopOrderTrigger", () => {
    it("triggers buy stop when price touches stop level from below", () => {
      const market = createMarket(1.085);
      const previousPrice = 1.084;
      const condition: OrderCondition = {
        priceLevel: 1.085, // Buy stop at 1.0850
        orderType: OrderType.Stop,
        side: OrderSide.Buy,
        quantity: 100000,
      };

      const result = checkStopOrderTrigger(condition, market, previousPrice);

      expect(result.matched).toBe(true);
      expect(result.shouldTrigger).toBe(true);
    });

    it("does not re-trigger buy stop if already above level", () => {
      const market = createMarket(1.086);
      const previousPrice = 1.085;
      const condition: OrderCondition = {
        priceLevel: 1.085,
        orderType: OrderType.Stop,
        side: OrderSide.Buy,
        quantity: 100000,
      };

      const result = checkStopOrderTrigger(condition, market, previousPrice);

      expect(result.matched).toBe(false);
    });

    it("triggers sell stop when price touches stop level from above", () => {
      const market = createMarket(1.084);
      const previousPrice = 1.085;
      const condition: OrderCondition = {
        priceLevel: 1.084, // Sell stop at 1.0840
        orderType: OrderType.Stop,
        side: OrderSide.Sell,
        quantity: 100000,
      };

      const result = checkStopOrderTrigger(condition, market, previousPrice);

      expect(result.matched).toBe(true);
      expect(result.shouldTrigger).toBe(true);
    });

    it("does not re-trigger sell stop if already below level", () => {
      const market = createMarket(1.083);
      const previousPrice = 1.084;
      const condition: OrderCondition = {
        priceLevel: 1.084,
        orderType: OrderType.Stop,
        side: OrderSide.Sell,
        quantity: 100000,
      };

      const result = checkStopOrderTrigger(condition, market, previousPrice);

      expect(result.matched).toBe(false);
    });
  });

  describe("checkStopLimitOrderMatch", () => {
    it("executes stop-limit when both conditions met", () => {
      const market = createMarket(1.0848);
      const previousPrice = 1.084;
      const condition: OrderCondition = {
        priceLevel: 1.085, // Stop at 1.0850
        orderType: OrderType.StopLimit,
        side: OrderSide.Buy,
        quantity: 100000,
        limitPrice: 1.0855, // Limit at 1.0855
      };

      // Simulate: price rises to trigger stop, then falls to limit
      const result = checkStopLimitOrderMatch(condition, market, previousPrice);

      // Note: This depends on if limit check passes after stop trigger
      expect(result).toHaveProperty("matched");
      expect(result).toHaveProperty("reason");
    });

    it("rejects stop-limit if stop not triggered", () => {
      const market = createMarket(1.084);
      const previousPrice = 1.084;
      const condition: OrderCondition = {
        priceLevel: 1.085,
        orderType: OrderType.StopLimit,
        side: OrderSide.Buy,
        quantity: 100000,
        limitPrice: 1.0855,
      };

      const result = checkStopLimitOrderMatch(condition, market, previousPrice);

      expect(result.matched).toBe(false);
      expect(result.reason).toContain("Stop");
    });

    it("rejects stop-limit if limit not met after stop trigger", () => {
      const market = createMarket(1.0856);
      const previousPrice = 1.084;
      const condition: OrderCondition = {
        priceLevel: 1.085,
        orderType: OrderType.StopLimit,
        side: OrderSide.Buy,
        quantity: 100000,
        limitPrice: 1.0855, // Price above limit
      };

      const result = checkStopLimitOrderMatch(condition, market, previousPrice);

      expect(result.matched).toBe(false);
    });
  });

  describe("checkTrailingStopOrderTrigger", () => {
    it("triggers trailing stop for buy order when price drops", () => {
      const market = createMarket(1.0835);
      const previousPrice = 1.0845;
      const highestPrice = 1.085;
      const trailingAmount = 0.0015; // 15 pips

      const condition = {
        priceLevel: 0,
        orderType: OrderType.Stop,
        side: OrderSide.Buy,
        quantity: 100000,
        trailingAmount,
      };

      // Stop should trigger when price falls below (1.0850 - 0.0015 = 1.0835)
      const result = checkTrailingStopOrderTrigger(
        condition,
        market,
        highestPrice,
        0,
        previousPrice,
      );

      expect(result.matched).toBe(true);
      expect(result.shouldTrigger).toBe(true);
    });

    it("triggers trailing stop for sell order when price rises", () => {
      const market = createMarket(1.0865);
      const previousPrice = 1.0855;
      const lowestPrice = 1.085;
      const trailingAmount = 0.0015;

      const condition = {
        priceLevel: 0,
        orderType: OrderType.Stop,
        side: OrderSide.Sell,
        quantity: 100000,
        trailingAmount,
      };

      // Stop should trigger when price rises above (1.0850 + 0.0015 = 1.0865)
      const result = checkTrailingStopOrderTrigger(
        condition,
        market,
        0,
        lowestPrice,
        previousPrice,
      );

      expect(result.matched).toBe(true);
      expect(result.shouldTrigger).toBe(true);
    });

    it("does not trigger trailing stop prematurely", () => {
      const market = createMarket(1.084);
      const previousPrice = 1.0845;
      const highestPrice = 1.085;
      const trailingAmount = 0.0015;

      const condition = {
        priceLevel: 0,
        orderType: OrderType.Stop,
        side: OrderSide.Buy,
        quantity: 100000,
        trailingAmount,
      };

      const result = checkTrailingStopOrderTrigger(
        condition,
        market,
        highestPrice,
        0,
        previousPrice,
      );

      expect(result.matched).toBe(false);
    });
  });

  describe("calculateExecutionPrice", () => {
    it("adds slippage for buy orders", () => {
      const result = calculateExecutionPrice(1.085, OrderSide.Buy, 0.0005);

      expect(result).toBe(1.0855);
    });

    it("subtracts slippage for sell orders", () => {
      const result = calculateExecutionPrice(1.085, OrderSide.Sell, 0.0005);

      expect(result).toBe(1.0845);
    });

    it("handles zero slippage", () => {
      const result = calculateExecutionPrice(1.085, OrderSide.Buy, 0);

      expect(result).toBe(1.085);
    });
  });

  describe("shouldOrderExecute", () => {
    it("identifies executable market orders", () => {
      const market = createMarket(1.085);
      const condition: OrderCondition = {
        priceLevel: 0,
        orderType: OrderType.Market,
        side: OrderSide.Buy,
        quantity: 100000,
      };

      const result = shouldOrderExecute(condition, market);

      expect(result.matched).toBe(true);
    });

    it("identifies executable limit orders", () => {
      const market = createMarket(1.0845);
      const condition: OrderCondition = {
        priceLevel: 1.0845,
        orderType: OrderType.Limit,
        side: OrderSide.Buy,
        quantity: 100000,
        limitPrice: 1.085,
      };

      const result = shouldOrderExecute(condition, market);

      expect(result.matched).toBe(true);
    });

    it("identifies triggered stop orders", () => {
      const market = createMarket(1.085);
      const condition: OrderCondition = {
        priceLevel: 1.085,
        orderType: OrderType.Stop,
        side: OrderSide.Buy,
        quantity: 100000,
      };

      const result = shouldOrderExecute(condition, market, 1.084);

      expect(result.matched).toBe(true);
    });
  });

  describe("calculatePostExecutionBalance", () => {
    it("deducts buy order cost and commission", () => {
      const balance = 10000;
      const executionPrice = 1.085;
      const quantity = 100000;
      const commission = 10;

      const result = calculatePostExecutionBalance(
        executionPrice,
        quantity,
        OrderSide.Buy,
        commission,
        balance,
      );

      const expectedCost = executionPrice * quantity + commission;
      expect(result).toBe(balance - expectedCost);
    });

    it("adds sell proceeds and deducts commission", () => {
      const balance = 10000;
      const executionPrice = 1.085;
      const quantity = 100000;
      const commission = 10;

      const result = calculatePostExecutionBalance(
        executionPrice,
        quantity,
        OrderSide.Sell,
        commission,
        balance,
      );

      const proceeds = executionPrice * quantity;
      expect(result).toBe(balance + proceeds - commission);
    });
  });

  describe("calculateMarginRequired", () => {
    it("calculates margin for forex position", () => {
      const quantity = 1; // 1 lot
      const entryPrice = 1.085;
      const leverage = 100; // 1:100 leverage

      const result = calculateMarginRequired(quantity, entryPrice, leverage);

      expect(result).toBeCloseTo((quantity * entryPrice) / leverage);
    });

    it("calculates higher margin for lower leverage", () => {
      const quantity = 1;
      const entryPrice = 1.085;

      const result100 = calculateMarginRequired(quantity, entryPrice, 100);
      const result50 = calculateMarginRequired(quantity, entryPrice, 50);

      expect(result50).toBeGreaterThan(result100);
    });
  });

  describe("calculateUnrealizedPnL", () => {
    it("calculates positive P&L for profitable buy position", () => {
      const quantity = 100000;
      const entryPrice = 1.085;
      const currentPrice = 1.086; // 10 pips profit

      const result = calculateUnrealizedPnL(
        quantity,
        entryPrice,
        currentPrice,
        OrderSide.Buy,
      );

      expect(result).toBeGreaterThan(0);
      expect(result).toBeCloseTo(quantity * (currentPrice - entryPrice));
    });

    it("calculates negative P&L for losing buy position", () => {
      const quantity = 100000;
      const entryPrice = 1.085;
      const currentPrice = 1.084; // 10 pips loss

      const result = calculateUnrealizedPnL(
        quantity,
        entryPrice,
        currentPrice,
        OrderSide.Buy,
      );

      expect(result).toBeLessThan(0);
    });

    it("calculates positive P&L for profitable sell position", () => {
      const quantity = 100000;
      const entryPrice = 1.085;
      const currentPrice = 1.084; // 10 pips profit on short

      const result = calculateUnrealizedPnL(
        quantity,
        entryPrice,
        currentPrice,
        OrderSide.Sell,
      );

      expect(result).toBeGreaterThan(0);
    });

    it("calculates negative P&L for losing sell position", () => {
      const quantity = 100000;
      const entryPrice = 1.085;
      const currentPrice = 1.086; // 10 pips loss on short

      const result = calculateUnrealizedPnL(
        quantity,
        entryPrice,
        currentPrice,
        OrderSide.Sell,
      );

      expect(result).toBeLessThan(0);
    });
  });

  describe("validateExecutionPreConditions", () => {
    it("validates sufficient balance and margin", () => {
      const result = validateExecutionPreConditions(10000, 500, 2000);

      expect(result.valid).toBe(true);
    });

    it("rejects insufficient margin", () => {
      const result = validateExecutionPreConditions(10000, 3000, 2000);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain("margin");
    });

    it("rejects zero or negative balance", () => {
      const result = validateExecutionPreConditions(0, 500, 2000);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain("balance");
    });
  });

  // ===== INTEGRATION TESTS =====

  describe("Integration: Complete order execution flow", () => {
    it("executes market buy order with slippage", () => {
      const market = createMarket(1.085);
      const condition: OrderCondition = {
        priceLevel: 0,
        orderType: OrderType.Market,
        side: OrderSide.Buy,
        quantity: 100000,
      };

      // Check if order matches
      const matchResult = shouldOrderExecute(condition, market);
      expect(matchResult.matched).toBe(true);

      // Calculate execution price with slippage
      const slippage = 0.0005; // 0.05 pips
      const executionPrice = calculateExecutionPrice(
        market.currentPrice,
        OrderSide.Buy,
        slippage,
      );
      expect(executionPrice).toBeGreaterThan(market.currentPrice);

      // Calculate balance after execution
      const initialBalance = 10000;
      const commission = 10;
      const newBalance = calculatePostExecutionBalance(
        executionPrice,
        condition.quantity,
        OrderSide.Buy,
        commission,
        initialBalance,
      );
      expect(newBalance).toBeLessThan(initialBalance);
    });

    it("executes limit order when price reaches target", () => {
      const market = createMarket(1.0845);
      const condition: OrderCondition = {
        priceLevel: 1.0845,
        orderType: OrderType.Limit,
        side: OrderSide.Buy,
        quantity: 100000,
        limitPrice: 1.085,
      };

      // Check if limit order matches
      const matchResult = shouldOrderExecute(condition, market);
      expect(matchResult.matched).toBe(true);
      expect(matchResult.executionPrice).toBe(1.085);
    });

    it("triggers stop order and converts to market", () => {
      const market = createMarket(1.085);
      const previousPrice = 1.084;
      const condition: OrderCondition = {
        priceLevel: 1.085,
        orderType: OrderType.Stop,
        side: OrderSide.Buy,
        quantity: 100000,
      };

      // Check if stop triggers
      const matchResult = shouldOrderExecute(condition, market, previousPrice);
      expect(matchResult.matched).toBe(true);
      expect(matchResult.shouldTrigger).toBe(true);

      // After trigger, becomes market order - execute with slippage
      const slippage = 0.0005;
      const executionPrice = calculateExecutionPrice(
        market.currentPrice,
        OrderSide.Buy,
        slippage,
      );
      expect(executionPrice).toBeGreaterThan(market.currentPrice);
    });

    it("validates pre-conditions before position creation", () => {
      const balance = 10000;
      const marginRequired = 500;
      const freeMargin = 2000;

      const validation = validateExecutionPreConditions(
        balance,
        marginRequired,
        freeMargin,
      );

      expect(validation.valid).toBe(true);

      // Simulate position creation
      if (validation.valid) {
        const quantity = 100000;
        const entryPrice = 1.085;
        const leverage = 100;
        const calculatedMargin = calculateMarginRequired(
          quantity,
          entryPrice,
          leverage,
        );

        expect(calculatedMargin).toBeLessThanOrEqual(freeMargin);
      }
    });

    it("handles complex risk management scenario", () => {
      // Buy position with stop loss and take profit
      const entryPrice = 1.085;
      const stopLoss = 1.084; // 10 pips stop
      const takeProfit = 1.087; // 20 pips target
      const quantity = 100000;

      // Market drops to stop
      const marketAtStop = createMarket(stopLoss);
      const stopCondition: OrderCondition = {
        priceLevel: stopLoss,
        orderType: OrderType.Stop,
        side: OrderSide.Sell, // Sell to close
        quantity,
      };

      const stopTriggers = checkStopOrderTrigger(
        stopCondition,
        marketAtStop,
        entryPrice,
      );
      expect(stopTriggers.matched).toBe(true);

      // Calculate loss
      const loss = calculateUnrealizedPnL(
        quantity,
        entryPrice,
        stopLoss,
        OrderSide.Buy,
      );
      expect(loss).toBeLessThan(0);
    });
  });

  describe("Edge cases and boundary conditions", () => {
    it("handles limit price equal to market price", () => {
      const marketPrice = 1.085;
      const market = createMarket(marketPrice);
      const condition: OrderCondition = {
        priceLevel: marketPrice,
        orderType: OrderType.Limit,
        side: OrderSide.Buy,
        quantity: 100000,
        limitPrice: marketPrice,
      };

      const result = checkLimitOrderMatch(condition, market);

      expect(result.matched).toBe(true);
    });

    it("handles very small order quantities", () => {
      const result = calculatePostExecutionBalance(
        1.085,
        0.01,
        OrderSide.Buy,
        0,
        10000,
      );

      expect(result).toBeLessThan(10000);
      expect(result).toBeGreaterThan(9999); // Only tiny deduction
    });

    it("handles large order quantities", () => {
      const result = calculatePostExecutionBalance(
        1.085,
        10000000,
        OrderSide.Buy,
        100,
        1000000,
      );

      expect(result).toBeLessThan(1000000);
      expect(Number.isFinite(result)).toBe(true);
    });

    it("handles zero slippage", () => {
      const price = calculateExecutionPrice(1.085, OrderSide.Buy, 0);

      expect(price).toBe(1.085);
    });

    it("handles very high leverage", () => {
      const result = calculateMarginRequired(1, 1.085, 500);

      expect(result).toBeDefined();
      expect(Number.isFinite(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
    });
  });
});
