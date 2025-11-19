import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskLevelColors(riskLevel: 'safe' | 'warning' | 'critical' | 'liquidation') {
  const colors = {
    safe: { text: 'text-status-safe', bg: 'bg-status-safe', border: 'border-status-safe' },
    warning: { text: 'text-status-warning', bg: 'bg-status-warning', border: 'border-status-warning' },
    critical: { text: 'text-status-critical', bg: 'bg-status-critical', border: 'border-status-critical' },
    liquidation: { text: 'text-status-error', bg: 'bg-status-error', border: 'border-status-error' },
  };
  return colors[riskLevel];
}
