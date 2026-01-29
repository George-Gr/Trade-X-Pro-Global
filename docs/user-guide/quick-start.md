# Quick Start Guide

Welcome to Trade-X-Pro-Global! This guide will get you up and running with our CFD trading simulation platform in about 30 minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm or yarn** package manager
- **Git** for version control
- A **Supabase account** for the backend

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Trade-X-Pro-Global
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including React, TypeScript, Vite, and Supabase client libraries.

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🎯 First Steps

### 1. Create an Account

1. Open the application in your browser
2. Click "Sign Up" and create a new account
3. Complete the KYC verification process

### 2. Fund Your Account

1. Navigate to the account settings
2. Add virtual funds (unlimited practice capital available)
3. Set your preferred currency

### 3. Place Your First Trade

1. Go to the trading dashboard
2. Select an asset (Forex, Stocks, Crypto, etc.)
3. Choose your position size and leverage
4. Set stop-loss and take-profit levels
5. Execute the trade

## 📊 Understanding the Interface

### Key Components

- **Portfolio Dashboard**: Overview of your positions and P&L
- **Trading Terminal**: Place orders and manage positions
- **Market Watch**: Real-time price feeds and charts
- **Risk Management**: Margin monitoring and alerts
- **Social Trading**: Copy other traders' strategies

### Trading Concepts

- **CFD**: Contract for Difference - profit from price movements without owning assets
- **Leverage**: Borrow money to increase position size (e.g., 10:1 leverage)
- **Margin**: Collateral required to maintain positions
- **P&L**: Profit and Loss calculations

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type:check
```

## 🆘 Need Help?

- Check the [full documentation](../README.md)
- Review the [developer guide](../developer-guide/ai-agent-guidelines.md)
- Open an [issue](https://github.com/your-org/trade-x-pro-global/issues) on GitHub

## 🎉 You're Ready!

Congratulations! You now have a fully functional CFD trading simulator. Start practicing your strategies with unlimited virtual capital and learn from the community.

**Happy Trading! 📈**</content>
<parameter name="filePath">c:\Users\Alpha\OneDrive\Desktop\Trade-X-Pro-Global\docs\user-guide\quick-start.md