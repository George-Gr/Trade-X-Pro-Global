import { NavLink } from "./NavLink";
import { DollarSign, LineChart, Building2, Gem, Bitcoin } from "lucide-react";

export const MarketsMenu = () => (
  <NavLink.SmallMenu title="Markets">
    <NavLink
      to="/markets/forex"
      icon={<DollarSign className="h-4 w-4" />}
      title="Forex"
      description="Major, Minor & Exotic pairs"
    />
    <NavLink
      to="/markets/stocks"
      icon={<LineChart className="h-4 w-4" />}
      title="Stocks"
      description="Global equity CFDs"
    />
    <NavLink
      to="/markets/indices"
      icon={<Building2 className="h-4 w-4" />}
      title="Indices"
      description="World market indices"
    />
    <NavLink
      to="/markets/commodities"
      icon={<Gem className="h-4 w-4" />}
      title="Commodities"
      description="Gold, Oil, Natural Gas"
    />
    <NavLink
      to="/markets/cryptocurrencies"
      icon={<Bitcoin className="h-4 w-4" />}
      title="Cryptocurrencies"
      description="BTC, ETH & more"
    />
  </NavLink.SmallMenu>
);
