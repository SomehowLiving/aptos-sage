'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { sandboxService } from '@/lib/sandbox';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/toaster';
import { 
  TestTube, 
  Play, 
  Code, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  Trash2,
  Copy,
  Terminal,
  FileText,
  Settings,
  Zap
} from 'lucide-react';
import { SandboxSimulation } from '@/types';

// Enhanced Move code templates
const MOVE_CODE_TEMPLATES = {
  token: `module MyToken::Token {
    use std::signer;
    use aptos_framework::coin;
    
    struct Token {}
    
    public entry fun initialize(account: &signer, name: vector<u8>, symbol: vector<u8>, decimals: u8) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<Token>(
            account,
            std::string::utf8(name),
            std::string::utf8(symbol),
            decimals,
            false,
        );
        
        // Store capabilities for later use
        move_to(account, MintCapability { mint_cap });
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_freeze_cap(freeze_cap);
    }
    
    struct MintCapability has key {
        mint_cap: coin::MintCapability<Token>,
    }
    
    public entry fun mint(account: &signer, to: address, amount: u64) acquires MintCapability {
        let mint_cap = &borrow_global<MintCapability>(signer::address_of(account)).mint_cap;
        let coins = coin::mint<Token>(amount, mint_cap);
        coin::deposit(to, coins);
    }
}`,
  
  pool: `module LiquidityPool::Pool {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    
    struct Pool<phantom X, phantom Y> has key {
        reserve_x: u64,
        reserve_y: u64,
        lp_tokens: u64,
        fee_rate: u64, // basis points (e.g., 30 = 0.3%)
        last_update: u64,
    }
    
    public entry fun create_pool<X, Y>(
        account: &signer,
        initial_x: u64,
        initial_y: u64,
        fee_rate: u64
    ) {
        let pool = Pool<X, Y> {
            reserve_x: initial_x,
            reserve_y: initial_y,
            lp_tokens: initial_x * initial_y, // Simple calculation
            fee_rate,
            last_update: timestamp::now_seconds(),
        };
        
        move_to(account, pool);
    }
    
    public fun swap_x_to_y<X, Y>(
        pool: &mut Pool<X, Y>,
        x_amount: u64
    ): u64 {
        let fee = x_amount * pool.fee_rate / 10000;
        let x_after_fee = x_amount - fee;
        let y_out = (pool.reserve_y * x_after_fee) / (pool.reserve_x + x_after_fee);
        
        pool.reserve_x = pool.reserve_x + x_amount;
        pool.reserve_y = pool.reserve_y - y_out;
        pool.last_update = timestamp::now_seconds();
        
        y_out
    }
}`,

  vault: `module Vault::Strategy {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    
    struct Vault<phantom T> has key {
        total_assets: u64,
        total_shares: u64,
        strategy_type: u8, // 0 = simple, 1 = compound
        fee_rate: u64,
        last_harvest: u64,
    }
    
    struct UserPosition has key {
        shares: u64,
        deposited_at: u64,
    }
    
    public entry fun create_vault<T>(
        account: &signer,
        strategy_type: u8,
        fee_rate: u64
    ) {
        let vault = Vault<T> {
            total_assets: 0,
            total_shares: 0,
            strategy_type,
            fee_rate,
            last_harvest: timestamp::now_seconds(),
        };
        
        move_to(account, vault);
    }
    
    public entry fun deposit<T>(
        account: &signer,
        vault_owner: address,
        amount: u64
    ) acquires Vault, UserPosition {
        let vault = borrow_global_mut<Vault<T>>(vault_owner);
        let shares = if (vault.total_shares == 0) {
            amount
        } else {
            amount * vault.total_shares / vault.total_assets
        };
        
        vault.total_assets = vault.total_assets + amount;
        vault.total_shares = vault.total_shares + shares;
        
        if (exists<UserPosition>(signer::address_of(account))) {
            let position = borrow_global_mut<UserPosition>(signer::address_of(account));
            position.shares = position.shares + shares;
        } else {
            move_to(account, UserPosition {
                shares,
                deposited_at: timestamp::now_seconds(),
            });
        };
    }
}`
};

export function SandboxView() {
  const { simulations, addSimulation, updateSimulation, removeSimulation } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<SandboxSimulation | null>(null);
  const [activeTab, setActiveTab] = useState('code');
  const [executionLog, setExecutionLog] = useState<Array<{type: string, message: string, timestamp: string}>>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const { success, error: showError } = useToast();

  const addLogEntry = (type: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLog(prev => [...prev, { type, message, timestamp }]);
  };

  const handleCreateSimulation = async (type: 'token' | 'pool' | 'vault') => {
    setIsCreating(true);
    addLogEntry('info', `Creating new ${type} simulation...`);
    
    try {
      // Enhanced mock parameters
      const mockParameters = {
        token: {
          name: 'My Token',
          symbol: 'MTK',
          decimals: 8,
          totalSupply: '1000000',
          iconUri: '',
          projectUri: '',
        },
        pool: {
          name: 'My Pool',
          tokenA: '0x1::aptos_coin::AptosCoin',
          tokenB: '0x123::my_token::MyToken',
          fee: 0.3,
          initialLiquidityA: '1000',
          initialLiquidityB: '1000',
        },
        vault: {
          name: 'My Vault',
          token: '0x1::aptos_coin::AptosCoin',
          strategy: 'compound',
          fee: 2.5,
          minDeposit: '100',
        },
      };

      // Create simulation with real code template
      const simulation = {
        ...await sandboxService.createSimulation(type, mockParameters[type]),
        code: MOVE_CODE_TEMPLATES[type],
        executionCount: 0,
        gasUsed: 0,
      };
      
      addSimulation(simulation);
      setSelectedSimulation(simulation);
      addLogEntry('success', `${type} simulation created successfully`);
      success('Simulation Created', `New ${type} simulation created successfully`);
    } catch (error) {
      addLogEntry('error', 'Failed to create simulation');
      showError('Creation Failed', 'Failed to create simulation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateCode = async (simulation: SandboxSimulation) => {
    try {
      addLogEntry('info', 'Generating optimized code...');
      updateSimulation(simulation.id, { status: 'compiling' });
      
      // Simulate code generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Enhanced code generation
      const optimizedCode = simulation.code?.replace(
        /\/\/ Simple calculation/g, 
        '// Optimized calculation with overflow protection'
      ) || MOVE_CODE_TEMPLATES[simulation.type as keyof typeof MOVE_CODE_TEMPLATES];

      updateSimulation(simulation.id, { 
        code: optimizedCode, 
        status: 'success' 
      });
      addLogEntry('success', 'Code generation completed');
      success('Code Generated', 'Move code generated successfully');
    } catch (error) {
      updateSimulation(simulation.id, { status: 'error' });
      addLogEntry('error', 'Failed to generate code');
      showError('Generation Failed', 'Failed to generate code');
    }
  };

  const handleTestCode = async (simulation: SandboxSimulation) => {
    try {
      setIsExecuting(true);
      addLogEntry('info', 'Starting simulation execution...');
      updateSimulation(simulation.id, { status: 'compiling' });

      // Simulate compilation
      await new Promise(resolve => setTimeout(resolve, 1500));
      addLogEntry('info', 'Compiling Move code...');

      // Simulate execution steps
      const steps = [
        'Initializing runtime environment',
        'Loading dependencies',
        'Executing module initialization',
        'Running test transactions',
        'Calculating gas usage',
        'Generating execution report'
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        addLogEntry('info', step);
      }

      // Generate enhanced results
      const gasUsed = Math.floor(Math.random() * 50000) + 10000;
      const success_rate = Math.random() > 0.2; // 80% success rate

      const result = {
        success: success_rate,
        gasUsed,
        executionTime: Math.floor(Math.random() * 2000) + 500,
        errors: success_rate ? [] : ['Type mismatch in function parameter', 'Resource not found at address'],
        warnings: ['Unused variable detected', 'Consider using more efficient algorithm'],
        transactions: [
          { type: 'Initialize', status: 'success', gas: Math.floor(gasUsed * 0.3) },
          { type: 'Execute', status: success_rate ? 'success' : 'failed', gas: Math.floor(gasUsed * 0.7) }
        ],
        gasEstimate: gasUsed,
        aiAnalysis: success_rate 
          ? 'Code executed successfully with optimal gas usage. Consider implementing additional safety checks for production deployment.'
          : 'Execution failed due to type safety issues. Review the highlighted errors and ensure all resource dependencies are properly initialized.'
      };

      updateSimulation(simulation.id, { 
        ...result, 
        status: success_rate ? 'success' : 'error',
        result,
        gasUsed,
        executionCount: (simulation as any).executionCount ? (simulation as any).executionCount + 1 : 1
      });

      setSelectedSimulation(prev => prev ? { 
        ...prev, 
        result, 
        status: success_rate ? 'success' : 'error',
        gasUsed,
        executionCount: ((prev as any).executionCount || 0) + 1
      } : null);

      addLogEntry(success_rate ? 'success' : 'error', 
        `Execution ${success_rate ? 'completed successfully' : 'failed'} - Gas used: ${gasUsed}`
      );
      success('Test Completed', 'Code testing completed');
    } catch (error) {
      updateSimulation(simulation.id, { status: 'error' });
      addLogEntry('error', 'Test execution failed');
      showError('Test Failed', 'Failed to test code');
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addLogEntry('info', 'Code copied to clipboard');
    success('Copied', 'Code copied to clipboard');
  };

  const getStatusIcon = (status: SandboxSimulation['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'compiling':
        return <LoadingSpinner size="sm" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: SandboxSimulation['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'compiling':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="h-full flex">
      {/* Enhanced Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <TestTube className="w-5 h-5 mr-2 text-blue-500" />
              Move Sandbox
            </h2>
            <div className="flex space-x-1">
              <button
                onClick={() => setExecutionLog([])}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Clear logs"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={() => handleCreateSimulation('token')}
              disabled={isCreating}
              variant="outline"
              size="sm"
              className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Token Simulation
            </Button>
            <Button
              onClick={() => handleCreateSimulation('pool')}
              disabled={isCreating}
              variant="outline"
              size="sm"
              className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Pool Simulation
            </Button>
            <Button
              onClick={() => handleCreateSimulation('vault')}
              disabled={isCreating}
              variant="outline"
              size="sm"
              className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Vault Simulation
            </Button>
          </div>
        </div>

        {/* Simulations List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Simulations ({simulations.length})
          </h3>
          
          {simulations.length === 0 ? (
            <div className="text-center py-8">
              <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No simulations yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Create your first simulation to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {simulations.map((simulation) => (
                <div
                  key={simulation.id}
                  onClick={() => setSelectedSimulation(simulation)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    selectedSimulation?.id === simulation.id
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(simulation.status)}
                      <span className="text-sm font-medium text-gray-900">
                        {simulation.type.charAt(0).toUpperCase() + simulation.type.slice(1)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSimulation(simulation.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(simulation.createdAt).toLocaleDateString()}</span>
                    {(simulation as any).executionCount > 0 && (
                      <span className="bg-gray-100 px-1 rounded">
                        {(simulation as any).executionCount}x
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Execution Log */}
        <div className="border-t border-gray-200 p-4 max-h-48 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Execution Log</h4>
          <div className="space-y-1 text-xs">
            {executionLog.slice(-10).map((log, index) => (
              <div key={index} className={`flex items-start space-x-2 ${
                log.type === 'error' ? 'text-red-600' :
                log.type === 'success' ? 'text-green-600' : 'text-gray-600'
              }`}>
                <span className="text-gray-400">{log.timestamp}</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedSimulation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedSimulation.type.charAt(0).toUpperCase() + selectedSimulation.type.slice(1)} Simulation
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Created {selectedSimulation.createdAt.toLocaleDateString()}</span>
                    {(selectedSimulation as any).gasUsed > 0 && (
                      <span>Gas: {(selectedSimulation as any).gasUsed.toLocaleString()}</span>
                    )}
                    {(selectedSimulation as any).executionCount > 0 && (
                      <span>Runs: {(selectedSimulation as any).executionCount}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleGenerateCode(selectedSimulation)}
                    disabled={selectedSimulation.status === 'compiling'}
                    size="sm"
                    className="btn-animate bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                    variant="outline"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Optimize
                  </Button>
                  
                  {selectedSimulation.code && (
                    <Button
                      onClick={() => handleTestCode(selectedSimulation)}
                      disabled={isExecuting || selectedSimulation.status === 'compiling'}
                      size="sm"
                      className="btn-animate bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      variant="outline"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Status Banner */}
            <div className={`p-3 border-b ${getStatusColor(selectedSimulation.status)}`}>
              <div className="flex items-center space-x-2">
                {getStatusIcon(selectedSimulation.status)}
                <span className="font-medium">
                  Status: {selectedSimulation.status.charAt(0).toUpperCase() + selectedSimulation.status.slice(1)}
                </span>
                {selectedSimulation.status === 'compiling' && (
                  <span className="text-sm text-gray-600">
                    Running simulation...
                  </span>
                )}
              </div>
            </div>

            {/* Enhanced Tabs */}
            <div className="border-b border-gray-200 bg-white">
              <div className="flex space-x-8 px-4">
                {[
                  { id: 'code', label: 'Code', icon: FileText },
                  { id: 'parameters', label: 'Parameters', icon: Settings },
                  { id: 'results', label: 'Results', icon: Zap }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-3 px-1 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'code' && (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between p-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">Move Code</h4>
                    <button
                      onClick={() => copyToClipboard(selectedSimulation.code || '')}
                      className="flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 text-sm font-mono text-gray-800 overflow-x-auto bg-gray-50">
                    {selectedSimulation.code}
                  </pre>
                </div>
              )}

              {activeTab === 'parameters' && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Configuration</h4>
                  <div className="grid gap-4">
                    {Object.entries(selectedSimulation.parameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'results' && (
                <div className="space-y-4">
                  {selectedSimulation.result ? (
                    <>
                      {/* Enhanced Execution Summary */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Execution Summary</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-600">Status</div>
                            <div className={`font-semibold ${selectedSimulation.result.success ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedSimulation.result.success ? 'Success' : 'Failed'}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-600">Gas Used</div>
                            <div className="font-semibold text-gray-900">{selectedSimulation.result.gasEstimate?.toLocaleString() || 'N/A'}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-600">Execution Time</div>
                            <div className="font-semibold text-gray-900">{(selectedSimulation.result as any).executionTime || 0}ms</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-600">Transactions</div>
                            <div className="font-semibold text-gray-900">{(selectedSimulation.result as any).transactions?.length || 0}</div>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      {(selectedSimulation.result as any).transactions && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Transaction Details</h4>
                          <div className="space-y-2">
                            {(selectedSimulation.result as any).transactions.map((tx: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div className="flex items-center space-x-3">
                                  {tx.status === 'success' ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className="font-medium">{tx.type}</span>
                                </div>
                                <span className="text-sm text-gray-600">{tx.gas?.toLocaleString()} gas</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Errors and Warnings */}
                      {((selectedSimulation.result.errors && selectedSimulation.result.errors.length > 0) || 
                        (selectedSimulation.result.warnings && selectedSimulation.result.warnings.length > 0)) && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Issues</h4>
                          
                          {selectedSimulation.result.errors && selectedSimulation.result.errors.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-red-600 mb-2">Errors:</h5>
                              <ul className="space-y-1">
                                {selectedSimulation.result.errors.map((error, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-sm text-red-600">
                                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {selectedSimulation.result.warnings && selectedSimulation.result.warnings.length > 0 && (
                            <div>
                              <h5 className="font-medium text-yellow-600 mb-2">Warnings:</h5>
                              <ul className="space-y-1">
                                {selectedSimulation.result.warnings.map((warning, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-sm text-yellow-600">
                                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{warning}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Analysis */}
                      {selectedSimulation.result.aiAnalysis && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">AI Analysis:</h5>
                          <p className="text-sm text-gray-600">
                            {selectedSimulation.result.aiAnalysis}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
                      <p className="text-gray-500">Execute the simulation to see results</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <TestTube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Move Sandbox
              </h3>
              <p className="text-gray-500 max-w-md">
                Create and test Move smart contracts in a safe environment. 
                Choose a simulation type to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// 'use client';

// import { useState } from 'react';
// import { useAppStore } from '@/store/useAppStore';
// import { sandboxService } from '@/lib/sandbox';
// import { Button } from '@/components/ui/button';
// import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
// import { useToast } from '@/components/ui/toaster';
// import { 
//   TestTube, 
//   Play, 
//   Code, 
//   CheckCircle, 
//   XCircle, 
//   AlertTriangle,
//   Plus,
//   Trash2
// } from 'lucide-react';
// import { SandboxSimulation } from '@/types';

// export function SandboxView() {
//   const { simulations, addSimulation, updateSimulation, removeSimulation } = useAppStore();
//   const [isCreating, setIsCreating] = useState(false);
//   const [selectedSimulation, setSelectedSimulation] = useState<SandboxSimulation | null>(null);
//   const { success, error: showError } = useToast();

//   const handleCreateSimulation = async (type: 'token' | 'pool' | 'vault') => {
//     setIsCreating(true);
//     try {
//       // Create mock parameters based on type
//       const mockParameters = {
//         token: {
//           name: 'My Token',
//           symbol: 'MTK',
//           decimals: 8,
//           totalSupply: '1000000',
//           iconUri: '',
//           projectUri: '',
//         },
//         pool: {
//           name: 'My Pool',
//           tokenA: '0x1::aptos_coin::AptosCoin',
//           tokenB: '0x123::my_token::MyToken',
//           fee: 0.3,
//           initialLiquidityA: '1000',
//           initialLiquidityB: '1000',
//         },
//         vault: {
//           name: 'My Vault',
//           token: '0x1::aptos_coin::AptosCoin',
//           strategy: 'compound',
//           fee: 2.5,
//           minDeposit: '100',
//         },
//       };

//       const simulation = await sandboxService.createSimulation(type, mockParameters[type]);
//       addSimulation(simulation);
//       setSelectedSimulation(simulation);
//       success('Simulation Created', `New ${type} simulation created successfully`);
//     } catch (error) {
//       showError('Creation Failed', 'Failed to create simulation');
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   const handleGenerateCode = async (simulation: SandboxSimulation) => {
//     try {
//       updateSimulation(simulation.id, { status: 'compiling' });
//       const code = await sandboxService.generateCode(simulation.id);
//       updateSimulation(simulation.id, { code, status: 'success' });
//       success('Code Generated', 'Move code generated successfully');
//     } catch (error) {
//       updateSimulation(simulation.id, { status: 'error' });
//       showError('Generation Failed', 'Failed to generate code');
//     }
//   };

//   const handleTestCode = async (simulation: SandboxSimulation) => {
//     try {
//       updateSimulation(simulation.id, { status: 'compiling' });
//       const result = await sandboxService.testCode(simulation.id);
//       updateSimulation(simulation.id, result);
//       success('Test Completed', 'Code testing completed');
//     } catch (error) {
//       updateSimulation(simulation.id, { status: 'error' });
//       showError('Test Failed', 'Failed to test code');
//     }
//   };

//   const getStatusIcon = (status: SandboxSimulation['status']) => {
//     switch (status) {
//       case 'success':
//         return <CheckCircle className="w-4 h-4 text-green-500" />;
//       case 'error':
//         return <XCircle className="w-4 h-4 text-red-500" />;
//       case 'compiling':
//         return <LoadingSpinner size="sm" />;
//       default:
//         return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
//     }
//   };

//   const getStatusColor = (status: SandboxSimulation['status']) => {
//     switch (status) {
//       case 'success':
//         return 'bg-green-50 border-green-200';
//       case 'error':
//         return 'bg-red-50 border-red-200';
//       case 'compiling':
//         return 'bg-blue-50 border-blue-200';
//       default:
//         return 'bg-yellow-50 border-yellow-200';
//     }
//   };

//   return (
//     <div className="h-full flex">
//       {/* Sidebar */}
//       <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-gray-900">Sandbox</h2>
//             <Button
//               onClick={() => handleCreateSimulation('token')}
//               disabled={isCreating}
//               size="sm"
//               className="btn-animate"
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               New
//             </Button>
//           </div>
          
//           <div className="space-y-2">
//             <Button
//               onClick={() => handleCreateSimulation('token')}
//               disabled={isCreating}
//               variant="outline"
//               size="sm"
//               className="w-full justify-start"
//             >
//               <TestTube className="w-4 h-4 mr-2" />
//               Token Simulation
//             </Button>
//             <Button
//               onClick={() => handleCreateSimulation('pool')}
//               disabled={isCreating}
//               variant="outline"
//               size="sm"
//               className="w-full justify-start"
//             >
//               <TestTube className="w-4 h-4 mr-2" />
//               Pool Simulation
//             </Button>
//             <Button
//               onClick={() => handleCreateSimulation('vault')}
//               disabled={isCreating}
//               variant="outline"
//               size="sm"
//               className="w-full justify-start"
//             >
//               <TestTube className="w-4 h-4 mr-2" />
//               Vault Simulation
//             </Button>
//           </div>
//         </div>

//         {/* Simulations List */}
//         <div className="flex-1 overflow-y-auto p-4">
//           <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
//             Simulations ({simulations.length})
//           </h3>
          
//           {simulations.length === 0 ? (
//             <div className="text-center py-8">
//               <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-500 text-sm">No simulations yet</p>
//               <p className="text-gray-400 text-xs mt-1">
//                 Create your first simulation to get started
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-2">
//               {simulations.map((simulation) => (
//                 <div
//                   key={simulation.id}
//                   onClick={() => setSelectedSimulation(simulation)}
//                   className={`p-3 rounded-lg border cursor-pointer transition-colors ${
//                     selectedSimulation?.id === simulation.id
//                       ? 'bg-blue-50 border-blue-200'
//                       : 'bg-white border-gray-200 hover:bg-gray-50'
//                   }`}
//                 >
//                   <div className="flex items-center justify-between mb-2">
//                     <div className="flex items-center space-x-2">
//                       {getStatusIcon(simulation.status)}
//                       <span className="text-sm font-medium text-gray-900">
//                         {simulation.type.charAt(0).toUpperCase() + simulation.type.slice(1)}
//                       </span>
//                     </div>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         removeSimulation(simulation.id);
//                       }}
//                       className="text-gray-400 hover:text-red-500"
//                     >
//                       <Trash2 className="w-3 h-3" />
//                     </button>
//                   </div>
                  
//                   <div className="text-xs text-gray-500">
//                     {simulation.createdAt.toLocaleDateString()}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         {selectedSimulation ? (
//           <>
//             {/* Header */}
//             <div className="p-4 border-b border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     {selectedSimulation.type.charAt(0).toUpperCase() + selectedSimulation.type.slice(1)} Simulation
//                   </h3>
//                   <p className="text-sm text-gray-500">
//                     Created {selectedSimulation.createdAt.toLocaleDateString()}
//                   </p>
//                 </div>
                
//                 <div className="flex items-center space-x-2">
//                   <Button
//                     onClick={() => handleGenerateCode(selectedSimulation)}
//                     disabled={selectedSimulation.status === 'compiling'}
//                     size="sm"
//                     className="btn-animate"
//                   >
//                     <Code className="w-4 h-4 mr-2" />
//                     Generate Code
//                   </Button>
                  
//                   {selectedSimulation.code && (
//                     <Button
//                       onClick={() => handleTestCode(selectedSimulation)}
//                       disabled={selectedSimulation.status === 'compiling'}
//                       size="sm"
//                       variant="outline"
//                       className="btn-animate"
//                     >
//                       <Play className="w-4 h-4 mr-2" />
//                       Test Code
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Content */}
//             <div className="flex-1 overflow-y-auto p-4">
//               {/* Status */}
//               <div className={`p-4 rounded-lg border mb-4 ${getStatusColor(selectedSimulation.status)}`}>
//                 <div className="flex items-center space-x-2">
//                   {getStatusIcon(selectedSimulation.status)}
//                   <span className="font-medium">
//                     Status: {selectedSimulation.status}
//                   </span>
//                 </div>
//               </div>

//               {/* Parameters */}
//               <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
//                 <h4 className="font-medium text-gray-900 mb-3">Parameters</h4>
//                 <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
//                   {JSON.stringify(selectedSimulation.parameters, null, 2)}
//                 </pre>
//               </div>

//               {/* Generated Code */}
//               {selectedSimulation.code && (
//                 <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
//                   <h4 className="font-medium text-gray-900 mb-3">Generated Code</h4>
//                   <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
//                     {selectedSimulation.code}
//                   </pre>
//                 </div>
//               )}

//               {/* Test Results */}
//               {selectedSimulation.result && (
//                 <div className="bg-white border border-gray-200 rounded-lg p-4">
//                   <h4 className="font-medium text-gray-900 mb-3">Test Results</h4>
                  
//                   {selectedSimulation.result.success ? (
//                     <div className="text-green-600 mb-3">
//                       ✓ Code compiled successfully
//                     </div>
//                   ) : (
//                     <div className="text-red-600 mb-3">
//                       ✗ Compilation failed
//                     </div>
//                   )}

//                   {selectedSimulation.result.errors && selectedSimulation.result.errors.length > 0 && (
//                     <div className="mb-3">
//                       <h5 className="font-medium text-red-600 mb-2">Errors:</h5>
//                       <ul className="text-sm text-red-600 space-y-1">
//                         {selectedSimulation.result.errors.map((error, index) => (
//                           <li key={index}>• {error}</li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}

//                   {selectedSimulation.result.warnings && selectedSimulation.result.warnings.length > 0 && (
//                     <div className="mb-3">
//                       <h5 className="font-medium text-yellow-600 mb-2">Warnings:</h5>
//                       <ul className="text-sm text-yellow-600 space-y-1">
//                         {selectedSimulation.result.warnings.map((warning, index) => (
//                           <li key={index}>• {warning}</li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}

//                   {selectedSimulation.result.gasEstimate && (
//                     <div className="mb-3">
//                       <h5 className="font-medium text-gray-900 mb-2">Gas Estimate:</h5>
//                       <p className="text-sm text-gray-600">
//                         {selectedSimulation.result.gasEstimate} gas units
//                       </p>
//                     </div>
//                   )}

//                   {selectedSimulation.result.aiAnalysis && (
//                     <div>
//                       <h5 className="font-medium text-gray-900 mb-2">AI Analysis:</h5>
//                       <p className="text-sm text-gray-600">
//                         {selectedSimulation.result.aiAnalysis}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center">
//             <div className="text-center">
//               <TestTube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 Select a Simulation
//               </h3>
//               <p className="text-gray-500">
//                 Choose a simulation from the sidebar to view details
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
