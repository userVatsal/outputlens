import { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ExitSurveyModalProps {
  onSubmit: (data: {
    reason?: string;
    lookingFor?: string;
    additionalFeedback?: string;
  }) => void;
  onDismiss: () => void;
}

const EXIT_REASONS = [
  { value: 'just_browsing', label: 'Just browsing' },
  { value: 'not_what_i_need', label: "Not what I'm looking for" },
  { value: 'too_complex', label: 'Seems too complex' },
  { value: 'pricing', label: 'Pricing concerns' },
  { value: 'need_more_info', label: 'Need more information' },
  { value: 'will_return', label: "I'll come back later" },
];

const LOOKING_FOR_OPTIONS = [
  { value: 'trading_signals', label: 'Trading signals/predictions' },
  { value: 'portfolio_tracker', label: 'Portfolio tracker' },
  { value: 'risk_analysis', label: 'Risk analysis tools' },
  { value: 'backtesting', label: 'Backtesting platform' },
  { value: 'something_else', label: 'Something else' },
];

export function ExitSurveyModal({ onSubmit, onDismiss }: ExitSurveyModalProps) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState<string>('');
  const [lookingFor, setLookingFor] = useState<string>('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    onSubmit({
      reason: reason || undefined,
      lookingFor: lookingFor || undefined,
      additionalFeedback: feedback.trim() || undefined,
    });
  };

  const handleSkip = () => {
    if (step === 1) {
      onDismiss();
    } else {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close survey"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Quick question</h3>
              <p className="text-sm text-muted-foreground">Help us improve OutputLens</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Why are you leaving?</p>
              <RadioGroup value={reason} onValueChange={setReason}>
                {EXIT_REASONS.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      reason === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setReason(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-medium">What were you looking for?</p>
              <RadioGroup value={lookingFor} onValueChange={setLookingFor}>
                {LOOKING_FOR_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                      lookingFor === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setLookingFor(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="pt-2">
                <Label htmlFor="feedback" className="text-sm font-medium">
                  Anything else? (Optional)
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us what you'd like to see..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-2 resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-border flex gap-3">
          <Button variant="ghost" onClick={handleSkip} className="flex-1">
            {step === 1 ? 'Skip' : 'Submit'}
          </Button>
          {step === 1 && (
            <Button
              onClick={() => setStep(2)}
              disabled={!reason}
              className="flex-1"
            >
              Next
            </Button>
          )}
          {step === 2 && (
            <Button onClick={handleSubmit} className="flex-1">
              Submit Feedback
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
