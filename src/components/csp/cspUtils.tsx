import { AlertTriangle, Eye, Shield } from 'lucide-react';

export interface ViolationSummary {
  total: number;
  bySeverity: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
  };
  uniqueSources: number;
}

export const calculateRiskLevel = (
  summary: ViolationSummary
): 'low' | 'medium' | 'high' | 'critical' => {
  const critical = summary.bySeverity.critical || 0;
  const high = summary.bySeverity.high || 0;
  const total = summary.total;

  if (critical > 0) return 'critical';
  if (high > 5 || total > 100) return 'high';
  if (high > 0 || total > 50) return 'medium';
  return 'low';
};

export const getRiskColor = (
  level: 'low' | 'medium' | 'high' | 'critical'
): string => {
  switch (level) {
    case 'critical':
      return 'text-red-600';
    case 'high':
      return 'text-orange-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export const getRiskIcon = (level: 'low' | 'medium' | 'high' | 'critical') => {
  switch (level) {
    case 'critical':
      return <AlertTriangle className="h-5 w-5" />;
    case 'high':
      return <AlertTriangle className="h-5 w-5" />;
    case 'medium':
      return <Eye className="h-5 w-5" />;
    case 'low':
      return <Shield className="h-5 w-5" />;
    default:
      return <Shield className="h-5 w-5" />;
  }
};
