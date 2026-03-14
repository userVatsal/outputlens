import { Link } from 'react-router-dom';
import { Mail, Twitter, Youtube, Instagram } from 'lucide-react';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: 'hsl(222, 47%, 11%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="orb orb-blue w-[400px] h-[400px] -bottom-40 -right-40 opacity-10" />
        <div className="orb orb-lavender w-[300px] h-[300px] -bottom-20 left-20 opacity-8" />
      </div>
      <div className="section-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-brand font-extrabold tracking-tight text-xl text-white">
                Output<span className="text-blue-400">Lens</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Institutional-grade risk intelligence for traders who want to quantify uncertainty before deploying capital.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://x.com/outputlens" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded text-white/40 hover:text-white hover:bg-white/8 transition-colors">
                <XIcon className="h-4 w-4" />
              </a>
              <a href="https://instagram.com/outputlens" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded text-white/40 hover:text-white hover:bg-white/8 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://youtube.com/@outputlens" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded text-white/40 hover:text-white hover:bg-white/8 transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/workspace', label: 'Risk Workspace' },
                { href: '/methodology', label: 'Methodology' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/about', label: 'About' },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Contact</h4>
            <a
              href="mailto:contact@outputlens.com"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4" />
              contact@outputlens.com
            </a>
            <p className="text-xs text-white/35 mt-2">
              Support, feedback, and enterprise inquiries.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} OutputLens. All rights reserved.
          </p>
          <p className="text-xs text-white/30 max-w-sm text-center sm:text-right">
            Not financial advice. OutputLens quantifies risk — it does not predict prices or guarantee outcomes.
          </p>
        </div>
      </div>
    </footer>
  );
}
