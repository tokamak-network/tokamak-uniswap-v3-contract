const ethers = require('ethers');
const fs = require("fs");
require('dotenv').config();
const hre = require('hardhat');
const {NonfungiblePositionManager: NonfungiblePositionManagerAddress, getContract, getPoolContractAddress, Fee, deployContract} = require("./constant.js");
const { expect } = require("chai");
const {encodePriceSqrt} = require('../../utils.js');
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');

async function main() {
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;
  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  ///=============== TONContract  
  const TONContract = await getContract('TON');
  ///=============== TOSContract  
  const TOSContract = await getContract('TOS');
  ///=============== WETHContract  
  const WETHContract = await getContract('WETH');
  ///=============== poolAddresses
  let poolAddressTOSTON = await getPoolContractAddress(UniswapV3FactoryContract, TONContract.address, TOSContract.address);
  let poolAddressWETHTOS = await getPoolContractAddress(UniswapV3FactoryContract, WETHContract.address, TOSContract.address);
  let poolAddressWETHTON = await getPoolContractAddress(UniswapV3FactoryContract, WETHContract.address, TONContract.address);
  
  let sqrtPriceX96 = ethers.constants.Zero;
  let tick = 0;
  let UniswapV3PoolContract = null;
  const UniswapV3Pool_ = new ethers.ContractFactory(
    UniswapV3PoolArtifact.abi,
    UniswapV3PoolArtifact.bytecode,
    deployer
  );
  //==================poolAddressTOSTON
  if (poolAddressTOSTON !== '0x0000000000000000000000000000000000000000') {
    UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressTOSTON);
    let slot0 = await UniswapV3PoolContract.slot0();
    sqrtPriceX96 = slot0.sqrtPriceX96;
    
    //1 WTON = 0.69988 TOS 2023.06.21 12:21am 기준
    //1 TOS = 1.42882 WTON
    //encodePriceSqrt(reserve1, reserve0)
    let reserve0, reserve1;
    if(TONContract.address < TOSContract.address){
      reserve0 = 1.42882;
      reserve1 = 1;
    } else{
      reserve0 = 1;
      reserve1 = 1.42882;
    }
    if(sqrtPriceX96.eq(ethers.constants.Zero)){
      let tx2 = await UniswapV3PoolContract.initialize(encodePriceSqrt(reserve1, reserve0));
      await tx2.wait();
      const receipt = await providers.getTransactionReceipt(tx2.hash);
      console.log(receipt);
    }
  }

  //==================poolAddressWETHTOS
  if (poolAddressWETHTOS !== '0x0000000000000000000000000000000000000000') {
    UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHTOS);
    let slot0 = await UniswapV3PoolContract.slot0();
    sqrtPriceX96 = slot0.sqrtPriceX96;

    //1 ETH = 914.193 TOS 2023.06.21 12:21am 기준
    //1 TOS = 0.00109 ETH
    //encodePriceSqrt(reserve1, reserve0)
    let reserve0, reserve1;
    if(WETHContract.address < TOSContract.address){
      reserve0 = 1;
      reserve1 = 914.193;
    } else{
      reserve0 = 914.193;
      reserve1 = 1;
    }

    if(sqrtPriceX96.eq(ethers.constants.Zero)){
      let tx2 = await UniswapV3PoolContract.initialize(encodePriceSqrt(reserve1, reserve0));
      await tx2.wait();
      const receipt = await providers.getTransactionReceipt(tx2.hash);
      console.log(receipt);
    }
  }

  //==================poolAddressWETHTON
  if (poolAddressWETHTON !== '0x0000000000000000000000000000000000000000') {
    UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHTON);
    let slot0 = await UniswapV3PoolContract.slot0();
    sqrtPriceX96 = slot0.sqrtPriceX96;

    //1 WTON = 0.00077 ETH 2023.06.21 12:21am 기준
    //1 ETH = 1,304.25 WTON
    //encodePriceSqrt(reserve1, reserve0)
    let reserve0, reserve1;
    if(WETHContract.address < TONContract.address){
      reserve0 = 1;
      reserve1 = 1,304.25;
    } else{
      reserve0 = 1,304.25;
      reserve1 = 1;
    }

    if(sqrtPriceX96.eq(ethers.constants.Zero)){
      let tx2 = await UniswapV3PoolContract.initialize(encodePriceSqrt(reserve1, reserve0));
      await tx2.wait();
      const receipt = await providers.getTransactionReceipt(tx2.hash);
      console.log(receipt);
    }
  }
  console.log('poolAddressTOSTON', poolAddressTOSTON);
  console.log('poolAddressWETHTOS', poolAddressWETHTOS);
  console.log('poolAddressWETHTON', poolAddressWETHTON);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
