/*
  Quick contract checker script
  
  This script checks if a contract exists at the specified address
  and attempts to call a view function to verify the interface.
  
  Usage:
  node scripts/check-contract.js 0xYourContractAddressHere
*/

require('dotenv').config();
const { ethers } = require('ethers');

// Configure these as needed
const defaultAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const networkUrl = process.env.NEXT_PUBLIC_NETWORK_URL || 'http://127.0.0.1:8545';

// ABI subset for verification (just the view functions we want to check)
const abi = [
  "function appointmentFee() external view returns (uint256)",
  "function isPaymentCompleted(string memory appointmentId) external view returns (bool)"
];

async function main() {
  // Get contract address from command line or .env
  const contractAddress = process.argv[2] || defaultAddress;
  
  if (!contractAddress) {
    console.error('❌ No contract address provided');
    console.log('Usage: node scripts/check-contract.js 0xYourContractAddressHere');
    process.exit(1);
  }
  
  console.log(`\n🔍 Checking contract at address: ${contractAddress}`);
  console.log(`🔗 Network: ${networkUrl}\n`);
  
  try {
    // Connect to network
    const provider = new ethers.providers.JsonRpcProvider(networkUrl);
    
    // Get network info
    const network = await provider.getNetwork();
    console.log(`Network name: ${network.name}`);
    console.log(`Chain ID: ${network.chainId}\n`);
    
    // Check if address has code (is a contract)
    const code = await provider.getCode(contractAddress);
    
    if (code === '0x' || code === '0x0') {
      console.error(`❌ No contract deployed at ${contractAddress}`);
      process.exit(1);
    }
    
    console.log(`✅ Contract exists at ${contractAddress}`);
    console.log(`📝 Code size: ${(code.length - 2) / 2} bytes\n`);
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // Try to call view functions to verify interface
    try {
      console.log('Testing contract interface...');
      
      // Get appointment fee
      const fee = await contract.appointmentFee();
      console.log(`✅ appointmentFee() ➝ ${ethers.utils.formatEther(fee)} ETH`);
      
      // Check a dummy appointment (it should return false)
      const isCompleted = await contract.isPaymentCompleted('test123');
      console.log(`✅ isPaymentCompleted("test123") ➝ ${isCompleted}`);
      
      console.log('\n🎉 Contract verification successful!');
      console.log('The contract is deployed and has the expected interface.');
    } catch (error) {
      console.error('\n❌ Failed to call contract functions:', error.message);
      console.log('The contract exists but does not match the expected interface.');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 