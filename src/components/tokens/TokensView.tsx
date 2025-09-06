'use client';

import { useAppStore } from '@/store/useAppStore';
import { formatBalance, formatAddress } from '@/lib/aptos';
import { 
  Coins, 
  Plus, 
  ExternalLink, 
  Copy,
  MoreHorizontal,
  TrendingUp,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toaster';

export function TokensView() {
  const { tokens, setAppState } = useAppStore();
  const { success } = useToast();

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    success('Copied', 'Token address copied to clipboard');
  };

  const handleViewExplorer = (address: string) => {
    window.open(`https://explorer.aptoslabs.com/account/${address}`, '_blank');
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tokens</h1>
          <p className="text-gray-600">Manage your created tokens</p>
        </div>
        
        <Button
          onClick={() => setAppState({ currentView: 'chat' })}
          className="btn-animate"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Token
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{tokens.length}</p>
              <p className="text-sm text-gray-600">Total Tokens</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">$0</p>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Holders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tokens List */}
      {tokens.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tokens created yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first token using our AI assistant
            </p>
            <Button
              onClick={() => setAppState({ currentView: 'chat' })}
              className="btn-animate"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Token
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Tokens</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {tokens.map((token) => (
              <div key={token.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {token.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Symbol: {token.symbol} • Decimals: {token.decimals}
                      </p>
                      <p className="text-sm text-gray-500">
                        Total Supply: {formatBalance(token.totalSupply, token.decimals)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyAddress(token.contractAddress)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewExplorer(token.contractAddress)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contract Address</p>
                    <p className="text-sm text-gray-900 font-mono">
                      {formatAddress(token.contractAddress)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created</p>
                    <p className="text-sm text-gray-900">
                      {token.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Creator</p>
                    <p className="text-sm text-gray-900 font-mono">
                      {formatAddress(token.creator)}
                    </p>
                  </div>
                </div>
                
                {token.iconUri && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Icon</p>
                    <img 
                      src={token.iconUri} 
                      alt={`${token.name} icon`}
                      className="w-8 h-8 rounded"
                    />
                  </div>
                )}
                
                {token.projectUri && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Project</p>
                    <a 
                      href={token.projectUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      {token.projectUri}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
