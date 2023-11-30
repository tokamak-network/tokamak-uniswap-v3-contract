const ethers = require("ethers");
require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const {
  getContract,
  getPoolContractAddress,
} = require("./helper_functions.js");
const { expect } = require("chai");

const chainName = hre.network.name;
//let allowanceAmount = ethers.utils.parseEther("1000000000000"); //0 12개
let allowanceAmount = ethers.constants.MaxUint256;
let minimumallowanceAmount = ethers.constants.MaxUint256; //0 11개 ether

async function main() {
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;
  let totalGasUsed = ethers.BigNumber.from("0");

  ///=============== NonfungiblePositionManagerContract
  const NonfungiblePositionManagerContract = await getContract(
    "NonfungiblePositionManager"
  );
  const NonfungiblePositionManagerAddress =
    NonfungiblePositionManagerContract.address;
  console.log("deployer.address", deployer.address);
  ///=============== TONContract
  const TONContract = (await getContract("WTON")).connect(deployer);
  ///=============== TOSContract
  const TOSContract = (await getContract("TOS")).connect(deployer);
  ///=============== USDCContract
  const USDCContract = (await getContract("USDC")).connect(deployer);
  ///=============== USDTContract
  const USDTContract = (await getContract("USDT")).connect(deployer);

  totalGasUsed = totalGasUsed.add(
    await allowFunction(
      "WTON",
      TONContract,
      deployer.address,
      NonfungiblePositionManagerAddress
    )
  );
  totalGasUsed = totalGasUsed.add(
    await allowFunction(
      "TOS",
      TOSContract,
      deployer.address,
      NonfungiblePositionManagerAddress
    )
  );
  totalGasUsed = totalGasUsed.add(
    await allowFunction(
      "USDC",
      USDCContract,
      deployer.address,
      NonfungiblePositionManagerAddress
    )
  );
  totalGasUsed = totalGasUsed.add(
    await allowFunction(
      "USDT",
      USDTContract,
      deployer.address,
      NonfungiblePositionManagerAddress
    )
  );
  console.log("totalGasUsded:", totalGasUsed);
}

async function allowFunction(tokenName, tokenContract, sender, spender) {
  let allowance = await tokenContract.allowance(sender, spender);
  console.log(`${tokenName} approved amount:`, allowance);
  if (allowance.lt(minimumallowanceAmount)) {
    const tx = await tokenContract.approve(spender, allowanceAmount);
    await tx.wait();
    expect(await tokenContract.allowance(sender, spender)).to.equal(
      allowanceAmount
    );
    console.log(`${tokenName} ${allowanceAmount} amount Approved`);
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log("transactionHash:", receipt.transactionHash);
    console.log("gasUsed: ", receipt.gasUsed);
    console.log();
    return receipt.gasUsed;
  } else {
    return ethers.BigNumber.from("0");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
