import { useState } from 'react';
import { Bookmark, Bell, FolderPlus, FileText, Download, RotateCcw, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlan } from '@/hooks/usePlan';
import { useToast } from '@/hooks/use-toast';
import { EnhancedTradeAnalysis } from '@/types/analysis';
import { useTrackedAssets } from '@/hooks/useTrackedAssets';
import { TrackAssetModal } from './TrackAssetModal';
import { AddToPortfolioModal } from './AddToPortfolioModal';
import { cn } from '@/lib/utils';

interface ActionPanelProps {
  analysis: EnhancedTradeAnalysis;
  onNewAnalysis: () => void;
  isHistorical?: boolean;
}

function generatePDFContent(analysis: EnhancedTradeAnalysis): string {
  const { input, riskMetrics, scenarios, simulation, marketData } = analysis;
  const timestamp = new Date().toLocaleString();
  const allScenarios = [...scenarios.base, ...scenarios.upside, ...scenarios.downside, ...scenarios.tail];
  const scenarioRows = allScenarios.map(s => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(s.probability * 100).toFixed(1)}%</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: ${s.returnRangeMax >= 0 ? '#10b981' : '#ef4444'};">
        ${s.returnRangeMin.toFixed(1)}% to ${s.returnRangeMax >= 0 ? '+' : ''}${s.returnRangeMax.toFixed(1)}%
      </td>
    </tr>
  `).join('');

  return `<style>@media print { body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; } } .pdf-container { max-width: 800px; margin: 0 auto; } .header { border-bottom: 2px solid #1B2B4B; padding-bottom: 16px; margin-bottom: 24px; } .logo { font-size: 24px; font-weight: bold; color: #1B2B4B; } .subtitle { color: #6b7280; font-size: 14px; margin-top: 4px; } .section { margin-bottom: 24px; } .section-title { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; } .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; } .metric { background: #f9fafb; padding: 12px; border-radius: 8px; } .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; } .metric-value { font-size: 18px; font-weight: 600; color: #111827; margin-top: 4px; } table { width: 100%; border-collapse: collapse; } th { background: #f3f4f6; padding: 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; } .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }</style>
  <div class="pdf-container"><div class="header"><div class="logo">OutputLens</div><div class="subtitle">Risk Analysis Report • Generated ${timestamp}</div></div>
  <div class="section"><div class="section-title">Analysis Summary</div><div class="grid"><div class="metric"><div class="metric-label">Asset</div><div class="metric-value">${input.asset}</div></div><div class="metric"><div class="metric-label">Direction</div><div class="metric-value">${input.direction.toUpperCase()}</div></div><div class="metric"><div class="metric-label">Entry Price</div><div class="metric-value">$${input.entryPrice.toLocaleString()}</div></div><div class="metric"><div class="metric-label">Time Horizon</div><div class="metric-value">${input.timeHorizon}</div></div></div></div>
  <div class="section"><div class="section-title">Risk Assessment</div><div class="grid"><div class="metric"><div class="metric-label">Risk Score</div><div class="metric-value">${riskMetrics.riskScore}/10 — ${riskMetrics.riskLabel}</div></div><div class="metric"><div class="metric-label">Win Probability</div><div class="metric-value">${riskMetrics.probabilityOfProfit.toFixed(1)}%</div></div><div class="metric"><div class="metric-label">Expected Return</div><div class="metric-value">${riskMetrics.expectedReturn >= 0 ? '+' : ''}${riskMetrics.expectedReturn.toFixed(2)}%</div></div><div class="metric"><div class="metric-label">VaR 95%</div><div class="metric-value">${riskMetrics.valueAtRisk95.toFixed(2)}%</div></div></div></div>
  <div class="section"><div class="section-title">Scenario Analysis</div><table><thead><tr><th>Scenario</th><th style="text-align: right;">Probability</th><th style="text-align: right;">Expected Return</th></tr></thead><tbody>${scenarioRows}</tbody></table></div>
  <div class="footer"><p>© ${new Date().getFullYear()} OutputLens. All rights reserved. This report is for informational purposes only.</p></div></div>`;
}

export function ActionPanel({ analysis, onNewAnalysis, isHistorical }: ActionPanelProps) {
  const { canExport } = usePlan();
  const { toast } = useToast();
  const { isAssetTracked } = useTrackedAssets();
  const [isExporting, setIsExporting] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const existingTrack = isAssetTracked(analysis.input.asset, analysis.input.market);

  const handleExportPDF = async () => {
    if (!canExport) {
      toast({ title: 'Pro Feature', description: 'PDF export is available on Pro and higher plans.', variant: 'destructive' });
      return;
    }
    setIsExporting(true);
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({ title: 'Pop-up Blocked', description: 'Please allow pop-ups to export PDF.', variant: 'destructive' });
        return;
      }
      const content = generatePDFContent(analysis);
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Risk Analysis - ${analysis.input.asset} | OutputLens</title></head><body>${content}<script>window.onload = function() { window.print(); };<\/script></body></html>`);
      printWindow.document.close();
      toast({ title: 'PDF Ready', description: 'Use the print dialog to save as PDF.' });
    } catch (error) {
      toast({ title: 'Export Failed', description: 'There was an error generating the PDF.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!canExport) {
      toast({ title: 'Pro Feature', description: 'CSV export is available on Pro and higher plans.', variant: 'destructive' });
      return;
    }
    const csvData = [
      ['Metric', 'Value'],
      ['Asset', analysis.input.asset],
      ['Direction', analysis.input.direction],
      ['Entry Price', analysis.input.entryPrice],
      ['Risk Score', `${analysis.riskMetrics.riskScore}/10`],
      ['Risk Label', analysis.riskMetrics.riskLabel],
      ['Win Probability', `${analysis.riskMetrics.probabilityOfProfit.toFixed(2)}%`],
      ['Expected Return', `${analysis.riskMetrics.expectedReturn.toFixed(2)}%`],
      ['VaR 95%', `${analysis.riskMetrics.valueAtRisk95.toFixed(2)}%`],
      ['VaR 99%', `${analysis.riskMetrics.valueAtRisk99.toFixed(2)}%`],
      ['Expected Shortfall', `${analysis.riskMetrics.expectedShortfall.toFixed(2)}%`],
    ];
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `risk-analysis-${analysis.input.asset}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export Complete', description: 'CSV file downloaded successfully.' });
  };

  const actions = [
    {
      label: 'New Analysis',
      icon: <RotateCcw className="h-4 w-4" />,
      onClick: onNewAnalysis,
      pro: false,
      active: false,
    },
    {
      label: existingTrack ? 'Tracking' : 'Track Asset',
      icon: existingTrack ? <Check className="h-4 w-4 text-bullish" /> : <Bookmark className="h-4 w-4" />,
      onClick: () => setShowTrackModal(true),
      pro: false,
      active: !!existingTrack,
    },
    {
      label: 'Monitor Risk',
      icon: <Bell className="h-4 w-4" />,
      onClick: () => setShowTrackModal(true),
      pro: false,
      active: false,
    },
    {
      label: 'Add to Portfolio',
      icon: <FolderPlus className="h-4 w-4" />,
      onClick: () => setShowPortfolioModal(true),
      pro: false,
      active: false,
    },
    {
      label: isExporting ? 'Exporting...' : 'Export PDF',
      icon: isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />,
      onClick: handleExportPDF,
      pro: !canExport,
      active: false,
    },
    {
      label: 'Export CSV',
      icon: <Download className="h-4 w-4" />,
      onClick: handleExportCSV,
      pro: !canExport,
      active: false,
    },
  ];

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Dark header */}
      <div
        className="px-4 py-2.5 border-b border-border/50"
        style={{ backgroundColor: 'hsl(var(--brand-navy))' }}
      >
        <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">Actions</span>
      </div>

      {/* Horizontal action bar */}
      <div className="flex flex-wrap gap-1 p-3 bg-card">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            disabled={isExporting && action.label.includes('Export')}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-100',
              'border border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
              action.active && 'border-bullish/30 bg-bullish/5 text-bullish',
              'text-muted-foreground'
            )}
          >
            {action.icon}
            {action.label}
            {action.pro && (
              <span className="absolute -top-1.5 -right-1.5 text-[8px] px-1 py-0.5 bg-primary text-primary-foreground rounded font-bold leading-none">
                PRO
              </span>
            )}
          </button>
        ))}
      </div>

      {isHistorical && (
        <div className="px-4 py-2 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground font-mono">
            📜 Viewing historical analysis · Some actions may not be available
          </p>
        </div>
      )}

      <TrackAssetModal open={showTrackModal} onOpenChange={setShowTrackModal} analysis={analysis} />
      <AddToPortfolioModal open={showPortfolioModal} onOpenChange={setShowPortfolioModal} analysis={analysis} />
    </div>
  );
}
