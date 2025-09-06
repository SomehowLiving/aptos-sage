'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { SandboxView } from '@/components/sandbox/SandboxView';
import { PoolsView } from '@/components/pools/PoolsView';
import { TokensView } from '@/components/tokens/TokensView';
import { WelcomeScreen } from '@/components/welcome/WelcomeScreen';

export default function HomePage() {
  const { appState, wallet } = useAppStore();
  const [showWelcome, setShowWelcome] = useState(true);

  const renderCurrentView = () => {
    if (showWelcome && !wallet.connected) {
      return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />;
    }

    switch (appState.currentView) {
      case 'chat':
        return <ChatInterface />;
      case 'dashboard':
        return <Dashboard />;
      case 'sandbox':
        return <SandboxView />;
      case 'pools':
        return <PoolsView />;
      case 'tokens':
        return <TokensView />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
