import { Award, BookMarked, BookOpen, UserCheck, Video } from 'lucide-react';
import { NavLink, SmallMenu } from './NavLink';

export const EducationMenu = () => (
  <SmallMenu title="Education">
    <NavLink
      to="/education/webinar"
      icon={<Video className="h-4 w-4" />}
      title="Webinars"
      description="Live trading sessions"
    />
    <NavLink
      to="/education/certifications"
      icon={<Award className="h-4 w-4" />}
      title="Certifications"
      description="Trading certificates"
    />
    <NavLink
      to="/education/tutorials"
      icon={<BookOpen className="h-4 w-4" />}
      title="Tutorials & E-Books"
      description="Guides & resources"
    />
    <NavLink
      to="/education/mentorship"
      icon={<UserCheck className="h-4 w-4" />}
      title="Mentorship"
      description="1-on-1 coaching"
    />
    <NavLink
      to="/education/glossary"
      icon={<BookMarked className="h-4 w-4" />}
      title="Glossary"
      description="Trading terminology"
    />
  </SmallMenu>
);
