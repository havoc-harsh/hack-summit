/*
INSTRUCTIONS FOR DEPLOYING TO SEPOLIA:

1. Get Sepolia ETH from a faucet:
   - https://sepoliafaucet.com
   - https://sepolia-faucet.pk910.de

2. Get a free API key from Infura:
   - Sign up at https://infura.io
   - Create a new project and get your API key
   - Add it to your .env file

3. Add your private key to the .env file:
   - PRIVATE_KEY="your_private_key_without_0x_prefix"
   - NEVER share your private key or commit it to git

4. Run this script:
   - node scripts/deploy-sepolia.js
*/

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Get contract artifact
const contractPath = path.join(__dirname, '../artifacts/contracts/PaymentProcessor.sol/PaymentProcessor.json');
const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const abi = contractJson.abi;
const bytecode = contractJson.bytecode;

async function main() {
  console.log('\n🚀 Starting Sepolia deployment...\n');

  // Check for required environment variables
  const infuraKey = process.env.SEPOLIA_URL?.includes('YOUR_INFURA_API_KEY') 
    ? null 
    : process.env.SEPOLIA_URL;
    
  const privateKey = process.env.PRIVATE_KEY;

  if (!infuraKey) {
    console.error('❌ Missing or invalid SEPOLIA_URL. Please add your Infura API key to .env file.');
    console.log('Example: SEPOLIA_URL="https://sepolia.infura.io/v3/your-infura-key-here"');
    process.exit(1);
  }

  if (!privateKey) {
    console.error('❌ Missing PRIVATE_KEY in .env file. Please add your private key WITHOUT the 0x prefix.');
    console.log('Example: PRIVATE_KEY="your-private-key-without-0x-prefix"');
    process.exit(1);
  }

  try {
    // Connect to Sepolia network
    console.log('🔗 Connecting to Sepolia network...');
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_URL);
    const wallet = new ethers.Wallet(`0x${privateKey}`, provider);
    
    // Check wallet balance
    const balance = await wallet.getBalance();
    const balanceEth = ethers.utils.formatEther(balance);
    console.log(`💰 Wallet balance: ${balanceEth} ETH`);

    if (balance.lt(ethers.utils.parseEther('0.01'))) {
      console.error('❌ Not enough ETH in your wallet for deployment. Please get ETH from a Sepolia faucet.');
      console.log('Recommended faucets:');
      console.log('- https://sepoliafaucet.com');
      console.log('- https://sepolia-faucet.pk910.de');
      process.exit(1);
    }

    // Deploy contract
    console.log('📝 Deploying PaymentProcessor contract...');
    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    const deployTx = contractFactory.getDeployTransaction();
    
    // Estimate gas price and gas limit
    const gasPrice = await provider.getGasPrice();
    const adjustedGasPrice = gasPrice.mul(12).div(10); // Add 20% to current gas price
    const gasLimit = (await provider.estimateGas(deployTx)).mul(12).div(10); // Add 20% buffer
    
    console.log(`⛽ Gas price: ${ethers.utils.formatUnits(adjustedGasPrice, 'gwei')} gwei`);
    console.log(`⛽ Estimated gas limit: ${gasLimit.toString()}`);
    
    // Deploy with adjusted gas price and limit
    const contract = await contractFactory.deploy({
      gasPrice: adjustedGasPrice,
      gasLimit
    });

    console.log(`⏳ Transaction hash: ${contract.deployTransaction.hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    // Wait for contract to be deployed
    await contract.deployed();
    
    console.log(`\n✅ Contract deployed successfully!`);
    console.log(`📍 Contract address: ${contract.address}`);
    
    // Add a sample hospital for testing
    console.log('\n🏥 Adding a sample hospital for testing...');
    const hospitalId = "hospital_1";
    const tx = await contract.addHospital(hospitalId, wallet.address);
    await tx.wait();
    console.log(`✅ Added hospital: ${hospitalId}`);
    
    // Instructions for updating .env
    console.log('\n📝 Update your .env file with:');
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS="${contract.address}"`);
    
    // Etherscan link
    console.log(`\n🔍 View your contract on Etherscan: https://sepolia.etherscan.io/address/${contract.address}`);
    
    console.log('\n✨ Deployment completed successfully! ✨\n');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 