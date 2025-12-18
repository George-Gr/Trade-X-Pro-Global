import { BarChart3, Laptop, Settings2, Users, Wrench } from 'lucide-react';
import { Menu, NavLink } from './NavLink';

export const TradingMenu = () => (
  <Menu title="Trading">
    <NavLink
      to="/trading/instruments"
      icon={<BarChart3 className="h-4 w-4" />}
      title="Trading Instruments"
      description="Forex, Stocks, Indices, Commodities, Crypto"
    />
    <NavLink
      to="/trading/platforms"
      icon={<Laptop className="h-4 w-4" />}
      title="Trading Platforms"
      description="MT4, MT5, WebTrader, Mobile Apps"
    />
    <NavLink
      to="/trading/account-types"
      icon={<Users className="h-4 w-4" />}
      title="Account Types"
      description="Standard, Premium, ECN, Islamic"
    />
    <NavLink
      to="/trading/conditions"
      icon={<Settings2 className="h-4 w-4" />}
      title="Trading Conditions"
      description="Spreads, Leverage, Execution"
    />
    <NavLink
      to="/trading/tools"
      icon={<Wrench className="h-4 w-4" />}
      title="Trading Tools"
      description="Analysis, Signals, Calculators"
    />
  </Menu>
);
