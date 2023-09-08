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
        "liquidityNet": "295357630202801652540",
        "liquidityGross": "295357630202801652540"
      },
      {
        "tick": "-6960",
        "liquidityNet": "2033221021885669794636",
        "liquidityGross": "2033221021885669794636"
      },
      {
        "tick": "-1260",
        "liquidityNet": "9204617911425388155947",
        "liquidityGross": "9204617911425388155947"
      },
      {
        "tick": "2700",
        "liquidityNet": "5392127",
        "liquidityGross": "5392127"
      },
      {
        "tick": "2820",
        "liquidityNet": "-5392127",
        "liquidityGross": "5392127"
      },
      {
        "tick": "2880",
        "liquidityNet": "692691774310136869118",
        "liquidityGross": "692691774310136869118"
      },
      {
        "tick": "3000",
        "liquidityNet": "-625579732809067817545",
        "liquidityGross": "625579732809067817545"
      },
      {
        "tick": "3120",
        "liquidityNet": "1913662642978290597",
        "liquidityGross": "1913662642978290597"
      },
      {
        "tick": "3240",
        "liquidityNet": "-1913662642978290597",
        "liquidityGross": "1913662642978290597"
      },
      {
        "tick": "3300",
        "liquidityNet": "-67112041501069051573",
        "liquidityGross": "67112041501069051573"
      },
      {
        "tick": "6960",
        "liquidityNet": "-2030524448043479712137",
        "liquidityGross": "2033356863261791599467"
      },
      {
        "tick": "7200",
        "liquidityNet": "-9204617911425388155947",
        "liquidityGross": "9204617911425388155947"
      },
      {
        "tick": "52980",
        "liquidityNet": "-1280366233034138834",
        "liquidityGross": "1280366233034138834"
      },
      {
        "tick": "887220",
        "liquidityNet": "-296773837811957596205",
        "liquidityGross": "296773837811957596205"
      }
    ],
    "pools": [
      {
        "id": "0x2c1c509942d4f55e2bfd2b670e52b7a16ec5e5c4",
        "liquidity": "11602222267657906945293"
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
      '0x2c1c509942d4f55e2bfd2b670e52b7a16ec5e5c4'
    );
    let tickSpacing = 60;
    let initializedTicks = await getInitializedTicks(tickSpacing, UniswapV3PoolContract);
    let subgraphInitializedTicks = [];
    const ticks = SubgraphResult.data.ticks;
    for(let i = 0; i< ticks.length; i++){
        tick = ticks[i];
        let rpctick = await UniswapV3PoolContract.ticks(tick.tick);
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