#!/bin/bash

# Aptos Assistant DeFi Suite - Installation Script
echo "🚀 Installing Aptos Assistant DeFi Suite..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cat > .env.local << EOF
# Aptos Configuration
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com

# OpenRouter API Configuration
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Smart Contract Addresses (Update with your deployed contracts)
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x1234567890abcdef
NEXT_PUBLIC_POOL_CONTRACT_ADDRESS=0x1234567890abcdef
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0x1234567890abcdef

# Application Configuration
NEXT_PUBLIC_APP_NAME=Aptos Assistant DeFi
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "✅ Environment file created at .env.local"
    echo "⚠️  Please update the OpenRouter API key in .env.local"
else
    echo "✅ Environment file already exists"
fi

# Check if TypeScript is working
echo "🔍 Checking TypeScript configuration..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript errors detected. Please check the configuration."
else
    echo "✅ TypeScript configuration is valid"
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your OpenRouter API key in .env.local"
echo "2. Deploy your smart contracts and update contract addresses"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "🔗 Useful links:"
echo "- OpenRouter API: https://openrouter.ai/"
echo "- Aptos Documentation: https://aptos.dev/"
echo "- Petra Wallet: https://petra.app/"
echo ""
echo "Happy building! 🚀"
