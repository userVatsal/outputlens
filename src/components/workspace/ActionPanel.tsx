import { useState } from 'react';
import { Bookmark, Bell, FolderPlus, FileText, Download, RotateCcw, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlan } from '@/hooks/usePlan';
import { useToast } from '@/hooks/use-toast';
import { EnhancedTradeAnalysis } from '@/types/analysis';
import { useTrackedAssets } from '@/hooks/useTrackedAssets';
import { TrackAssetModal } from './TrackAssetModal';

interface ActionPanelProps {
  analysis: EnhancedTradeAnalysis;
  onNewAnalysis: () => void;
  isHistorical?: boolean;
}

// Generate professional PDF content for printing
function generatePDFContent(analysis: EnhancedTradeAnalysis): string {
  const { input, riskMetrics, scenarios, simulation, marketData } = analysis;
  const timestamp = new Date().toLocaleString();
  
  // Flatten scenarios from the DynamicScenarioSet structure
  const allScenarios = [
    ...scenarios.base,
    ...scenarios.upside,
    ...scenarios.downside,
    ...scenarios.tail,
  ];
  
  const scenarioRows = allScenarios.map(s => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(s.probability * 100).toFixed(1)}%</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: ${s.returnRangeMax >= 0 ? '#10b981' : '#ef4444'};">
        ${s.returnRangeMin.toFixed(1)}% to ${s.returnRangeMax >= 0 ? '+' : ''}${s.returnRangeMax.toFixed(1)}%
      </td>
    </tr>
  `).join('');

  return `
    <style>
      @media print {
        body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
        .no-print { display: none !important; }
      }
      .pdf-container { max-width: 800px; margin: 0 auto; }
      .header { border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
      .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
      .subtitle { color: #6b7280; font-size: 14px; margin-top: 4px; }
      .section { margin-bottom: 24px; }
      .section-title { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
      .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .metric { background: #f9fafb; padding: 12px; border-radius: 8px; }
      .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
      .metric-value { font-size: 18px; font-weight: 600; color: #111827; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #f3f4f6; padding: 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; }
      .risk-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
      .risk-low { background: #d1fae5; color: #065f46; }
      .risk-medium { background: #fef3c7; color: #92400e; }
      .risk-high { background: #fee2e2; color: #991b1b; }
      .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
    </style>
    <div class="pdf-container">
      <div class="header">
        <div class="logo">OutputLens</div>
        <div class="subtitle">AI-Powered Risk Analysis Report • Generated ${timestamp}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Analysis Summary</div>
        <div class="grid">
          <div class="metric">
            <div class="metric-label">Asset</div>
            <div class="metric-value">${input.asset}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Direction</div>
            <div class="metric-value">${input.direction.toUpperCase()}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Entry Price</div>
            <div class="metric-value">$${input.entryPrice.toLocaleString()}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Time Horizon</div>
            <div class="metric-value">${input.timeHorizon}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Risk Assessment</div>
        <div class="grid">
          <div class="metric">
            <div class="metric-label">Risk Score</div>
            <div class="metric-value">
              ${riskMetrics.riskScore}/10
              <span class="risk-badge ${riskMetrics.riskScore <= 3 ? 'risk-low' : riskMetrics.riskScore <= 6 ? 'risk-medium' : 'risk-high'}" style="margin-left: 8px;">
                ${riskMetrics.riskLabel}
              </span>
            </div>
          </div>
          <div class="metric">
            <div class="metric-label">Win Probability</div>
            <div class="metric-value">${riskMetrics.probabilityOfProfit.toFixed(1)}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Expected Return</div>
            <div class="metric-value" style="color: ${riskMetrics.expectedReturn >= 0 ? '#10b981' : '#ef4444'};">
              ${riskMetrics.expectedReturn >= 0 ? '+' : ''}${riskMetrics.expectedReturn.toFixed(2)}%
            </div>
          </div>
          <div class="metric">
            <div class="metric-label">Value at Risk (95%)</div>
            <div class="metric-value" style="color: #ef4444;">${riskMetrics.valueAtRisk95.toFixed(2)}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Value at Risk (99%)</div>
            <div class="metric-value" style="color: #ef4444;">${riskMetrics.valueAtRisk99.toFixed(2)}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Expected Shortfall</div>
            <div class="metric-value" style="color: #ef4444;">${riskMetrics.expectedShortfall.toFixed(2)}%</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Scenario Analysis</div>
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th style="text-align: right;">Probability</th>
              <th style="text-align: right;">Expected Return</th>
            </tr>
          </thead>
          <tbody>
            ${scenarioRows}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Simulation Details</div>
        <div class="grid">
          <div class="metric">
            <div class="metric-label">Monte Carlo Paths</div>
            <div class="metric-value">${simulation.paths.toLocaleString()}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Data Quality</div>
            <div class="metric-value">${marketData.dataQuality === 'live' ? 'Live Market Data' : 'Estimated'}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Volatility</div>
            <div class="metric-value">${riskMetrics.volatilityProxy.toFixed(2)}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Kurtosis</div>
            <div class="metric-value">${simulation.kurtosis?.toFixed(2) || 'N/A'}</div>
          </div>
        </div>
      </div>

      ${input.assumptions ? `
      <div class="section">
        <div class="section-title">Trade Thesis</div>
        <p style="color: #4b5563; font-style: italic;">"${input.assumptions}"</p>
      </div>
      ` : ''}

      <div class="footer">
        <p><strong>Disclaimer:</strong> This analysis uses Monte Carlo simulation with ${simulation.paths.toLocaleString()} paths. It does not predict actual outcomes and is not financial advice. Markets are inherently unpredictable. Always consult a qualified financial advisor before trading.</p>
        <p style="margin-top: 8px;">© ${new Date().getFullYear()} OutputLens. All rights reserved.</p>
      </div>
    </div>
  `;
}

export function ActionPanel({ analysis, onNewAnalysis, isHistorical }: ActionPanelProps) {
  const { canExport } = usePlan();
  const { toast } = useToast();
  const { isAssetTracked } = useTrackedAssets();
  const [isExporting, setIsExporting] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  const existingTrack = isAssetTracked(analysis.input.asset, analysis.input.market);

  const handleMonitorRisk = () => {
    // Open track modal - monitoring is part of tracking
    setShowTrackModal(true);
  };

  const handleAddToPortfolio = () => {
    toast({
      title: "Coming Soon",
      description: "Portfolio integration will be available in an upcoming release.",
    });
  };

  const handleExportPDF = async () => {
    if (!canExport) {
      toast({
        title: "Pro Feature",
        description: "PDF export is available on Pro and higher plans.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Pop-up Blocked",
          description: "Please allow pop-ups to export PDF.",
          variant: "destructive",
        });
        return;
      }

      // Generate and write the PDF content
      const content = generatePDFContent(analysis);
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Risk Analysis - ${analysis.input.asset} | OutputLens</title>
          </head>
          <body>
            ${content}
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

      toast({
        title: "PDF Ready",
        description: "Use the print dialog to save as PDF.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!canExport) {
      toast({
        title: "Pro Feature",
        description: "CSV export is available on Pro and higher plans.",
        variant: "destructive",
      });
      return;
    }

    // Generate CSV data
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
      ['Volatility', `${analysis.riskMetrics.volatilityProxy.toFixed(2)}%`],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `risk-analysis-${analysis.input.asset}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "CSV file downloaded successfully.",
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Actions</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Primary Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNewAnalysis}
          className="flex flex-col items-center gap-1.5 h-auto py-3"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="text-xs">New Analysis</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTrackModal(true)}
          className="flex flex-col items-center gap-1.5 h-auto py-3 relative"
        >
          {existingTrack ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          <span className="text-xs">{existingTrack ? 'Tracking' : 'Track Asset'}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMonitorRisk}
          className="flex flex-col items-center gap-1.5 h-auto py-3"
        >
          <Bell className="h-4 w-4" />
          <span className="text-xs">Monitor Risk</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddToPortfolio}
          className="flex flex-col items-center gap-1.5 h-auto py-3"
        >
          <FolderPlus className="h-4 w-4" />
          <span className="text-xs">Add to Portfolio</span>
        </Button>

        {/* Pro Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex flex-col items-center gap-1.5 h-auto py-3 relative"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span className="text-xs">Export PDF</span>
          {!canExport && (
            <span className="absolute -top-1 -right-1 text-[8px] px-1 py-0.5 bg-primary text-primary-foreground rounded font-medium">
              PRO
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="flex flex-col items-center gap-1.5 h-auto py-3 relative"
        >
          <Download className="h-4 w-4" />
          <span className="text-xs">Export CSV</span>
          {!canExport && (
            <span className="absolute -top-1 -right-1 text-[8px] px-1 py-0.5 bg-primary text-primary-foreground rounded font-medium">
              PRO
            </span>
          )}
        </Button>
      </div>

      {isHistorical && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Viewing historical analysis • Some actions may not be available
          </p>
        </div>
      )}

      {/* Track Asset Modal */}
      <TrackAssetModal
        open={showTrackModal}
        onOpenChange={setShowTrackModal}
        analysis={analysis}
      />
    </div>
  );
}
