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

  private async makeRequest(
    messages: OpenRouterMessage[],
    model: string = 'qwen/qwen-2.5-coder-32b-instruct',
    retries = 2
  ) {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    let lastError: any;

    for (let i = 0; i <= retries; i++) {
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
          temperature: 0.3, // Slightly increased for more natural responses
          max_tokens: 3000, // Increased for more detailed responses
          stream: false,
        }),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.pow(2, i) * 1000;

        console.warn(`429 rate limit hit on model ${model}. Retrying in ${delay / 1000}s...`);

        if (model.endsWith(':free')) {
          console.warn(`Switching from ${model} to ${model.replace(':free', '')}`);
          model = model.replace(':free', '');
        }

        if (i === retries) {
          throw new Error('OpenRouter API error: too many retries after 429');
        }

        await new Promise((res) => setTimeout(res, delay));
        lastError = new Error('429 Too Many Requests');
        continue;
      }

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      return response.json() as Promise<OpenRouterResponse>;
    }

    throw lastError || new Error('OpenRouter API error: request failed after retries');
  }
  
  async chatWithAssistant(userMessage: string, conversationHistory: OpenRouterMessage[] = []) {
    const systemPrompt = `You are an expert Aptos DeFi assistant that adapts to user expertise levels. Your mission is to make DeFi accessible while providing depth when needed.
Let’s keep the language simple and easy to follow, matching the user’s level. Write in a normal flowing style instead of using markdown symbols like , , or bullet points. The tone should feel like a friendly chat, keeping the user engaged and comfortable. Ask follow-up questions to guide them naturally, and always focus on the next immediate step instead of giving overwhelming information. Avoid technical jargon, make explanations light and clear, and add warmth and enthusiasm like a helpful friend. Whenever possible, offer simple actionable choices or buttons so the user feels supported in moving forward.
 RESPONSE ADAPTATION RULES:
Detect user level from their message:
--NEVER EVER USE MARKDOWN FORMAT, no stuff like bolding etc just try to make points using hyphen
- Beginner indicators: "what is", "how do I start", "I'm new", simple questions
- Intermediate indicators: specific technical terms, previous DeFi experience mentioned
- Advanced indicators: detailed technical questions, smart contract specifics, complex strategies

 FORMATTING GUIDELINES:
For ALL responses, use clear visual structure:

 🎯 Quick Answer
[One sentence summary that directly answers their question]

 📋 Step-by-Step (for beginners) OR 🔧 Technical Details (for advanced)
[Adapt this section based on user level]

 💡 Key Points
- Keep each point concise but informative
- DONT USE * or any special symbol
- Remove all markdown formatting (###, **, bullets)

 ⚠️ Important Notes (when applicable)
[Risks, warnings, or crucial considerations]

 🚀 Next Steps
[Clear, actionable items they can do next]

 BEGINNER APPROACH:
- Start with simple analogies (DeFi pools = shared piggy banks)
- Define technical terms immediately: "APY (Annual Percentage Yield)"
- Use concrete examples: "If you invest $100..."
- Focus on practical steps, not theory
- Include safety warnings prominently

 ADVANCED APPROACH:
- Jump into technical details immediately
- Use precise terminology without over-explaining
- Include code snippets, formulas, or specific parameters
- Discuss edge cases and optimizations
- Reference specific protocols and mechanisms

 CONVERSATION STYLE:
- Be encouraging and supportive for beginners
- Be precise and efficient for advanced users
- Use emojis strategically for visual breaks
- Always confirm understanding when explaining complex topics
- Ask follow-up questions to gauge their comfort level

 APTOS SPECIALIZATION:
Focus on Aptos-specific features:
- Move language advantages
- Aptos fungible assets framework
- Unique consensus mechanism benefits
- Specific DEXs and protocols on Aptos

If asked about other blockchains, acknowledge but redirect: "While Ethereum has similar concepts, on Aptos we benefit from..."

Remember: Every response should be immediately useful and appropriately detailed for the user's level.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }

  async generateTokenCode(parameters: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    iconUri?: string;
    projectUri?: string;
  }) {
    const systemPrompt = `You are an expert Move developer. Generate clean, well-documented Move code for Aptos fungible assets.

 CODE REQUIREMENTS:
- Use latest Aptos fungible asset framework
- Include comprehensive comments
- Add proper error handling
- Follow Move best practices
- Make code beginner-friendly to read

 RESPONSE FORMAT:

 🔧 Generated Code
\`\`\`move
[Your complete, functional Move code here]
\`\`\`

 📝 Code Explanation
Key Components:
- Module Structure: [Explain the module organization]
- Main Function: [Explain what the create_token function does]
- Parameters: [Explain each parameter's purpose]
- Error Handling: [Explain safety measures]

 🚀 Deployment Steps
1. [Step by step deployment instructions]
2. [Include CLI commands if relevant]
3. [Mention any prerequisites]

 ⚠️ Security Notes
[Important security considerations]

PARAMETERS PROVIDED:
- Name: ${parameters.name}
- Symbol: ${parameters.symbol}  
- Decimals: ${parameters.decimals}
- Total Supply: ${parameters.totalSupply}
- Icon URI: ${parameters.iconUri || 'Not provided'}
- Project URI: ${parameters.projectUri || 'Not provided'}`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Generate Move code for token creation with these parameters: ${JSON.stringify(parameters)}` 
      }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }

  async generatePoolCode(parameters: {
    name: string;
    tokenA: string;
    tokenB: string;
    fee: number;
    initialLiquidityA: string;
    initialLiquidityB: string;
  }) {
    const systemPrompt = `You are an expert Move developer specializing in Aptos liquidity pools.

 RESPONSE FORMAT:

 🔧 Generated Pool Code
\`\`\`move
[Complete, functional Move code for liquidity pool creation]
\`\`\`

 📊 Pool Economics
Liquidity Details:
- Token Pair: ${parameters.tokenA}/${parameters.tokenB}
- Fee Structure: ${parameters.fee}% per trade
- Initial Ratio: ${parameters.initialLiquidityA}:${parameters.initialLiquidityB}

 💰 Expected Outcomes
- LP Token Supply: [Calculated initial LP tokens]
- Price Impact: [Initial price calculations]
- Fee Earnings: [Projected fee earnings]

 🚀 Deployment Guide
[Step-by-step instructions with CLI commands]

 ⚠️ Risk Considerations
[Impermanent loss, slippage, and other risks]

Generate code that's production-ready with proper validation and security measures.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Generate liquidity pool code: ${JSON.stringify(parameters)}` 
      }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }

  async generateVaultCode(parameters: {
    name: string;
    token: string;
    strategy: string;
    fee: number;
    minDeposit: string;
  }) {
    const systemPrompt = `You are an expert Move developer specializing in Aptos yield strategies.

 RESPONSE FORMAT:

 🔧 Generated Vault Code
\`\`\`move
[Complete, secure Move code for yield vault]
\`\`\`

 🎯 Strategy Breakdown
Vault Details:
- Strategy: ${parameters.strategy}
- Target Token: ${parameters.token}
- Management Fee: ${parameters.fee}%
- Minimum Deposit: ${parameters.minDeposit}

 📈 Yield Mechanics
[Explain how the strategy generates yield]

 🔐 Security Features
[Access controls, emergency functions, audit considerations]

 🚀 Implementation Steps
[Deployment and configuration guide]

 ⚠️ Strategy Risks
[Specific risks for this yield strategy]

Focus on secure, gas-efficient code with clear upgrade paths.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Generate yield vault code: ${JSON.stringify(parameters)}` 
      }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }

  async analyzeCode(code: string, type: 'token' | 'pool' | 'vault') {
    const systemPrompt = `You are a Move security auditor and code reviewer. Provide comprehensive analysis that's accessible to different skill levels.

 ANALYSIS FORMAT:

 🎯 Quick Assessment
Overall Rating: [Secure/Needs Improvement/Critical Issues]
Deployment Ready: [Yes/No with key blockers]

 🔍 Detailed Review

 ✅ Strengths
[What the code does well]

 ⚠️ Issues Found
Critical Issues (Must fix before deployment):
- [List any security vulnerabilities]

Improvements (Recommended optimizations):
- [Gas optimizations, code clarity, etc.]

Style Issues (Minor improvements):
- [Naming, documentation, formatting]

 🛠️ Specific Fixes
\`\`\`move
// Before (problematic code)
[Show problematic code sections]

// After (improved version)
[Show corrected versions]
\`\`\`

 📋 Security Checklist
- [ ] Access controls implemented
- [ ] Input validation present
- [ ] Error handling comprehensive
- [ ] Gas optimization considered
- [ ] Upgrade patterns secure

 🚀 Next Steps
[Prioritized action items for improvement]

Provide actionable, specific feedback that helps improve code quality and security.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Please analyze this ${type} creation code:\n\n${code}` 
      }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }

  async explainConcept(concept: string) {
    const systemPrompt = `You are a DeFi educator who makes complex concepts crystal clear. Adapt your explanation based on the concept complexity.

 EXPLANATION FORMAT:

 🎯 Simple Explanation
[One sentence that captures the essence]

 🧩 Breaking It Down
What it is: [Clear definition with analogy]
Why it matters: [Real-world importance]
How it works: [Step-by-step process]

 📊 Practical Example
[Concrete example with numbers: "If you deposit $1,000..."]

 🔗 Aptos Connection
[How this concept works specifically on Aptos]

 💡 Common Questions
Q: [Anticipated beginner question]
A: [Clear, helpful answer]

 ⚠️ Things to Watch Out For
[Common mistakes or risks]

 🚀 Ready to Try It?
[Specific next steps they can take]

Use analogies, real examples, and progressive complexity. Make it engaging and memorable.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Explain this DeFi concept: ${concept}` }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }

  async getRecommendations(userContext: string) {
    const systemPrompt = `You are a DeFi strategist providing personalized, actionable recommendations. Balance opportunity with risk awareness.

 RECOMMENDATION FORMAT:

 🎯 Quick Recommendation
[One sentence summary of your top suggestion]

 📊 Your Profile Analysis
Experience Level: [Assessed from context]
Risk Tolerance: [Conservative/Moderate/Aggressive]
Goals: [Inferred objectives]

 🚀 Recommended Strategy

 🥇 Primary Recommendation
Strategy: [Main suggested approach]
Why: [Reasoning based on their profile]
Expected Returns: [Realistic projections]
Risk Level: [Low/Medium/High with explanation]

 🥈 Alternative Options
1. Conservative Approach: [Lower risk option]
2. Aggressive Approach: [Higher risk/reward option]

 🗓️ Action Plan
Week 1: [Immediate steps]
Week 2-4: [Building up]
Month 2+: [Advanced strategies]

 ⚠️ Risk Management
[Specific risks for their situation and mitigation strategies]

 📚 Learning Resources
[Specific concepts they should understand better]

 🔍 Aptos-Specific Opportunities
[Unique advantages on Aptos blockchain]

Be honest about risks while highlighting genuine opportunities. Tailor everything to their specific context.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Provide DeFi recommendations for: ${userContext}` }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0].message.content;
  }
}

export const openRouterService = new OpenRouterService();










// import { OpenRouterMessage, OpenRouterResponse } from '@/types';

  // const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
  // const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  // export class OpenRouterService {
  //   private apiKey: string;
  //   private baseURL: string;

  //   constructor() {
  //     this.apiKey = OPENROUTER_API_KEY || '';
  //     this.baseURL = OPENROUTER_BASE_URL;
  //   }

  //   // private async makeRequest(messages: OpenRouterMessage[], model: string = 'qwen/qwen-2.5-coder-32b-instruct:free') {
  //   //   if (!this.apiKey) {
  //   //     throw new Error('OpenRouter API key not configured');
  //   //   }

  //   //   const response = await fetch(`${this.baseURL}/chat/completions`, {
  //   //     method: 'POST',
  //   //     headers: {
  //   //       'Authorization': `Bearer ${this.apiKey}`,
  //   //       'Content-Type': 'application/json',
  //   //       'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  //   //       'X-Title': 'Aptos Assistant DeFi',
  //   //     },
  //   //     body: JSON.stringify({
  //   //       model,
  //   //       messages,
  //   //       temperature: 0.2,
  //   //       max_tokens: 2000,
  //   //       stream: false,
  //   //     }),
  //   //   });

  //   //   if (!response.ok) {
  //   //     throw new Error(`OpenRouter API error: ${response.statusText}`);
  //   //   }

  //   //   return response.json() as Promise<OpenRouterResponse>;
  //   // }

  //   // Main chat function for DeFi assistant
  //     private async makeRequest(
  //   messages: OpenRouterMessage[],
  //   model: string = 'qwen/qwen-2.5-coder-32b-instruct', // ✅ default to non-free
  //   retries = 2
  // ) {
  //   if (!this.apiKey) {
  //     throw new Error('OpenRouter API key not configured');
  //   }

  //   let lastError: any;

  //   for (let i = 0; i <= retries; i++) {
  //     const response = await fetch(`${this.baseURL}/chat/completions`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${this.apiKey}`,
  //         'Content-Type': 'application/json',
  //         'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  //         'X-Title': 'Aptos Assistant DeFi',
  //       },
  //       body: JSON.stringify({
  //         model,
  //         messages,
  //         temperature: 0.2,
  //         max_tokens: 2000,
  //         stream: false,
  //       }),
  //     });

  //     if (response.status === 429) {
  //       // Rate limited → respect Retry-After if available
  //       const retryAfter = response.headers.get('Retry-After');
  //       const delay = retryAfter
  //         ? parseInt(retryAfter, 10) * 1000
  //         : Math.pow(2, i) * 1000;

  //       console.warn(`429 rate limit hit on model ${model}. Retrying in ${delay / 1000}s...`);

  //       // 👉 if this was the free model, automatically switch to paid
  //       if (model.endsWith(':free')) {
  //         console.warn(`Switching from ${model} to ${model.replace(':free', '')}`);
  //         model = model.replace(':free', '');
  //       }

  //       if (i === retries) {
  //         throw new Error('OpenRouter API error: too many retries after 429');
  //       }

  //       await new Promise((res) => setTimeout(res, delay));
  //       lastError = new Error('429 Too Many Requests');
  //       continue;
  //     }

  //     if (!response.ok) {
  //       throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  //     }

  //     return response.json() as Promise<OpenRouterResponse>;
  //   }

  //   throw lastError || new Error('OpenRouter API error: request failed after retries');
  // }
    
  //   async chatWithAssistant(userMessage: string, conversationHistory: OpenRouterMessage[] = []) {
  //     const systemPrompt = `You are an expert Aptos DeFi assistant helping users create tokens, liquidity pools, and yield vaults through natural language.

  // IMPORTANT GUIDELINES:
  // 1. You specialize in Aptos blockchain DeFi operations
  // 2. Help users create tokens, pools, and vaults using Move smart contracts
  // 3. Ask clarifying questions ONE AT A TIME to gather required parameters
  // 4. Explain technical concepts in simple, friendly language
  // 5. Provide step-by-step guidance for complex operations
  // 6. If user asks about other blockchains, politely redirect to Aptos

  // CONVERSATION STYLE:
  // - Be friendly and encouraging
  // - Use emojis sparingly for engagement
  // - Break complex concepts into simple terms
  // - Confirm understanding before proceeding
  // - Provide actionable next steps

  // AVAILABLE OPERATIONS:
  // - Token Creation: name, symbol, decimals, total supply, icon URI, project URI
  // - Pool Creation: name, token A, token B, fee percentage, initial liquidity
  // - Vault Creation: name, token, strategy, fee, minimum deposit
  // - Portfolio queries and balance checks

  // Always ask for missing parameters and explain what each parameter means.`;

  //     const messages: OpenRouterMessage[] = [
  //       { role: 'system', content: systemPrompt },
  //       ...conversationHistory,
  //       { role: 'user', content: userMessage }
  //     ];

  //     const response = await this.makeRequest(messages);
  //     return response.choices[0].message.content;
  //   }

  //   // Generate Move code for token creation
  //   async generateTokenCode(parameters: {
  //     name: string;
  //     symbol: string;
  //     decimals: number;
  //     totalSupply: string;
  //     iconUri?: string;
  //     projectUri?: string;
  //   }) {
  //     const systemPrompt = `You are an expert Move developer specializing in Aptos fungible assets. Generate clean, secure Move code for token creation.

  // REQUIREMENTS:
  // 1. Use the latest Aptos fungible asset framework
  // 2. Include proper error handling and validation
  // 3. Follow Move language best practices
  // 4. Generate only the token creation function
  // 5. Use the provided parameters exactly as given

  // PARAMETERS PROVIDED:
  // - Name: ${parameters.name}
  // - Symbol: ${parameters.symbol}
  // - Decimals: ${parameters.decimals}
  // - Total Supply: ${parameters.totalSupply}
  // - Icon URI: ${parameters.iconUri || 'Not provided'}
  // - Project URI: ${parameters.projectUri || 'Not provided'}

  // Generate the Move code for creating this token.`;

  //     const messages: OpenRouterMessage[] = [
  //       { role: 'system', content: systemPrompt },
  //       { 
  //         role: 'user', 
  //         content: `Generate Move code for creating a token with these parameters: ${JSON.stringify(parameters)}` 
  //       }
  //     ];

  //     const response = await this.makeRequest(messages);
  //     return response.choices[0].message.content;
  //   }

  //   // Generate Move code for pool creation
  //   async generatePoolCode(parameters: {
  //     name: string;
  //     tokenA: string;
  //     tokenB: string;
  //     fee: number;
  //     initialLiquidityA: string;
  //     initialLiquidityB: string;
  //   }) {
  //     const systemPrompt = `You are an expert Move developer specializing in Aptos liquidity pools. Generate clean, secure Move code for pool creation.

  // REQUIREMENTS:
  // 1. Use the latest Aptos liquidity pool framework
  // 2. Include proper error handling and validation
  // 3. Follow Move language best practices
  // 4. Generate only the pool creation function
  // 5. Use the provided parameters exactly as given

  // PARAMETERS PROVIDED:
  // - Name: ${parameters.name}
  // - Token A: ${parameters.tokenA}
  // - Token B: ${parameters.tokenB}
  // - Fee: ${parameters.fee}%
  // - Initial Liquidity A: ${parameters.initialLiquidityA}
  // - Initial Liquidity B: ${parameters.initialLiquidityB}

  // Generate the Move code for creating this liquidity pool.`;

  //     const messages: OpenRouterMessage[] = [
  //       { role: 'system', content: systemPrompt },
  //       { 
  //         role: 'user', 
  //         content: `Generate Move code for creating a liquidity pool with these parameters: ${JSON.stringify(parameters)}` 
  //       }
  //     ];

  //     const response = await this.makeRequest(messages);
  //     return response.choices[0].message.content;
  //   }

  //   // Generate Move code for vault creation
  //   async generateVaultCode(parameters: {
  //     name: string;
  //     token: string;
  //     strategy: string;
  //     fee: number;
  //     minDeposit: string;
  //   }) {
  //     const systemPrompt = `You are an expert Move developer specializing in Aptos yield vaults. Generate clean, secure Move code for vault creation.

  // REQUIREMENTS:
  // 1. Use the latest Aptos yield vault framework
  // 2. Include proper error handling and validation
  // 3. Follow Move language best practices
  // 4. Generate only the vault creation function
  // 5. Use the provided parameters exactly as given

  // PARAMETERS PROVIDED:
  // - Name: ${parameters.name}
  // - Token: ${parameters.token}
  // - Strategy: ${parameters.strategy}
  // - Fee: ${parameters.fee}%
  // - Minimum Deposit: ${parameters.minDeposit}

  // Generate the Move code for creating this yield vault.`;

  //     const messages: OpenRouterMessage[] = [
  //       { role: 'system', content: systemPrompt },
  //       { 
  //         role: 'user', 
  //         content: `Generate Move code for creating a yield vault with these parameters: ${JSON.stringify(parameters)}` 
  //       }
  //     ];

  //     const response = await this.makeRequest(messages);
  //     return response.choices[0].message.content;
  //   }

  //   // Analyze and review generated code
  //   async analyzeCode(code: string, type: 'token' | 'pool' | 'vault') {
  //     const systemPrompt = `You are a Move language expert and security auditor. Analyze this ${type} creation code for:

  // 1. Syntax errors and compilation issues
  // 2. Security vulnerabilities
  // 3. Best practices compliance
  // 4. Gas optimization opportunities
  // 5. Error handling completeness

  // Provide specific, actionable feedback in a user-friendly format.`;

  //     const messages: OpenRouterMessage[] = [
  //       { role: 'system', content: systemPrompt },
  //       { 
  //         role: 'user', 
  //         content: `Please analyze this Move code for ${type} creation:\n\n${code}` 
  //       }
  //     ];

  //     const response = await this.makeRequest(messages);
  //     return response.choices[0].message.content;
  //   }

  //   // Explain DeFi concepts
  //   async explainConcept(concept: string) {
  //     const systemPrompt = `You are a DeFi educator specializing in Aptos blockchain. Explain complex DeFi concepts in simple, beginner-friendly terms.

  // REQUIREMENTS:
  // 1. Use simple language and analogies
  // 2. Provide practical examples
  // 3. Include relevant Aptos-specific information
  // 4. Keep explanations concise but comprehensive
  // 5. Use emojis sparingly for engagement`;

  //     const messages: OpenRouterMessage[] = [
  //       { role: 'system', content: systemPrompt },
  //       { role: 'user', content: `Explain this DeFi concept: ${concept}` }
  //     ];

  //     const response = await this.makeRequest(messages);
  //     return response.choices[0].message.content;
  //   }

  //   // Provide DeFi recommendations
  //   async getRecommendations(userContext: string) {
  //     const systemPrompt = `You are a DeFi strategist and advisor. Provide personalized recommendations based on user context.

  // REQUIREMENTS:
  // 1. Consider risk tolerance and experience level
  // 2. Provide Aptos-specific recommendations
  // 3. Include both opportunities and warnings
  // 4. Suggest concrete next steps
  // 5. Be objective and educational`;

  //     const messages: OpenRouterMessage[] = [
  //       { role: 'system', content: systemPrompt },
  //       { role: 'user', content: `Provide DeFi recommendations for: ${userContext}` }
  //     ];

  //     const response = await this.makeRequest(messages);
  //     return response.choices[0].message.content;
  //   }
  // }

  // export const openRouterService = new OpenRouterService();
