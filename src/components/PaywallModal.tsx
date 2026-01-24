import { Link } from 'react-router-dom';
import { Sparkles, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const proFeatures = [
  'Unlimited analyses',
  'Full analysis history',
  'Priority support',
  'Early access to new features',
];

export function PaywallModal({ open, onOpenChange }: PaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            You've used your 10 free analyses this month. Upgrade to keep analyzing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price */}
          <div className="text-center py-4 bg-muted/50 rounded-lg">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-foreground">$9</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Cancel anytime</p>
          </div>

          {/* Features */}
          <ul className="space-y-3">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-bullish/10 flex items-center justify-center">
                  <Check className="h-3 w-3 text-bullish" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="space-y-3">
            <Button className="w-full" asChild>
              <Link to="/pricing">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade Now
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => onOpenChange(false)}
            >
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
