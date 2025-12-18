import { NavLink } from "./NavLink";
import {
  FileText,
  ScrollText,
  AlertTriangle,
  Cookie,
  Scale,
} from "lucide-react";

export const LegalMenu = () => (
  <NavLink.SmallMenu title="Legal">
    <NavLink
      to="/legal/privacy"
      icon={<FileText className="h-4 w-4" />}
      title="Privacy Policy"
      description="Data protection"
    />
    <NavLink
      to="/legal/terms"
      icon={<ScrollText className="h-4 w-4" />}
      title="Terms & Conditions"
      description="Service agreement"
    />
    <NavLink
      to="/legal/risk-disclosure"
      icon={<AlertTriangle className="h-4 w-4" />}
      title="Risk Disclosure"
      description="Trading risks"
    />
    <NavLink
      to="/legal/cookie-policy"
      icon={<Cookie className="h-4 w-4" />}
      title="Cookie Policy"
      description="Cookie usage"
    />
    <NavLink
      to="/legal/aml-policy"
      icon={<Scale className="h-4 w-4" />}
      title="AML Policy"
      description="Anti-money laundering"
    />
  </NavLink.SmallMenu>
);
