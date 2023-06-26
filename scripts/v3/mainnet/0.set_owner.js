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
  if (chainName === 'hardhat')
    deployer = await hre.ethers.getImpersonatedSigner(
      '0xB68AA9E398c054da7EBAaA446292f611CA0CD52B'
    );
  ///=========== UniswapV3Factory

  const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  let tx = await UniswapV3FactoryContract.setOwner(deployer.address);
  await tx.wait();
  const receipt = await providers.getTransactionReceipt(tx.hash);
  console.log('transactionHash:', receipt.transactionHash);
  console.log('gasUsed: ', receipt.gasUsed);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
