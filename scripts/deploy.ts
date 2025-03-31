const hre = require("hardhat");

async function main() {
  console.log("Deploying PaymentProcessor contract...");

  // Deploy the contract
  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
  const paymentProcessor = await PaymentProcessor.deploy();
  await paymentProcessor.deployed();

  console.log("PaymentProcessor deployed to:", paymentProcessor.address);

  // Add a sample hospital (for testing purposes)
  const sampleHospitalId = "hospital_1";
  const [deployer] = await hre.ethers.getSigners();
  await paymentProcessor.addHospital(sampleHospitalId, deployer.address);
  console.log("Added sample hospital with ID:", sampleHospitalId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 