@echo off
echo 🚀 Installing Aptos Assistant DeFi Suite...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm detected

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Create environment file if it doesn't exist
if not exist .env.local (
    echo 📝 Creating environment file...
    (
        echo # Aptos Configuration
        echo NEXT_PUBLIC_APTOS_NETWORK=testnet
        echo NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com
        echo.
        echo # OpenRouter API Configuration
        echo NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
        echo OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
        echo.
        echo # Smart Contract Addresses ^(Update with your deployed contracts^)
        echo NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x1234567890abcdef
        echo NEXT_PUBLIC_POOL_CONTRACT_ADDRESS=0x1234567890abcdef
        echo NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0x1234567890abcdef
        echo.
        echo # Application Configuration
        echo NEXT_PUBLIC_APP_NAME=Aptos Assistant DeFi
        echo NEXT_PUBLIC_APP_URL=http://localhost:3000
    ) > .env.local
    echo ✅ Environment file created at .env.local
    echo ⚠️  Please update the OpenRouter API key in .env.local
) else (
    echo ✅ Environment file already exists
)

echo.
echo 🎉 Installation completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update your OpenRouter API key in .env.local
echo 2. Deploy your smart contracts and update contract addresses
echo 3. Run 'npm run dev' to start the development server
echo 4. Open http://localhost:3000 in your browser
echo.
echo 🔗 Useful links:
echo - OpenRouter API: https://openrouter.ai/
echo - Aptos Documentation: https://aptos.dev/
echo - Petra Wallet: https://petra.app/
echo.
echo Happy building! 🚀
pause
