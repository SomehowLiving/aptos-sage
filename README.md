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
- **Risk-Free Testing**: Test DeFi strategies without real funds
- **AI Code Review**: Automated analysis of generated smart contracts
- **Simulation Environment**: Safe space to experiment with parameters
- **One-Click Deployment**: Move from sandbox to mainnet seamlessly

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
- **Aptos CLI** (optional, for contract deployment) - [Install guide](https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli/)

## 🔧 Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# ===========================================
# APTOS BLOCKCHAIN CONFIGURATION
# ===========================================

# Network: 'testnet' or 'mainnet'
NEXT_PUBLIC_APTOS_NETWORK=testnet

# Aptos node URL (use testnet for development)
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com

# ===========================================
# AI SERVICE CONFIGURATION (REQUIRED)
# ===========================================

# OpenRouter API Key - Get from https://openrouter.ai/
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here

# OpenRouter base URL (usually don't change this)
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# ===========================================
# SMART CONTRACT ADDRESSES (REQUIRED)
# ===========================================

# Token contract address (deploy your token.move contract first)
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x1234567890abcdef

# Pool contract address (deploy your liquidity_pool.move contract first)
NEXT_PUBLIC_POOL_CONTRACT_ADDRESS=0x1234567890abcdef

# Vault contract address (deploy your yield_vault.move contract first)
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0x1234567890abcdef

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================

# Application name
NEXT_PUBLIC_APP_NAME=Aptos Assistant DeFi

# Application URL (for development use localhost)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# OPTIONAL CONFIGURATION
# ===========================================

# Enable debug mode (set to 'true' for development)
NEXT_PUBLIC_DEBUG_MODE=false

# Custom RPC endpoint (optional, uses default if not set)
# NEXT_PUBLIC_CUSTOM_RPC_URL=https://your-custom-rpc.com
```

### How to Get Required API Keys

#### 1. OpenRouter API Key (Required for AI functionality)
1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Go to "Keys" section in your dashboard
4. Create a new API key
5. Copy the key and paste it in `NEXT_PUBLIC_OPENROUTER_API_KEY`

#### 2. Smart Contract Addresses
You need to deploy your Move contracts first:

```bash
# Navigate to your contracts directory
cd dexxy-contracts

# Deploy token contract
aptos move publish --named-addresses defi_suite=YOUR_ADDRESS

# Deploy pool contract  
aptos move publish --named-addresses defi_suite=YOUR_ADDRESS

# Deploy vault contract
aptos move publish --named-addresses defi_suite=YOUR_ADDRESS
```

After deployment, update the contract addresses in your `.env.local` file.

## 🚀 Quick Start

### Option 1: Automated Installation (Windows)
```bash
# Run the installation script
install.bat
```

### Option 2: Manual Installation
```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Update environment variables (see above)
# Edit .env.local with your API keys and contract addresses

# 4. Start development server
npm run dev
```

### Option 3: Using npm scripts
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 🌐 Access the Application

Once the development server is running:

1. Open your browser
2. Navigate to [http://localhost:3000](http://localhost:3000)
3. Connect your wallet (Petra or Pontem)
4. Start chatting with the AI assistant!

## 🎯 Usage Guide

### First Time Setup

1. **Connect Wallet**
   - Click "Connect Wallet" in the header
   - Choose Petra or Pontem wallet
   - Approve the connection

2. **Start Creating**
   - Go to "AI Assistant" tab
   - Type: "I want to create a token called MyCoin"
   - Follow the AI's guidance

### Available Commands

- **Token Creation**: "Create a token called MyCoin with symbol MC and 1 million supply"
- **Pool Creation**: "Create a liquidity pool for APT and MyCoin with 0.3% fee"
- **Vault Creation**: "Create a yield vault for APT with compound strategy"
- **Portfolio Check**: "Show me my portfolio"
- **Help**: "How can you help me?"

### Sandbox Testing

1. Navigate to "Sandbox" tab
2. Create a new simulation
3. Test your strategy safely
4. Deploy to mainnet when ready

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **Radix UI** for components

### Backend
- **OpenRouter API** with Qwen3 Coder model
- **Aptos TypeScript SDK** for blockchain interactions
- **Move Language** for smart contracts
- **Node.js** with Express

### Blockchain
- **Aptos Network** (Testnet/Mainnet)
- **Move Smart Contracts**
- **Petra & Pontem Wallet** integration

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aptos-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the following variables in `.env.local`:
   ```env
   # OpenRouter API Configuration
   NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
   
   # Aptos Configuration
   NEXT_PUBLIC_APTOS_NETWORK=testnet
   NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com
   
   # Smart Contract Addresses (Update with your deployed contracts)
   NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x1234567890abcdef
   NEXT_PUBLIC_POOL_CONTRACT_ADDRESS=0x1234567890abcdef
   NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0x1234567890abcdef
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Getting Started

1. **Connect Your Wallet**
   - Click "Connect Wallet" in the header
   - Choose between Petra or Pontem wallet
   - Approve the connection

2. **Start Chatting with AI**
   - Navigate to the AI Assistant tab
   - Describe what you want to create
   - Follow the AI's guidance

3. **Create Your First Token**
   - Say "I want to create a token"
   - Provide details like name, symbol, and supply
   - Review and deploy

### Available Commands

- **Token Creation**: "Create a token called MyCoin with symbol MC"
- **Pool Creation**: "Create a liquidity pool for APT and MyCoin"
- **Vault Creation**: "Create a yield vault for APT with compound strategy"
- **Portfolio Check**: "Show me my portfolio"
- **Help**: "How can you help me?"

### Sandbox Testing

1. **Navigate to Sandbox**
   - Click on the Sandbox tab in the sidebar
   - Create a new simulation

2. **Test Your Strategy**
   - Generate code for your DeFi product
   - Run tests in the sandbox environment
   - Review AI analysis and suggestions

3. **Deploy to Mainnet**
   - Once satisfied with sandbox results
   - Deploy directly to Aptos mainnet

## 🔧 Development

### Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── chat/          # Chat interface
│   ├── dashboard/     # Dashboard components
│   ├── layout/        # Layout components
│   ├── pools/         # Pool management
│   ├── sandbox/       # Sandbox interface
│   ├── tokens/        # Token management
│   ├── ui/            # Reusable UI components
│   └── wallet/        # Wallet integration
├── lib/               # Utility libraries
│   ├── aptos.ts       # Aptos blockchain integration
│   ├── openrouter.ts  # AI service integration
│   ├── sandbox.ts     # Sandbox functionality
│   └── utils.ts       # Helper functions
├── store/             # State management
│   └── useAppStore.ts # Zustand store
└── types/             # TypeScript types
    └── index.ts       # Type definitions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Smart Contracts

The project integrates with existing Move smart contracts:

- **Token Contract**: `dexxy-contracts/sources/token.move`
- **Pool Contract**: `dexxy-contracts/sources/liquidity_pool.move`
- **Vault Contract**: `dexxy-contracts/sources/yield_vault.move`

## 🌐 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Ensure OpenRouter API key is configured

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Custom Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm run start
   ```

## 🔐 Security

- **Wallet Integration**: Secure connection with Aptos wallets
- **API Security**: Rate limiting and input validation
- **Smart Contract Auditing**: AI-powered code analysis
- **Sandbox Testing**: Safe environment for experimentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Aptos Foundation** for the blockchain infrastructure
- **OpenRouter** for AI model access
- **Qwen Team** for the advanced coding model
- **Petra & Pontem** for wallet integration

## 📞 Support

- **Documentation**: Check the README and inline comments
- **Issues**: Report bugs via GitHub issues
- **Discord**: Join our community Discord server
- **Email**: Contact us at support@aptosassistant.com

---

**Built with ❤️ for the Aptos DeFi ecosystem**
