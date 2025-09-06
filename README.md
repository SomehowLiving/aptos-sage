# Aptos Assistant DeFi Suite

An AI-powered DeFi platform that enables anyone to create tokens, liquidity pools, and yield vaults on the Aptos blockchain using natural language interactions.

## 🚀 Features

### Core DeFi Functions
- **AI-Guided Token Creation**: Create custom tokens through conversational AI
- **Liquidity Pool Management**: Set up and manage liquidity pools with AI assistance
- **Yield Vault Creation**: Build yield-generating vaults with automated strategies
- **Wallet Integration**: Seamless connection with Petra and Pontem wallets
- **Real-time AI Feedback**: Get instant recommendations and optimizations

### Virtual Sandbox & Experimentation
- **Risk-Free Testing**: Test DeFi strategies without real funds using E2B sandboxes.
- **AI Code Review**: Automated analysis of generated smart contracts.
- **Live Compilation**: Compile Move code in a secure, virtualized environment.
- **One-Click Deployment**: Move from sandbox to mainnet seamlessly.

### AI-Powered Assistant
- **Natural Language Processing**: Describe what you want in plain English
- **Qwen3 Coder Integration**: Advanced AI model for code generation
- **Contextual Guidance**: Step-by-step assistance for complex operations
- **Error Analysis**: AI-powered debugging and optimization suggestions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

## 🔧 Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# ===========================================
# APTOS BLOCKCHAIN CONFIGURATION
# ===========================================
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com

# ===========================================
# AI SERVICE CONFIGURATION (REQUIRED)
# ===========================================
NEXT_PUBLIC_OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"

# ===========================================
# E2B SANDBOX CONFIGURATION (REQUIRED)
# ===========================================
E2B_API_KEY="YOUR_E2B_API_KEY"

# ===========================================
# SMART CONTRACT ADDRESSES (REQUIRED)
# ===========================================
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x1234567890abcdef
NEXT_PUBLIC_POOL_CONTRACT_ADDRESS=0x1234567890abcdef
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0x1234567890abcdef

# ... (rest of the variables)
```

### How to Get Required API Keys

#### 1. OpenRouter API Key (Required for AI functionality)
1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account and go to the "Keys" section.
3. Create a new API key and copy it to `NEXT_PUBLIC_OPENROUTER_API_KEY`.

#### 2. E2B API Key (Required for Sandbox functionality)
1. Visit [E2B.dev](https://e2b.dev/)
2. Sign up for an account and go to your dashboard.
3. Get your API key.
4. Copy the key and paste it in `E2B_API_KEY` in your `.env.local` file.

#### 3. Smart Contract Addresses
You need to deploy your Move contracts first to a live network. After deployment, update the contract addresses in your `.env.local` file.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
# A .env.local file will be created for you.
# You just need to fill in the API keys.

# 3. Start development server
npm run dev
```

## 🌐 Access the Application

Once the development server is running:

1. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)
2. Connect your wallet (Petra or Pontem)
3. Start chatting with the AI assistant!

## 🎯 Usage Guide

### Sandbox Testing

1. Navigate to the "Sandbox" tab.
2. Create a new simulation for a token, pool, or vault.
3. Click "Generate Code" to have the AI write the Move smart contract.
4. Click "Test Code" to compile it in a secure sandbox.
5. Review the compilation results and AI analysis.
6. Deploy to a live network when ready.

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** & **Framer Motion**
- **Zustand** for state management

### Backend & Services
- **OpenRouter API** with Qwen3 Coder model
- **E2B Sandboxes** for secure code execution
- **Aptos TypeScript SDK** for blockchain interactions
- **Move Language** for smart contracts

---

**Built with ❤️ for the Aptos DeFi ecosystem**
