const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const {
  getContract,
  getPoolContractAddress,
} = require('./helper_functions.js');
//enableFeeAmount 100 1

async function main() {
  const chainName = hre.network.name;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;
  let totalGasUsed = ethers.BigNumber.from('0');

  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = (await getContract('UniswapV3Factory')).connect(deployer);
  let tx = await UniswapV3FactoryContract.setOwner('0x340C44089bc45F86060922d2d89eFee9e0CDF5c7');
  await tx.wait();
  const receipt = await providers.getTransactionReceipt(tx.hash);
  console.log('transactionHash:', receipt.transactionHash);
  console.log('gasUsed: ', receipt.gasUsed);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
