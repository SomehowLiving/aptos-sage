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
  Trash2
} from 'lucide-react';
import { SandboxSimulation } from '@/types';

export function SandboxView() {
  const { simulations, addSimulation, updateSimulation, removeSimulation } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<SandboxSimulation | null>(null);
  const { success, error: showError } = useToast();

  const handleCreateSimulation = async (type: 'token' | 'pool' | 'vault') => {
    setIsCreating(true);
    try {
      // Create mock parameters based on type
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

      const simulation = await sandboxService.createSimulation(type, mockParameters[type]);
      addSimulation(simulation);
      setSelectedSimulation(simulation);
      success('Simulation Created', `New ${type} simulation created successfully`);
    } catch (error) {
      showError('Creation Failed', 'Failed to create simulation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateCode = async (simulation: SandboxSimulation) => {
    try {
      updateSimulation(simulation.id, { status: 'compiling' });
      const code = await sandboxService.generateCode(simulation.id);
      updateSimulation(simulation.id, { code, status: 'success' });
      success('Code Generated', 'Move code generated successfully');
    } catch (error) {
      updateSimulation(simulation.id, { status: 'error' });
      showError('Generation Failed', 'Failed to generate code');
    }
  };

  const handleTestCode = async (simulation: SandboxSimulation) => {
    try {
      updateSimulation(simulation.id, { status: 'compiling' });
      const result = await sandboxService.testCode(simulation.id);
      updateSimulation(simulation.id, result);
      success('Test Completed', 'Code testing completed');
    } catch (error) {
      updateSimulation(simulation.id, { status: 'error' });
      showError('Test Failed', 'Failed to test code');
    }
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
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sandbox</h2>
            <Button
              onClick={() => handleCreateSimulation('token')}
              disabled={isCreating}
              size="sm"
              className="btn-animate"
            >
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={() => handleCreateSimulation('token')}
              disabled={isCreating}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Token Simulation
            </Button>
            <Button
              onClick={() => handleCreateSimulation('pool')}
              disabled={isCreating}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Pool Simulation
            </Button>
            <Button
              onClick={() => handleCreateSimulation('vault')}
              disabled={isCreating}
              variant="outline"
              size="sm"
              className="w-full justify-start"
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
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSimulation?.id === simulation.id
                      ? 'bg-blue-50 border-blue-200'
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
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {simulation.createdAt.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedSimulation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedSimulation.type.charAt(0).toUpperCase() + selectedSimulation.type.slice(1)} Simulation
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created {selectedSimulation.createdAt.toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleGenerateCode(selectedSimulation)}
                    disabled={selectedSimulation.status === 'compiling'}
                    size="sm"
                    className="btn-animate"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Generate Code
                  </Button>
                  
                  {selectedSimulation.code && (
                    <Button
                      onClick={() => handleTestCode(selectedSimulation)}
                      disabled={selectedSimulation.status === 'compiling'}
                      size="sm"
                      variant="outline"
                      className="btn-animate"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Test Code
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Status */}
              <div className={`p-4 rounded-lg border mb-4 ${getStatusColor(selectedSimulation.status)}`}>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedSimulation.status)}
                  <span className="font-medium">
                    Status: {selectedSimulation.status}
                  </span>
                </div>
              </div>

              {/* Parameters */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Parameters</h4>
                <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
                  {JSON.stringify(selectedSimulation.parameters, null, 2)}
                </pre>
              </div>

              {/* Generated Code */}
              {selectedSimulation.code && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Generated Code</h4>
                  <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
                    {selectedSimulation.code}
                  </pre>
                </div>
              )}

              {/* Test Results */}
              {selectedSimulation.result && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Test Results</h4>
                  
                  {selectedSimulation.result.success ? (
                    <div className="text-green-600 mb-3">
                      ✓ Code compiled successfully
                    </div>
                  ) : (
                    <div className="text-red-600 mb-3">
                      ✗ Compilation failed
                    </div>
                  )}

                  {selectedSimulation.result.errors && selectedSimulation.result.errors.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-red-600 mb-2">Errors:</h5>
                      <ul className="text-sm text-red-600 space-y-1">
                        {selectedSimulation.result.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedSimulation.result.warnings && selectedSimulation.result.warnings.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-yellow-600 mb-2">Warnings:</h5>
                      <ul className="text-sm text-yellow-600 space-y-1">
                        {selectedSimulation.result.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedSimulation.result.gasEstimate && (
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-900 mb-2">Gas Estimate:</h5>
                      <p className="text-sm text-gray-600">
                        {selectedSimulation.result.gasEstimate} gas units
                      </p>
                    </div>
                  )}

                  {selectedSimulation.result.aiAnalysis && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">AI Analysis:</h5>
                      <p className="text-sm text-gray-600">
                        {selectedSimulation.result.aiAnalysis}
                      </p>
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
                Select a Simulation
              </h3>
              <p className="text-gray-500">
                Choose a simulation from the sidebar to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
