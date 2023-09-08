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
        "tick": "192040",
        "liquidityNet": "-147036927562019",
        "liquidityGross": "147036927562019"
      },
      {
        "tick": "192060",
        "liquidityNet": "-110172609084353",
        "liquidityGross": "110172609084353"
      },
      {
        "tick": "192070",
        "liquidityNet": "140326580976",
        "liquidityGross": "140326580976"
      },
      {
        "tick": "192080",
        "liquidityNet": "4529554013872",
        "liquidityGross": "4529554013872"
      },
      {
        "tick": "192200",
        "liquidityNet": "15414338298688096",
        "liquidityGross": "18678180153422378"
      },
      {
        "tick": "192340",
        "liquidityNet": "13506826513573",
        "liquidityGross": "13506826513573"
      },
      {
        "tick": "192380",
        "liquidityNet": "-2692443696620189",
        "liquidityGross": "2692443696620189"
      },
      {
        "tick": "192430",
        "liquidityNet": "-10497484848368857",
        "liquidityGross": "10497484848368857"
      },
      {
        "tick": "192540",
        "liquidityNet": "-141815289",
        "liquidityGross": "2239138129"
      },
      {
        "tick": "192580",
        "liquidityNet": "3790906020488205",
        "liquidityGross": "3790906020488205"
      },
      {
        "tick": "192600",
        "liquidityNet": "-3644394708515212",
        "liquidityGross": "3937417332461198"
      },
      {
        "tick": "192610",
        "liquidityNet": "260665095269471",
        "liquidityGross": "260665095269471"
      },
      {
        "tick": "192860",
        "liquidityNet": "132275722559100",
        "liquidityGross": "132275722559100"
      },
      {
        "tick": "192890",
        "liquidityNet": "-3237118060730",
        "liquidityGross": "3237118060730"
      },
      {
        "tick": "192900",
        "liquidityNet": "5875113052435318",
        "liquidityGross": "5875113052435318"
      },
      {
        "tick": "192920",
        "liquidityNet": "1271190279969978",
        "liquidityGross": "1271190279969978"
      },
      {
        "tick": "192930",
        "liquidityNet": "380121176868823",
        "liquidityGross": "380121176868823"
      },
      {
        "tick": "192970",
        "liquidityNet": "-380121176868823",
        "liquidityGross": "380121176868823"
      },
      {
        "tick": "193000",
        "liquidityNet": "58278198966",
        "liquidityGross": "58278198966"
      },
      {
        "tick": "193010",
        "liquidityNet": "-140326580976",
        "liquidityGross": "140326580976"
      },
      {
        "tick": "193020",
        "liquidityNet": "939548715160843",
        "liquidityGross": "939548715160843"
      },
      {
        "tick": "193030",
        "liquidityNet": "98698960755",
        "liquidityGross": "98698960755"
      },
      {
        "tick": "193120",
        "liquidityNet": "5093975067",
        "liquidityGross": "5093975067"
      },
      {
        "tick": "193130",
        "liquidityNet": "891838173693642",
        "liquidityGross": "891838173693642"
      },
      {
        "tick": "193160",
        "liquidityNet": "-639430873",
        "liquidityGross": "196758490637"
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
  // const TOSContract = await getContract('TOS');
  // const TOSAddress = TOSContract.address;
  // ///=============== USDCContract
  // const TONContract = await getContract('TON');
  // const TONAddress = TONContract.address;
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
      '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'
    );
    let tickSpacing = 10;
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
  let upperCompressed = 193160/tickSpacing;
  let maxbitmapIndex = upperCompressed>>8;
  let lowerCompressed = 192040/tickSpacing;
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