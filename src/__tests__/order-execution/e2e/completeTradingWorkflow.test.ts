/**
 * End-to-End Tests for Complete Trading Workflow
 *
 * Tests the complete user journey from order creation to position tracking:
 * - User authentication and session management
 * - Order placement workflow
 * - Real-time position updates
 * - Portfolio management
 * - Error handling in real browser environment
 * - Performance under real user interactions
 */

import { BrowserContext, Page, expect, test } from '@playwright/test';

// Test data
const testUser = {
  id: 'test-user-e2e-' + Date.now(),
  email: `testuser${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
};

test.describe('Complete Trading Workflow E2E Tests', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeEach(async ({ context: browserContext }) => {
    context = browserContext;
    page = await context.newPage();

    // Set up test environment
    await page.goto('/');

    // Mock API responses for testing
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();

      if (url.includes('/auth/session')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              session: {
                user: {
                  id: testUser.id,
                  email: testUser.email,
                },
                access_token: 'mock-token',
              },
            },
          }),
        });
      } else if (url.includes('/execute-order')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              order_id: `order-${Date.now()}`,
              position_id: `position-${Date.now()}`,
              status: 'executed',
              execution_details: {
                execution_price: '1.0950',
                slippage: '0.0001',
                commission: '2.50',
                total_cost: '109.50',
                timestamp: new Date().toISOString(),
                transaction_id: `txn-${Date.now()}`,
              },
            },
          }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.afterAll(async () => {
    // Clean up test data
    // Test cleanup completed
  });

  test.describe('User Authentication and Session Management', () => {
    test('should allow user to register and login successfully', async () => {
      await page.goto('/register');

      // Fill registration form
      await page.fill('[data-testid="firstName"]', testUser.firstName);
      await page.fill('[data-testid="lastName"]', testUser.lastName);
      await page.fill('[data-testid="email"]', testUser.email);
      await page.fill('[data-testid="password"]', testUser.password);
      await page.fill('[data-testid="confirmPassword"]', testUser.password);

      // Accept terms and conditions
      await page.check('[data-testid="terms"]');

      // Submit registration
      await page.click('[data-testid="register-submit"]');

      // Verify successful registration
      await expect(page).toHaveURL('/login');
      await expect(
        page.locator('[data-testid="success-message"]')
      ).toBeVisible();
    });

    test('should maintain session across page navigation', async () => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email"]', testUser.email);
      await page.fill('[data-testid="password"]', testUser.password);
      await page.click('[data-testid="login-submit"]');

      // Verify successful login
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

      // Navigate to different pages
      await page.click('[data-testid="trade-nav"]');
      await expect(page).toHaveURL('/trade');

      await page.click('[data-testid="portfolio-nav"]');
      await expect(page).toHaveURL('/portfolio');

      await page.click('[data-testid="dashboard-nav"]');
      await expect(page).toHaveURL('/dashboard');

      // Verify user is still authenticated
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should handle session timeout gracefully', async () => {
      // Login and navigate to trading page
      await page.goto('/login');
      await page.fill('[data-testid="email"]', testUser.email);
      await page.fill('[data-testid="password"]', testUser.password);
      await page.click('[data-testid="login-submit"]');

      await expect(page).toHaveURL('/dashboard');
      await page.click('[data-testid="trade-nav"]');
      await expect(page).toHaveURL('/trade');

      // Simulate session timeout by clearing session storage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Try to place an order
      await page.click('[data-testid="buy-button"]');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
      await expect(
        page.locator('[data-testid="session-timeout-message"]')
      ).toBeVisible();
    });
  });

  test.describe('Order Placement Workflow', () => {
    test.beforeEach(async () => {
      // Login before each order placement test
      await page.goto('/login');
      await page.fill('[data-testid="email"]', testUser.email);
      await page.fill('[data-testid="password"]', testUser.password);
      await page.click('[data-testid="login-submit"]');
      await expect(page).toHaveURL('/dashboard');
      await page.click('[data-testid="trade-nav"]');
      await expect(page).toHaveURL('/trade');
    });

    test('should successfully place a market buy order', async () => {
      // Select symbol
      await page.fill('[data-testid="symbol-input"]', 'EURUSD');
      await page.click('[data-testid="symbol-suggestion"]');

      // Select order type
      await page.selectOption('[data-testid="order-type"]', 'market');

      // Select side
      await page.click('[data-testid="buy-radio"]');

      // Enter quantity
      await page.fill('[data-testid="quantity-input"]', '1.0');

      // Place order
      await page.click('[data-testid="place-order-button"]');

      // Verify order placement
      await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-id"]')).toBeVisible();

      // Verify order appears in recent orders
      await page.click('[data-testid="recent-orders-tab"]');
      await expect(page.locator('[data-testid="order-EURUSD"]')).toBeVisible();
    });

    test('should successfully place a limit sell order with stop loss and take profit', async () => {
      // Select symbol
      await page.fill('[data-testid="symbol-input"]', 'GBPUSD');
      await page.click('[data-testid="symbol-suggestion"]');

      // Select order type
      await page.selectOption('[data-testid="order-type"]', 'limit');

      // Select side
      await page.click('[data-testid="sell-radio"]');

      // Enter quantity
      await page.fill('[data-testid="quantity-input"]', '0.5');

      // Enter price
      await page.fill('[data-testid="price-input"]', '1.2500');

      // Enter stop loss
      await page.fill('[data-testid="stop-loss-input"]', '1.2600');

      // Enter take profit
      await page.fill('[data-testid="take-profit-input"]', '1.2400');

      // Place order
      await page.click('[data-testid="place-order-button"]');

      // Verify order placement
      await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-id"]')).toBeVisible();

      // Verify advanced order settings are saved
      await page.click('[data-testid="pending-orders-tab"]');
      await expect(
        page.locator('[data-testid="pending-order-GBPUSD"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="sl-GBPUSD"]')).toContainText(
        '1.2600'
      );
      await expect(page.locator('[data-testid="tp-GBPUSD"]')).toContainText(
        '1.2400'
      );
    });

    test('should validate order inputs and show appropriate error messages', async () => {
      // Try to place order with invalid symbol
      await page.fill('[data-testid="symbol-input"]', 'INVALID_SYMBOL');
      await page.selectOption('[data-testid="order-type"]', 'market');
      await page.click('[data-testid="buy-radio"]');
      await page.fill('[data-testid="quantity-input"]', '1.0');

      await page.click('[data-testid="place-order-button"]');

      // Should show validation error
      await expect(page.locator('[data-testid="symbol-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="symbol-error"]')).toContainText(
        'Invalid symbol'
      );

      // Try to place order with invalid quantity
      await page.fill('[data-testid="symbol-input"]', 'EURUSD');
      await page.fill('[data-testid="quantity-input"]', '0');

      await page.click('[data-testid="place-order-button"]');

      // Should show validation error
      await expect(
        page.locator('[data-testid="quantity-error"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="quantity-error"]')
      ).toContainText('Quantity must be greater than 0');

      // Try to place limit order without price
      await page.selectOption('[data-testid="order-type"]', 'limit');
      await page.fill('[data-testid="quantity-input"]', '1.0');

      await page.click('[data-testid="place-order-button"]');

      // Should show validation error
      await expect(page.locator('[data-testid="price-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="price-error"]')).toContainText(
        'Price is required for limit orders'
      );
    });
  });

  test.describe('Real-time Position Updates', () => {
    test.beforeEach(async () => {
      // Login and place initial order
      await page.goto('/login');
      await page.fill('[data-testid="email"]', testUser.email);
      await page.fill('[data-testid="password"]', testUser.password);
      await page.click('[data-testid="login-submit"]');
      await expect(page).toHaveURL('/dashboard');

      // Place a test order
      await page.click('[data-testid="trade-nav"]');
      await page.fill('[data-testid="symbol-input"]', 'EURUSD');
      await page.selectOption('[data-testid="order-type"]', 'market');
      await page.click('[data-testid="buy-radio"]');
      await page.fill('[data-testid="quantity-input"]', '1.0');
      await page.click('[data-testid="place-order-button"]');

      // Wait for order to be placed
      await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
    });

    test('should display real-time position updates', async () => {
      // Navigate to positions view
      await page.click('[data-testid="positions-tab"]');

      // Verify position is displayed
      await expect(
        page.locator('[data-testid="position-EURUSD"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="position-quantity"]')
      ).toContainText('1.0');
      await expect(page.locator('[data-testid="position-side"]')).toContainText(
        'BUY'
      );

      // Simulate price update
      await page.evaluate(() => {
        window.dispatchEvent(
          new CustomEvent('price-update', {
            detail: {
              symbol: 'EURUSD',
              price: 1.1,
              change: 0.005,
              changePercent: 0.46,
            },
          })
        );
      });

      // Verify price update is reflected
      await expect(
        page.locator('[data-testid="position-current-price"]')
      ).toContainText('1.1000');
      await expect(page.locator('[data-testid="position-pnl"]')).toContainText(
        '+'
      );
    });

    test('should update portfolio metrics in real-time', async () => {
      // Navigate to portfolio view
      await page.click('[data-testid="portfolio-nav"]');

      // Verify initial portfolio metrics
      await page.locator('[data-testid="account-balance"]').textContent();

      // Simulate position P&L update
      await page.evaluate(() => {
        window.dispatchEvent(
          new CustomEvent('portfolio-update', {
            detail: {
              totalBalance: 10250.0,
              unrealizedPnL: 125.5,
              marginUsed: 219.0,
              freeMargin: 10031.0,
            },
          })
        );
      });

      // Verify updated metrics
      await expect(
        page.locator('[data-testid="account-balance"]')
      ).toContainText('10,250.00');
      await expect(
        page.locator('[data-testid="unrealized-pnl"]')
      ).toContainText('+125.50');
      await expect(page.locator('[data-testid="free-margin"]')).toContainText(
        '10,031.00'
      );
    });

    test('should handle WebSocket connection loss gracefully', async () => {
      // Disconnect WebSocket simulation
      await page.evaluate(() => {
        window.dispatchEvent(new Event('websocket-disconnected'));
      });

      // Should show connection status indicator
      await expect(
        page.locator('[data-testid="connection-status"]')
      ).toContainText('Disconnected');

      // Attempt to place an order
      await page.click('[data-testid="trade-nav"]');
      await page.fill('[data-testid="symbol-input"]', 'GBPUSD');
      await page.selectOption('[data-testid="order-type"]', 'market');
      await page.click('[data-testid="sell-radio"]');
      await page.fill('[data-testid="quantity-input"]', '0.5');
      await page.click('[data-testid="place-order-button"]');

      // Should show connection error message
      await expect(
        page.locator('[data-testid="connection-error"]')
      ).toBeVisible();
    });
  });

  test.describe('Portfolio Management', () => {
    test.beforeEach(async () => {
      // Login and set up test data
      await page.goto('/login');
      await page.fill('[data-testid="email"]', testUser.email);
      await page.fill('[data-testid="password"]', testUser.password);
      await page.click('[data-testid="login-submit"]');
      await expect(page).toHaveURL('/dashboard');
    });

    test('should display complete portfolio overview', async () => {
      await page.click('[data-testid="portfolio-nav"]');

      // Verify all portfolio sections are visible
      await expect(
        page.locator('[data-testid="account-summary"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="positions-table"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="orders-history"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="balance-chart"]')).toBeVisible();

      // Verify account summary metrics
      await expect(page.locator('[data-testid="total-balance"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="available-margin"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="margin-level"]')).toBeVisible();
    });

    test('should allow position management actions', async () => {
      await page.click('[data-testid="trade-nav"]');

      // Place a test order to have a position
      await page.fill('[data-testid="symbol-input"]', 'EURUSD');
      await page.selectOption('[data-testid="order-type"]', 'market');
      await page.click('[data-testid="buy-radio"]');
      await page.fill('[data-testid="quantity-input"]', '1.0');
      await page.click('[data-testid="place-order-button"]');

      await expect(page.locator('[data-testid="order-success"]')).toBeVisible();

      // Navigate to positions
      await page.click('[data-testid="portfolio-nav"]');
      await page.click('[data-testid="positions-tab"]');

      // Test position close action
      await page.click(
        '[data-testid="position-EURUSD"] [data-testid="close-position-button"]'
      );

      // Verify close confirmation dialog
      await expect(
        page.locator('[data-testid="close-position-dialog"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="close-position-symbol"]')
      ).toContainText('EURUSD');

      // Confirm close
      await page.click('[data-testid="confirm-close-position"]');

      // Verify position is removed
      await expect(
        page.locator('[data-testid="position-EURUSD"]')
      ).not.toBeVisible();
    });

    test('should display trading history and statistics', async () => {
      await page.click('[data-testid="portfolio-nav"]');
      await page.click('[data-testid="history-tab"]');

      // Verify history table
      await expect(
        page.locator('[data-testid="trading-history-table"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="history-date"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="history-symbol"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="history-side"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="history-quantity"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="history-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="history-pnl"]')).toBeVisible();

      // Test history filtering
      await page.selectOption('[data-testid="history-filter"]', 'today');
      await expect(page.locator('[data-testid="history-filter"]')).toHaveValue(
        'today'
      );

      // Test date range picker
      await page.click('[data-testid="date-range-picker"]');
      await page.click('[data-testid="last-7-days"]');
      await expect(
        page.locator('[data-testid="history-date-range"]')
      ).toContainText('Last 7 days');
    });
  });

  test.describe('Error Handling and User Feedback', () => {
    test.beforeEach(async () => {
      await page.goto('/login');
      await page.fill('[data-testid="email"]', testUser.email);
      await page.fill('[data-testid="password"]', testUser.password);
      await page.click('[data-testid="login-submit"]');
      await expect(page).toHaveURL('/dashboard');
    });

    test('should handle insufficient margin error gracefully', async () => {
      await page.click('[data-testid="trade-nav"]');

      // Try to place a very large order that would exceed margin
      await page.fill('[data-testid="symbol-input"]', 'EURUSD');
      await page.selectOption('[data-testid="order-type"]', 'market');
      await page.click('[data-testid="buy-radio"]');
      await page.fill('[data-testid="quantity-input"]', '1000'); // Very large quantity

      await page.click('[data-testid="place-order-button"]');

      // Should show insufficient margin error
      await expect(page.locator('[data-testid="margin-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="margin-error"]')).toContainText(
        'Insufficient margin'
      );
      await expect(
        page.locator('[data-testid="required-margin"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="available-margin"]')
      ).toBeVisible();
    });

    test('should handle network connectivity issues', async () => {
      await page.click('[data-testid="trade-nav"]');

      // Block network requests
      await page.route('**/execute-order', (route) => {
        route.abort('internetdisconnected');
      });

      await page.fill('[data-testid="symbol-input"]', 'EURUSD');
      await page.selectOption('[data-testid="order-type"]', 'market');
      await page.click('[data-testid="buy-radio"]');
      await page.fill('[data-testid="quantity-input"]', '1.0');
      await page.click('[data-testid="place-order-button"]');

      // Should show network error
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

      // Test retry functionality
      await page.unroute('**/execute-order'); // Restore network
      await page.click('[data-testid="retry-button"]');

      // Should attempt to place order again
      await expect(
        page.locator('[data-testid="order-processing"]')
      ).toBeVisible();
    });

    test('should validate form inputs in real-time', async () => {
      await page.click('[data-testid="trade-nav"]');

      // Test symbol validation
      await page.fill('[data-testid="symbol-input"]', 'INVALID_SYMBOL_123!');
      await page.press('[data-testid="symbol-input"]', 'Tab');

      await expect(page.locator('[data-testid="symbol-error"]')).toBeVisible();

      // Test quantity validation
      await page.fill('[data-testid="symbol-input"]', 'EURUSD');
      await page.fill('[data-testid="quantity-input"]', '-1');
      await page.press('[data-testid="quantity-input"]', 'Tab');

      await expect(
        page.locator('[data-testid="quantity-error"]')
      ).toBeVisible();

      // Test price validation for limit orders
      await page.selectOption('[data-testid="order-type"]', 'limit');
      await page.fill('[data-testid="quantity-input"]', '1.0');
      await page.fill('[data-testid="price-input"]', '0');
      await page.press('[data-testid="price-input"]', 'Tab');

      await expect(page.locator('[data-testid="price-error"]')).toBeVisible();
    });
  });

  test.describe('Performance Requirements Validation', () => {
    test.beforeEach(async () => {
      await page.goto('/login');
      await page.fill('[data-testid="email"]', testUser.email);
      await page.fill('[data-testid="password"]', testUser.password);
      await page.click('[data-testid="login-submit"]');
      await expect(page).toHaveURL('/dashboard');
    });

    test('should complete order execution within 500ms', async () => {
      await page.click('[data-testid="trade-nav"]');

      const startTime = Date.now();

      // Fill and submit order form
      await page.fill('[data-testid="symbol-input"]', 'EURUSD');
      await page.selectOption('[data-testid="order-type"]', 'market');
      await page.click('[data-testid="buy-radio"]');
      await page.fill('[data-testid="quantity-input"]', '1.0');

      await page.click('[data-testid="place-order-button"]');

      // Wait for order completion
      await expect(page.locator('[data-testid="order-success"]')).toBeVisible();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Verify execution time is within requirement
      expect(executionTime).toBeLessThan(500);
    });

    test('should handle concurrent order submissions efficiently', async () => {
      await page.click('[data-testid="trade-nav"]');

      const startTime = Date.now();

      // Submit multiple orders rapidly
      const clickPromises: Promise<void>[] = [];

      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="symbol-input"]', `PAIR${i}`);
        await page.selectOption('[data-testid="order-type"]', 'market');
        await page.click('[data-testid="buy-radio"]');
        await page.fill('[data-testid="quantity-input"]', '0.1');

        // Collect click promises instead of swallowing errors
        clickPromises.push(page.click('[data-testid="place-order-button"]'));
      }

      // Wait for all clicks to complete and check for errors
      const clickResults = await Promise.allSettled(clickPromises);
      const failedClicks = clickResults.filter(
        (result) => result.status === 'rejected'
      );

      if (failedClicks.length > 0) {
        throw new Error(
          `Failed to click place order button for ${failedClicks.length} orders: ${failedClicks.map((r) => (r as PromiseRejectedResult).reason).join(', ')}`
        );
      }

      // Wait for each order to complete successfully
      for (let i = 0; i < 5; i++) {
        await page.waitForSelector('[data-testid="order-success"]', {
          timeout: 5000,
        });
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should handle concurrent submissions within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds for 5 orders
    });

    test('should maintain responsive UI during high-frequency updates', async () => {
      await page.click('[data-testid="trade-nav"]');

      // Start monitoring UI responsiveness
      let uiResponsive = true;
      let monitorUI: NodeJS.Timeout | undefined;

      try {
        monitorUI = setInterval(() => {
          if (page.isClosed()) {
            clearInterval(monitorUI);
            return;
          }

          page
            .evaluate(() => {
              return !document.hidden && document.readyState === 'complete';
            })
            .then((responsive) => {
              if (!responsive) uiResponsive = false;
            });
        }, 100);

        // Simulate high-frequency price updates
        for (let i = 0; i < 100; i++) {
          await page.evaluate(
            (price) => {
              window.dispatchEvent(
                new CustomEvent('price-update', {
                  detail: {
                    symbol: 'EURUSD',
                    price: price,
                    change: 0.001,
                    changePercent: 0.09,
                  },
                })
              );
            },
            1.095 + i * 0.0001
          );

          // Small delay to prevent overwhelming the UI
          await page.waitForTimeout(10);
        }

        // UI should remain responsive
        expect(uiResponsive).toBe(true);
      } finally {
        if (monitorUI) {
          clearInterval(monitorUI);
        }
      }
    });
  });

  test.describe('Security and Data Integrity', () => {
    test.beforeEach(async () => {
      await page.goto('/login');
      await page.fill('[data-testid="email"]', testUser.email);
      await page.fill('[data-testid="password"]', testUser.password);
      await page.click('[data-testid="login-submit"]');
      await expect(page).toHaveURL('/dashboard');
    });

    test('should prevent XSS attacks in order inputs', async () => {
      await page.click('[data-testid="trade-nav"]');

      // Set up console monitoring before attempting XSS
      const logs: string[] = [];
      page.on('console', (msg) => logs.push(msg.text()));

      // Attempt XSS attack in symbol field
      await page.fill(
        '[data-testid="symbol-input"]',
        '<script>alert("xss")</script>'
      );
      await page.selectOption('[data-testid="order-type"]', 'market');
      await page.click('[data-testid="buy-radio"]');
      await page.fill('[data-testid="quantity-input"]', '1.0');

      await page.click('[data-testid="place-order-button"]');

      // Should show validation error, not execute script
      await expect(page.locator('[data-testid="symbol-error"]')).toBeVisible();

      await page.waitForTimeout(1000);

      const xssLogs = logs.filter(
        (log) => log.includes('alert') || log.includes('xss')
      );
      expect(xssLogs).toHaveLength(0);
    });

    test('should validate CSRF protection on order submission', async () => {
      await page.click('[data-testid="trade-nav"]');

      // Remove CSRF token
      await page.evaluate(() => {
        document.cookie =
          'csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('csrf-token');
      });

      await page.fill('[data-testid="symbol-input"]', 'EURUSD');
      await page.selectOption('[data-testid="order-type"]', 'market');
      await page.click('[data-testid="buy-radio"]');
      await page.fill('[data-testid="quantity-input"]', '1.0');

      await page.click('[data-testid="place-order-button"]');

      // Should show CSRF error
      await expect(page.locator('[data-testid="csrf-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="csrf-error"]')).toContainText(
        'Security token'
      );
    });

    test('should protect against SQL injection attempts', async () => {
      await page.click('[data-testid="trade-nav"]');

      // Attempt SQL injection in various fields
      const maliciousInputs = [
        "'; DROP TABLE orders; --",
        "' OR '1'='1",
        "1; DELETE FROM users WHERE '1'='1",
        "EURUSD' UNION SELECT * FROM users--",
      ];

      for (const input of maliciousInputs) {
        await page.fill('[data-testid="symbol-input"]', input);
        await page.selectOption('[data-testid="order-type"]', 'market');
        await page.click('[data-testid="buy-radio"]');
        await page.fill('[data-testid="quantity-input"]', '1.0');

        await page.click('[data-testid="place-order-button"]');

        // Should show validation error, not process malicious input
        await expect(
          page.locator('[data-testid="symbol-error"]')
        ).toBeVisible();
      }
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work consistently across different browsers', async () => {
      // This test would run on different browsers in parallel in a real CI/CD setup
      // For now, we'll test the basic functionality

      await page.goto('/login');

      // Test basic page load
      await expect(page).toHaveTitle(/.*Trade.*Pro.*Global.*/);

      // Test responsive design
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile size
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop size
      await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();

      // Test touch interactions on mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.tap('[data-testid="mobile-menu-button"]');
      await expect(
        page.locator('[data-testid="mobile-nav-menu"]')
      ).toBeVisible();
    });
  });
});
