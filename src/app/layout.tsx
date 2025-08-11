import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { AppShell } from '@/components/ledger/app-shell';
import { AuthWrapper } from '@/components/auth/auth-wrapper';

export const metadata: Metadata = {
  title: 'AB INTERIOR',
  description: 'A modern customer payment ledger application for AB Interior.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", "min-h-screen bg-background font-sans")}>
        <AuthWrapper>
          {children}
        </AuthWrapper>
        <Toaster />
      </body>
    </html>
  );
}
