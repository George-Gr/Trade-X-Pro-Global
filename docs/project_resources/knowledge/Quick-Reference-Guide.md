# TradeX Pro Global - Quick Reference Guide

## 🚀 Getting Started

### **Prerequisites**
```bash
# Check Node.js version (requires 18+)
node --version

# Install npm globally
npm install -g npm
```

### **Quick Setup**
```bash
# Clone and setup
git clone https://github.com/George-Gr/Trade-X-Pro-Global.git
cd Trade-X-Pro-Global
npm install
npm dev
```

## 📁 Key Directories

### **Source Code**
- `/src/components` - 180+ UI components organized by feature
- `/src/pages` - 40+ route-level page components
- `/src/hooks` - 40+ custom React hooks
- `/src/services` - API and WebSocket services
- `/src/store` - Redux store and slices

### **Documentation**
- `/docs` - Comprehensive project documentation
- `/PRD.md` - Complete product requirements
- `/README.md` - Quick start guide

### **Configuration**
- `/package.json` - Dependencies and scripts
- `/vite.config.ts` - Build configuration
- `/tailwind.config.js` - Styling configuration

## 🎯 Core Components

### **Trading Interface**
- `TradingPanel.tsx` - Main trading interface
- `OrderForm.tsx` - Order placement form
- `PositionsTable.tsx` - Open positions display
- `TradingViewChart.tsx` - Advanced charting

### **Dashboard**
- `AccountSummary.tsx` - Portfolio overview
- `PerformanceMetrics.tsx` - Performance analytics
- `RiskAlertsCard.tsx` - Risk monitoring
- `MarginLevelCard.tsx` - Margin monitoring

### **Admin**
- `KYCPanel.tsx` - KYC verification management
- `RiskPanel.tsx` - System risk monitoring
- `UsersPanel.tsx` - User management
- `RiskEventsTable.tsx` - Risk event tracking

## 🔧 Development Commands

### **Development**
```bash
npm dev              # Start development server
npm dev:clean        # Clean restart
npm dev:fresh        # Fresh install and restart
```

### **Build**
```bash
npm build            # Production build
npm build:dev        # Development build
npm preview          # Preview production build
```

### **Testing**
```bash
npm test             # Run unit tests
npm test:ui          # Run tests with UI
npm test:e2e         # Run e2e tests
```

### **Code Quality**
```bash
npm lint             # Run linter
npm type:strict      # TypeScript checking
npm sync-validators  # Sync form validators
```

## 📊 Architecture Overview

### **Frontend Stack**
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Radix UI** for accessible components

### **Data Flow**
1. **WebSocket** → Real-time market data
2. **Redux Store** → Application state
3. **React Components** → UI rendering
4. **API Services** → Backend communication

### **Key Services**
- **MarketDataService** - Real-time price feeds
- **TradingService** - Order execution
- **PortfolioService** - Portfolio management
- **RiskService** - Risk monitoring

## 🎨 Design System

### **Colors**
- Primary: Blue tones (`#0f172a`, `#1e293b`)
- Accent: Gold (`#f59e0b`)
- Success: Green (`#10b981`)
- Warning: Amber (`#f59e0b`)
- Error: Red (`#ef4444`)

### **Breakpoints**
- Mobile: `320px - 768px`
- Tablet: `768px - 1024px`
- Desktop: `1024px+`

## 🔒 Security Features

### **Authentication**
- Multi-factor authentication
- Session management
- Role-based access control

### **Data Protection**
- Input validation with Zod
- XSS protection
- CSRF protection

## 📱 Responsive Design

### **Mobile-First Approach**
- Touch-optimized interactions
- Swipe gestures
- Bottom navigation
- Collapsible sidebars

### **Performance Optimizations**
- Lazy loading
- Image optimization
- Virtual scrolling
- Code splitting

## 🧪 Testing Strategy

### **Unit Tests**
- Component testing with React Testing Library
- Hook testing with renderHook
- Utility function testing

### **Integration Tests**
- User flow testing
- API integration testing
- State management testing

### **E2E Tests**
- Critical user journeys
- Cross-browser testing
- Mobile responsiveness

## 🚀 Deployment

### **Environment Variables**
```env
VITE_API_URL=https://api.example.com
VITE_WS_URL=wss://ws.example.com
VITE_SENTRY_DSN=your-sentry-dsn
```

### **Build Optimization**
- Tree shaking
- Code splitting
- Asset optimization
- Compression

## 📚 Useful Resources

### **Documentation**
- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://radix-ui.com)

### **Trading Concepts**
- [CFD Trading](https://www.investopedia.com/terms/c/contractfordifferences.asp)
- [Technical Analysis](https://www.investopedia.com/terms/t/technicalanalysis.asp)
- [Risk Management](https://www.investopedia.com/terms/r/riskmanagement.asp)

## 🆘 Troubleshooting

### **Common Issues**
1. **Port already in use** - Change port in vite.config.ts
2. **Dependency conflicts** - Clear node_modules and reinstall
3. **Build failures** - Check Node.js version and memory

### **Performance Issues**
1. **Slow builds** - Increase Node.js memory limit
2. **Large bundles** - Analyze with bundle analyzer
3. **Memory leaks** - Check component unmounting

## 📞 Support

### **Getting Help**
- Check `/docs` directory for detailed guides
- Review component documentation
- Check test files for usage examples
- Review PRD.md for feature specifications

---

**Last Updated**: December 4, 2025  
**Version**: 1.0  
**Status**: Production-Ready