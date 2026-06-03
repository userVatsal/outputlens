import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[ErrorBoundary] caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-lg border border-border bg-surface p-6 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-bearish/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-bearish" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mt-1">
              An unexpected error occurred. Try refreshing the page.
            </p>
            {this.state.error?.message && (
              <p className="mt-3 text-[11px] font-mono text-muted-foreground/70 break-all">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={this.handleReset}>
              Try again
            </Button>
            <Button size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }
}