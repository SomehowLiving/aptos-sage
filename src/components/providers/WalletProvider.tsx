'use client';

import { ReactNode, useEffect } from 'react';
import { 
  AptosWalletAdapterProvider,
  useWallet 
} from '@aptos-labs/wallet-adapter-react';

// Import specific wallet adapters
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { Network } from "@aptos-labs/ts-sdk";

// Add other wallets as needed
// import { MartianWallet } from '@martianwallet/aptos-wallet-adapter';
// import { RiseWallet } from '@rise-wallet/wallet-adapter';
// import { FewchaWallet } from 'fewcha-plugin-wallet-adapter';

import { useAppStore } from '@/store/useAppStore';

// Configure available wallets
const wallets = [new PetraWallet(),
  // Add other wallets here when available
  // new MartianWallet(),
  // new RiseWallet(),
  // new FewchaWallet(),
];

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const { setWallet } = useAppStore();

  return (
    <AptosWalletAdapterProvider
      // wallets={wallets}
      autoConnect={true}
      dappConfig={{
        network: Network.testnet // or 'testnet' for testing
        // Add your dapp info
        // name: 'Your Dapp Name',
        // url: 'https://yourdapp.com' // optional
      }}
      onError={(error) => {
        console.error('Wallet connection error:', error);
        setWallet({
          connected: false,
          address: undefined,
          balance: undefined,
          network: undefined,
        });
      }}
    >
      <WalletStateUpdater />
      {children}
    </AptosWalletAdapterProvider>
  );
}

function WalletStateUpdater() {
  const { setWallet } = useAppStore();
  const { 
    connected, 
    account, 
    network,
    wallet 
  } = useWallet();

  useEffect(() => {
    // Update store when wallet connection changes
    if (connected && account) {
      setWallet({
        connected: true,
        address: account.address?.toString(), // Convert to string if needed
        balance: undefined, // Balance should be fetched separately using Aptos client
        network: network?.name || network?.chainId?.toString(),
      });
      
      console.log('Wallet connected:', {
        address: account.address?.toString(),
        network: network?.name,
        wallet: wallet?.name
      });
    } else {
      setWallet({
        connected: false,
        address: undefined,
        balance: undefined,
        network: undefined,
      });
      
      console.log('Wallet disconnected');
    }
  }, [connected, account, network, wallet, setWallet]);

  return null;
}