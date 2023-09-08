const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const JSBI = require('jsbi') // jsbi@3.2.5
const {NonfungiblePositionManager: NonfungiblePositionManagerAddress, getContract, getPoolContractAddress} = require("./helper_functions.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const SubgraphResult = {
  "data": {
    "ticks": [
      {
        "tick": "-887220",
        "liquidityNet": "19500396393",
        "liquidityGross": "19500396393"
      },
      {
        "tick": "-206160",
        "liquidityNet": "5170636001269",
        "liquidityGross": "5170636001269"
      },
      {
        "tick": "-195780",
        "liquidityNet": "-5170636001269",
        "liquidityGross": "5170636001269"
      },
      {
        "tick": "887220",
        "liquidityNet": "-19500396393",
        "liquidityGross": "19500396393"
      }
    ]
  }
}
async function main() {
    const chainName = hre.network.name;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
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
      '0xcd55aa8bec623e17147059ab5cf91c77299c2cee'
    );
    let tickSpacing = 60;
    let initializedTicks = await getInitializedTicks(tickSpacing, UniswapV3PoolContract);
    let subgraphInitializedTicks = [];
    const ticks = SubgraphResult.data.ticks;
    for(let i = 0; i< ticks.length; i++){
        tick = ticks[i];
        let rpctick = await UniswapV3PoolContract.ticks(ethers.BigNumber.from(tick.tick));
        //console.log(tick.tick, rpctick);
        subgraphInitializedTicks.push(tick.tick);
        console.log("tick:",tick.tick,", subgraph liquidityNet:", tick.liquidityNet,", rpc liquidityNet:", rpctick.liquidityNet.toString(), ", correct?=", tick.liquidityNet == rpctick.liquidityNet.toString());
        //console.log("             subgraph liquidityGross:",tick.liquidityGross, ", rpc liquidityGross",rpctick.liquidityGross.toString(),", correct?=", tick.liquidityGross == rpctick.liquidityGross.toString());
    }
    let subgraphitlength = subgraphInitializedTicks.length;
    let rpcitlength = initializedTicks.length;
    let shorterLength = subgraphitlength > rpcitlength ? rpcitlength : subgraphitlength;
    console.log("subgraphInitalizedTicks, rpcInitializedTicks");
    for(let i = 0 ; i< shorterLength; i++){
      console.log(subgraphInitializedTicks[i], initializedTicks[i]);
    }
    for(let i = shorterLength; i< subgraphitlength; i++){
      console.log(subgraphInitializedTicks[i],", x");
    }
    for(let i = shorterLength; i< rpcitlength; i++){
      console.log("x, ", initializedTicks[i]);
    }
    // console.log("subgraph InitializedTicks : ",subgraphInitializedTicks);
    // console.log("rpc InitializedTicks",initializedTicks);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

async function getInitializedTicks(tickSpacing, UniswapV3PoolContract) {
  let upperCompressed = 887220/tickSpacing;
  let maxbitmapIndex = upperCompressed>>8;
  let lowerCompressed = -887220/tickSpacing;
  let minbitmapIndex = lowerCompressed>>8;
  let initializedTicks = [];
  for(let i= minbitmapIndex; i <= maxbitmapIndex; i++){
    let numberstr = BigInt(await UniswapV3PoolContract.tickBitmap(i)).toString(2);
    let length = numberstr.length;
    for (let j = length-1; j>=0; j--){
      if(numberstr[j] == 1){
          let index = length - j - 1;
          initializedTicks.push((index + (i*256))*tickSpacing);
      }
    }
  }
  return initializedTicks;
}