# Environment Variables Setup Guide

This guide will help you set up all the required environment variables for the Aptos Assistant DeFi Suite.

## 📋 Required Environment Variables

### 1. **OpenRouter API Key** (CRITICAL - Required for AI functionality)

**What it is**: API key for accessing OpenRouter's AI models (Qwen3 Coder)

**How to get it**:
1. Visit [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up for a free account
3. Go to "Keys" section in your dashboard
4. Click "Create Key"
5. Copy the generated API key

**Environment Variable**:
```env
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
```

**Cost**: Free tier available with 200 requests/day

---

### 2. **Smart Contract Addresses** (CRITICAL - Required for blockchain functionality)

You need to deploy your Move contracts first, then get their addresses.

#### Deploy Your Contracts:

```bash
# Navigate to your contracts directory
cd dexxy-contracts

# Make sure you have Aptos CLI installed
# Install from: https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli/

# Create a new account (if you don't have one)
aptos init

# Deploy token contract
aptos move publish --named-addresses defi_suite=YOUR_ADDRESS

# Deploy pool contract
aptos move publish --named-addresses defi_suite=YOUR_ADDRESS

# Deploy vault contract
aptos move publish --named-addresses defi_suite=YOUR_ADDRESS
```

#### Get Contract Addresses:
After deployment, you'll see output like:
```
Published package 0x1234567890abcdef1234567890abcdef12345678
```

**Environment Variables**:
```env
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
NEXT_PUBLIC_POOL_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

---

### 3. **Aptos Network Configuration**

**For Development (Testnet)**:
```env
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com
```

**For Production (Mainnet)**:
```env
NEXT_PUBLIC_APTOS_NETWORK=mainnet
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com
```

---

### 4. **Application Configuration**

```env
NEXT_PUBLIC_APP_NAME=Aptos Assistant DeFi
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

---

## 🔧 Complete .env.local File Template

Create a file named `.env.local` in the root directory with this content:

```env
# ===========================================
# APTOS BLOCKCHAIN CONFIGURATION
# ===========================================

# Network: 'testnet' or 'mainnet'
NEXT_PUBLIC_APTOS_NETWORK=testnet

# Aptos node URL
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com

# ===========================================
# AI SERVICE CONFIGURATION (REQUIRED)
# ===========================================

# OpenRouter API Key - Get from https://openrouter.ai/
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here

# OpenRouter base URL
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# ===========================================
# SMART CONTRACT ADDRESSES (REQUIRED)
# ===========================================

# Token contract address (deploy token.move first)
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

# Pool contract address (deploy liquidity_pool.move first)
NEXT_PUBLIC_POOL_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

# Vault contract address (deploy yield_vault.move first)
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================

# Application name
NEXT_PUBLIC_APP_NAME=Aptos Assistant DeFi

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# OPTIONAL CONFIGURATION
# ===========================================

# Enable debug mode
NEXT_PUBLIC_DEBUG_MODE=false

# Custom RPC endpoint (optional)
# NEXT_PUBLIC_CUSTOM_RPC_URL=https://your-custom-rpc.com
```

---

## 🚨 Important Notes

### Security
- **Never commit** your `.env.local` file to version control
- **Keep your API keys secure** and don't share them publicly
- **Use testnet** for development and testing

### API Key Limits
- OpenRouter free tier: 200 requests/day
- Monitor your usage in the OpenRouter dashboard
- Consider upgrading if you need more requests

### Contract Deployment
- **Testnet first**: Always deploy to testnet before mainnet
- **Fund your account**: You need APT tokens to deploy contracts
- **Get testnet APT**: Use the Aptos faucet for testnet tokens

---

## 🔍 Troubleshooting

### Common Issues

1. **"OpenRouter API key not configured"**
   - Make sure `NEXT_PUBLIC_OPENROUTER_API_KEY` is set correctly
   - Check that the key starts with `sk-or-v1-`

2. **"Contract address not found"**
   - Deploy your contracts first
   - Update the contract addresses in `.env.local`
   - Make sure addresses are valid Aptos addresses (64 characters)

3. **"Network connection failed"**
   - Check your internet connection
   - Verify the Aptos node URL is correct
   - Try switching between testnet and mainnet

4. **"Wallet connection failed"**
   - Make sure you have Petra or Pontem wallet installed
   - Check that you're on the correct network (testnet/mainnet)
   - Refresh the page and try again

### Getting Help

- Check the [Aptos Documentation](https://aptos.dev/)
- Visit [OpenRouter Support](https://openrouter.ai/docs)
- Join the [Aptos Discord](https://discord.gg/aptoslabs)

---

## ✅ Verification Checklist

Before running the application, make sure you have:

- [ ] Node.js 18+ installed
- [ ] OpenRouter API key obtained and configured
- [ ] Move contracts deployed to Aptos
- [ ] Contract addresses updated in `.env.local`
- [ ] Aptos network configured (testnet for development)
- [ ] Wallet installed (Petra or Pontem)
- [ ] `.env.local` file created in the root directory

Once all items are checked, you're ready to run the application!



