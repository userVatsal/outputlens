import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send } from 'lucide-react';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Please enter a valid email').max(255, 'Email must be less than 255 characters'),
  subject: z.enum(['Support', 'Bug Report', 'Feature Request', 'General Inquiry'], { errorMap: () => ({ message: 'Please select a subject' }) }),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
});

export function Footer() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: 'Validation Error',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: result.data,
      });

      if (error) throw error;

      toast({
        title: 'Message sent!',
        description: "We'll get back to you soon.",
      });

      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: 'Failed to send message',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <BrandLogo size="md" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Three-layer risk intelligence. We quantify uncertainty before capital is deployed. 
              Probabilities, not predictions. Truth over hype.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/workspace" className="text-muted-foreground hover:text-foreground transition-colors">
                  Risk Workspace
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
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
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

          {/* Contact Form */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="contact-name" className="sr-only">Name</Label>
                  <Input
                    id="contact-name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-9 text-sm bg-background"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email" className="sr-only">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="Your email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-9 text-sm bg-background"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-subject" className="sr-only">Subject</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="contact-subject" className="h-9 text-sm bg-background">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Bug Report">Bug Report</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                    <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contact-message" className="sr-only">Message</Label>
                <Textarea
                  id="contact-message"
                  placeholder="Your message (10-1000 characters)"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="text-sm bg-background resize-none"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <Button 
                type="submit" 
                size="sm" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} OutputLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
