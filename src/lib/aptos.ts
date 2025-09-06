import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { 
  Account, 
  Ed25519PrivateKey, 
  Ed25519PublicKey 
} from '@aptos-labs/ts-sdk';

// Aptos configuration
const APTOS_NETWORK = (process.env.NEXT_PUBLIC_APTOS_NETWORK as Network) || Network.TESTNET;

const config = new AptosConfig({ 
  network: APTOS_NETWORK,
  fullnode: process.env.NEXT_PUBLIC_APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com'
});

export const aptos = new Aptos(config);

// Smart contract addresses
export const CONTRACT_ADDRESSES = {
  TOKEN: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x1234567890abcdef',
  POOL: process.env.NEXT_PUBLIC_POOL_CONTRACT_ADDRESS || '0x1234567890abcdef',
  VAULT: process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS || '0x1234567890abcdef',
};

// Helper functions for smart contract interactions
export class AptosContractService {
  private aptos: Aptos;

  constructor() {
    this.aptos = aptos;
  }

  // Token creation
  async createToken(
    account: Account,
    parameters: {
      name: string;
      symbol: string;
      decimals: number;
      initialSupply: string;
      iconUri?: string;
      projectUri?: string;
    }
  ) {
    const { name, symbol, decimals, initialSupply, iconUri, projectUri } = parameters;

    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESSES.TOKEN}::token::create_token`,
        typeArguments: [],
        functionArguments: [
          Buffer.from(name, 'utf8'),
          Buffer.from(symbol, 'utf8'),
          decimals,
          BigInt(initialSupply),
          Buffer.from(iconUri || '', 'utf8'),
          Buffer.from(projectUri || '', 'utf8'),
        ],
      },
    });

    return await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });
  }

  // Pool creation
  async createPool(
    account: Account,
    parameters: {
      name: string;
      tokenA: string;
      tokenB: string;
      fee: number;
      initialLiquidityA: string;
      initialLiquidityB: string;
    }
  ) {
    const { name, tokenA, tokenB, fee, initialLiquidityA, initialLiquidityB } = parameters;

    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESSES.POOL}::liquidity_pool::create_pool`,
        typeArguments: [tokenA, tokenB],
        functionArguments: [
          Buffer.from(name, 'utf8'),
          fee,
          BigInt(initialLiquidityA),
          BigInt(initialLiquidityB),
        ],
      },
    });

    return await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });
  }

  // Vault creation
  async createVault(
    account: Account,
    parameters: {
      name: string;
      token: string;
      strategy: string;
      fee: number;
      minDeposit: string;
    }
  ) {
    const { name, token, strategy, fee, minDeposit } = parameters;

    const transaction = await this.aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESSES.VAULT}::yield_vault::create_vault`,
        typeArguments: [token],
        functionArguments: [
          Buffer.from(name, 'utf8'),
          Buffer.from(strategy, 'utf8'),
          fee,
          BigInt(minDeposit),
        ],
      },
    });

    return await this.aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });
  }

  // Get account balance
  async getAccountBalance(accountAddress: string, tokenType?: string) {
    try {
      if (tokenType) {
        // Get specific token balance
        const resources = await this.aptos.getAccountResources({
          accountAddress,
        });
        
        // Find the fungible asset store for the specific token
        const store = resources.find(resource => 
          resource.type.includes('PrimaryFungibleStore') && 
          resource.type.includes(tokenType)
        );
        
        return store ? (store.data as any).balance : '0';
      } else {
        // Get APT balance
        const balance = await this.aptos.getAccountAPTAmount({
          accountAddress,
        });
        return balance.toString();
      }
    } catch (error) {
      console.error('Error getting account balance:', error);
      return '0';
    }
  }

  // Get transaction status
  async getTransactionStatus(transactionHash: string) {
    try {
      const transaction = await this.aptos.getTransactionByHash({
        transactionHash,
      });
      return transaction;
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return null;
    }
  }

  // Estimate gas for transaction
  async estimateGas(transaction: any) {
    try {
      const gasEstimate = await this.aptos.estimateGasPrice();
      return gasEstimate;
    } catch (error) {
      console.error('Error estimating gas:', error);
      return null;
    }
  }
}

export const contractService = new AptosContractService();

// Utility functions
// export const formatAddress = (address: string) => {
//   if (!address) return '';
//   return `${address.slice(0, 6)}...${address.slice(-4)}`;
// };
export const formatAddress = (address: unknown) => {
  if (!address) return '';

  // Ensure it's a string
  const addr = typeof address === 'string' ? address : String(address);

  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const formatBalance = (balance: string, decimals: number = 8) => {
  const num = parseFloat(balance) / Math.pow(10, decimals);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};

export const parseBalance = (balance: string, decimals: number = 8) => {
  const num = parseFloat(balance);
  return (num * Math.pow(10, decimals)).toString();
};
