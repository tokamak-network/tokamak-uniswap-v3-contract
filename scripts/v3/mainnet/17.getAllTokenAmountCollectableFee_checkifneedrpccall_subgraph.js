const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const JSBI = require('jsbi'); // jsbi@3.2.5
const { getContract} = require('./helper_functions.js');
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const sdk = require('@uniswap/v3-sdk');
const getFeeGrowthInside = sdk.TickLibrary.getFeeGrowthInside;
const getTokensOwed = sdk.PositionLibrary.getTokensOwed;
const axios = require('axios');
//const SUBGRAPH_URL = 'https://thegraph.titan-goerli.tokamak.network/subgraphs/name/tokamak/titan-uniswap-subgraph';
const SUBGRAPH_URL = 'https://thegraph.titan-goerli.tokamak.network/subgraphs/name/tokamak/titan-uniswap-subgraph';
const owner = "0x8c595DA827F4182bC0E3917BccA8e654DF8223E1";

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

  const POSITIONS_QUERY = getPOSITIONS_QUERY(owner);
  const result = await axios.post(SUBGRAPH_URL, { query: POSITIONS_QUERY });
  const length = result.data.data.positions.length;
  const collectableFees = {};

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
    //console.log(position.id, tokenOwed0.toString(), tokenOwed1.toString());
    collectableFees[position.id] = [tokenOwed0.toString(), tokenOwed1.toString()];
    ///////////////
  }
  const postionSnapshotLength = result.data.data.positionSnapshots.length;
  const positionSnapshots = result.data.data.positionSnapshots;
  let rpccallCount = 0;
  for (let i = 0; i < postionSnapshotLength - 1; i++){
    let positionSnapshot1 = positionSnapshots[i];
    let [id1, blockNum1]  = [positionSnapshot1.position.id, positionSnapshot1.blockNumber];
    let positionSnapshot2 = positionSnapshots[i+1];
    let [id2, blockNum2] = [positionSnapshot2.position.id, positionSnapshot2.blockNumber];
    if (id1 === id2){
      let positionSnapshotSameIds = {};
      let findtwoBiggestBlockNums = [];
      positionSnapshotSameIds[blockNum1] = positionSnapshot1;
      positionSnapshotSameIds[blockNum2] = positionSnapshot2;
      findtwoBiggestBlockNums.push(blockNum1, blockNum2);
      while(i < postionSnapshotLength - 2) {
        i++;
        id1 = id2;
        id2 = positionSnapshots[i+1].position.id;
        if(id1 === id2) {
          positionSnapshotSameIds[positionSnapshots[i+1].blockNumber] = positionSnapshots[i+1];
          findtwoBiggestBlockNums.push(positionSnapshots[i+1].blockNumber);
        } else {
          break;
        }
      };
      const twoBiggest = findTwoBiggest(findtwoBiggestBlockNums);
      positionSnapshot1 = positionSnapshotSameIds[twoBiggest[0]];
      positionSnapshot2 = positionSnapshotSameIds[twoBiggest[1]];
      if (positionSnapshot1.liquidity !== positionSnapshot2.liquidity && positionSnapshot1.withdrawnToken0 === positionSnapshot2.withdrawnToken0 && positionSnapshot1.withdrawnToken1 === positionSnapshot2.withdrawnToken1){
        let tokenId = parseInt(id1);
        console.log("tokenId", tokenId);
        let positionInfo = await NonfungiblePositionManagerContract.positions(tokenId);
        rpccallCount++;
        const tokenOwed0Already = positionInfo.tokensOwed0;
        const tokenOwed1Already = positionInfo.tokensOwed1;
        //console.log(tokenId, tokenOwed0Already, tokenOwed1Already);
        collectableFees[id1] = [tokenOwed0Already.add(ethers.BigNumber.from(collectableFees[id1][0])).toString(), tokenOwed1Already.add(ethers.BigNumber.from(collectableFees[id1][1])).toString()];
      }
    }
  }
  console.log(collectableFees);
  console.log('positionCount:', length);
  console.log("rpccallCount:",rpccallCount);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

let findTwoBiggest = function(arr){
  const result = [];
  let max = Math.max.apply(null, arr);
  result.push(max.toString());
  let maxIndex = arr.indexOf(max.toString());
  arr[maxIndex] = -Infinity;
  max = Math.max.apply(null, arr);
  result.push(max.toString());
  return result;
}

function getPOSITIONS_QUERY(ownerAddress){
  return `
  query MyQuery {
    positions(where: {owner: "${ownerAddress}"}) {
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
    positionSnapshots(
    where: {position_: {owner: "${ownerAddress}"}}
    orderBy: position__id
    orderDirection: desc
    ) {
      liquidity
      withdrawnToken0
      withdrawnToken1
      position {
        id
      }
      blockNumber
    }
  }
`
}
