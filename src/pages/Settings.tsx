import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Bell,
  Eye,
  Monitor,
  Palette,
  Volume2,
  Keyboard,
} from 'lucide-react';
import { SettingsLoading } from '@/components/common/PageLoadingStates';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    visualPreferences,
    colorBlindMode,
    keyboardShortcuts,
    screenReaderEnabled,
    setScreenReaderEnabled,
    toggleHighContrast,
    toggleReduceMotion,
    toggleColorBlindMode,
  } = useAccessibility();
  const [kycStatus, setKycStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);

  const fetchKYCStatus = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('kyc_status')
      .eq('id', user.id)
      .single();

    if (error) {
      // Handle error - consider showing a toast or setting error state
      setKycStatus('pending');
    } else if (data) {
      setKycStatus(data.kyc_status || 'pending');
    }
  }, [user]);
  useEffect(() => {
    if (user) {
      fetchKYCStatus();
    }
  }, [user, fetchKYCStatus]);

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return <SettingsLoading />;
  }

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto">
        {/* Accessibility Settings Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Accessibility Settings */}
            <div className="lg:col-span-3 space-y-6">
              {/* Visual Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Monitor className="w-6 h-6 text-blue-600" />
                    <span>Visual Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Customize your visual experience for optimal accessibility
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="high-contrast">High Contrast Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enhances color contrast for better visibility
                      </p>
                    </div>
                    <Switch
                      id="high-contrast"
                      checked={visualPreferences.preferences.highContrast}
                      onCheckedChange={(checked) =>
                        visualPreferences.updatePreference(
                          'highContrast',
                          checked
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="reduce-motion">Reduce Motion</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimizes animations and transitions
                      </p>
                    </div>
                    <Switch
                      id="reduce-motion"
                      checked={visualPreferences.preferences.reduceMotion}
                      onCheckedChange={(checked) =>
                        visualPreferences.updatePreference(
                          'reduceMotion',
                          checked
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="larger-text">Larger Text</Label>
                      <p className="text-sm text-muted-foreground">
                        Increases default font size
                      </p>
                    </div>
                    <Switch
                      id="larger-text"
                      checked={visualPreferences.preferences.largerText}
                      onCheckedChange={(checked) =>
                        visualPreferences.updatePreference(
                          'largerText',
                          checked
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="focus-indicators">
                        Enhanced Focus Indicators
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Makes keyboard focus more visible
                      </p>
                    </div>
                    <Switch
                      id="focus-indicators"
                      checked={visualPreferences.preferences.focusIndicator}
                      onCheckedChange={(checked) =>
                        visualPreferences.updatePreference(
                          'focusIndicator',
                          checked
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Color Blind Mode */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Palette className="w-6 h-6 text-purple-600" />
                    <span>Color Blind Mode</span>
                  </CardTitle>
                  <CardDescription>
                    Simulate and test different types of color vision deficiency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {colorBlindMode.availableModes.map((mode) => (
                      <Button
                        key={mode.type}
                        onClick={() => toggleColorBlindMode(mode.type)}
                        variant={
                          colorBlindMode.colorBlindMode.type === mode.type
                            ? 'default'
                            : 'outline'
                        }
                        className="w-full justify-start"
                      >
                        {mode.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Screen Reader */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Volume2 className="w-6 h-6 text-orange-600" />
                    <span>Screen Reader</span>
                  </CardTitle>
                  <CardDescription>
                    Enhanced support for screen readers and assistive
                    technologies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="screen-reader">Screen Reader Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enables enhanced screen reader support
                      </p>
                    </div>
                    <Switch
                      id="screen-reader"
                      checked={screenReaderEnabled}
                      onCheckedChange={setScreenReaderEnabled}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Keyboard Shortcuts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Keyboard className="w-6 h-6 text-green-600" />
                    <span>Keyboard Shortcuts</span>
                  </CardTitle>
                  <CardDescription>
                    Quick keyboard shortcuts for trading and accessibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {keyboardShortcuts.shortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-muted rounded"
                      >
                        <div>
                          <p className="font-medium">{shortcut.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {shortcut.category}
                          </p>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                          {shortcut.key}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Actions and Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Accessibility Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Score</CardTitle>
                  <CardDescription>
                    Your current accessibility compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {Math.round(
                        visualPreferences.preferences.highContrast ? 95 : 85
                      )}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {visualPreferences.preferences.highContrast
                        ? 'Excellent'
                        : 'Good'}{' '}
                      compliance
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    One-click accessibility improvements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => {
                      toggleHighContrast();
                      toggleReduceMotion();
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    Optimize for Visibility
                  </Button>

                  <Button
                    onClick={() => {
                      setScreenReaderEnabled(true);
                      visualPreferences.updatePreference('largerText', true);
                    }}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    Screen Reader Mode
                  </Button>

                  <Button
                    onClick={() => {
                      toggleColorBlindMode('deuteranopia');
                    }}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    Test Color Blind Mode
                  </Button>

                  <Button
                    onClick={() => {
                      // Reset all accessibility settings
                      visualPreferences.updatePreference('highContrast', false);
                      visualPreferences.updatePreference('reduceMotion', false);
                      visualPreferences.updatePreference('largerText', false);
                      visualPreferences.updatePreference(
                        'focusIndicator',
                        false
                      );
                      colorBlindMode.applyColorBlindSimulation({
                        type: 'none',
                        intensity: 0,
                      });
                      setScreenReaderEnabled(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Reset All Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800 font-medium">
                      Keyboard Navigation
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Use Tab to navigate, Enter to activate, and Esc to close
                      modals
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800 font-medium">
                      Screen Reader
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Use H for headings, R for regions, and F for forms
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                    <p className="text-sm text-purple-800 font-medium">
                      Color Contrast
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      High contrast improves readability for all users
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Original Settings Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account preferences and information
                </p>
              </div>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Your personal and account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Email Address
                      </p>
                      <p className="font-medium">{user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Account Number
                      </p>
                      <p className="font-medium">Demo #12345</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Account Type
                      </p>
                      <Badge variant="outline">Paper Trading</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Account Status
                      </p>
                      <Badge className="bg-profit">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KYC Status */}
              <Card>
                <CardHeader>
                  <CardTitle>KYC Verification</CardTitle>
                  <CardDescription>
                    Identity verification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center gap-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Loading status...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {kycStatus === 'approved' ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-profit" />
                              <div>
                                <p className="font-medium">Verified</p>
                                <p className="text-sm text-muted-foreground">
                                  Your identity has been verified
                                </p>
                              </div>
                            </>
                          ) : kycStatus === 'rejected' ? (
                            <>
                              <XCircle className="h-4 w-4 text-loss" />
                              <div>
                                <p className="font-medium">Rejected</p>
                                <p className="text-sm text-muted-foreground">
                                  Please review and resubmit documents
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-amber-500" />
                              <div>
                                <p className="font-medium">
                                  Pending Verification
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Submit your documents to get verified
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                        {kycStatus !== 'approved' && (
                          <Button onClick={() => navigate('/kyc')}>
                            {kycStatus === 'rejected'
                              ? 'Resubmit'
                              : 'Submit Documents'}
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Trading Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Trading Preferences</CardTitle>
                  <CardDescription>
                    Configure your trading experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Default Leverage
                    </p>
                    <p className="font-medium">1:100</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Default Order Type
                    </p>
                    <p className="font-medium">Market</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Default Volume
                    </p>
                    <p className="font-medium">0.01 lots</p>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Management</CardTitle>
                  <CardDescription>Your account risk settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Maximum Leverage
                    </p>
                    <p className="font-medium">1:500 (Varies by asset)</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Margin Call Level
                    </p>
                    <p className="font-medium">50%</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Stop Out Level
                    </p>
                    <p className="font-medium">20%</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Advanced Risk Settings
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Configure position limits, daily loss limits, and more
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate('/risk-management')}
                      variant="outline"
                    >
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-4">
                    <Bell className="h-4 w-4" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Manage Notifications
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Set up email and in-app notification preferences
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate('/notifications')}
                      variant="outline"
                    >
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Legal Disclaimer */}
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-amber-500">
                    Important Notice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    TradeX Pro is a paper trading platform for educational and
                    practice purposes only. No real funds are involved. All
                    trading activity is simulated. This platform is not
                    affiliated with IC Markets or any regulated financial
                    institution.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Settings;
