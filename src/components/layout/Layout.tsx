import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { LiveActivityToast } from '@/components/landing/LiveActivityToast';

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  hideToast?: boolean;
}

export function Layout({ children, hideFooter = false, hideToast = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      {!hideToast && <LiveActivityToast />}
    </div>
  );
}