import { cn } from '@/lib/utils';
import type { ColorContrastType, ContrastResult } from '../types';

export interface ColorContrastTabProps {
  colorContrast: ColorContrastType;
}

export function ColorContrastTab({ colorContrast }: ColorContrastTabProps) {
  return (
    <div className="space-y-6">
      {/* Compliance Report */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Total Elements</h4>
          <p className="text-3xl font-bold">
            {colorContrast.complianceReport.total}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Passing</h4>
          <p className="text-3xl font-bold text-[hsl(var(--success))]">
            {colorContrast.complianceReport.passing}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Failing</h4>
          <p className="text-3xl font-bold text-[hsl(var(--destructive))]">
            {colorContrast.complianceReport.failing}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">AA Compliance</h4>
          <p className="text-3xl font-bold">
            {colorContrast.complianceReport.aaCompliance.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Contrast Results */}
      <div className="bg-card rounded-lg p-6 border">
        <h4 className="font-semibold mb-4">Contrast Results</h4>
        <div className="space-y-3">
          {colorContrast.contrastResults
            .slice(0, 10)
            .map((result: ContrastResult, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 border rounded"
              >
                <div className="flex items-center space-x-4">
                  <span
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: result.background }}
                  />
                  <span
                    className="px-2 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: result.text }}
                  >
                    Text
                  </span>
                  <span className="text-sm">
                    Ratio: {result.ratio.toFixed(2)}:1
                  </span>
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-white text-xs',
                      result.wcag === 'aaa'
                        ? 'bg-[hsl(var(--success))]'
                        : result.wcag === 'aa'
                        ? 'bg-[hsl(var(--warning))]'
                        : 'bg-[hsl(var(--destructive))]'
                    )}
                  >
                    {result.wcag.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() =>
                    colorContrast.highlightFailingElements(
                      result.wcag === 'fail'
                    )
                  }
                  className="px-3 py-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded text-sm hover:bg-[hsl(var(--primary))/90]"
                >
                  Highlight
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
