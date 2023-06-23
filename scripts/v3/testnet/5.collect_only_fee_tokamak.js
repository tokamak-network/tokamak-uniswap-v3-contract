const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const JSBI = require('jsbi') // jsbi@3.2.5
const {NonfungiblePositionManager: NonfungiblePositionManagerAddress, getContract, getPoolContractAddress, Fee, deployContract} = require("./constant.js");

const UniswapV3PoolArtifact = require('./abis/UniswapV3Pool.sol/UniswapV3Pool.json');

async function main() {
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;

  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  ///=============== TONContract  
  const TONContract = await getContract('TON');
  const TON = TONContract.address;
  ///=============== TOSContract  
  const TOSContract = await getContract('TOS');
  const TOS = TOSContract.address;
  ///=============== WETHContract  
  const WETHContract = await getContract('WETH');
  const WETH = WETHContract.address;
  ///=============== WETHContract  
  const NonfungiblePositionManagerContract = await getContract('NonfungiblePositionManager');
  ///=============== poolAddresses
  let poolAddressTOSTON = await getPoolContractAddress(UniswapV3FactoryContract, TON, TOS);
  let poolAddressWETHTOS = await getPoolContractAddress(UniswapV3FactoryContract, WETH, TOS);
  let poolAddressWETHTON = await getPoolContractAddress(UniswapV3FactoryContract, WETH, TON);

  let balanceBeforeTON = await TONContract.balanceOf(deployer.address);
  console.log('balanceBeforeTON', balanceBeforeTON.toString());

  ///=========== TOSContract
  let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
  console.log('balanceBeforeTOS', balanceBeforeTOS.toString());

  // //============== PoolContract
  // const UniswapV3Pool_ = new ethers.ContractFactory(
  //   UniswapV3PoolArtifact.abi,
  //   UniswapV3PoolArtifact.bytecode,
  //   deployer
  // );
  // UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressTOSTON);
  // let liquidity = await UniswapV3PoolContract.liquidity();
  // console.log('liquidity : ', liquidity);
  // let slot0 = await UniswapV3PoolContract.slot0();
  // console.log('tick', slot0.tick);

  const tokenId = 1
  //   /* GET ACCRUED UNCLAIMDED FEES */
  //   // callStatic simulates a call without state changes
  let results1 = await NonfungiblePositionManagerContract.callStatic.collect({
    tokenId: 1,
    recipient: deployer.address,
    amount0Max: ethers.BigNumber.from(2).pow(256).sub(1),
    amount1Max: ethers.BigNumber.from(2).pow(256).sub(1),
  });
  console.log('Fee0:', parseFloat(results1.amount0));
  console.log('Fee1:', parseFloat(results1.amount1));

  let results2 = await NonfungiblePositionManagerContract.callStatic.collect({
    tokenId: 2,
    recipient: deployer.address,
    amount0Max: ethers.BigNumber.from(2).pow(256).sub(1),
    amount1Max: ethers.BigNumber.from(2).pow(256).sub(1),
  });
  console.log('Fee0:', parseFloat(results2.amount0));
  console.log('Fee1:', parseFloat(results2.amount1));

  let results3 = await NonfungiblePositionManagerContract.callStatic.collect({
    tokenId: 3,
    recipient: deployer.address,
    amount0Max: ethers.BigNumber.from(2).pow(256).sub(1),
    amount1Max: ethers.BigNumber.from(2).pow(256).sub(1),
  });
  console.log('Fee0:', parseFloat(results3.amount0));
  console.log('Fee1:', parseFloat(results3.amount1));

  // //=========collect Fee
  // if (parseFloat(results.amount0) > 0 || (results.amount1) > 0) {
  //   const tx = await NonfungiblePositionManagerContract.collect({
  //     tokenId: tokenId,
  //     recipient: deployer.address,
  //     amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
  //     amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
  //   });
  //   await tx.wait();
  //   const receipt = await providers.getTransactionReceipt(tx.hash);
  //   console.log('receipt', receipt);
  //   let balanceAfterCollectFeeTON = await TONContract.balanceOf(
  //     deployer.address
  //   );
  //   console.log(
  //     'balanceAfterCollectFeeTON',
  //     balanceAfterCollectFeeTON.toString()
  //   );
  //   let balanceAfterCollectFeeTOS = await TOSContract.balanceOf(
  //     deployer.address
  //   );
  //   console.log(
  //     'balanceAfterCollectFeeTOS',
  //     balanceAfterCollectFeeTOS.toString()
  //   );
  // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
