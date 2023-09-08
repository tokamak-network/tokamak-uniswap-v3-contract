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
        "liquidityNet": "91426011629339683",
        "price0": "0.000000000000000000000000000000000000002954278418582885262890650958806081",
        "price1": "338492131855223783697272027725930700000",
        "__typename": "Tick",
        "liquidityGross": "91426011629339683"
      },
      {
        "tick": "-92460",
        "liquidityNet": "141435641405323348510",
        "price0": "0.00009654148642954377697064259520969804",
        "price1": "10358.24117675878701682919077912586",
        "__typename": "Tick",
        "liquidityGross": "141435641405323348510"
      },
      {
        "tick": "-85200",
        "liquidityNet": "238921269400242085362",
        "price0": "0.0001995243989925643897415756494741576",
        "price1": "5011.918367122943553509787939409857",
        "__typename": "Tick",
        "liquidityGross": "238921269400242085362"
      },
      {
        "tick": "-80100",
        "liquidityNet": "1067850948698556588270",
        "price0": "0.0003322577527032774153944283990544477",
        "price1": "3009.711562375639715186338613911201",
        "__typename": "Tick",
        "liquidityGross": "1067850948698556588270"
      },
      {
        "tick": "-77640",
        "liquidityNet": "1991394999010102307228",
        "price0": "0.0004249190720498402550614460435558151",
        "price1": "2353.389305817523946628536271590027",
        "__typename": "Tick",
        "liquidityGross": "1991394999010102307228"
      },
      {
        "tick": "-76140",
        "liquidityNet": "-1991394999010102307228",
        "price0": "0.0004936818259150759809596679178062766",
        "price1": "2025.596138051923679677737821952354",
        "__typename": "Tick",
        "liquidityGross": "1991394999010102307228"
      },
      {
        "tick": "-76020",
        "liquidityNet": "-238921269400242085362",
        "price0": "0.0004996413957605122661205544361180469",
        "price1": "2001.435446472332007457715061875249",
        "__typename": "Tick",
        "liquidityGross": "238921269400242085362"
      },
      {
        "tick": "-73140",
        "liquidityNet": "1460182551030245820",
        "price0": "0.0006663907655815661367396560574919887",
        "price1": "1500.62103445759729620537110304243",
        "__typename": "Tick",
        "liquidityGross": "1460182551030245820"
      },
      {
        "tick": "-72420",
        "liquidityNet": "-1460182551030245820",
        "price0": "0.0007161378195380760142499232191857418",
        "price1": "1396.379262088156542776238731876913",
        "__typename": "Tick",
        "liquidityGross": "1460182551030245820"
      },
      {
        "tick": "-46080",
        "liquidityNet": "-1067850948698556588270",
        "price0": "0.009974039462202664295231746582056602",
        "price1": "100.2602810816591915339715672222582",
        "__typename": "Tick",
        "liquidityGross": "1067850948698556588270"
      },
      {
        "tick": "16080",
        "liquidityNet": "76027763255584",
        "price0": "4.992414224852787072040281992146536",
        "price1": "0.2003038920572515840132386670115411",
        "__typename": "Tick",
        "liquidityGross": "76027763255584"
      },
      {
        "tick": "23040",
        "liquidityNet": "-76027763255584",
        "price0": "10.01300559680554615508089957799179",
        "price1": "0.09987011295779465721366739428013291",
        "__typename": "Tick",
        "liquidityGross": "76027763255584"
      },
      {
        "tick": "92100",
        "liquidityNet": "-141435641405323348510",
        "price0": "9991.994793093059210757145302033331",
        "price1": "0.000100080116203748168163561592702797",
        "__typename": "Tick",
        "liquidityGross": "141435641405323348510"
      },
      {
        "tick": "887220",
        "liquidityNet": "-91426011629339683",
        "price0": "338492131855223783697272027725930700000",
        "price1": "0.000000000000000000000000000000000000002954278418582885262890650958806081",
        "__typename": "Tick",
        "liquidityGross": "91426011629339683"
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
  ///=============== NonfungiblePositionManagerContract`
  const NonfungiblePositionManagerContract = (
    await getContract('NonfungiblePositionManager')
  ).connect(deployer);
  const UniswapV3Pool_ = new ethers.ContractFactory(
      UniswapV3PoolArtifact.abi,
      UniswapV3PoolArtifact.bytecode,
      deployer
    );
    let UniswapV3PoolContract = UniswapV3Pool_.attach(
      '0x3b466f5d9b49aedd65f6124d5986a9f30b1f5442'/////////////
    );
    let tickSpacing = 60; /////////
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