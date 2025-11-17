import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskLevelColors(riskLevel: 'safe' | 'warning' | 'critical' | 'liquidation') {
  const colors = {
    safe: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-500' },
    warning: { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-500' },
    critical: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-500' },
    liquidation: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-500' },
  };
  return colors[riskLevel];
}
