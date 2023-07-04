const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const JSBI = require('jsbi') // jsbi@3.2.5
const {NonfungiblePositionManager: NonfungiblePositionManagerAddress, getContract, getPoolContractAddress, Fee, deployContract} = require("./constant.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');


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

  ///=========== TONContract
  let balanceBeforeTON = await TONContract.balanceOf(deployer.address);
  console.log('balanceBeforeTON', balanceBeforeTON.toString());
  ///=========== TOSContract
  let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
  console.log('balanceBeforeTOS', balanceBeforeTOS.toString());

  // const tokenId = 1
  // //   /* GET ACCRUED UNCLAIMDED FEES */
  // //   // callStatic simulates a call without state changes
  // var results = await NonfungiblePositionManagerContract.callStatic.collect({
  //   tokenId: tokenId,
  //   recipient: deployer.address,
  //   amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
  //   amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
  // });
  // console.log('Fee0:', parseFloat(results.amount0));
  // console.log('Fee1:', parseFloat(results.amount1));

  //===============burn liquidity
  for(let i=3; i< 4; i++){
    const positionInfo = await NonfungiblePositionManagerContract.positions(i);
    console.log(positionInfo);
    if (positionInfo.liquidity > 0) {
      await exit(NonfungiblePositionManagerContract, positionInfo.liquidity, i, 0, 0, deployer.address)
    }
  }
  for(let i=4; i<6; i++){
    const positionInfo = await NonfungiblePositionManagerContract.positions(i);
    console.log(positionInfo);
    if (positionInfo.liquidity > 0) {
    await exitForETH(NonfungiblePositionManagerContract, positionInfo.liquidity, i, 0, 0, deployer.address)
    }
  }
}

  


async function exit( //ERC20으로 바등ㄹ떄
  nft,
  liquidity,
  tokenId,
  amount0Min,
  amount1Min,
  recipient,
) {
  const decreaseLiquidityData = nft.interface.encodeFunctionData('decreaseLiquidity', [
    { tokenId, liquidity, amount0Min, amount1Min, deadline: Date.now() + 100000 },
  ])
  const collectData = nft.interface.encodeFunctionData('collect', [
    {
      tokenId,
      recipient,
      amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
      amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
    },
  ])
  const burnData = nft.interface.encodeFunctionData('burn', [tokenId])
  try{
    const tx = await nft.multicall([decreaseLiquidityData, collectData, burnData])
    await tx.wait();
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log(receipt);
  } catch(e){
    console.log(e.message);
  }
  
}

async function exitForETH(
  nft,
  liquidity,
  tokenId,
  amount0Min,
  amount1Min,
  recipient,
) {
  const decreaseLiquidityData = nft.interface.encodeFunctionData('decreaseLiquidity', [
    { tokenId, liquidity, amount0Min, amount1Min, deadline: Date.now() + 100000 },
  ])
  const collectData = nft.interface.encodeFunctionData('collect', [
    {
      tokenId,
      recipient: nft.address,
      amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
      amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
    },
  ])
  const amountMinimum = 0
  const unwrapWETH9 = nft.interface.encodeFunctionData('unwrapWETH9', [amountMinimum, recipient])
  const burnData = nft.interface.encodeFunctionData('burn', [tokenId])
  
  try{
    const tx = await nft.multicall([decreaseLiquidityData, collectData, unwrapWETH9, burnData])
    await tx.wait();
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log(receipt);
  } catch(e) {
    console.log(e.message);
  }
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



// decreaseLiquidity({
//   tokenId: tokenId,
//   liquidity: positionInfo.liquidity,
//   amount0Min: 0,
//   amount1Min: 0,
//   deadline: Date.now() + 100000,
// });
// await tx.wait();
// let receipt = await providers.getTransactionReceipt(tx.hash);
// console.log('receipt', receipt);

// tx = await NonfungiblePositionManagerContract.collect({
//   tokenId: tokenId,
//   recipient: deployer.address,
//   amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
//   amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
// });
// await tx.wait();
// receipt = await providers.getTransactionReceipt(tx.hash);
// console.log('receipt', receipt);
// let balanceAfterCollectFeeTON = await TONContract.balanceOf(
//   deployer.address
// );