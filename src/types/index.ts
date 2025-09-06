// Core application types
export interface User {
  id: string;
  address: string;
  nickname?: string;
  reputation: number;
  createdAt: Date;
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  contractAddress: string;
  creator: string;
  createdAt: Date;
  iconUri?: string;
  projectUri?: string;
}

export interface Pool {
  id: string;
  name: string;
  tokenA: Token;
  tokenB: Token;
  liquidity: string;
  fee: number;
  contractAddress: string;
  creator: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Vault {
  id: string;
  name: string;
  token: Token;
  totalValue: string;
  apy: number;
  contractAddress: string;
  creator: string;
  createdAt: Date;
  isActive: boolean;
}

// Chat and AI types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: 'create_token' | 'create_pool' | 'create_vault' | 'query';
    parameters?: Record<string, any>;
    code?: string;
    transactionHash?: string;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// AI Assistant types
export interface AIResponse {
  message: string;
  action?: 'create_token' | 'create_pool' | 'create_vault' | 'query';
  parameters?: Record<string, any>;
  code?: string;
  suggestions?: string[];
  confidence: number;
}

export interface TokenParameters {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  iconUri?: string;
  projectUri?: string;
}

export interface PoolParameters {
  name: string;
  tokenA: string;
  tokenB: string;
  fee: number;
  initialLiquidityA: string;
  initialLiquidityB: string;
}

export interface VaultParameters {
  name: string;
  token: string;
  strategy: string;
  fee: number;
  minDeposit: string;
}

// Sandbox types
export interface SandboxSimulation {
  id: string;
  type: 'token' | 'pool' | 'vault';
  parameters: TokenParameters | PoolParameters | VaultParameters;
  code: string;
  status: 'pending' | 'compiling' | 'success' | 'error';
  result?: {
    success: boolean;
    errors?: string[];
    warnings?: string[];
    gasEstimate?: string;
    aiAnalysis?: string;
  };
  createdAt: Date;
}

// Transaction types
export interface Transaction {
  hash: string;
  type: 'deploy' | 'mint' | 'transfer' | 'create_pool' | 'deposit' | 'withdraw';
  status: 'pending' | 'success' | 'failed';
  from: string;
  to?: string;
  amount?: string;
  token?: string;
  gasUsed?: string;
  timestamp: Date;
}

// Wallet types
export interface WalletState {
  connected: boolean;
  address?: string;
  balance?: string;
  network?: string;
}

// UI State types
export interface AppState {
  currentView: 'chat' | 'dashboard' | 'sandbox' | 'pools' | 'tokens';
  selectedToken?: Token;
  selectedPool?: Pool;
  selectedVault?: Vault;
  isLoading: boolean;
  error?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// OpenRouter API types
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
