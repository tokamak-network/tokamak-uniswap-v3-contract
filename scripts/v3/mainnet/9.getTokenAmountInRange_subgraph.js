const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const JSBI = require('jsbi'); // jsbi@3.2.5
const { getContract} = require('./helper_functions.js');
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const sdk = require('@uniswap/v3-sdk');
const getSqrtRatioAtTick = sdk.TickMath.getSqrtRatioAtTick;
const getAmount0Delta = sdk.SqrtPriceMath.getAmount0Delta;
const getAmount1Delta = sdk.SqrtPriceMath.getAmount1Delta;
const axios = require('axios');
const SUBGRAPH_URL =
  'https://thegraph.titan-goerli.tokamak.network/subgraphs/name/tokamak/titan-uniswap-subgraph';
  POSITIONS_QUERY = `
  query MyQuery {
    positions(where: {id: "22"}) {
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
    amount1 = getAmount1Delta(lowersqrtPriceSub, uppersqrtPriceSub, liquiditySub, false).toString()
  }
  console.log(amount0, amount1);

  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
