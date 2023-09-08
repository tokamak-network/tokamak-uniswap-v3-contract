const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const JSBI = require('jsbi'); // jsbi@3.2.5
const {
  NonfungiblePositionManager: NonfungiblePositionManagerAddress,
  getContract,
  getPoolContractAddress,
} = require('./helper_functions.js');
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const { encodePriceSqrt } = require('../../utils.js');
const sdk = require('@uniswap/v3-sdk');
const getTickAtSqrtRatio = sdk.TickMath.getTickAtSqrtRatio;
const { consoleEvents } = require('../testnet/consoleEvents.js');
const nearestUsableTick = sdk.nearestUsableTick;
const { expect } = require('chai');
const getSqrtRatioAtTick = sdk.TickMath.getSqrtRatioAtTick;
const getNextSqrtPriceFromAmount0RoundingUp =
  sdk.SqrtPriceMath.getNextSqrtPriceFromAmount0RoundingUp;
const getNextSqrtPriceFromAmount1RoundingDown =
  sdk.SqrtPriceMath.getNextSqrtPriceFromAmount1RoundingDown;
const getAmount0Delta = sdk.SqrtPriceMath.getAmount0Delta;
const getAmount1Delta = sdk.SqrtPriceMath.getAmount1Delta;
const axios = require('axios');
const SUBGRAPH_URL =
  'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-gorli';
  POSITIONS_QUERY = `
  query MyQuery {
    positions(where: {id: "73467"}) {
      id
      feeGrowthInside0LastX128
      feeGrowthInside1LastX128
      liquidity
      owner
      pool {
        id
        sqrtPrice
        tick
      }
      tickLower {
        tickIdx
        feeGrowthOutside0X128
        feeGrowthOutside1X128
      }
      tickUpper {
        tickIdx
        feeGrowthOutside0X128
        feeGrowthOutside1X128
      }
      token0 {
        id
      }
      token1 {
        id
      }
    }
  }
`;
async function main() {
  const chainName = hre.network.name;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  deployer = await hre.ethers.getSigner("0x8c595da827f4182bc0e3917bcca8e654df8223e1");
  providers = hre.ethers.provider;
  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  ///=============== TOSContract
  const TOSContract = await getContract('TOS');
  const TOSAddress = TOSContract.address;
  ///=============== USDCContract
  const TONContract = await getContract('TON');
  const TONAddress = TONContract.address;
  ///=============== NonfungiblePositionManagerContract
  const NonfungiblePositionManagerContract = (
    await getContract('NonfungiblePositionManager')
  ).connect(deployer);
  const UniswapV3Pool_ = new ethers.ContractFactory(
    UniswapV3PoolArtifact.abi,
    UniswapV3PoolArtifact.bytecode,
    deployer
  );
  let UniswapV3PoolContract = UniswapV3Pool_.attach(
    '0x544973170869b2ac245dA27A22BF5A104199942c'
  );
  let amount0 = amount1 = 0;
  let tokenId = 73467;
  let positionInfo = await NonfungiblePositionManagerContract.positions(tokenId);
  let liquidity = JSBI.BigInt(positionInfo.liquidity.toString());
  const tickLower = positionInfo.tickLower;
  const tickUpper = positionInfo.tickUpper;
  const lowersqrtPriceX96 = getSqrtRatioAtTick(tickLower);
  const uppersqrtPriceX96 = getSqrtRatioAtTick(tickUpper);
  const sqrtPriceX96 = JSBI.BigInt(
    (await UniswapV3PoolContract.slot0()).sqrtPriceX96.toString()
  );
  const slot0Tick = (await UniswapV3PoolContract.slot0()).tick;
  if(slot0Tick < tickLower) {
    amount0 = getAmount0Delta(lowersqrtPriceX96,uppersqrtPriceX96, liquidity, false).toString()
  } else if (slot0Tick < tickUpper) {
    amount0 = getAmount0Delta(sqrtPriceX96, uppersqrtPriceX96, liquidity, false).toString()
    amount1 = getAmount1Delta(lowersqrtPriceX96, sqrtPriceX96, liquidity, false).toString()
  } else {
    console.log(ethers.BigNumber.from(positionInfo.liquidity.toString()));
    amount1 = getAmount1Delta(lowersqrtPriceX96, uppersqrtPriceX96,  JSBI.BigInt(2004784), false).toString()
  }
  console.log(amount0, amount1);
  let deadline = Math.floor(Date.now() / 1000) + 100000;
  let results =
    await NonfungiblePositionManagerContract.callStatic.decreaseLiquidity({
      tokenId: tokenId,
      liquidity: positionInfo.liquidity,
      deadline: deadline,
      amount0Min: 0,
      amount1Min: 0,
    });
  let results2 = await NonfungiblePositionManagerContract.callStatic.collect({
    tokenId: tokenId,
    recipient: deployer.address,
    amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
    amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
  },{gasLimit:300000});
  console.log(results2.amount0);
  console.log(results2.amount1);
  console.log(results.amount0.add(results2.amount0)); // amount0 + fee = 44071833809710618407
  console.log(results.amount1.add(results2.amount1)); // amount1 + fee = 18546165554919205637
  console.log(results.amount0.toString());
  console.log( results.amount1.toString());

  const result = await axios.post(SUBGRAPH_URL, { query: POSITIONS_QUERY });
  const position10 = result.data.data.positions[0];

  const slot0TickSub = parseInt(position10.pool.tick);
  const tickLowerSub = parseInt(position10.tickLower.tickIdx);
  const tickUpperSub = parseInt(position10.tickUpper.tickIdx);
  const sqrtPriceSub = JSBI.BigInt(position10.pool.sqrtPrice);
  const uppersqrtPriceSub = getSqrtRatioAtTick(tickUpperSub);
  const lowersqrtPriceSub = getSqrtRatioAtTick(tickLowerSub);
  const liquiditySub = JSBI.BigInt(position10.liquidity);
  
  
  if(slot0TickSub < tickLowerSub) {
    amount0 = getAmount0Delta( lowersqrtPriceSub,uppersqrtPriceSub, liquiditySub, false).toString()
  } else if (slot0TickSub < tickUpperSub) {
    amount0 = getAmount0Delta(sqrtPriceSub, uppersqrtPriceSub, liquiditySub, false).toString()
    amount1 = getAmount1Delta(lowersqrtPriceSub, sqrtPriceSub, liquiditySub, false).toString()
  } else {
    console.log(lowersqrtPriceSub.toString(), uppersqrtPriceSub.toString(), liquiditySub.toString());
    amount1 = getAmount1Delta(lowersqrtPriceSub, uppersqrtPriceSub, liquiditySub, false).toString()
  }
  console.log(amount0, amount1);
  console.log(position10, slot0TickSub);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
