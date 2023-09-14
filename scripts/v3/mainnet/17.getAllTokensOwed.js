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
  for (let i = 0; i < 66; i++){
    try {
      let tokenId = i;
      let positionInfo = await NonfungiblePositionManagerContract.positions(tokenId);
      const tokenOwed0Already = positionInfo.tokensOwed0;
      const tokenOwed1Already = positionInfo.tokensOwed1;
      console.log(tokenId, tokenOwed0Already, tokenOwed1Already); 
    } catch (error) {
      console.log();
    }
    
    ///////////////
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
