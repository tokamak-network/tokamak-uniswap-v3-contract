const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const { expect } = require("chai");
const {NonfungiblePositionManager: NonfungiblePositionManagerAddress, getContract, deployContract, getPoolContractAddress} = require("./constant.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const sdk = require("@uniswap/v3-sdk");
const nearestUsableTick = sdk.nearestUsableTick;
const {consoleEvents} = require("./consoleEvents.js");


async function main() {
    const accounts = await hre.ethers.getSigners();
    const deployer = accounts[0];
    providers = hre.ethers.provider;
    await deployContract();
    console.log("Deployer ETH Balance:", await providers.getBalance(deployer.address));
    let totalGasUsed = ethers.BigNumber.from("0")

    ///=============== TONContract  
    const TONContract = await getContract('TON');
    ///=============== TOSContract  
    const TOSContract = await getContract('TOS');
    ///=============== WETHContract  
    const WETHContract = await getContract('WETH');
    ///=============== USDCContract  
    const USDCContract = await getContract('USDC');
    ///=============== USDTContract  
    const USDTContract = await getContract('USDT');

    //=======================approve
    let allowanceAmount = ethers.utils.parseEther('1000000000000'); //0 12개 ether
    let minimumallowanceAmount = ethers.utils.parseEther('100000000000'); //0 11개 ether
    ///=============== TON Contract Allowance
    let allowance = await TONContract.allowance(
      deployer.address,
      NonfungiblePositionManagerAddress
    );
    if (allowance.lt(minimumallowanceAmount)) {
      const tx = await TONContract.approve(
        NonfungiblePositionManagerAddress,
        allowanceAmount
      );
      await tx.wait();
      expect(await TONContract.allowance(deployer.address, NonfungiblePositionManagerAddress)).to.equal(allowanceAmount);
      console.log(`TON Contract ${allowanceAmount} ether amount Approved`);
      const receipt = await providers.getTransactionReceipt(tx.hash);
      console.log("transactionHash:", receipt.transactionHash);
      console.log("gasUsed: ",receipt.gasUsed);
      console.log();
      totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    }
  
    ///================ TOS Contract Allowance 
    allowance = await TOSContract.allowance(
      deployer.address,
      NonfungiblePositionManagerAddress
    );
    if (allowance.lt(minimumallowanceAmount)) {
      const tx = await TOSContract.approve(
        NonfungiblePositionManagerAddress,
        allowanceAmount
      );
      await tx.wait();
      expect(await TONContract.allowance(deployer.address, NonfungiblePositionManagerAddress)).to.equal(allowanceAmount);
      console.log(`TOS Contract ${allowanceAmount} ether amount Approved`);
      const receipt = await providers.getTransactionReceipt(tx.hash);
      console.log("transactionHash:", receipt.transactionHash);
      console.log("gasUsed: ",receipt.gasUsed);
      console.log();
      totalGasUsed = totalGasUsed.add(receipt.gasUsed);

      
    }

    ///================ WETH Contract Allowance 
    allowance = await WETHContract.allowance(
      deployer.address,
      NonfungiblePositionManagerAddress
    );
    if (allowance.lt(minimumallowanceAmount)) {
      const tx = await WETHContract.approve(
        NonfungiblePositionManagerAddress,
        allowanceAmount
      );
      await tx.wait();
      expect(await WETHContract.allowance(deployer.address, NonfungiblePositionManagerAddress)).to.equal(allowanceAmount);
      console.log(`WETH Contract ${allowanceAmount} ether amount Approved`);
      const receipt = await providers.getTransactionReceipt(tx.hash);
      console.log("transactionHash:", receipt.transactionHash);
      console.log("gasUsed: ",receipt.gasUsed);
      console.log();
      totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    }

    ///================ USDC Contract Allowance 
    allowance = await USDCContract.allowance(
      deployer.address,
      NonfungiblePositionManagerAddress
    );
    if (allowance.lt(minimumallowanceAmount)) {
      const tx = await USDCContract.approve(
        NonfungiblePositionManagerAddress,
        allowanceAmount
      );
      await tx.wait();
      expect(await USDCContract.allowance(deployer.address, NonfungiblePositionManagerAddress)).to.equal(allowanceAmount);
      console.log(`USDCContract Contract ${allowanceAmount} ether amount Approved`);
      const receipt = await providers.getTransactionReceipt(tx.hash);
      console.log("transactionHash:", receipt.transactionHash);
      console.log("gasUsed: ",receipt.gasUsed);
      console.log();
      totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    }

    ///================ USDT Contract Allowance 
    allowance = await USDTContract.allowance(
      deployer.address,
      NonfungiblePositionManagerAddress
    );
    if (allowance.lt(minimumallowanceAmount)) {
      const tx = await USDTContract.approve(
        NonfungiblePositionManagerAddress,
        allowanceAmount
      );
      await tx.wait();
      expect(await USDTContract.allowance(deployer.address, NonfungiblePositionManagerAddress)).to.equal(allowanceAmount);
      console.log(`USDTContract Contract ${allowanceAmount} ether amount Approved`);
      const receipt = await providers.getTransactionReceipt(tx.hash);
      console.log("transactionHash:", receipt.transactionHash);
      console.log("gasUsed: ",receipt.gasUsed);
      console.log();
      totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    }

    console.log("totalGasUsed:",totalGasUsed);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });