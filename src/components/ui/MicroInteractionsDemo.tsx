import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, MultiStepProgress } from "@/components/ui/progress";
import { LoadingSpinner, PageLoadingOverlay } from "@/components/ui/LoadingSkeleton";
import { SuccessAnimation, ErrorAnimation, WarningAnimation, InfoAnimation } from "@/components/ui/SuccessAnimation";
import { NumberCounter, LargeNumberCounter, CompactNumberCounter } from "@/components/ui/NumberCounter";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export function MicroInteractionsDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('');
  const [loadingType, setLoadingType] = useState<string>('');
  const [progressValue, setProgressValue] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const reducedMotion = useReducedMotion();

  const steps = [
    { id: 'step1', label: 'Personal Info', status: 'completed' as const },
    { id: 'step2', label: 'Account Setup', status: 'completed' as const },
    { id: 'step3', label: 'Verification', status: 'active' as const },
    { id: 'step4', label: 'Complete', status: 'pending' as const },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgressValue(prev => prev >= 100 ? 0 : prev + 10);
    }, 200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showSuccess || showError || showWarning || showInfo) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setShowError(false);
        setShowWarning(false);
        setShowInfo(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, showError, showWarning, showInfo]);

  const demos = [
    {
      id: 'buttons',
      title: 'Button Interactions',
      description: 'Hover and click feedback',
      component: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setActiveDemo('buttons')}>Default</Button>
            <Button variant="secondary" onClick={() => setActiveDemo('buttons')}>
              Secondary
            </Button>
            <Button variant="destructive" onClick={() => setActiveDemo('buttons')}>
              Destructive
            </Button>
            <Button variant="outline" onClick={() => setActiveDemo('buttons')}>
              Outline
            </Button>
            <Button variant="ghost" onClick={() => setActiveDemo('buttons')}>
              Ghost
            </Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button variant="success" onClick={() => setActiveDemo('buttons')}>
              Success
            </Button>
            <Button variant="warning" onClick={() => setActiveDemo('buttons')}>
              Warning
            </Button>
            <Button variant="loading" onClick={() => setActiveDemo('buttons')}>
              Loading
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'cards',
      title: 'Card Hover Effects',
      description: 'Lift and scale interactions',
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card elevation="1" variant="primary" interactive>
            <CardHeader>
              <CardTitle>Interactive Card 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Hover me for lift effect</p>
            </CardContent>
          </Card>
          <Card elevation="2" variant="secondary" interactive>
            <CardHeader>
              <CardTitle>Interactive Card 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Higher elevation card</p>
            </CardContent>
          </Card>
          <Card elevation="3" variant="tertiary" interactive>
            <CardHeader>
              <CardTitle>Interactive Card 3</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Premium lift effect</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'progress',
      title: 'Progress Indicators',
      description: 'Multi-step forms and loading',
      component: (
        <div className="space-y-8">
          <div>
            <h4 className="mb-4">Multi-Step Progress</h4>
            <MultiStepProgress steps={steps} />
          </div>
          <div>
            <h4 className="mb-4">Linear Progress</h4>
            <Progress value={progressValue} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{progressValue}% complete</p>
          </div>
        </div>
      )
    },
    {
      id: 'loading',
      title: 'Loading Animations',
      description: 'Various loading states',
      component: (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <LoadingSpinner size="sm" variant="spinner" />
              <p className="text-xs mt-2">Spinner</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="md" variant="dots" />
              <p className="text-xs mt-2">Dots</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="lg" variant="pulse" />
              <p className="text-xs mt-2">Pulse</p>
            </div>
            <div className="text-center">
              <LoadingSpinner size="xl" variant="bounce" />
              <p className="text-xs mt-2">Bounce</p>
            </div>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => {
              setPageLoading(true);
              setTimeout(() => setPageLoading(false), 3000);
            }}>
              Show Page Loading
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'feedback',
      title: 'Success/Error Feedback',
      description: 'Visual feedback animations',
      component: (
        <div className="space-y-8">
          <div className="flex flex-wrap gap-4">
            <Button variant="success" onClick={() => setShowSuccess(true)}>
              Show Success
            </Button>
            <Button variant="destructive" onClick={() => setShowError(true)}>
              Show Error
            </Button>
            <Button variant="warning" onClick={() => setShowWarning(true)}>
              Show Warning
            </Button>
            <Button variant="outline" onClick={() => setShowInfo(true)}>
              Show Info
            </Button>
          </div>
          <div className="flex justify-center">
            {showSuccess && <SuccessAnimation message="Operation completed!" />}
            {showError && <ErrorAnimation message="Something went wrong!" />}
            {showWarning && <WarningAnimation message="Please review this!" />}
            {showInfo && <InfoAnimation message="Here's some information!" />}
          </div>
        </div>
      )
    },
    {
      id: 'counting',
      title: 'Number Counting',
      description: 'Animated statistics',
      component: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <LargeNumberCounter value={1250} prefix="$" suffix="M" />
              <p className="text-sm text-muted-foreground">Monthly Volume</p>
            </div>
            <div>
              <LargeNumberCounter value={98.7} suffix="%" decimals={1} />
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div>
              <LargeNumberCounter value={50000} decimals={0} />
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <CompactNumberCounter value={1234} />
              <p className="text-xs text-muted-foreground">Trades</p>
            </div>
            <div>
              <CompactNumberCounter value={4.8} decimals={1} suffix="★" />
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div>
              <CompactNumberCounter value={85} suffix="%" />
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
            <div>
              <CompactNumberCounter value={24} suffix="h" />
              <p className="text-xs text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Micro-Interactions Demo</h1>
        <p className="text-muted-foreground mt-2">
          Experience the enhanced animations and micro-interactions
        </p>
        {reducedMotion && (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg mt-4">
            <strong>Reduced Motion Mode:</strong> Some animations are disabled based on your system preferences
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demos.map((demo) => (
          <Card 
            key={demo.id} 
            elevation="1" 
            variant="primary" 
            interactive
            className={cn(
              activeDemo === demo.id && "ring-2 ring-primary/50"
            )}
            onClick={() => setActiveDemo(demo.id)}
          >
            <CardHeader>
              <CardTitle>{demo.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{demo.description}</p>
              {activeDemo === demo.id && demo.component}
            </CardContent>
          </Card>
        ))}
      </div>

      <PageLoadingOverlay visible={pageLoading} text="Processing your request..." />

      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Performance Notes</h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          All animations are optimized for 60fps performance using CSS transforms and opacity changes. 
          They respect the prefers-reduced-motion accessibility setting and gracefully degrade when disabled.
        </p>
      </div>
    </div>
  );
}