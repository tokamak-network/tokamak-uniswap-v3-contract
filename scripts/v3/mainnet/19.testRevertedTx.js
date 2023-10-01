const ethers = require("ethers");
require("dotenv").config();
const hre = require("hardhat");
const {
  getContract,
  getPoolContractAddress,
  deployContract,
} = require("./helper_functions.js");
const UniswapV3PoolArtifact = require("../abis/UniswapV3Pool.sol/UniswapV3Pool.json");
const { expect } = require("chai");
const { encodePath } = require("../../utils.js");

async function main() {
  const chainId = hre.network.config.chainId;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  const providers = hre.ethers.provider;

  // const nftContractFactory = await hre.ethers.getContractFactory(
  //   "NonfungiblePositionManager",
  //   deployer
  // );
  // const nftContract = await nftContractFactory.deploy(
  //   "0x8c2351935011cfecca4ea08403f127fb782754ac",
  //   "0x4200000000000000000000000000000000000006",
  //   "0x39463E80fb909827C8DDB27953264A7B6c2cE0c9"
  // );
  // const titanNftContract = nftContract.attach(
  //   "0x324d7015E30e7C231e4aC155546b8AbfEAB00977"
  // );
  // const nftContract = await hre.ethers.getContractAt(
  //   NonfungiblePositionManagerABI.abi,
  //   '0x324d7015E30e7C231e4aC155546b8AbfEAB00977',
  //   deployer
  // )
  console.log(deployer.address);

  try {
    // const txArgs = {
    //   to: "0x324d7015E30e7C231e4aC155546b8AbfEAB00977",
    //   from: deployer.address,
    //   data: "0xac9650d8000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000c4219f5d17000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000045144af27a5400000000000000000000000000000000000000000000000000000000000186a0000000000000000000000000000000000000000000000000000044e83f441b4500000000000000000000000000000000000000000000000000000000000185a600000000000000000000000000000000000000000000000000000000750a9cc900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000412210e8a00000000000000000000000000000000000000000000000000000000",
    //   gasLimit: 284875,
    //   value: hre.ethers.utils.parseEther("0.00008"),
    // };
    // const tx = await deployer.sendTransaction(txArgs);
    // await tx.wait();
    // console.log(tx);
    // const receipt = await providers.getTransactionReceipt(tx.hash);
    // console.log(receipt);
  } catch (e) {
    console.log(e.message);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
