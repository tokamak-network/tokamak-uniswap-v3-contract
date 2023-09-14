const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const JSBI = require('jsbi') // jsbi@3.2.5
const {NonfungiblePositionManager: NonfungiblePositionManagerAddress, getContract, getPoolContractAddress} = require("./helper_functions.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const {encodePriceSqrt} = require('../../utils.js');
const sdk = require("@uniswap/v3-sdk");
const getTickAtSqrtRatio = sdk.TickMath.getTickAtSqrtRatio;
const {consoleEvents} = require("../testnet/consoleEvents.js");
const nearestUsableTick = sdk.nearestUsableTick;
const { expect } = require("chai");
const getSqrtRatioAtTick = sdk.TickMath.getSqrtRatioAtTick;
const getNextSqrtPriceFromAmount0RoundingUp = sdk.SqrtPriceMath.getNextSqrtPriceFromAmount0RoundingUp;
const getNextSqrtPriceFromAmount1RoundingDown = sdk.SqrtPriceMath.getNextSqrtPriceFromAmount1RoundingDown;

async function main() {
  const chainName = hre.network.name;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;
  let totalGasUsed = ethers.BigNumber.from("0")


  ///=============== NonfungiblePositionManagerContract  
  const NonfungiblePositionManagerContract = (await getContract('NonfungiblePositionManager')).connect(deployer);

  
 // ===============burn liquidity
     positionInfo = await NonfungiblePositionManagerContract.positions(74573);
    console.log(positionInfo);
      if (positionInfo.liquidity > 0) {
        await exit(NonfungiblePositionManagerContract, positionInfo.liquidity, 74573, 0, 0, deployer.address)
      }
}

async function exit(
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
  sweepTokenAddress
) {
  
  const decreaseLiquidityData = nft.interface.encodeFunctionData('decreaseLiquidity', [
    { tokenId, liquidity, amount0Min, amount1Min, deadline: Date.now() + 100000 },
  ])
  const collectData = nft.interface.encodeFunctionData('collect', [
    {
      tokenId,
      recipient: '0x0000000000000000000000000000000000000000',
      amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
      amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
    },
  ])
  const amountMinimum = 0
  const unwrapWETH9 = nft.interface.encodeFunctionData('unwrapWETH9', [amountMinimum, recipient])
  
  const sweepToken = nft.interface.encodeFunctionData('sweepToken',[sweepTokenAddress, amountMinimum, recipient])

  //     Function: sweepToken(address, uint256, address)
  // #	Name	Type	Data
  // 1	token	address	af88d065e77c8cc2239327c5edb3a432268e5831
  // 2	amountMinimum	uint256	44642212
  // 3	recipient	address	8e85abd6de597cd75f40980990feec0526444637
  
  const burnData = nft.interface.encodeFunctionData('burn', [tokenId])
  
  try{
    const tx = await nft.multicall([decreaseLiquidityData, collectData, unwrapWETH9, sweepToken, burnData], {gasLimit: 3000000})
    await tx.wait();
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log(receipt);
    console.log("what")
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




