import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ThemePreview from '@/components/ui/ThemePreview';
import { 
  User, 
  Mail, 
  Lock, 
  Globe, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Star,
  TrendingUp,
  DollarSign,
  PieChart 
} from 'lucide-react';

interface DarkModeTestProps {
  className?: string;
}

const DarkModeTest: React.FC<DarkModeTestProps> = ({ className }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
    bio: '',
    notifications: true,
    theme: 'system',
    riskLevel: 'medium',
    leverage: 10,
  });

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'JP', name: 'Japan' },
    { code: 'AU', name: 'Australia' },
  ];

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const testComponents = [
    {
      category: 'Buttons',
      components: [
        { variant: 'default', label: 'Primary Button' },
        { variant: 'secondary', label: 'Secondary Button' },
        { variant: 'outline', label: 'Outline Button' },
        { variant: 'ghost', label: 'Ghost Button' },
        { variant: 'destructive', label: 'Destructive Button' },
      ]
    },
    {
      category: 'Form Elements',
      components: [
        { type: 'input', label: 'Text Input' },
        { type: 'email', label: 'Email Input' },
        { type: 'password', label: 'Password Input' },
        { type: 'select', label: 'Select Dropdown' },
        { type: 'textarea', label: 'Text Area' },
      ]
    },
    {
      category: 'Interactive Elements',
      components: [
        { type: 'switch', label: 'Toggle Switch' },
        { type: 'checkbox', label: 'Checkbox' },
        { type: 'radio', label: 'Radio Button' },
        { type: 'slider', label: 'Slider Control' },
      ]
    },
    {
      category: 'Status Indicators',
      components: [
        { type: 'badge', label: 'Status Badges' },
        { type: 'progress', label: 'Progress Bar' },
        { type: 'alert', label: 'Alert Messages' },
      ]
    }
  ];

  return (
    <div className={`dark-mode-test ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="h-6 w-6" />
              Dark Mode Testing Suite
            </h1>
            <p className="text-muted-foreground">
              Comprehensive testing of all UI components in {isDarkMode ? 'dark' : 'light'} mode
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle showLabel size="sm" />
            <Badge variant={isDarkMode ? 'default' : 'secondary'}>
              {isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}
            </Badge>
          </div>
        </div>

        {/* Theme Status */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Status</CardTitle>
            <CardDescription>
              Current theme configuration and system information
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Current Theme</Label>
              <div className="text-sm font-medium">{isDarkMode ? 'Dark' : 'Light'}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Background</Label>
              <div className="text-sm font-medium">hsl(var(--background))</div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Text Color</Label>
              <div className="text-sm font-medium">hsl(var(--foreground))</div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Contrast Ratio</Label>
              <div className="text-sm font-medium">4.5:1+</div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Form */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Form Test</CardTitle>
            <CardDescription>
              Test all form components with real-time validation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="inline h-4 w-4 mr-1" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                  <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-full">
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Country
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange('country', value)}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-4">
              <Label>Notification Preferences</Label>
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifications"
                    checked={formData.notifications}
                    onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                  />
                  <Label htmlFor="notifications">Enable notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="theme-switch"
                    checked={isDarkMode}
                    onCheckedChange={() => {}}
                  />
                  <Label htmlFor="theme-switch">Dark mode</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Risk Level</Label>
              <RadioGroup
                value={formData.riskLevel}
                onValueChange={(value) => handleInputChange('riskLevel', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low-risk" />
                  <Label htmlFor="low-risk">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium-risk" />
                  <Label htmlFor="medium-risk">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high-risk" />
                  <Label htmlFor="high-risk">High</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leverage">Leverage: {formData.leverage}x</Label>
              <Slider
                id="leverage"
                min={1}
                max={50}
                step={1}
                value={[formData.leverage]}
                onValueChange={(value) => handleInputChange('leverage', value[0])}
                className="w-full"
              />
            </div>

            <Button className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Test Form
            </Button>
          </CardContent>
        </Card>

        {/* Component Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Button Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                All button styles and states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="default" disabled>Disabled</Button>
                <Button variant="default" className="opacity-50 cursor-not-allowed">
                  Hover State
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Components */}
          <Card>
            <CardHeader>
              <CardTitle>Status Indicators</CardTitle>
              <CardDescription>
                Badges, progress bars, and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Active</Badge>
                <Badge variant="secondary">Pending</Badge>
                <Badge variant="outline">Inactive</Badge>
                <Badge className="bg-green-500">Success</Badge>
                <Badge className="bg-red-500">Error</Badge>
                <Badge className="bg-yellow-500 text-black">Warning</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Account Balance</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="w-full" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Success: Trade executed successfully</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Warning: Margin level approaching limit</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trading Interface Mockup */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Interface Mockup</CardTitle>
            <CardDescription>
              Test dark mode with trading-specific components
          </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trading Panel */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="EUR/USD" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eurusd">EUR/USD</SelectItem>
                        <SelectItem value="gbpusd">GBP/USD</SelectItem>
                        <SelectItem value="usdjpy">USD/JPY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Volume</Label>
                    <Input type="number" placeholder="100000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Leverage</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="10x" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1x">1x</SelectItem>
                        <SelectItem value="10x">10x</SelectItem>
                        <SelectItem value="50x">50x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Order Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Market" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                        <SelectItem value="stop">Stop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="default" className="flex-1 bg-green-600 hover:bg-green-700">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Buy
                  </Button>
                  <Button variant="default" className="flex-1 bg-red-600 hover:bg-red-700">
                    <TrendingUp className="h-4 w-4 mr-2 transform rotate-180" />
                    Sell
                  </Button>
                </div>
              </div>

              {/* Account Summary */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance</span>
                    <span className="font-medium">$10,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Equity</span>
                    <span className="font-medium text-green-500">$10,250</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Used Margin</span>
                    <span className="font-medium">$1,250</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Free Margin</span>
                    <span className="font-medium">$9,000</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">P&L</span>
                    <span className="font-medium text-green-500">+$250 (+2.5%)</span>
                  </div>
                  <Progress value={25} className="w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Preview */}
        <ThemePreview />
      </div>
    </div>
  );
};

export default DarkModeTest;