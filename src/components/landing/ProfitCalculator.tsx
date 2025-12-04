import { FadeInUp } from '@/components/animations/MotionWrappers';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, Percent, TrendingUp } from 'lucide-react';
import React from 'react';

const ProfitCalculator: React.FC = () => {
  const [investment, setInvestment] = React.useState(10000);
  const [leverage, setLeverage] = React.useState(10);
  const [priceChange, setPriceChange] = React.useState(5);

  const positionSize = investment * leverage;
  const profitLoss = (positionSize * priceChange) / 100;
  const roi = (profitLoss / investment) * 100;

  return (
    <section className="py-24" style={{ background: '#0A1628' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInUp>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700' }}>
              <Calculator className="w-4 h-4" style={{ color: '#FFD700' }} />
              <span className="text-sm font-medium" style={{ color: '#FFD700' }}>Interactive Tool</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
              Profit
              <span style={{ color: '#FFD700' }}> Calculator</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#F5F5DC' }}>
              See how leverage affects your potential returns
            </p>
          </div>
        </FadeInUp>

        <div className="max-w-4xl mx-auto">
          <Card style={{ background: '#1a2d42', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                  {/* Investment Amount */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium" style={{ color: '#F5F5DC' }}>
                        Investment Amount
                      </label>
                      <span className="text-sm font-bold" style={{ color: '#FFD700' }}>
                        ${investment.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="1000"
                      value={investment}
                      onChange={(e) => setInvestment(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: 'linear-gradient(to right, #FFD700 0%, #FFD700 ' + ((investment - 1000) / 490) + '%, rgba(255,255,255,0.1) ' + ((investment - 1000) / 490) + '%, rgba(255,255,255,0.1) 100%)' }}
                    />
                  </div>

                  {/* Leverage */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium" style={{ color: '#F5F5DC' }}>
                        Leverage
                      </label>
                      <span className="text-sm font-bold" style={{ color: '#FFD700' }}>
                        1:{leverage}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={leverage}
                      onChange={(e) => setLeverage(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: 'linear-gradient(to right, #FFD700 0%, #FFD700 ' + leverage + '%, rgba(255,255,255,0.1) ' + leverage + '%, rgba(255,255,255,0.1) 100%)' }}
                    />
                  </div>

                  {/* Price Change */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium" style={{ color: '#F5F5DC' }}>
                        Price Movement
                      </label>
                      <span className="text-sm font-bold" style={{ color: priceChange >= 0 ? '#22c55e' : '#ef4444' }}>
                        {priceChange >= 0 ? '+' : ''}{priceChange}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="0.5"
                      value={priceChange}
                      onChange={(e) => setPriceChange(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    />
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                  <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5" style={{ color: '#F5F5DC' }} />
                      <span className="text-sm" style={{ color: '#F5F5DC' }}>Position Size</span>
                    </div>
                    <motion.div
                      key={positionSize}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold"
                      style={{ color: '#FFFFFF' }}
                    >
                      ${positionSize.toLocaleString()}
                    </motion.div>
                  </div>

                  <div className="rounded-xl p-4" style={{ background: profitLoss >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5" style={{ color: profitLoss >= 0 ? '#22c55e' : '#ef4444' }} />
                      <span className="text-sm" style={{ color: '#F5F5DC' }}>Profit / Loss</span>
                    </div>
                    <motion.div
                      key={profitLoss}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold"
                      style={{ color: profitLoss >= 0 ? '#22c55e' : '#ef4444' }}
                    >
                      {profitLoss >= 0 ? '+' : ''}{profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </motion.div>
                  </div>

                  <div className="rounded-xl p-4" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <Percent className="w-5 h-5" style={{ color: '#FFD700' }} />
                      <span className="text-sm" style={{ color: '#F5F5DC' }}>Return on Investment</span>
                    </div>
                    <motion.div
                      key={roi}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold"
                      style={{ color: '#FFD700' }}
                    >
                      {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                <p className="text-xs text-center" style={{ color: 'rgba(245, 245, 220, 0.6)' }}>
                  ⚠️ This calculator is for educational purposes only. Leverage magnifies both gains and losses.
                  Past performance does not guarantee future results.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProfitCalculator;
