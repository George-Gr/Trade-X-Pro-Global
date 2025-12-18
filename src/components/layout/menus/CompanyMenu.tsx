import { Handshake, Info, Lock, Phone, Shield } from 'lucide-react';
import { NavLink, SmallMenu } from './NavLink';

export const CompanyMenu = () => (
  <SmallMenu title="Company">
    <NavLink
      to="/company/about"
      icon={<Info className="h-4 w-4" />}
      title="About Us"
      description="Our story & mission"
    />
    <NavLink
      to="/company/regulation"
      icon={<Shield className="h-4 w-4" />}
      title="Regulation"
      description="Licenses & compliance"
    />
    <NavLink
      to="/company/security"
      icon={<Lock className="h-4 w-4" />}
      title="Security"
      description="Fund protection"
    />
    <NavLink
      to="/company/partners"
      icon={<Handshake className="h-4 w-4" />}
      title="Partners"
      description="Partnership programs"
    />
    <NavLink
      to="/company/contact"
      icon={<Phone className="h-4 w-4" />}
      title="Contact Us"
      description="Get in touch"
    />
  </SmallMenu>
);
