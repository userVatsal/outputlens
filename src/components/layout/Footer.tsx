import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <BrandLogo size="md" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Educational scenario analysis for traders. Understand potential outcomes before you trade.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/analyze" className="text-muted-foreground hover:text-foreground transition-colors">
                  Analyze Trade
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="text-muted-foreground hover:text-foreground transition-colors">
                  Methodology
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Disclaimer</h4>
            <p className="text-xs text-muted-foreground">
              OutputLens is for educational purposes only. It does not provide financial advice, 
              predictions, or recommendations. Past scenarios do not guarantee future results. 
              Always consult a qualified financial advisor before trading.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} OutputLens. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Not financial advice. For educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
