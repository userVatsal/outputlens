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
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Export Ready",
        description: "PDF export functionality coming soon.",
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
