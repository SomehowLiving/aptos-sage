@echo off
echo 🔧 Aptos Assistant DeFi Suite - Environment Setup
echo ================================================
echo.

REM Check if .env.local already exists
if exist .env.local (
    echo ⚠️  .env.local already exists!
    echo.
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo Setup cancelled.
        pause
        exit /b 0
    )
)

echo 📝 Creating .env.local file...
echo.

REM Create .env.local file
(
    echo # ===========================================
    echo # APTOS BLOCKCHAIN CONFIGURATION
    echo # ===========================================
    echo.
    echo # Network: 'testnet' or 'mainnet'
    echo NEXT_PUBLIC_APTOS_NETWORK=testnet
    echo.
    echo # Aptos node URL
    echo NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com
    echo.
    echo # ===========================================
    echo # AI SERVICE CONFIGURATION ^(REQUIRED^)
    echo # ===========================================
    echo.
    echo # OpenRouter API Key - Get from https://openrouter.ai/
    echo NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
    echo.
    echo # OpenRouter base URL
    echo OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
    echo.
    echo # ===========================================
    echo # SMART CONTRACT ADDRESSES ^(REQUIRED^)
    echo # ===========================================
    echo.
    echo # Token contract address ^(deploy token.move first^)
    echo NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
    echo.
    echo # Pool contract address ^(deploy liquidity_pool.move first^)
    echo NEXT_PUBLIC_POOL_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
    echo.
    echo # Vault contract address ^(deploy yield_vault.move first^)
    echo NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
    echo.
    echo # ===========================================
    echo # APPLICATION CONFIGURATION
    echo # ===========================================
    echo.
    echo # Application name
    echo NEXT_PUBLIC_APP_NAME=Aptos Assistant DeFi
    echo.
    echo # Application URL
    echo NEXT_PUBLIC_APP_URL=http://localhost:3000
    echo.
    echo # ===========================================
    echo # OPTIONAL CONFIGURATION
    echo # ===========================================
    echo.
    echo # Enable debug mode
    echo NEXT_PUBLIC_DEBUG_MODE=false
) > .env.local

echo ✅ .env.local file created successfully!
echo.

echo 📋 Next Steps:
echo.
echo 1. 🔑 Get OpenRouter API Key:
echo    - Visit: https://openrouter.ai/
echo    - Sign up for free account
echo    - Create API key in dashboard
echo    - Update NEXT_PUBLIC_OPENROUTER_API_KEY in .env.local
echo.
echo 2. 🏗️ Deploy Smart Contracts:
echo    - Navigate to: dexxy-contracts/
echo    - Run: aptos move publish --named-addresses defi_suite=YOUR_ADDRESS
echo    - Update contract addresses in .env.local
echo.
echo 3. 🚀 Start Application:
echo    - Run: npm run dev
echo    - Open: http://localhost:3000
echo.
echo 📖 For detailed instructions, see:
echo    - README.md
echo    - ENVIRONMENT_SETUP.md
echo.
echo Happy building! 🚀
pause



