import { describe, it, expect } from 'vitest';
import {
  exportToCSV,
  generatePDFHTML,
  type PortfolioExportData,
} from '@/lib/export/portfolioExport';

const mockExportData: PortfolioExportData = {
  balance: 10000,
  equity: 10500,
  marginLevel: 95.2,
  totalPnL: 500,
  roi: 5,
  positions: [
    {
      symbol: 'EURUSD',
      quantity: 1,
      entryPrice: 1.1,
      currentPrice: 1.12,
      side: 'buy',
      pnl: 200,
    },
    {
      symbol: 'GBPUSD',
      quantity: 2,
      entryPrice: 1.3,
      currentPrice: 1.31,
      side: 'buy',
      pnl: 300,
    },
  ],
  timestamp: new Date('2025-11-14T12:00:00Z'),
};

describe('exportToCSV', () => {
  it('generates CSV content with header', () => {
    const csv = exportToCSV(mockExportData);

    expect(csv).toContain('PORTFOLIO SNAPSHOT REPORT');
    expect(csv).toContain('Exported:');
  });

  it('includes account summary section', () => {
    const csv = exportToCSV(mockExportData);

    expect(csv).toContain('ACCOUNT SUMMARY');
    expect(csv).toContain('Balance,');
    expect(csv).toContain('10000');
  });

  it('includes positions section', () => {
    const csv = exportToCSV(mockExportData);

    expect(csv).toContain('OPEN POSITIONS');
    expect(csv).toContain('EURUSD');
    expect(csv).toContain('GBPUSD');
  });

  it('formats currency values correctly', () => {
    const csv = exportToCSV(mockExportData);

    expect(csv).toMatch(/\$[\d,]+/);
  });

  it('includes all position details', () => {
    const csv = exportToCSV(mockExportData);

    // Check for position data
    expect(csv).toContain('1.1');
    expect(csv).toContain('1.12');
    expect(csv).toContain('buy');
  });

  it('calculates and includes metrics', () => {
    const csv = exportToCSV(mockExportData);

    expect(csv).toContain('Margin Level');
    expect(csv).toContain('Total P&L');
    expect(csv).toContain('ROI');
  });
});

describe('generatePDFHTML', () => {
  it('generates valid HTML structure', () => {
    const html = generatePDFHTML(mockExportData);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html>');
    expect(html).toContain('</html>');
  });

  it('includes portfolio report title', () => {
    const html = generatePDFHTML(mockExportData);

    expect(html).toContain('Portfolio Report');
  });

  it('includes account summary data', () => {
    const html = generatePDFHTML(mockExportData);

    expect(html).toContain('Account Balance');
    expect(html).toContain('Total Equity');
    expect(html).toContain('Margin Level');
  });

  it('includes positions table', () => {
    const html = generatePDFHTML(mockExportData);

    expect(html).toContain('Open Positions');
    expect(html).toContain('<table>');
    expect(html).toContain('EURUSD');
    expect(html).toContain('GBPUSD');
  });

  it('includes table headers', () => {
    const html = generatePDFHTML(mockExportData);

    expect(html).toContain('Symbol');
    expect(html).toContain('Quantity');
    expect(html).toContain('Entry Price');
    expect(html).toContain('Current Price');
    expect(html).toContain('Side');
    expect(html).toContain('P&L');
  });

  it('applies styling for positive/negative values', () => {
    const html = generatePDFHTML(mockExportData);

    expect(html).toContain('positive');
    expect(html).toContain('negative');
  });

  it('includes generation timestamp', () => {
    const html = generatePDFHTML(mockExportData);

    expect(html).toContain('Generated:');
  });

  it('formats currency in HTML', () => {
    const html = generatePDFHTML(mockExportData);

    expect(html).toMatch(/\$[\d,]+/);
  });
});
