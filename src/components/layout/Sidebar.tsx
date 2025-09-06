'use client';

import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  LayoutDashboard, 
  TestTube, 
  Coins, 
  TrendingUp,
  Zap,
  Users,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    id: 'chat',
    label: 'AI Assistant',
    icon: MessageSquare,
    description: 'Chat with AI to create DeFi products',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview of your DeFi portfolio',
  },
  {
    id: 'sandbox',
    label: 'Sandbox',
    icon: TestTube,
    description: 'Test and simulate DeFi strategies',
  },
  {
    id: 'tokens',
    label: 'Tokens',
    icon: Coins,
    description: 'Manage your created tokens',
  },
  {
    id: 'pools',
    label: 'Pools',
    icon: TrendingUp,
    description: 'Liquidity pools and trading',
  },
];

const futureFeatures = [
  {
    id: 'vaults',
    label: 'Yield Vaults',
    icon: Zap,
    description: 'Coming soon',
    disabled: true,
  },
  {
    id: 'social',
    label: 'Social',
    icon: Users,
    description: 'Coming soon',
    disabled: true,
  },
  {
    id: 'rewards',
    label: 'Rewards',
    icon: Trophy,
    description: 'Coming soon',
    disabled: true,
  },
];

export function Sidebar() {
  const { appState, setAppState } = useAppStore();

  const handleNavigation = (viewId: string) => {
    setAppState({ currentView: viewId as any });
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">AA</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              DeFi Suite
            </h2>
            <p className="text-xs text-gray-500">AI-Powered</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Core Features
          </h3>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = appState.currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3 text-left",
                  isActive && "bg-blue-50 text-blue-700 border border-blue-200"
                )}
                onClick={() => handleNavigation(item.id)}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-blue-600" : "text-gray-500"
                  )} />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Future Features */}
        <div className="space-y-1 mt-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Coming Soon
          </h3>
          {futureFeatures.map((item) => {
            const Icon = item.icon;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                disabled
                className="w-full justify-start h-auto p-3 text-left opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-400">{item.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Powered by Aptos & AI</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
