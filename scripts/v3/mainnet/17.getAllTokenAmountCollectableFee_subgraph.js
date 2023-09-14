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
const getFeeGrowthInside = sdk.TickLibrary.getFeeGrowthInside;
const getTokensOwed = sdk.PositionLibrary.getTokensOwed;
const axios = require('axios');
//const SUBGRAPH_URL = 'https://thegraph.titan-goerli.tokamak.network/subgraphs/name/tokamak/titan-uniswap-subgraph';
const SUBGRAPH_URL = 'https://thegraph.titan-goerli.tokamak.network/subgraphs/name/tokamak/titan-uniswap-subgraph';
  const owner = "0xB68AA9E398c054da7EBAaA446292f611CA0CD52B";
  POSITIONS_QUERY = `
  query MyQuery {
    positions(where: {owner: "0xB68AA9E398c054da7EBAaA446292f611CA0CD52B"}) {
      liquidity
      pool {
        tick
        feeGrowthGlobal0X128
        feeGrowthGlobal1X128
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
      feeGrowthInside0LastX128
      feeGrowthInside1LastX128
      id
    }
  }
`;
async function main() {
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;
  const NonfungiblePositionManagerContract = (
    await getContract('NonfungiblePositionManager')
  ).connect(deployer);
  const UniswapV3Pool_ = new ethers.ContractFactory(
    UniswapV3PoolArtifact.abi,
    UniswapV3PoolArtifact.bytecode,
    deployer
  );
  const result = await axios.post(SUBGRAPH_URL, { query: POSITIONS_QUERY });
  const length = result.data.data.positions.length;
  for (let i = 0; i<length; i++){
    const position = result.data.data.positions[i];
    const slot0TickSub = parseInt(position.pool.tick);
    const tickLowerSub = parseInt(position.tickLower.tickIdx);
    const tickUpperSub = parseInt(position.tickUpper.tickIdx);
    const liquiditySub = JSBI.BigInt(position.liquidity);

    const feeGrowthOutside0Lower = JSBI.BigInt(position.tickLower.feeGrowthOutside0X128);
    const feeGrowthOutside1Lower = JSBI.BigInt(position.tickLower.feeGrowthOutside1X128);
    const feeGrowthOutside0Upper = JSBI.BigInt(position.tickUpper.feeGrowthOutside0X128);
    const feeGrowthOutside1Upper = JSBI.BigInt(position.tickUpper.feeGrowthOutside1X128);
    const feeGrowthGlobal0X128 = JSBI.BigInt(position.pool.feeGrowthGlobal0X128);
    const feeGrowthGlobal1X128 = JSBI.BigInt(position.pool.feeGrowthGlobal1X128);


    const feeGrowthInside = getFeeGrowthInside({feeGrowthOutside0X128: feeGrowthOutside0Lower, feeGrowthOutside1X128:feeGrowthOutside1Lower},{feeGrowthOutside0X128: feeGrowthOutside0Upper, feeGrowthOutside1X128:feeGrowthOutside1Upper}, tickLowerSub, tickUpperSub, slot0TickSub, feeGrowthGlobal0X128, feeGrowthGlobal1X128);
    const feeGrowthInside0X128 =  feeGrowthInside[0];
    const feeGrowthInside1X128 = feeGrowthInside[1];
    const feeGrowthInside0LastX128 = JSBI.BigInt(position.feeGrowthInside0LastX128);
    const feeGrowthInside1LastX128 = JSBI.BigInt(position.feeGrowthInside1LastX128);

    const tokenOweds = getTokensOwed(feeGrowthInside0LastX128,feeGrowthInside1LastX128,liquiditySub,feeGrowthInside0X128, feeGrowthInside1X128);
    const tokenOwed0 = tokenOweds[0];
    const tokenOwed1 = tokenOweds[1]; 
    ///////////////



    let tokenId = parseInt(position.id);
    let positionInfo = await NonfungiblePositionManagerContract.positions(tokenId);
    const tokenOwed0Already = positionInfo.tokensOwed0;
    const tokenOwed1Already = positionInfo.tokensOwed1;
    console.log(tokenId, tokenOwed0Already, tokenOwed1Already);
    console.log(tokenOwed0.toString(), tokenOwed1.toString());
    ///////////////

    console.log("token0AmountFeeToBeCollected, ",(ethers.BigNumber.from(tokenOwed0.toString())).add(tokenOwed0Already).toString()); // amount0 + fee = 44071833809710618407
    console.log("token1AmountFeeToBeCollected, ",(ethers.BigNumber.from(tokenOwed1.toString())).add(tokenOwed1Already).toString()); // amount1 + fee = 18546165554919205637
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
