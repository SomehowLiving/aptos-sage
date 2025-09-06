import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/components/providers/WalletProvider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aptos Assistant DeFi Suite',
  description: 'AI-powered DeFi platform for creating tokens, pools, and vaults on Aptos blockchain',
  keywords: ['Aptos', 'DeFi', 'AI', 'Blockchain', 'Tokens', 'Liquidity Pools', 'Yield Vaults'],
  authors: [{ name: 'Aptos Assistant Team' }],
  openGraph: {
    title: 'Aptos Assistant DeFi Suite',
    description: 'Create DeFi products with AI assistance on Aptos blockchain',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aptos Assistant DeFi Suite',
    description: 'AI-powered DeFi platform for Aptos blockchain',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WalletProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {children}
          </div>
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
