const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const {
  getContract,
  getPoolContractAddress,
  deployContract,
} = require('./helper_functions.js');
//enableFeeAmount 100 1

async function main() {
  const chainName = hre.network.name;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;
  if (chainName === 'hardhat')
    deployer = await hre.ethers.getImpersonatedSigner(
      '0xB68AA9E398c054da7EBAaA446292f611CA0CD52B'
    );
  if (chainName === 'localhost') {
    const localAccount = accounts[1];
    await localAccount.sendTransaction({
      to: deployer.address,
      value: ethers.utils.parseEther('1.0'), // Sends exactly 1.0 ether
    });
    console.log('ETH_balance:', await providers.getBalance(deployer.address));
    await deployContract();
    console.log('ETH_balance:', await providers.getBalance(deployer.address));
  }
  ///=========== UniswapV3Factory
  const ETHBeforeBalance = await providers.getBalance(deployer.address);
  const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  let tx = await UniswapV3FactoryContract.enableFeeAmount(100, 1);
  await tx.wait();
  const receipt = await providers.getTransactionReceipt(tx.hash);
  console.log('transactionHash:', receipt.transactionHash);
  console.log('gasUsed: ', receipt.gasUsed);
  console.log(
    'ETH_Used',
    ethers.utils.formatUnits(
      ETHBeforeBalance.sub(await providers.getBalance(deployer.address)),
      18
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
