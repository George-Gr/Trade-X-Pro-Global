import React, { useState, useEffect } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  EyeOff, 
  Monitor, 
  Palette, 
  Keyboard, 
  Volume2, 
  Settings, 
  Menu,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';

/**
 * Accessibility Navigation Component
 * 
 * Floating accessibility menu that provides quick access to accessibility features.
 * Can be toggled on/off and provides keyboard shortcuts for power users.
 */

export function AccessibilityNavigation() {
  const {
    visualPreferences,
    colorBlindMode,
    keyboardShortcuts,
    complianceScore,
    categoryScores,
    toggleHighContrast,
    toggleReduceMotion,
    toggleColorBlindMode,
    screenReaderEnabled,
    setScreenReaderEnabled
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Keyboard shortcuts for accessibility navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle accessibility menu: Ctrl+Shift+A
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Quick toggle high contrast: Ctrl+Shift+H
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        toggleHighContrast();
      }
      
      // Quick toggle reduce motion: Ctrl+Shift+M
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleReduceMotion();
      }
      
      // Quick toggle screen reader: Ctrl+Shift+S
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setScreenReaderEnabled(!screenReaderEnabled);
      }    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleHighContrast, toggleReduceMotion, setScreenReaderEnabled, screenReaderEnabled]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsVisible(true)}
                className="rounded-full w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                aria-label="Show accessibility menu"
              >
                <Settings className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show Accessibility Menu</p>
              <p className="text-xs text-muted-foreground">Ctrl+Shift+A</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <>
      {/* Floating Accessibility Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                className="rounded-full w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                aria-label="Open accessibility settings"
              >
                <Palette className="w-8 h-8" />
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                  {complianceScore}%
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Accessibility Settings</p>
              <p className="text-xs text-muted-foreground">Compliance: {complianceScore}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Accessibility Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <DrawerHeader>
              <div className="flex justify-between items-center">
                <div>
                  <DrawerTitle>Accessibility Settings</DrawerTitle>
                  <DrawerDescription>
                    Customize your trading experience for optimal accessibility
                  </DrawerDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">
                    Compliance: {complianceScore}%
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsVisible(false)}
                    aria-label="Hide accessibility menu"
                  >
                    <EyeOff className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close accessibility settings"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </DrawerHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Visual Preferences */}
              <div className="bg-card rounded-lg p-6 border">
                <div className="flex items-center space-x-3 mb-4">
                  <Monitor className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">Visual Preferences</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">High Contrast</label>
                      <p className="text-sm text-muted-foreground">
                        Enhances color contrast for better visibility
                      </p>
                    </div>
                    <Button
                      onClick={toggleHighContrast}
                      variant={visualPreferences.preferences.highContrast ? "default" : "outline"}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {visualPreferences.preferences.highContrast ? "On" : "Off"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Reduce Motion</label>
                      <p className="text-sm text-muted-foreground">
                        Minimizes animations and transitions
                      </p>
                    </div>
                    <Button
                      onClick={toggleReduceMotion}
                      variant={visualPreferences.preferences.reduceMotion ? "default" : "outline"}
                      className="gap-2"
                    >
                      <Monitor className="w-4 h-4" />
                      {visualPreferences.preferences.reduceMotion ? "On" : "Off"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Larger Text</label>
                      <p className="text-sm text-muted-foreground">
                        Increases default font size
                      </p>
                    </div>
                    <Button
                      onClick={() => visualPreferences.updatePreference('largerText', !visualPreferences.preferences.largerText)}
                      variant={visualPreferences.preferences.largerText ? "default" : "outline"}
                      className="gap-2"
                    >
                      <Monitor className="w-4 h-4" />
                      {visualPreferences.preferences.largerText ? "On" : "Off"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Color Blind Mode */}
              <div className="bg-card rounded-lg p-6 border">
                <div className="flex items-center space-x-3 mb-4">
                  <Palette className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold">Color Blind Mode</h3>
                </div>
                
                <div className="space-y-3">
                  {colorBlindMode.availableModes.map((mode) => (
                    <Button
                      key={mode.type}
                      onClick={() => toggleColorBlindMode(mode.type)}
                      variant={colorBlindMode.colorBlindMode.type === mode.type ? "default" : "outline"}
                      className="w-full justify-start"
                    >
                      {mode.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="bg-card rounded-lg p-6 border">
                <div className="flex items-center space-x-3 mb-4">
                  <Keyboard className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
                </div>
                
                <div className="space-y-3">
                  {keyboardShortcuts.shortcuts.slice(0, 6).map((shortcut, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded">
                      <div>
                        <p className="font-medium">{shortcut.description}</p>
                        <p className="text-sm text-muted-foreground">{shortcut.category}</p>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Screen Reader */}
              <div className="bg-card rounded-lg p-6 border">
                <div className="flex items-center space-x-3 mb-4">
                  <Volume2 className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold">Screen Reader</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Screen Reader Mode</label>
                      <p className="text-sm text-muted-foreground">
                        Enhanced support for screen readers
                      </p>
                    </div>
                    <Button
                      onClick={() => setScreenReaderEnabled(!screenReaderEnabled)}
                      variant={screenReaderEnabled ? "default" : "outline"}
                      className="gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      {screenReaderEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-medium text-blue-900">Quick Tips:</p>
                    <ul className="text-sm text-blue-700 space-y-1 mt-2">
                      <li>• Use Tab to navigate through elements</li>
                      <li>• Use H to navigate headings</li>
                      <li>• Use R to navigate regions</li>
                      <li>• Use F to navigate forms</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Compliance Score */}
              <div className="bg-card rounded-lg p-6 border">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold">Accessibility Score</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-800">
                          WCAG Compliance
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-blue-600">
                          {complianceScore}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div
                        style={{ width: `${complianceScore}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          complianceScore >= 90 ? 'bg-green-500' :
                          complianceScore >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Visual</span>
                      <span className="font-medium">{categoryScores?.visual ?? '—'}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Keyboard</span>
                      <span className="font-medium">{categoryScores?.keyboard ?? '—'}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Screen Reader</span>
                      <span className="font-medium">{categoryScores?.screenReader ?? '—'}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Forms</span>
                      <span className="font-medium">{categoryScores?.forms ?? '—'}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-lg p-6 border">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="w-6 h-6 text-gray-600" />
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      toggleHighContrast();
                      toggleReduceMotion();
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Optimize View
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setScreenReaderEnabled(true);
                      visualPreferences.updatePreference('largerText', true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Screen Reader Mode
                  </Button>
                  
                  <Button
                    onClick={() => {
                      toggleColorBlindMode('deuteranopia');
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Color Blind Test
                  </Button>
                  
                  <Button
                    onClick={() => {
                      // Reset all accessibility settings
                      visualPreferences.updatePreference('highContrast', false);
                      visualPreferences.updatePreference('reduceMotion', false);
                      visualPreferences.updatePreference('largerText', false);
                      colorBlindMode.applyColorBlindSimulation({ type: 'none', intensity: 0 });
                      setScreenReaderEnabled(false);
                    }}
                    variant="outline"
                  >
                    Reset Settings
                  </Button>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    Tip: Use Ctrl+Shift+A to quickly open this menu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default AccessibilityNavigation;