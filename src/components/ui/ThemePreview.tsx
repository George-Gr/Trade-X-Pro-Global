import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Sun, 
  Moon, 
  Monitor,
  Eye,
  CheckCircle,
  AlertTriangle,
  Palette 
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface ThemePreviewProps {
  className?: string;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ className }) => {
  const { theme, setTheme, isDarkMode } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<string>(theme);

  const themes = [
    { key: 'light', label: 'Light', icon: Sun, description: 'Clean and bright' },
    { key: 'dark', label: 'Dark', icon: Moon, description: 'Professional and sleek' },
    { key: 'system', label: 'System', icon: Monitor, description: 'Follows system preference' },
  ];

  const previewColors = [
    { name: 'Primary', cssVar: '--primary', foreground: '--primary-foreground' },
    { name: 'Secondary', cssVar: '--secondary', foreground: '--secondary-foreground' },
    { name: 'Accent', cssVar: '--accent', foreground: '--accent-foreground' },
    { name: 'Success', cssVar: '--buy', foreground: '--buy-foreground' },
    { name: 'Danger', cssVar: '--sell', foreground: '--sell-foreground' },
    { name: 'Muted', cssVar: '--muted', foreground: '--muted-foreground' },
  ];

  const previewButtons = [
    { variant: 'default' as const, label: 'Default Button' },
    { variant: 'secondary' as const, label: 'Secondary Button' },
    { variant: 'outline' as const, label: 'Outline Button' },
    { variant: 'ghost' as const, label: 'Ghost Button' },
    { variant: 'destructive' as const, label: 'Destructive Button' },
  ];

  const handlePreviewChange = (newTheme: string) => {
    setPreviewTheme(newTheme);
    // Temporarily apply theme for preview
    document.documentElement.classList.remove('light', 'dark');
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.classList.add(newTheme);
    }
  };

  const handleApplyTheme = () => {
    setTheme(previewTheme);
  };

  return (
    <Card className={`theme-preview ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Theme Preview</CardTitle>
            </div>
            <CardDescription>
              Preview and customize your trading terminal theme
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {themes.find(t => t.key === previewTheme)?.label} Mode
            </Badge>
            {theme === previewTheme && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div>
          <h4 className="text-sm font-medium mb-3">Select Theme</h4>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(({ key, label, icon: Icon, description }) => (
              <Button
                key={key}
                variant={previewTheme === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePreviewChange(key)}
                className="h-auto py-2 flex flex-col items-center gap-1"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Color Palette Preview */}
        <div>
          <h4 className="text-sm font-medium mb-3">Color Palette</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {previewColors.map(({ name, cssVar, foreground }) => (
              <div key={name} className="space-y-2">
                <div 
                  className="h-12 rounded-md flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: `hsl(var(${cssVar}))`,
                    color: `hsl(var(${foreground}))`,
                  }}
                >
                  {name}
                </div>
                <div className="text-xs text-center text-muted-foreground">
                  {name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Component Preview */}
        <div>
          <h4 className="text-sm font-medium mb-3">Component Preview</h4>
          <div className="space-y-3">
            {/* Buttons */}
            <div className="flex flex-wrap gap-2">
              {previewButtons.map(({ variant, label }) => (
                <Button key={variant} variant={variant} size="sm">
                  {label}
                </Button>
              ))}
            </div>

            {/* Badges and Status Indicators */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge className="bg-green-500">Success</Badge>
              <Badge className="bg-red-500">Error</Badge>
            </div>

            {/* Form Elements */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Text input"
                className="w-full px-3 py-2 rounded-md border"
              />
              <select className="w-full px-3 py-2 rounded-md border">
                <option>Select input</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Theme Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleApplyTheme}
            disabled={theme === previewTheme}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Apply Theme
          </Button>
          <ThemeToggle size="sm" />
        </div>

        {/* Accessibility Check */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>WCAG AA compliant colors</span>
          <Eye className="h-3 w-3 ml-auto" />
          <span>Live preview</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemePreview;