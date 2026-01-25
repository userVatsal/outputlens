import { useState, useEffect } from 'react';
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

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-survey-title"
    >
      <div className="relative w-full max-w-sm sm:max-w-md max-h-[90vh] bg-card border border-border rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground transition-colors z-10 p-1 rounded-md hover:bg-muted/50"
          aria-label="Close survey"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 pr-8">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 id="exit-survey-title" className="font-semibold text-base sm:text-lg">Quick question</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Help us improve OutputLens</p>
            </div>
          </div>
        </div>

        {/* Content - scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm font-medium">Why are you leaving?</p>
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
                {EXIT_REASONS.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center space-x-2.5 sm:space-x-3 p-2.5 sm:p-3 rounded-lg border transition-colors cursor-pointer min-h-[44px]",
                      reason === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setReason(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="shrink-0" />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1 text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm font-medium">What were you looking for?</p>
              <RadioGroup value={lookingFor} onValueChange={setLookingFor} className="space-y-2">
                {LOOKING_FOR_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center space-x-2.5 sm:space-x-3 p-2.5 sm:p-3 rounded-lg border transition-colors cursor-pointer min-h-[44px]",
                      lookingFor === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setLookingFor(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="shrink-0" />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1 text-sm">
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
                  className="mt-2 resize-none text-sm"
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 shrink-0">
          <Button variant="ghost" onClick={handleSkip} className="flex-1 min-h-[44px]">
            {step === 1 ? 'Skip' : 'Submit'}
          </Button>
          {step === 1 && (
            <Button
              onClick={() => setStep(2)}
              disabled={!reason}
              className="flex-1 min-h-[44px]"
            >
              Next
            </Button>
          )}
          {step === 2 && (
            <Button onClick={handleSubmit} className="flex-1 min-h-[44px]">
              Submit Feedback
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
