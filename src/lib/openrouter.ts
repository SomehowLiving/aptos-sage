import { OpenRouterMessage, OpenRouterResponse } from '@/types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

export class OpenRouterService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = OPENROUTER_API_KEY || '';
    this.baseURL = OPENROUTER_BASE_URL;
  }

  private async makeRequest(messages: OpenRouterMessage[], model: string = 'qwen/qwen-2.5-coder-32b-instruct:free') {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Aptos Assistant DeFi',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    return response.json() as Promise<OpenRouterResponse>;
  }

  // Main chat function for DeFi assistant
  async chatWithAssistant(userMessage: string, conversationHistory: OpenRouterMessage[] = []) {
    const systemPrompt = `You are an expert Aptos DeFi assistant helping users create tokens, liquidity pools, and yield vaults through natural language.

IMPORTANT GUIDELINES:
1. You specialize in Aptos blockchain DeFi operations
2. Help users create tokens, pools, and vaults using Move smart contracts
3. Ask clarifying questions ONE AT A TIME to gather required parameters
4. Explain technical concepts in simple, friendly language
5. Provide step-by-step guidance for complex operations
6. If user asks about other blockchains, politely redirect to Aptos

CONVERSATION STYLE:
- Be friendly and encouraging
- Use emojis sparingly for engagement
- Break complex concepts into simple terms
- Confirm understanding before proceeding
- Provide actionable next steps

AVAILABLE OPERATIONS:
- Token Creation: name, symbol, decimals, total supply, icon URI, project URI
- Pool Creation: name, token A, token B, fee percentage, initial liquidity
- Vault Creation: name, token, strategy, fee, minimum deposit
- Portfolio queries and balance checks

Always ask for missing parameters and explain what each parameter means.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }

  // Generate Move code for token creation
  async generateTokenCode(parameters: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    iconUri?: string;
    projectUri?: string;
  }) {
    const systemPrompt = `You are an expert Move developer specializing in Aptos fungible assets. Generate clean, secure Move code for token creation.

REQUIREMENTS:
1. Use the latest Aptos fungible asset framework
2. Include proper error handling and validation
3. Follow Move language best practices
4. Generate only the token creation function
5. Use the provided parameters exactly as given

PARAMETERS PROVIDED:
- Name: ${parameters.name}
- Symbol: ${parameters.symbol}
- Decimals: ${parameters.decimals}
- Total Supply: ${parameters.totalSupply}
- Icon URI: ${parameters.iconUri || 'Not provided'}
- Project URI: ${parameters.projectUri || 'Not provided'}

Generate the Move code for creating this token.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Generate Move code for creating a token with these parameters: ${JSON.stringify(parameters)}` 
      }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }

  // Generate Move code for pool creation
  async generatePoolCode(parameters: {
    name: string;
    tokenA: string;
    tokenB: string;
    fee: number;
    initialLiquidityA: string;
    initialLiquidityB: string;
  }) {
    const systemPrompt = `You are an expert Move developer specializing in Aptos liquidity pools. Generate clean, secure Move code for pool creation.

REQUIREMENTS:
1. Use the latest Aptos liquidity pool framework
2. Include proper error handling and validation
3. Follow Move language best practices
4. Generate only the pool creation function
5. Use the provided parameters exactly as given

PARAMETERS PROVIDED:
- Name: ${parameters.name}
- Token A: ${parameters.tokenA}
- Token B: ${parameters.tokenB}
- Fee: ${parameters.fee}%
- Initial Liquidity A: ${parameters.initialLiquidityA}
- Initial Liquidity B: ${parameters.initialLiquidityB}

Generate the Move code for creating this liquidity pool.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Generate Move code for creating a liquidity pool with these parameters: ${JSON.stringify(parameters)}` 
      }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }

  // Generate Move code for vault creation
  async generateVaultCode(parameters: {
    name: string;
    token: string;
    strategy: string;
    fee: number;
    minDeposit: string;
  }) {
    const systemPrompt = `You are an expert Move developer specializing in Aptos yield vaults. Generate clean, secure Move code for vault creation.

REQUIREMENTS:
1. Use the latest Aptos yield vault framework
2. Include proper error handling and validation
3. Follow Move language best practices
4. Generate only the vault creation function
5. Use the provided parameters exactly as given

PARAMETERS PROVIDED:
- Name: ${parameters.name}
- Token: ${parameters.token}
- Strategy: ${parameters.strategy}
- Fee: ${parameters.fee}%
- Minimum Deposit: ${parameters.minDeposit}

Generate the Move code for creating this yield vault.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Generate Move code for creating a yield vault with these parameters: ${JSON.stringify(parameters)}` 
      }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }

  // Analyze and review generated code
  async analyzeCode(code: string, type: 'token' | 'pool' | 'vault') {
    const systemPrompt = `You are a Move language expert and security auditor. Analyze this ${type} creation code for:

1. Syntax errors and compilation issues
2. Security vulnerabilities
3. Best practices compliance
4. Gas optimization opportunities
5. Error handling completeness

Provide specific, actionable feedback in a user-friendly format.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Please analyze this Move code for ${type} creation:\n\n${code}` 
      }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }

  // Explain DeFi concepts
  async explainConcept(concept: string) {
    const systemPrompt = `You are a DeFi educator specializing in Aptos blockchain. Explain complex DeFi concepts in simple, beginner-friendly terms.

REQUIREMENTS:
1. Use simple language and analogies
2. Provide practical examples
3. Include relevant Aptos-specific information
4. Keep explanations concise but comprehensive
5. Use emojis sparingly for engagement`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Explain this DeFi concept: ${concept}` }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }

  // Provide DeFi recommendations
  async getRecommendations(userContext: string) {
    const systemPrompt = `You are a DeFi strategist and advisor. Provide personalized recommendations based on user context.

REQUIREMENTS:
1. Consider risk tolerance and experience level
2. Provide Aptos-specific recommendations
3. Include both opportunities and warnings
4. Suggest concrete next steps
5. Be objective and educational`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Provide DeFi recommendations for: ${userContext}` }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }
}

export const openRouterService = new OpenRouterService();
