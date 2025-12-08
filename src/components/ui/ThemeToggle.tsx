import * as React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  Sun, 
  Moon, 
  Monitor, 
  RotateCcw 
} from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'default', 
  size = 'default',
  showLabel = false,
  className 
}) => {
  const { theme, setTheme, isDarkMode, isThemeLoaded } = useTheme();

  const themes = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Monitor },
  ];

  const currentTheme = themes.find(t => t.key === theme);
  const IconComponent = currentTheme?.icon || Sun;

  if (!isThemeLoaded) {
    return (
      <Button 
        variant="ghost" 
        size={size}
        className={className}
        disabled
      >
        <RotateCcw className="h-4 w-4 animate-spin" />
        {showLabel && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  return (
    <div className={className}>
      <Button
        variant={variant}
        size={size}
        onClick={() => {
          const currentIndex = themes.findIndex(t => t.key === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].key);
        }}
        className="relative overflow-hidden transition-all duration-300 ease-in-out"
        aria-label={`Switch to ${themes[(themes.findIndex(t => t.key === theme) + 1) % themes.length].label} theme`}
      >
        <div className="relative flex items-center">
          <IconComponent 
            className={`
              transition-all
              duration-300
              ease-in-out
              ${
                isDarkMode 
                  ? 'text-yellow-400' 
                  : 'text-gray-600'
              }
            `}
          />
          {showLabel && (
            <span className="ml-2 font-medium">
              {currentTheme?.label}
            </span>
          )}
        </div>
        
        {/* Theme indicator dot */}
        <div className={`
          absolute
          bottom-0.5
          right-0.5
          w-1.5
          h-1.5
          rounded-full
          transition-colors
          duration-300
          ${
            theme === 'system' 
              ? 'bg-blue-500' 
              : theme === 'dark'
              ? 'bg-gray-600'
              : 'bg-yellow-400'
          }
        `} />
      </Button>
    </div>
  );
};

export default ThemeToggle;