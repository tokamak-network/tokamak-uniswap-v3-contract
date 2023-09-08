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

/////////
const testAccount = "0xB68AA9E398c054da7EBAaA446292f611CA0CD52B";
///////

const SUBGRAPH_URL =
  'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-gorli';
  POSITIONS_QUERY = `
  query MyQuery {
    positions(
      where: {owner: "0xB68AA9E398c054da7EBAaA446292f611CA0CD52B"}
      orderBy: id
    ) {
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
  deployer = await hre.ethers.getSigner(testAccount);
  console.log(deployer.address);
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
    '0x8df54ada313293e80634f981820969be7542cee9'
  );
  let amount0 = amount1 = 0;
  const subgraph_ids = [];
  const subgraph_amounts = [];

  const result = await axios.post(SUBGRAPH_URL, { query: POSITIONS_QUERY });
  console.log(result.data.data);
  const length = result.data.data.positions.length;
  for(let i = 0; i< length; i++) {
    const position = result.data.data.positions[i];
    const slot0TickSub = parseInt(position.pool.tick);
    const tickLowerSub = parseInt(position.tickLower.tickIdx);
    const tickUpperSub = parseInt(position.tickUpper.tickIdx);
    const sqrtPriceSub = JSBI.BigInt(position.pool.sqrtPrice);
    const uppersqrtPriceSub = getSqrtRatioAtTick(tickUpperSub);
    const lowersqrtPriceSub = getSqrtRatioAtTick(tickLowerSub);
    const liquiditySub = JSBI.BigInt(position.liquidity);
    if(slot0TickSub < tickLowerSub) {
      amount0 = getAmount0Delta( lowersqrtPriceSub,uppersqrtPriceSub, liquiditySub, false).toString()
      amount1 = 0;
    } else if (slot0TickSub < tickUpperSub) {
      amount0 = getAmount0Delta(sqrtPriceSub, uppersqrtPriceSub, liquiditySub, false).toString()
      amount1 = getAmount1Delta(lowersqrtPriceSub, sqrtPriceSub, liquiditySub, false).toString()
    } else {
      //console.log(lowersqrtPriceSub.toString(), uppersqrtPriceSub.toString(), liquiditySub.toString());
      amount0 = 0;
      amount1 = getAmount1Delta(lowersqrtPriceSub, uppersqrtPriceSub, liquiditySub, false).toString()
    }
    subgraph_ids.push(position.id);
    subgraph_amounts.push([amount0,amount1]);
     console.log("tokenID: ",position.id);
     console.log(amount0, amount1);
 //console.log(position, slot0TickSub);
  }
  const rpc_ids = [];
  const rpc_amounts = [];
  const resultBalanceOf = await NonfungiblePositionManagerContract.balanceOf(testAccount);
  const nftNums = resultBalanceOf.toNumber();
  console.log(nftNums);
  const nftNumsOrder = [];
  for (let i = 0 ; i< nftNums; i++){
    const tokenIDRPC = await NonfungiblePositionManagerContract.tokenOfOwnerByIndex(testAccount, i);
    nftNumsOrder.push(tokenIDRPC);
  }
  nftNumsOrder.sort(function (a, b) {
    return a - b;
  });
  for (let i = 0 ; i< nftNums; i++){
    let tokenId = nftNumsOrder[i];
    console.log(tokenId);
    let positionInfo = await NonfungiblePositionManagerContract.positions(tokenId);
    let deadline = Math.floor(Date.now() / 1000) + 100000;
    if (positionInfo.liquidity.eq(0)){
      rpc_amounts.push([0,0]);
    } else{
      let results = await NonfungiblePositionManagerContract.callStatic.decreaseLiquidity({
        tokenId: tokenId,
        liquidity: positionInfo.liquidity,
        deadline: deadline,
        amount0Min: 0,
        amount1Min: 0,
      });
      rpc_amounts.push([results.amount0.toString(), results.amount1.toString()]);
    }
    rpc_ids.push(tokenId.toString());
  }
  console.log("subgraph | rpc");
  console.log("position count:",subgraph_ids.length, rpc_ids.length, ", correct?:", subgraph_ids.length == rpc_ids.length);
  for(let i = 0; i< subgraph_ids.length; i++){
    console.log("tokenId:",subgraph_ids[i],",",rpc_ids[i]);
    console.log("amount0:",subgraph_amounts[i][0],",",rpc_amounts[i][0], ", correct?:", subgraph_amounts[i][0] == rpc_amounts[i][0]);
    console.log("amount1:",subgraph_amounts[i][1],",",rpc_amounts[i][1], ", correct?:", subgraph_amounts[i][1] == rpc_amounts[i][1]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
