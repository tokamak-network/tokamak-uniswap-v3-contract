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
  let tokamakAccount;
  if (chainId === 31337)
  tokamakAccount = await hre.ethers.getImpersonatedSigner(
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    );
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
  let Multicall2Contract;
  if(chainId === 31337){
    const Multicall2Factory = await hre.ethers.getContractFactory("Multicall2");
    Multicall2Contract = await Multicall2Factory.deploy();
    await Multicall2Contract.deployed();
  } else{
    Multicall2Contract = await getContract('Multicall2');
  }
  //const Multicall2Contract = await getContract('Multicall2');
  const Multicall2Address = Multicall2Contract.address;

  let tx, receipt;

  //============= Multicall approves tonContract.approve(WTONContract, uint256.max)
  let allowance = await TONContract.allowance(Multicall2Address, WTONAddress);
  if(allowance.lt(ethers.utils.parseEther('100000000000000'))){
    const multicall2ApprovesWTONContractCall = {
      target: TONAddress,
      callData: TONContract.interface.encodeFunctionData('approve',[WTONAddress, ethers.constants.MaxUint256])
    }
    let tx = await Multicall2Contract.connect(tokamakAccount).aggregate([multicall2ApprovesWTONContractCall], {gasLimit: ethers.BigNumber.from('30000000')});
    await tx.wait();
    let receipt = await providers.getTransactionReceipt(tx.hash);
    console.log("==== Multicall approves tonContract.approve(WTONContract, uint256.max) ====");
    console.log(receipt);
    console.log(receipt.gasUsed);
  }

  //=============approve
  allowance = await TONContract.allowance(deployer.address, Multicall2Address);
  if(allowance.lt(ethers.utils.parseEther('100000'))){
    const tx = await TONContract.approve(Multicall2Address, ethers.utils.parseEther('100000000000'))
        await tx.wait();
        const receipt = await providers.getTransactionReceipt(tx.hash);
        console.log("==== user approves tonContract.approve(Multicall2Address, 100000000000 TON) ====");
        console.log(receipt);
        console.log(receipt.gasUsed);
  }
  
  //============ swapAmount
  let amountIn = ethers.utils.parseEther('0.01');

  //============ tonContract.transferFrom(user, multicall2, swapAmount);
  const transferFromUserToMulticall2Call = {
    target: TONAddress,
    callData: TONContract.interface.encodeFunctionData('transferFrom',[deployer.address, Multicall2Address, amountIn])
  }

  //============= SwapFromTonAndTransfer
  const swapFromTonAndTransferParams = [SwapRouterAddress, amountIn]
  const swapFromTonAndTransferCall = {
    target: WTONAddress,
    callData: WTONContract.interface.encodeFunctionData('swapFromTONAndTransfer', swapFromTonAndTransferParams)
  }
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
    amountIn:0,
    amountOutMinimum:0,
    deadline,
  }
  const exactInputSingleCall = {
    target: SwapRouterAddress,
    callData: SwapRouterContract.interface.encodeFunctionData('exactInput', [params])
  }

  // ========= ton, tos balance check
  let balanceBeforeTON = await TONContract.balanceOf(deployer.address);
  console.log("balanceBeforeTON:",balanceBeforeTON);
  let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
  console.log("balanceBeforeTOS:",balanceBeforeTOS);
  let balanceBeforeETH = await providers.getBalance(deployer.address);
  console.log("balanceBeforeETH", balanceBeforeETH);

  // ==========aggregate
  const aggregateParams = [transferFromUserToMulticall2Call, swapFromTonAndTransferCall,exactInputSingleCall];
  tx = await Multicall2Contract.aggregate(aggregateParams);
  await tx.wait();
  receipt = await providers.getTransactionReceipt(tx.hash);
  console.log(receipt);
  console.log("==== aggregate =====")
  console.log(receipt.gasUsed);


  // ========= ton, tos balance check
  let balanceAfterTON = await TONContract.balanceOf(deployer.address);
  console.log("balanceAfterTON:",balanceAfterTON);
  let balanceAfterTOS = await TOSContract.balanceOf(deployer.address);
  console.log("balanceAfterTOS:",balanceAfterTOS);
  let balanceAfterETH = await providers.getBalance(deployer.address);
  console.log("balanceAfterETH", balanceAfterETH);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  

//console.log(swapFromTonAndTransferParams);
//   const tx = await WTONContract.swapFromTONAndTransfer(swapFromTonAndTransferParams[0], swapFromTonAndTransferParams[1]);
// const tx = await SwapRouterAddress.exactInput(params);