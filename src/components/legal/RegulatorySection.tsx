import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import React from 'react';

const RegulatorySection: React.FC = () => {
  return (
    <section className="py-16 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Regulated & Secure Trading</h2>
          <p className="text-muted-foreground">
            TradeX Pro Global operates under strict regulatory standards to ensure the safety and security of your funds.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* License 1 */}
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                  FCA
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Financial Conduct Authority</h3>
                  <p className="text-sm text-muted-foreground">United Kingdom</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                Active
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">License Number:</span>
                <span className="font-mono font-medium">123456 (Demo)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entity:</span>
                <span className="font-medium">TradeX Pro UK Ltd</span>
              </div>
            </div>
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4" />
                Verify License
                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
              </a>
            </Button>
          </div>

          {/* License 2 */}
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                  ASIC
                </div>
                <div>
                  <h3 className="font-semibold text-lg">ASIC</h3>
                  <p className="text-sm text-muted-foreground">Australia</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                Active
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">License Number:</span>
                <span className="font-mono font-medium">AFSL 987654 (Demo)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entity:</span>
                <span className="font-medium">TradeX Pro AU Pty Ltd</span>
              </div>
            </div>
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4" />
                Verify License
                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            * The regulatory information above is for demonstration purposes only.
            TradeX Pro Global ensures compliance with all local regulations in the jurisdictions it operates.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegulatorySection;
