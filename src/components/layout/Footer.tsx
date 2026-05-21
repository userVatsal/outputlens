import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="section-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
                <span className="text-primary text-xs font-bold tabular">OL</span>
              </div>
              <span className="font-brand font-bold text-foreground tracking-tight">
                Output<span className="text-primary">Lens</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Probabilistic risk intelligence for analysts who reject point forecasts.
            </p>
            <p className="text-xs text-muted-foreground/70 font-mono">Quantify uncertainty.</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-label">Product</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/workspace',   label: 'Workspace'   },
                { href: '/methodology', label: 'Methodology' },
                { href: '/pricing',     label: 'Pricing'     },
                { href: '/about',       label: 'About'       },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-label">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms"   className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-label">Contact</h4>
            <a href="mailto:contact@outputlens.com" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-4 w-4" /> contact@outputlens.com
            </a>
            <p className="text-xs text-muted-foreground/70">SOC2 Type II compliant · 256-bit encrypted</p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} OutputLens. All rights reserved.</p>
          <p className="text-xs text-muted-foreground/70 max-w-sm text-center sm:text-right">
            Not financial advice. OutputLens quantifies risk — it does not predict prices or guarantee outcomes.
          </p>
        </div>
      </div>
    </footer>
  );
}