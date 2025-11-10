import '@/lib/orpc.server'; //pre rendering for ssr
import type { Metadata } from 'next';
import { Cabin, Bai_Jamjuree } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import { AuthProvider } from '@/context/AuthProvider';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const geistSans = Cabin({
  weight: '600',
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Bai_Jamjuree({
  weight: '600',
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Future-Ready Collaboration Platform',
  description: 'An AI-powered workspace for seamless team communication and productivity.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>{children}</Providers>
            <Toaster closeButton position="top-center" />
          </ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
