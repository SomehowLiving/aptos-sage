import { Sandbox } from '@e2b/sdk';
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

  // Test the generated code using an E2B sandbox
  async testCode(simulationId: string): Promise<SandboxSimulation> {
    const simulation = this.simulations.get(simulationId);
    if (!simulation) {
      throw new Error('Simulation not found');
    }

    if (!simulation.code) {
      throw new Error('No code generated for simulation');
    }

    simulation.status = 'compiling';
    this.simulations.set(simulationId, simulation);

    let sandbox: Sandbox | undefined;
    try {
      if (!process.env.E2B_API_KEY) {
        throw new Error('E2B_API_KEY is not set in environment variables.');
      }

      sandbox = await Sandbox.create({ 
        template: 'base',
        apiKey: process.env.E2B_API_KEY,
      });

      // Install Aptos CLI
      const installProc = await sandbox.process.start('curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3');
      await installProc.wait;
      
      const aptosCliPath = '/root/.local/bin/aptos';

      // Create Move.toml for the project
      const moveTomlContent = `
[package]
name = "SandboxProject"
version = "1.0.0"
authors = []

[addresses]
ProjectAddress = "0x1"
`;
      await sandbox.filesystem.write('/home/user/Move.toml', moveTomlContent);

      // Create sources directory and write the generated code
      await sandbox.filesystem.makeDir('/home/user/sources');
      await sandbox.filesystem.write('/home/user/sources/main.move', simulation.code);
      
      // Compile the code inside the sandbox
      const compileProc = await sandbox.process.start(
        `${aptosCliPath} move compile`,
        { cwd: '/home/user' }
      );
      const output = await compileProc.wait;

      const success = output.exitCode === 0;
      const errors = !success ? output.stderr.split('\n').filter(line => line.trim() !== '') : [];
      const warnings = success ? output.stdout.split('\n').filter(line => line.trim() !== '' && line.toLowerCase().includes('warning')) : [];

      // Get AI analysis of the code
      const aiAnalysis = await openRouterService.analyzeCode(simulation.code, simulation.type);

      simulation.result = {
        success,
        errors,
        warnings,
        gasEstimate: 'Compilation check only',
        aiAnalysis,
      };
      simulation.status = success ? 'success' : 'error';

    } catch (error) {
      simulation.status = 'error';
      simulation.result = {
        success: false,
        errors: [error instanceof Error ? error.message : 'An unknown error occurred during sandbox execution.'],
      };
    } finally {
      if (sandbox) {
        await sandbox.close();
      }
    }
    
    this.simulations.set(simulationId, simulation);
    return simulation;
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
