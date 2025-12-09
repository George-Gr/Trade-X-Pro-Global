import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { downloadCSV, downloadPDF, type PortfolioExportData } from '@/lib/export/portfolioExport';
import { usePortfolioData } from '@/hooks/usePortfolioData';

export const ExportToolbar: React.FC = () => {
  const { profile, positions, calculateEquity, calculateMarginLevel } = usePortfolioData();

  const handleExportCSV = useCallback(() => {
    const balance = profile?.balance ?? 0;
    const equity = calculateEquity();
    const marginLevel = calculateMarginLevel();

    const totalPnL = (positions || []).reduce((sum, pos) => {
      const posValue = (pos.current_price || 0) * pos.quantity * 100000;
      const entryValue = (pos.entry_price || 0) * pos.quantity * 100000;
      const pnl = pos.side === 'buy' ? posValue - entryValue : entryValue - posValue;
      return sum + pnl;
    }, 0);

    const roi = balance > 0 ? (totalPnL / balance) * 100 : 0;

    const exportData: PortfolioExportData = {
      balance,
      equity,
      marginLevel: Number.isFinite(marginLevel) ? marginLevel : 0,
      totalPnL,
      roi,
      positions: (positions || []).map((pos) => ({
        symbol: pos.symbol,
        quantity: pos.quantity,
        entryPrice: pos.entry_price,
        currentPrice: pos.current_price ?? 0,
        side: pos.side as 'buy' | 'sell',
        pnl: pos.current_price != null ? (pos.current_price - pos.entry_price) * pos.quantity * 100000 * (pos.side === 'buy' ? 1 : -1) : 0,
      })),
      timestamp: new Date(),
    };

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadCSV(exportData, `portfolio-export-${timestamp}.csv`);
  }, [profile, positions, calculateEquity, calculateMarginLevel]);

  const handleExportPDF = useCallback(() => {
    const balance = profile?.balance ?? 0;
    const equity = calculateEquity();
    const marginLevel = calculateMarginLevel();

    const totalPnL = (positions || []).reduce((sum, pos) => {
      const posValue = (pos.current_price || 0) * pos.quantity * 100000;
      const entryValue = (pos.entry_price || 0) * pos.quantity * 100000;
      const pnl = pos.side === 'buy' ? posValue - entryValue : entryValue - posValue;
      return sum + pnl;
    }, 0);

    const roi = balance > 0 ? (totalPnL / balance) * 100 : 0;

    const exportData: PortfolioExportData = {
      balance,
      equity,
      marginLevel: Number.isFinite(marginLevel) ? marginLevel : 0,
      totalPnL,
      roi,
      positions: (positions || []).map((pos) => ({
        symbol: pos.symbol,
        quantity: pos.quantity,
        entryPrice: pos.entry_price,
        currentPrice: pos.current_price ?? 0,
        side: pos.side as 'buy' | 'sell',
        pnl: pos.current_price != null ? (pos.current_price - pos.entry_price) * pos.quantity * 100000 * (pos.side === 'buy' ? 1 : -1) : 0,
      })),
      timestamp: new Date(),
    };

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadPDF(exportData, `portfolio-export-${timestamp}.pdf`);
  }, [profile, positions, calculateEquity, calculateMarginLevel]);

  return (
    <div className="flex gap-4">
      <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-4">
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-4">
        <FileText className="h-4 w-4" />
        Export PDF
      </Button>
    </div>
  );
};

export default ExportToolbar;
