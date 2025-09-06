'use client';

import { useAppStore } from '@/store/useAppStore';
import { formatBalance, formatAddress } from '@/lib/aptos';
import { 
  TrendingUp, 
  Plus, 
  ExternalLink, 
  Copy,
  MoreHorizontal,
  Activity,
  DollarSign,
  Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toaster';

export function PoolsView() {
  const { pools, setAppState } = useAppStore();
  const { success } = useToast();

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    success('Copied', 'Pool address copied to clipboard');
  };

  const handleViewExplorer = (address: string) => {
    window.open(`https://explorer.aptoslabs.com/account/${address}`, '_blank');
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liquidity Pools</h1>
          <p className="text-gray-600">Manage your liquidity pools</p>
        </div>
        
        <Button
          onClick={() => setAppState({ currentView: 'chat' })}
          className="btn-animate"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Pool
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pools.length}</p>
              <p className="text-sm text-gray-600">Total Pools</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">$0</p>
              <p className="text-sm text-gray-600">Total Liquidity</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Active Trades</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0.3%</p>
              <p className="text-sm text-gray-600">Avg Fee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pools List */}
      {pools.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pools created yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first liquidity pool using our AI assistant
            </p>
            <Button
              onClick={() => setAppState({ currentView: 'chat' })}
              className="btn-animate"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Pool
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Pools</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {pools.map((pool) => (
              <div key={pool.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {pool.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {pool.tokenA.symbol} / {pool.tokenB.symbol}
                      </p>
                      <p className="text-sm text-gray-500">
                        Fee: {pool.fee}% • Liquidity: {formatBalance(pool.liquidity)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyAddress(pool.contractAddress)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewExplorer(pool.contractAddress)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Token A</p>
                    <p className="text-sm text-gray-900">{pool.tokenA.name}</p>
                    <p className="text-sm text-gray-500">{pool.tokenA.symbol}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Token B</p>
                    <p className="text-sm text-gray-900">{pool.tokenB.name}</p>
                    <p className="text-sm text-gray-500">{pool.tokenB.symbol}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created</p>
                    <p className="text-sm text-gray-900">
                      {pool.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pool.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pool.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Contract Address</p>
                  <p className="text-sm text-gray-900 font-mono">
                    {formatAddress(pool.contractAddress)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
