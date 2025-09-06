'use client';

import { useState } from 'react';
import {
  useWallet,
  WalletName,
  WalletInfo,
} from '@aptos-labs/wallet-adapter-react';

import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PetraWalletName } from 'petra-plugin-wallet-adapter';

export function WalletSelector() {
  const { connect, wallets = [], connected, wallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = async (walletName: WalletName) => {
    try {
      await connect(walletName);
      setIsOpen(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  if (connected) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={wallet?.name === PetraWalletName}
        className="btn-animate"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {wallet?.name === PetraWalletName ? 'Connected' : 'Connect Wallet'}
        <ChevronDown
          className={cn(
            'w-4 h-4 ml-2 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {isOpen && wallets.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">
              Available Wallets
            </div>
            {wallets.map((wallet: WalletInfo) => (
              <button
                key={wallet.name}
                onClick={() => handleConnect(wallet.name as WalletName)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{wallet.name}</div>
                  <div className="text-xs text-gray-500">
                    Available
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 p-3">
            <div className="text-xs text-gray-500 text-center">
              <p>Don't have a wallet?</p>
              <a
                href="https://petra.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Download Petra
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
