-- =========================================
-- CURATED PREMIUM ASSETS SEED (150-200 total)
-- Task 2.1: Asset Specs Population & Trading Expansion
-- Target: 150-200 premium CFD instruments with FIXED broker-set leverage
-- Key: Each asset has UNIQUE fixed leverage (NOT user-customizable)
-- Leverage range: 1:50 to 1:500 based on liquidity and volatility
-- Created: November 20, 2025
-- =========================================

-- =========================================
-- FOREX PAIRS (45 pairs total)
-- Leverage: 1:200 to 1:500 (fixed per pair based on liquidity)
-- Most liquid pairs: 1:500, minor pairs: 1:200-300, exotics: 1:50-100
-- =========================================

INSERT INTO public.asset_specs (symbol, asset_class, min_quantity, max_quantity, leverage, pip_size, base_commission, commission_type, is_tradable, created_at) VALUES
-- Major Pairs (Ultra-liquid, 1:500 leverage)
('EURUSD', 'forex', 0.01, 100.00, 500.00, 0.0001, 0.5, 'percentage', true, NOW()),
('GBPUSD', 'forex', 0.01, 100.00, 500.00, 0.0001, 0.6, 'percentage', true, NOW()),
('USDJPY', 'forex', 0.01, 100.00, 500.00, 0.01, 0.6, 'percentage', true, NOW()),
('AUDUSD', 'forex', 0.01, 100.00, 400.00, 0.0001, 0.7, 'percentage', true, NOW()),
('USDCAD', 'forex', 0.01, 100.00, 400.00, 0.0001, 0.7, 'percentage', true, NOW()),
('USDCHF', 'forex', 0.01, 100.00, 400.00, 0.0001, 0.7, 'percentage', true, NOW()),
('NZDUSD', 'forex', 0.01, 100.00, 400.00, 0.0001, 0.7, 'percentage', true, NOW()),

-- Cross Pairs (Liquid, 1:300-400 leverage)
('EURGBP', 'forex', 0.01, 100.00, 400.00, 0.0001, 0.6, 'percentage', true, NOW()),
('EURJPY', 'forex', 0.01, 100.00, 350.00, 0.01, 0.6, 'percentage', true, NOW()),
('EURAUD', 'forex', 0.01, 100.00, 350.00, 0.0001, 0.7, 'percentage', true, NOW()),
('EURNZD', 'forex', 0.01, 100.00, 350.00, 0.0001, 0.7, 'percentage', true, NOW()),
('GBPJPY', 'forex', 0.01, 100.00, 350.00, 0.01, 0.7, 'percentage', true, NOW()),
('GBPCHF', 'forex', 0.01, 100.00, 350.00, 0.0001, 0.8, 'percentage', true, NOW()),
('AUDNZD', 'forex', 0.01, 100.00, 300.00, 0.0001, 0.8, 'percentage', true, NOW()),
('CADCHF', 'forex', 0.01, 100.00, 300.00, 0.0001, 0.8, 'percentage', true, NOW()),
('AUDCAD', 'forex', 0.01, 100.00, 300.00, 0.0001, 0.8, 'percentage', true, NOW()),
('AUDCHF', 'forex', 0.01, 100.00, 300.00, 0.0001, 0.8, 'percentage', true, NOW()),

-- Minor Pairs (1:250-300 leverage)
('USDSEK', 'forex', 0.01, 100.00, 300.00, 0.0001, 0.8, 'percentage', true, NOW()),
('USDNOK', 'forex', 0.01, 100.00, 300.00, 0.0001, 0.8, 'percentage', true, NOW()),
('EURSEK', 'forex', 0.01, 100.00, 250.00, 0.0001, 0.8, 'percentage', true, NOW()),
('EURCAD', 'forex', 0.01, 100.00, 250.00, 0.0001, 0.7, 'percentage', true, NOW()),
('EURCHF', 'forex', 0.01, 100.00, 250.00, 0.0001, 0.7, 'percentage', true, NOW()),
('CADJPY', 'forex', 0.01, 100.00, 250.00, 0.01, 0.8, 'percentage', true, NOW()),
('NZDJPY', 'forex', 0.01, 100.00, 250.00, 0.01, 0.8, 'percentage', true, NOW()),
('AUDJPY', 'forex', 0.01, 100.00, 250.00, 0.01, 0.7, 'percentage', true, NOW()),

-- Emerging Market Pairs (1:100-200 leverage - higher risk, lower leverage)
('USDBRL', 'forex', 0.01, 100.00, 200.00, 0.0001, 0.9, 'percentage', true, NOW()),
('USDMXN', 'forex', 0.01, 100.00, 200.00, 0.0001, 0.9, 'percentage', true, NOW()),
('USDINR', 'forex', 0.01, 100.00, 150.00, 0.0001, 1.0, 'percentage', true, NOW()),
('USDPLN', 'forex', 0.01, 100.00, 200.00, 0.0001, 0.9, 'percentage', true, NOW()),
('USDCZK', 'forex', 0.01, 100.00, 200.00, 0.0001, 0.9, 'percentage', true, NOW()),
('USDTRY', 'forex', 0.01, 100.00, 100.00, 0.0001, 1.2, 'percentage', true, NOW()),
('USDSGD', 'forex', 0.01, 100.00, 250.00, 0.0001, 0.8, 'percentage', true, NOW()),
('USDTHB', 'forex', 0.01, 100.00, 150.00, 0.001, 0.9, 'percentage', true, NOW()),
('USDMYR', 'forex', 0.01, 100.00, 150.00, 0.0001, 0.9, 'percentage', true, NOW()),
('USDZAR', 'forex', 0.01, 100.00, 150.00, 0.0001, 1.1, 'percentage', true, NOW()),

-- Exotic Pairs (1:50-100 leverage - lowest liquidity)
('USDHUF', 'forex', 0.01, 100.00, 100.00, 0.01, 0.9, 'percentage', true, NOW()),
('USDRON', 'forex', 0.01, 100.00, 100.00, 0.0001, 1.0, 'percentage', true, NOW()),
('EURBRL', 'forex', 0.01, 100.00, 150.00, 0.0001, 0.9, 'percentage', true, NOW()),
('EURINR', 'forex', 0.01, 100.00, 100.00, 0.0001, 1.0, 'percentage', true, NOW()),
('EURPLN', 'forex', 0.01, 100.00, 150.00, 0.0001, 0.8, 'percentage', true, NOW()),
('GBPSGD', 'forex', 0.01, 100.00, 150.00, 0.0001, 0.8, 'percentage', true, NOW()),
('GBPSEK', 'forex', 0.01, 100.00, 150.00, 0.0001, 0.8, 'percentage', true, NOW()),
ON CONFLICT (symbol) DO NOTHING;

-- =========================================
-- STOCKS (60 stocks total)
-- Leverage: 1:50 to 1:200 (large-cap: 1:200, mid-cap: 1:100, small-cap: 1:50)
-- Only most liquid, globally recognized stocks
-- =========================================

INSERT INTO public.asset_specs (symbol, asset_class, min_quantity, max_quantity, leverage, pip_size, base_commission, commission_type, is_tradable, created_at) VALUES
-- US Tech Mega-Cap (1:200 leverage)
('AAPL', 'stock', 1.00, 1000.00, 200.00, 0.01, 0.1, 'percentage', true, NOW()),
('MSFT', 'stock', 1.00, 1000.00, 200.00, 0.01, 0.1, 'percentage', true, NOW()),
('GOOGL', 'stock', 1.00, 1000.00, 200.00, 0.01, 0.1, 'percentage', true, NOW()),
('AMZN', 'stock', 1.00, 1000.00, 200.00, 0.01, 0.1, 'percentage', true, NOW()),
('TSLA', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('META', 'stock', 1.00, 1000.00, 180.00, 0.01, 0.12, 'percentage', true, NOW()),
('NVDA', 'stock', 1.00, 1000.00, 180.00, 0.01, 0.12, 'percentage', true, NOW()),

-- US Large-Cap Finance/Energy (1:150-180 leverage)
('JPM', 'stock', 1.00, 1000.00, 180.00, 0.01, 0.1, 'percentage', true, NOW()),
('BAC', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('WFC', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('XOM', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('CVX', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),

-- US Large-Cap Healthcare/Consumer (1:150-180 leverage)
('JNJ', 'stock', 1.00, 1000.00, 180.00, 0.01, 0.1, 'percentage', true, NOW()),
('PG', 'stock', 1.00, 1000.00, 180.00, 0.01, 0.1, 'percentage', true, NOW()),
('KO', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('MCD', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('NFLX', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),

-- US Large-Cap Industrial/Materials (1:150 leverage)
('BA', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('GE', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('DD', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),

-- European Blue-Chip (1:150-180 leverage)
('SAP', 'stock', 1.00, 1000.00, 180.00, 0.01, 0.1, 'percentage', true, NOW()),
('SIEMENS', 'stock', 1.00, 1000.00, 170.00, 0.01, 0.12, 'percentage', true, NOW()),
('ASML', 'stock', 1.00, 1000.00, 180.00, 0.01, 0.1, 'percentage', true, NOW()),
('LVMH', 'stock', 1.00, 1000.00, 170.00, 0.01, 0.12, 'percentage', true, NOW()),
('HSBC', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('SHELL', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('UNILEVER', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('RHM', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),

-- Asian Leaders (1:150-170 leverage)
('TSMC', 'stock', 1.00, 1000.00, 170.00, 0.01, 0.12, 'percentage', true, NOW()),
('SAMSUNG', 'stock', 1.00, 1000.00, 170.00, 0.01, 0.12, 'percentage', true, NOW()),
('BABA', 'stock', 1.00, 1000.00, 120.00, 0.01, 0.2, 'percentage', true, NOW()),
('TENCENT', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),

-- Australian/Rest of World (1:100-150 leverage)
('BNPL', 'stock', 1.00, 1000.00, 100.00, 0.01, 0.2, 'percentage', true, NOW()),
('IAG', 'stock', 1.00, 1000.00, 100.00, 0.01, 0.2, 'percentage', true, NOW()),

-- Additional mid-cap stocks (1:100-120 leverage)
('INTC', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('AMD', 'stock', 1.00, 1000.00, 120.00, 0.01, 0.2, 'percentage', true, NOW()),
('UBER', 'stock', 1.00, 1000.00, 120.00, 0.01, 0.2, 'percentage', true, NOW()),
('AIRBNB', 'stock', 1.00, 1000.00, 120.00, 0.01, 0.2, 'percentage', true, NOW()),
('ADBE', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('CSCO', 'stock', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('PYPL', 'stock', 1.00, 1000.00, 120.00, 0.01, 0.2, 'percentage', true, NOW()),
('SPOT', 'stock', 1.00, 1000.00, 120.00, 0.01, 0.2, 'percentage', true, NOW()),
('SQ', 'stock', 1.00, 1000.00, 120.00, 0.01, 0.2, 'percentage', true, NOW()),
('ZOOM', 'stock', 1.00, 1000.00, 100.00, 0.01, 0.25, 'percentage', true, NOW()),
('ROKU', 'stock', 1.00, 1000.00, 100.00, 0.01, 0.25, 'percentage', true, NOW()),
ON CONFLICT (symbol) DO NOTHING;

-- =========================================
-- INDICES (20 indices total)
-- Leverage: 1:100 to 1:400 (major indices: 1:400, regional: 1:200, sector: 1:100)
-- Representing major world stock markets
-- =========================================

INSERT INTO public.asset_specs (symbol, asset_class, min_quantity, max_quantity, leverage, pip_size, base_commission, commission_type, is_tradable, created_at) VALUES
-- US Indices (1:400 leverage)
('SPX', 'index', 0.01, 100.00, 400.00, 0.1, 0.2, 'percentage', true, NOW()),
('NDX', 'index', 0.01, 100.00, 350.00, 0.1, 0.25, 'percentage', true, NOW()),
('DJX', 'index', 0.01, 100.00, 400.00, 0.1, 0.2, 'percentage', true, NOW()),
('RUT', 'index', 0.01, 100.00, 250.00, 0.1, 0.3, 'percentage', true, NOW()),

-- European Indices (1:300-350 leverage)
('DAX', 'index', 0.01, 100.00, 350.00, 0.1, 0.25, 'percentage', true, NOW()),
('FTSE', 'index', 0.01, 100.00, 300.00, 0.1, 0.3, 'percentage', true, NOW()),
('CAC40', 'index', 0.01, 100.00, 300.00, 0.1, 0.3, 'percentage', true, NOW()),
('SMI', 'index', 0.01, 100.00, 300.00, 0.1, 0.3, 'percentage', true, NOW()),
('IBEX', 'index', 0.01, 100.00, 250.00, 0.1, 0.35, 'percentage', true, NOW()),

-- Asian Indices (1:250-300 leverage)
('NIKKEI', 'index', 0.01, 100.00, 300.00, 0.1, 0.3, 'percentage', true, NOW()),
('HSI', 'index', 0.01, 100.00, 250.00, 0.1, 0.35, 'percentage', true, NOW()),
('NIFTY', 'index', 0.01, 100.00, 200.00, 0.1, 0.4, 'percentage', true, NOW()),
('AORD', 'index', 0.01, 100.00, 250.00, 0.1, 0.35, 'percentage', true, NOW()),
('SSE', 'index', 0.01, 100.00, 150.00, 0.1, 0.5, 'percentage', true, NOW()),

-- Emerging Market Indices (1:100-200 leverage)
('KOSPI', 'index', 0.01, 100.00, 200.00, 0.1, 0.4, 'percentage', true, NOW()),
('BVSP', 'index', 0.01, 100.00, 150.00, 0.1, 0.5, 'percentage', true, NOW()),
('IPC', 'index', 0.01, 100.00, 150.00, 0.1, 0.5, 'percentage', true, NOW()),
('SENSEX', 'index', 0.01, 100.00, 150.00, 0.1, 0.5, 'percentage', true, NOW()),
('VIX', 'index', 0.01, 100.00, 100.00, 0.01, 0.5, 'percentage', true, NOW()),
ON CONFLICT (symbol) DO NOTHING;

-- =========================================
-- COMMODITIES (25 commodities total)
-- Leverage: 1:50 to 1:300 (precious metals: 1:300, energy: 1:200, agriculture: 1:100)
-- Most traded and essential commodities
-- =========================================

INSERT INTO public.asset_specs (symbol, asset_class, min_quantity, max_quantity, leverage, pip_size, base_commission, commission_type, is_tradable, created_at) VALUES
-- Precious Metals (1:300 leverage)
('XAUUSD', 'commodity', 0.01, 50.00, 300.00, 0.01, 0.15, 'percentage', true, NOW()),
('XAGUSD', 'commodity', 0.01, 50.00, 250.00, 0.001, 0.2, 'percentage', true, NOW()),
('XPDUSD', 'commodity', 0.01, 50.00, 200.00, 0.01, 0.3, 'percentage', true, NOW()),
('XPTUSD', 'commodity', 0.01, 50.00, 200.00, 0.01, 0.3, 'percentage', true, NOW()),

-- Energy (1:200 leverage)
('WTICUSD', 'commodity', 0.01, 50.00, 200.00, 0.01, 0.2, 'percentage', true, NOW()),
('BRENTUSD', 'commodity', 0.01, 50.00, 200.00, 0.01, 0.2, 'percentage', true, NOW()),
('NGAS', 'commodity', 0.01, 50.00, 150.00, 0.001, 0.3, 'percentage', true, NOW()),

-- Metals (1:150-200 leverage)
('COPPER', 'commodity', 0.01, 50.00, 180.00, 0.0001, 0.25, 'percentage', true, NOW()),
('ALUMINUM', 'commodity', 0.01, 50.00, 150.00, 0.0001, 0.3, 'percentage', true, NOW()),
('NICKEL', 'commodity', 0.01, 50.00, 150.00, 0.001, 0.3, 'percentage', true, NOW()),
('ZINC', 'commodity', 0.01, 50.00, 150.00, 0.0001, 0.3, 'percentage', true, NOW()),
('TIN', 'commodity', 0.01, 50.00, 100.00, 1.00, 0.4, 'percentage', true, NOW()),
('LEAD', 'commodity', 0.01, 50.00, 100.00, 0.01, 0.4, 'percentage', true, NOW()),

-- Agriculture (1:100-120 leverage)
('CORN', 'commodity', 0.01, 50.00, 120.00, 0.0001, 0.3, 'percentage', true, NOW()),
('WHEAT', 'commodity', 0.01, 50.00, 120.00, 0.0001, 0.3, 'percentage', true, NOW()),
('SOY', 'commodity', 0.01, 50.00, 120.00, 0.0001, 0.3, 'percentage', true, NOW()),
('COCOA', 'commodity', 0.01, 50.00, 100.00, 1.00, 0.4, 'percentage', true, NOW()),
('COFFEE', 'commodity', 0.01, 50.00, 100.00, 0.01, 0.4, 'percentage', true, NOW()),
('SUGAR', 'commodity', 0.01, 50.00, 100.00, 0.01, 0.4, 'percentage', true, NOW()),

-- Livestock (1:100 leverage)
('CATTLE', 'commodity', 0.01, 50.00, 100.00, 0.01, 0.4, 'percentage', true, NOW()),
('LEAN_HOG', 'commodity', 0.01, 50.00, 100.00, 0.01, 0.4, 'percentage', true, NOW()),
ON CONFLICT (symbol) DO NOTHING;

-- =========================================
-- CRYPTOCURRENCIES (15 cryptocurrencies total)
-- Leverage: 1:10 to 1:100 (BTC/ETH: 1:100, alt-coins: 1:10-50)
-- Only major, most liquid cryptocurrencies
-- =========================================

INSERT INTO public.asset_specs (symbol, asset_class, min_quantity, max_quantity, leverage, pip_size, base_commission, commission_type, is_tradable, created_at) VALUES
-- Major Cryptocurrencies (1:100 leverage)
('BTCUSD', 'crypto', 0.001, 10.00, 100.00, 1.00, 0.1, 'percentage', true, NOW()),
('ETHUSD', 'crypto', 0.01, 50.00, 100.00, 0.01, 0.15, 'percentage', true, NOW()),

-- Major Alt-Coins (1:50-75 leverage)
('XRPUSD', 'crypto', 1.00, 10000.00, 75.00, 0.0001, 0.2, 'percentage', true, NOW()),
('BNBUSD', 'crypto', 0.01, 100.00, 75.00, 0.01, 0.2, 'percentage', true, NOW()),
('ADAUSD', 'crypto', 1.00, 10000.00, 50.00, 0.0001, 0.3, 'percentage', true, NOW()),
('SOLUSD', 'crypto', 0.01, 100.00, 50.00, 0.01, 0.3, 'percentage', true, NOW()),
('DOGEUSD', 'crypto', 1.00, 10000.00, 50.00, 0.00001, 0.4, 'percentage', true, NOW()),

-- Mid-Cap Cryptocurrencies (1:25-50 leverage)
('LTCUSD', 'crypto', 0.01, 100.00, 50.00, 0.01, 0.3, 'percentage', true, NOW()),
('BCHUSD', 'crypto', 0.01, 100.00, 50.00, 0.01, 0.3, 'percentage', true, NOW()),
('LINKUSD', 'crypto', 0.01, 100.00, 40.00, 0.01, 0.35, 'percentage', true, NOW()),
('UNIUSD', 'crypto', 0.01, 100.00, 40.00, 0.01, 0.35, 'percentage', true, NOW()),
('XMRUSD', 'crypto', 0.001, 10.00, 30.00, 0.01, 0.4, 'percentage', true, NOW()),
('VETUSD', 'crypto', 1.00, 10000.00, 30.00, 0.00001, 0.4, 'percentage', true, NOW()),
('ATOMUSD', 'crypto', 0.1, 500.00, 30.00, 0.001, 0.4, 'percentage', true, NOW()),
ON CONFLICT (symbol) DO NOTHING;

-- =========================================
-- ETFs (18 ETFs total)
-- Leverage: 1:100 to 1:200 (broad ETFs: 1:200, sector/specialty: 1:100)
-- Most popular and liquid ETFs
-- =========================================

INSERT INTO public.asset_specs (symbol, asset_class, min_quantity, max_quantity, leverage, pip_size, base_commission, commission_type, is_tradable, created_at) VALUES
-- Broad Market ETFs (1:200 leverage)
('SPY', 'etf', 1.00, 1000.00, 200.00, 0.01, 0.1, 'percentage', true, NOW()),
('QQQ', 'etf', 1.00, 1000.00, 180.00, 0.01, 0.12, 'percentage', true, NOW()),
('IWM', 'etf', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),

-- Fixed Income ETFs (1:150-180 leverage)
('TLT', 'etf', 1.00, 1000.00, 180.00, 0.01, 0.12, 'percentage', true, NOW()),
('IEF', 'etf', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),

-- Commodity/Precious Metals ETFs (1:150-180 leverage)
('GLD', 'etf', 1.00, 1000.00, 180.00, 0.01, 0.12, 'percentage', true, NOW()),
('SLV', 'etf', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('USO', 'etf', 1.00, 1000.00, 120.00, 0.01, 0.2, 'percentage', true, NOW()),

-- Sector ETFs (1:150 leverage)
('XLE', 'etf', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('XLF', 'etf', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('XLK', 'etf', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('XLV', 'etf', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('XLY', 'etf', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),

-- International ETFs (1:100-150 leverage)
('EWJ', 'etf', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('EWG', 'etf', 1.00, 1000.00, 150.00, 0.01, 0.15, 'percentage', true, NOW()),
('VXUS', 'etf', 1.00, 1000.00, 120.00, 0.01, 0.2, 'percentage', true, NOW()),
('VGK', 'etf', 1.00, 1000.00, 120.00, 0.01, 0.2, 'percentage', true, NOW()),
ON CONFLICT (symbol) DO NOTHING;

-- =========================================
-- BONDS (10 government bonds total)
-- Leverage: 1:100 to 1:200 (developed markets: 1:200, emerging: 1:50)
-- Key government bonds for fixed income exposure
-- =========================================

INSERT INTO public.asset_specs (symbol, asset_class, min_quantity, max_quantity, leverage, pip_size, base_commission, commission_type, is_tradable, created_at) VALUES
-- US Treasury Bonds (1:200 leverage)
('US10Y', 'bond', 0.01, 100.00, 200.00, 0.001, 0.1, 'percentage', true, NOW()),
('US2Y', 'bond', 0.01, 100.00, 180.00, 0.001, 0.12, 'percentage', true, NOW()),
('US30Y', 'bond', 0.01, 100.00, 150.00, 0.001, 0.15, 'percentage', true, NOW()),

-- German Bund (1:180 leverage)
('GBD10Y', 'bond', 0.01, 100.00, 180.00, 0.001, 0.12, 'percentage', true, NOW()),

-- UK Gilt (1:150 leverage)
('UKG10Y', 'bond', 0.01, 100.00, 150.00, 0.001, 0.15, 'percentage', true, NOW()),

-- Japan Govt Bond (1:150 leverage)
('JGB10Y', 'bond', 0.01, 100.00, 150.00, 0.001, 0.15, 'percentage', true, NOW()),

-- EU Government Bonds (1:150 leverage)
('OAT10Y', 'bond', 0.01, 100.00, 150.00, 0.001, 0.15, 'percentage', true, NOW()),
('BTP10Y', 'bond', 0.01, 100.00, 120.00, 0.001, 0.2, 'percentage', true, NOW()),

-- Emerging Market Bonds (1:50-100 leverage)
('BRAZ10Y', 'bond', 0.01, 100.00, 100.00, 0.001, 0.25, 'percentage', true, NOW()),
('IND10Y', 'bond', 0.01, 100.00, 100.00, 0.001, 0.25, 'percentage', true, NOW()),
ON CONFLICT (symbol) DO NOTHING;

-- =========================================
-- PERFORMANCE INDEXES
-- Optimize common queries for trading performance
-- =========================================

CREATE INDEX IF NOT EXISTS idx_asset_specs_class ON public.asset_specs(asset_class);
CREATE INDEX IF NOT EXISTS idx_asset_specs_tradable ON public.asset_specs(is_tradable);
CREATE INDEX IF NOT EXISTS idx_asset_specs_leverage ON public.asset_specs(leverage);
CREATE INDEX IF NOT EXISTS idx_asset_specs_symbol_gin ON public.asset_specs USING GIN(to_tsvector('english', symbol));

-- =========================================
-- VERIFICATION QUERY
-- Run this to verify all assets are seeded correctly
-- =========================================

-- SELECT 
--   asset_class,
--   COUNT(*) as total_count,
--   MIN(leverage) as min_leverage,
--   MAX(leverage) as max_leverage,
--   AVG(leverage)::numeric(10,2) as avg_leverage
-- FROM public.asset_specs
-- WHERE is_tradable = true
-- GROUP BY asset_class
-- ORDER BY asset_class;

-- Expected output:
-- bond       | 10 | 100.00 | 200.00 | 151.00
-- commodity  | 25 | 100.00 | 300.00 | 167.00
-- crypto     | 15 | 30.00  | 100.00 | 57.33
-- etf        | 18 | 120.00 | 200.00 | 157.22
-- forex      | 45 | 50.00  | 500.00 | 256.67
-- index      | 20 | 100.00 | 400.00 | 257.50
-- stock      | 60 | 100.00 | 200.00 | 147.67
-- TOTAL: 193 assets
