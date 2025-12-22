# Ask Mode Guidelines

This file provides documentation and inquiry guidance for AI agents working on this trading platform codebase.

## Project Context

**TradePro v10**: Broker-independent CFD trading simulation platform with multi-asset trading (forex, stocks, crypto, indices), paper trading, social copy trading, KYC/AML verification, and risk management.

## Trading Platform Terminology

**CFD (Contract for Difference)**: Derivative trading instrument allowing speculation on price movements without owning underlying assets
**Margin Trading**: Trading with borrowed funds to amplify position sizes
**Liquidation**: Forced closure of positions when margin requirements not met
**Spread**: Difference between bid and ask prices
**Leverage**: Ratio of borrowed to owned funds (e.g., 1:100 means $1000 controls $100,000 position)

## Complex Business Logic Areas

**Order Matching Engine**: Located in `src/lib/trading/orderMatching.ts` - handles market, limit, stop, and stop-limit orders
**Margin Calculations**: `src/lib/trading/marginCalculations.ts` - critical for risk management
**Position Management**: `src/lib/trading/positionUtils.ts` - tracks open/closed positions
**Risk Monitoring**: `src/lib/risk/` - margin calls, liquidation thresholds

## Multi-Asset Trading Workflows

**Forex Trading**: Currency pairs with 24/5 market hours
**Stock Trading**: Individual company shares with exchange-specific hours
**Cryptocurrency**: 24/7 trading with high volatility
**Indices**: Market basket trading with specific session times
**Commodities**: Physical goods trading with delivery considerations

## KYC/AML Compliance Context

**Multi-step Verification**: Document upload, identity verification, address confirmation
**AML Monitoring**: Transaction pattern analysis for suspicious activities
**Risk Assessment**: User risk profiling for appropriate leverage limits
**Regulatory Reporting**: Automated compliance reporting to authorities

## Real-time Data Requirements

**Price Streaming**: WebSocket connections to multiple data providers
**Position Updates**: Real-time P&L calculation and display
**Risk Monitoring**: Continuous margin level assessment
**Order Execution**: Sub-second order processing and confirmation

## Documentation Structure

**PRD.md**: Primary feature requirements and scope definition
**STYLE_GUIDE.md**: Code standards and conventions
**SECURITY.md**: Security standards and compliance requirements
**ACCESSIBILITY_STANDARDS.md**: WCAG 2.1 AA requirements
**Quick Start**: `docs/PRIMARY/QUICK_START.md` - 30-minute onboarding guide

## API Integration Points

**Supabase**: PostgreSQL database with real-time subscriptions
**TradingView**: Chart library integration with custom compatibility patches
**Sentry**: Error tracking and performance monitoring
**Authentication**: JWT-based auth with MFA support
