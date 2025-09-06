'use client';

import { Button } from '@/components/ui/button';
import { MessageSquare, Zap, Coins, TrendingUp, HelpCircle } from 'lucide-react';

interface ChatHeaderProps {
  walletConnected: boolean;
  onQuickAction: (action: string) => void;
}

export function ChatHeader({ walletConnected, onQuickAction }: ChatHeaderProps) {
  const quickActions = [
    {
      id: 'create_token',
      label: 'Create Token',
      icon: Coins,
      description: 'Launch a new token',
      disabled: !walletConnected,
    },
    {
      id: 'create_pool',
      label: 'Create Pool',
      icon: TrendingUp,
      description: 'Set up liquidity',
      disabled: !walletConnected,
    },
    {
      id: 'help',
      label: 'Get Help',
      icon: HelpCircle,
      description: 'Learn how to use',
      disabled: false,
    },
  ];

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
            <p className="text-sm text-gray-500">
              {walletConnected ? 'Ready to help with DeFi' : 'Connect wallet to start'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                disabled={action.disabled}
                onClick={() => onQuickAction(action.id)}
                className="btn-animate"
                title={action.description}
              >
                <Icon className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
