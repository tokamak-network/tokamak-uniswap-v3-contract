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

  await hre.network.provider.send("hardhat_impersonateAccount", [
    "0x24884b9a47049b7663aedac7c7c91afd406ea09e",
  ]);
  deployer = await hre.ethers.getSigner(
    "0x24884B9A47049B7663aEdaC7c7C91afd406EA09e"
  );
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
  // const usdcContract = await hre.ethers.getContractAt(
  //   "TestERC20",
  //   "0x46bbbc5f20093cb53952127c84f1fbc9503bd6d9",
  //   deployer
  // );
  // console.log((await usdcContract.balanceOf(deployer.address)).toString());
  // console.log(
  //   (
  //     await usdcContract.allowance(deployer.address, titanNftContract.address)
  //   ).toString()
  // );
  // console.log(
  //   "eth_balance:",
  //   (await providers.getBalance(deployer.address)).toString()
  // );
  try {
    const txArgs = {
      to: "0x324d7015E30e7C231e4aC155546b8AbfEAB00977",
      from: deployer.address,
      data: "0xac9650d8000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000c4219f5d17000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000045144af27a5400000000000000000000000000000000000000000000000000000000000186a0000000000000000000000000000000000000000000000000000044e83f441b4500000000000000000000000000000000000000000000000000000000000185a600000000000000000000000000000000000000000000000000000000750a9cc900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000412210e8a00000000000000000000000000000000000000000000000000000000",
      gasLimit: 284875,
      value: hre.ethers.utils.parseEther("0.00008"),
    };
    // const increaseLiquidityTx = titanNftContract.interface.encodeFunctionData(
    //   "increaseLiquidity",
    //   [
    //     {
    //       tokenId: 11,
    //       amount0Desired: BigNumber.from("9999915718874"),
    //       amount1Desired: BigNumber.from("13171"),
    //       amount0Min: BigNumber.from("9975009289866"),
    //       amount1Min: BigNumber.from("13139"),
    //       deadline: BigNumber.from("1963560053"),
    //     },
    //   ]
    // );
    // const refundETHTx = titanNftContract.interface.encodeFunctionData(
    //   "refundETH",
    //   []
    // );
    const tx = await deployer.sendTransaction(txArgs);
    // console.log(
    //   titanNftContract.interface.encodeFunctionData("multicall", [
    //     increaseLiquidityTx,
    //     refundETHTx,
    //   ])
    // );
    //const tx = await titanNftContract.multicall([increaseLiquidityTx, refundETHTx], {
    //   value: hre.ethers.utils.parseEther('0.00001'),
    //   gasLimit: BigNumber.from('600000'),
    // })

    await tx.wait();
    console.log(tx);
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log(receipt);
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
