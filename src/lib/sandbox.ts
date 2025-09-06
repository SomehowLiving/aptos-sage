import { SandboxSimulation, TokenParameters, PoolParameters, VaultParameters } from '@/types';
import { openRouterService } from './openrouter';

export class SandboxService {
  private simulations: Map<string, SandboxSimulation> = new Map();

  // Create a new simulation
  async createSimulation(
    type: 'token' | 'pool' | 'vault',
    parameters: TokenParameters | PoolParameters | VaultParameters
  ): Promise<SandboxSimulation> {
    const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const simulation: SandboxSimulation = {
      id: simulationId,
      type,
      parameters,
      code: '',
      status: 'pending',
      createdAt: new Date(),
    };

    this.simulations.set(simulationId, simulation);
    return simulation;
  }

  // Generate code for simulation
  async generateCode(simulationId: string): Promise<string> {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) {
      throw new Error('Simulation not found');
    }

    simulation.status = 'compiling';

    try {
      let code: string;

      switch (simulation.type) {
        case 'token':
          code = await openRouterService.generateTokenCode(simulation.parameters as TokenParameters);
          break;
        case 'pool':
          code = await openRouterService.generatePoolCode(simulation.parameters as PoolParameters);
          break;
        case 'vault':
          code = await openRouterService.generateVaultCode(simulation.parameters as VaultParameters);
          break;
        default:
          throw new Error('Invalid simulation type');
      }

      simulation.code = code;
      return code;
    } catch (error) {
      simulation.status = 'error';
      simulation.result = {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      };
      throw error;
    }
  }

  // Test the generated code
  async testCode(simulationId: string): Promise<SandboxSimulation> {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) {
      throw new Error('Simulation not found');
    }

    if (!simulation.code) {
      throw new Error('No code generated for simulation');
    }

    simulation.status = 'compiling';

    try {
      // Simulate compilation and testing
      const testResult = await this.simulateCompilation(simulation.code, simulation.type);
      
      // Get AI analysis of the code
      const aiAnalysis = await openRouterService.analyzeCode(simulation.code, simulation.type);

      simulation.result = {
        success: testResult.success,
        errors: testResult.errors,
        warnings: testResult.warnings,
        gasEstimate: testResult.gasEstimate,
        aiAnalysis,
      };

      simulation.status = testResult.success ? 'success' : 'error';
    } catch (error) {
      simulation.status = 'error';
      simulation.result = {
        success: false,
        errors: [error instanceof Error ? error.message : 'Testing failed'],
      };
    }

    return simulation;
  }

  // Simulate compilation (mock implementation)
  private async simulateCompilation(code: string, type: string) {
    // In a real implementation, this would use Aptos CLI or Move compiler
    // For now, we'll simulate based on common patterns
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic syntax checks
    if (!code.includes('module')) {
      errors.push('Missing module declaration');
    }
    
    if (!code.includes('public entry fun')) {
      errors.push('Missing public entry function');
    }
    
    if (type === 'token' && !code.includes('fungible_asset')) {
      errors.push('Token code should use fungible_asset framework');
    }
    
    if (type === 'pool' && !code.includes('liquidity')) {
      errors.push('Pool code should include liquidity management');
    }
    
    if (type === 'vault' && !code.includes('yield')) {
      errors.push('Vault code should include yield strategy');
    }
    
    // Check for common security issues
    if (code.includes('assert!') && !code.includes('error::')) {
      warnings.push('Consider using proper error codes with assertions');
    }
    
    if (!code.includes('signer::address_of')) {
      warnings.push('Consider validating signer address');
    }
    
    // Estimate gas (mock)
    const gasEstimate = this.estimateGas(code, type);
    
    return {
      success: errors.length === 0,
      errors,
      warnings,
      gasEstimate,
    };
  }

  // Estimate gas usage (mock implementation)
  private estimateGas(code: string, type: string): string {
    // In a real implementation, this would use Aptos gas estimation
    const baseGas = 1000;
    const complexityMultiplier = code.length / 1000;
    const typeMultiplier = type === 'token' ? 1 : type === 'pool' ? 1.5 : 2;
    
    const estimatedGas = Math.round(baseGas * complexityMultiplier * typeMultiplier);
    return estimatedGas.toString();
  }

  // Get simulation by ID
  getSimulation(simulationId: string): SandboxSimulation | undefined {
    return this.simulations.get(simulationId);
  }

  // Get all simulations
  getAllSimulations(): SandboxSimulation[] {
    return Array.from(this.simulations.values());
  }

  // Delete simulation
  deleteSimulation(simulationId: string): boolean {
    return this.simulations.delete(simulationId);
  }

  // Clear all simulations
  clearAllSimulations(): void {
    this.simulations.clear();
  }

  // Validate parameters
  validateParameters(type: 'token' | 'pool' | 'vault', parameters: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (type) {
      case 'token':
        const tokenParams = parameters as TokenParameters;
        if (!tokenParams.name || tokenParams.name.length < 1) {
          errors.push('Token name is required');
        }
        if (!tokenParams.symbol || tokenParams.symbol.length < 1 || tokenParams.symbol.length > 10) {
          errors.push('Token symbol must be 1-10 characters');
        }
        if (tokenParams.decimals < 0 || tokenParams.decimals > 18) {
          errors.push('Decimals must be between 0 and 18');
        }
        if (!tokenParams.totalSupply || parseFloat(tokenParams.totalSupply) <= 0) {
          errors.push('Total supply must be greater than 0');
        }
        break;

      case 'pool':
        const poolParams = parameters as PoolParameters;
        if (!poolParams.name || poolParams.name.length < 1) {
          errors.push('Pool name is required');
        }
        if (!poolParams.tokenA || !poolParams.tokenB) {
          errors.push('Both tokens are required');
        }
        if (poolParams.tokenA === poolParams.tokenB) {
          errors.push('Token A and Token B must be different');
        }
        if (poolParams.fee < 0 || poolParams.fee > 100) {
          errors.push('Fee must be between 0 and 100');
        }
        if (!poolParams.initialLiquidityA || parseFloat(poolParams.initialLiquidityA) <= 0) {
          errors.push('Initial liquidity A must be greater than 0');
        }
        if (!poolParams.initialLiquidityB || parseFloat(poolParams.initialLiquidityB) <= 0) {
          errors.push('Initial liquidity B must be greater than 0');
        }
        break;

      case 'vault':
        const vaultParams = parameters as VaultParameters;
        if (!vaultParams.name || vaultParams.name.length < 1) {
          errors.push('Vault name is required');
        }
        if (!vaultParams.token) {
          errors.push('Token is required');
        }
        if (!vaultParams.strategy || vaultParams.strategy.length < 1) {
          errors.push('Strategy is required');
        }
        if (vaultParams.fee < 0 || vaultParams.fee > 100) {
          errors.push('Fee must be between 0 and 100');
        }
        if (!vaultParams.minDeposit || parseFloat(vaultParams.minDeposit) <= 0) {
          errors.push('Minimum deposit must be greater than 0');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const sandboxService = new SandboxService();
