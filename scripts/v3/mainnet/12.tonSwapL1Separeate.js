const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const {getContract, getPoolContractAddress, deployContract} = require("./helper_functions.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const { expect } = require("chai");
const {encodePath } = require("../../utils");

async function main() {
  const chainId = hre.network.config.chainId;
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;
  let totalGasUsed = ethers.BigNumber.from("0")
  ///=============== TONContract
  const TONContract = await getContract('TON');
  const TONAddress = TONContract.address;
  ///=============== TONContract
  const WTONContract = await getContract('WTON');
  const WTONAddress = WTONContract.address;
  ///=============== TOSContract
  const TOSContract = await getContract('TOS');
  const TOSAddress = TOSContract.address;
  ///=============== WETHContract
  const WETHContract = await getContract('WETH');
  const WETHAddress = WETHContract.address;
  ///=============== SwapRouterContract  
  const SwapRouterContract = await getContract('SwapRouter02');
  const SwapRouterAddress = SwapRouterContract.address;
  //////////////////////////////////////////
  
  //=============SwapFromTonAndTransfer
  let amountIn = ethers.utils.parseEther('0.01');
  const swapFromTONCall = {
    target: WTONAddress,
    callData: WTONContract.interface.encodeFunctionData('swapFromTON',[amountIn])
  }
  //==============exactIn data
  let deadline = Date.now() + 100000;

  let paths = [WTONAddress, TOSAddress];
  let fee = [3000];
  let path = encodePath(paths, fee)
  
  const params = {
    recipient: deployer.address,
    path,
    amountIn: ethers.utils.parseEther('10000000'),
    amountOutMinimum:0,
    deadline,
  };

  //=============approve
  let allowance = await TONContract.allowance(deployer.address, WTONAddress);
  if(allowance.lt(ethers.utils.parseEther('100000'))){
    const tx = await TONContract.approve(WTONAddress, ethers.utils.parseEther('100000000000'))
        await tx.wait();
        const receipt = await providers.getTransactionReceipt(tx.hash);
        console.log("==== user approves tonContract.approve(WTONContract, 100000000000 TON) ====");
        console.log(receipt);
        console.log(receipt.gasUsed);
  }

  //=============approve
  allowance = await WTONContract.allowance(deployer.address, SwapRouterAddress);
  if(allowance.lt(ethers.utils.parseEther('100000'))){
    const tx = await WTONContract.approve(SwapRouterAddress, ethers.utils.parseEther('100000000000'))
        await tx.wait();
        const receipt = await providers.getTransactionReceipt(tx.hash);
        console.log("==== user approves WtonContract.approve(SwapRouter, 100000000000 TON) ====");
        console.log(receipt);
        console.log(receipt.gasUsed);
  }

  // ========= ton, tos balance check
  let balanceBeforeTON = await TONContract.balanceOf(deployer.address);
  console.log("balanceBeforeTON:",balanceBeforeTON);
  let balanceBeforeWTON = await WTONContract.balanceOf(deployer.address);
  console.log("balanceBeforeWTON:",balanceBeforeWTON);
  let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
  console.log("balanceBeforeTOS:",balanceBeforeTOS);
  let balanceBeforeETH = await providers.getBalance(deployer.address);
  console.log("balanceBeforeETH", balanceBeforeETH);

  let tx = await WTONContract.swapFromTON(amountIn);
  await tx.wait();
  let receipt = await providers.getTransactionReceipt(tx.hash);
  console.log("===== swapFromTON ======")
  console.log(receipt);
  console.log(receipt.gasUsed);

  // ========= ton, tos balance check
  let balanceAfterSwapFromTONTON = await TONContract.balanceOf(deployer.address);
  console.log("balanceAfterSwapFromTON:",balanceAfterSwapFromTONTON);
  let balanceAfterSwapFromTONWTON = await WTONContract.balanceOf(deployer.address);
  console.log("balanceAfterSwapFromTONWTON:",balanceAfterSwapFromTONWTON);
  let balanceAfterSwapFromTONTOS = await TOSContract.balanceOf(deployer.address);
  console.log("balanceAfterSwapFromTONTOS:",balanceAfterSwapFromTONTOS);
  let balanceAfterSwapFromTONETH = await providers.getBalance(deployer.address);
  console.log("balanceAfterSwapFromTONETH", balanceAfterSwapFromTONETH);
  
  tx = await SwapRouterContract.exactInput(params);
  await tx.wait();
  receipt = await providers.getTransactionReceipt(tx.hash);
  console.log("===== exactInput ======")
  console.log(receipt);
  console.log(receipt.gasUsed);

  // ========= ton, tos balance check
  let balanceAfterTON = await TONContract.balanceOf(deployer.address);
  console.log("balanceAfterTON:",balanceAfterTON);
  let balanceAfterWTON = await WTONContract.balanceOf(deployer.address);
  console.log("balanceAfterWTON:",balanceAfterWTON);
  let balanceAfterTOS = await TOSContract.balanceOf(deployer.address);
  console.log("balanceAfterTOS:",balanceAfterTOS);
  let balanceAfterETH = await providers.getBalance(deployer.address);
  console.log("balanceAfterETH", balanceAfterETH);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  