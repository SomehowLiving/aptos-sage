'use client';

import { useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { WalletSelector } from '@/components/wallet/WalletSelector';
import { Bell, Settings, User } from 'lucide-react';
import { formatAddress, formatBalance } from '@/lib/aptos';

export function Header() {
  const { connected, account, disconnect } = useWallet();
  const { wallet, setWallet, setLoading } = useAppStore();

  useEffect(() => {
    if (connected && account) {
      setWallet({
        connected: true,
        address: account.address,
        balance: '0', // Will be fetched separately
        network: 'testnet', // Will be determined from wallet
      });
    } else {
      setWallet({
        connected: false,
        address: undefined,
        balance: undefined,
        network: undefined,
      });
    }
  }, [connected, account, setWallet]);

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await disconnect();
      setWallet({
        connected: false,
        address: undefined,
        balance: undefined,
        network: undefined,
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AA</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">
              Aptos Assistant
            </h1>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Wallet Connection */}
          {connected && account ? (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatAddress(account.address)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatBalance(wallet.balance || '0')} APT
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="btn-animate"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <WalletSelector />
          )}

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Profile */}
          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
