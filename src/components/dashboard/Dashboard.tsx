'use client';

import { useAppStore } from '@/store/useAppStore';
import { formatBalance, formatAddress } from '@/lib/aptos';
import { 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Activity, 
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const { tokens, pools, wallet, appState, setAppState } = useAppStore();

  const stats = [
    {
      title: 'Total Tokens',
      value: tokens.length.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: Coins,
    },
    {
      title: 'Active Pools',
      value: pools.length.toString(),
      change: '+1',
      changeType: 'positive' as const,
      icon: Activity,
    },
    {
      title: 'Portfolio Value',
      value: formatBalance(wallet.balance || '0'),
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Total Transactions',
      value: '24',
      change: '+3',
      changeType: 'positive' as const,
      icon: Wallet,
    },
  ];

  const recentTokens = tokens.slice(0, 3);
  const recentPools = pools.slice(0, 3);

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your DeFi portfolio</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={() => setAppState({ currentView: 'chat' })}
            className="btn-animate"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-center mt-4">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tokens */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tokens</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAppState({ currentView: 'tokens' })}
              >
                View All
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            {recentTokens.length === 0 ? (
              <div className="text-center py-8">
                <Coins className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No tokens created yet</p>
                <Button
                  onClick={() => setAppState({ currentView: 'chat' })}
                  size="sm"
                  className="btn-animate"
                >
                  Create Your First Token
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTokens.map((token) => (
                  <div key={token.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {token.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{token.name}</p>
                        <p className="text-sm text-gray-500">{token.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatBalance(token.totalSupply, token.decimals)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatAddress(token.contractAddress)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Pools */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Pools</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAppState({ currentView: 'pools' })}
              >
                View All
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            {recentPools.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No pools created yet</p>
                <Button
                  onClick={() => setAppState({ currentView: 'chat' })}
                  size="sm"
                  className="btn-animate"
                >
                  Create Your First Pool
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPools.map((pool) => (
                  <div key={pool.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{pool.name}</p>
                        <p className="text-sm text-gray-500">
                          {pool.tokenA.symbol} / {pool.tokenB.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatBalance(pool.liquidity)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pool.fee}% fee
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => setAppState({ currentView: 'chat' })}
            variant="outline"
            className="h-auto p-4 text-left"
          >
            <div className="flex items-center space-x-3">
              <Coins className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Create Token</p>
                <p className="text-sm text-gray-500">Launch a new cryptocurrency</p>
              </div>
            </div>
          </Button>
          
          <Button
            onClick={() => setAppState({ currentView: 'chat' })}
            variant="outline"
            className="h-auto p-4 text-left"
          >
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Create Pool</p>
                <p className="text-sm text-gray-500">Set up liquidity for trading</p>
              </div>
            </div>
          </Button>
          
          <Button
            onClick={() => setAppState({ currentView: 'sandbox' })}
            variant="outline"
            className="h-auto p-4 text-left"
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium">Test Strategy</p>
                <p className="text-sm text-gray-500">Simulate in sandbox</p>
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
