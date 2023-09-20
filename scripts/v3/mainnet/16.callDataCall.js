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
  providers = hre.ethers.provider;
  // if (chainId === 31337) {
  //   await hre.network.provider.send("hardhat_impersonateAccount", [
  //     "0x24884b9a47049b7663aedac7c7c91afd406ea09e",
  //   ]);
  //   deployer = providers.getSigner(
  //     "0x24884B9A47049B7663aEdaC7c7C91afd406EA09e"
  //   );
  //   await hre.network.provider.send("hardhat_setBalance", [
  //     "0x24884b9a47049b7663aedac7c7c91afd406ea09e",
  //     "0x10000000000000000000000000",
  //   ]);
  // }
  // // if (chainId === 31337)
  // //   deployer = await hre.ethers.getImpersonatedSigner(
  // //     "0x24884b9a47049b7663aedac7c7c91afd406ea09e"
  // //   );
  // // if (chainId === 31337) {
  // //   const provider = new ethers.providers.JsonRpcProvider(
  // //     "https://rpc.titan.tokamak.network"
  // //   );
  // //   await provider.send("hardhat_impersonateAccount", [
  // //     "0x24884B9A47049B7663aEdaC7c7C91afd406EA09e",
  // //   ]);
  // //   deployer = provider.getSigner("0x24884B9A47049B7663aEdaC7c7C91afd406EA09e");
  // // }
  // // if (chainId === 31337)
  // //   deployer = await hre.ethers.getSigner(deployer.address);
  // // let totalGasUsed = ethers.BigNumber.from("0")
  // // ///=========== UniswapV3Factory
  // // const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  // ///=============== NonfungiblePositionManagerContract
  // // const NonfungiblePositionManagerContract = await getContract(
  // //   "NonfungiblePositionManager"
  // // );
  // // const NonfungiblePositionManagerAddress =
  // //   NonfungiblePositionManagerContract.address;
  // // ///=============== TONContract
  // // const TONContract = await getContract('TON');
  // // const TONAddress = TONContract.address;
  // // ///=============== WETHContract
  // // const WETHContract = await getContract('WETH');
  // // const WETHAddress = WETHContract.address;
  // //   ///=============== WETHContract
  // //   const TOSContract = await getContract('TOS');
  // //   const TOSAddress = TOSContract.address;
  // ///=============== TOSContract
  // // const USDCContract = await getContract("USDC");
  // // const USDCAddress = USDCContract.address;
  // // ///=============== SwapRouterContract
  // // const SwapRouterContract = await getContract('SwapRouter02'); //
  // // const SwapRouterAddress = SwapRouterContract.address;

  // // let ethBalance = await providers.getBalance(deployer.address);
  // // console.log("ethBalance",ethBalance);
  // // let usdcBalance = await USDCContract.balanceOf(deployer.address);
  // // console.log("usdcBalance",usdcBalance);
  // // console.log(NonfungiblePositionManagerContract.address);
  // // let positionInfo = await NonfungiblePositionManagerContract.positions(21);
  // // console.log(positionInfo);
  // // const allowance = USDCContract.allowance(
  // //   "0x24884B9A47049B7663aEdaC7c7C91afd406EA09e"
  // // );
  console.log(deployer.address);
  try {
    const txArgs = {
      to: "0x324d7015E30e7C231e4aC155546b8AbfEAB00977",
      from: deployer.address,
      data: "0xac9650d8000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000c4219f5d17000000000000000000000000000000000000000000000000000000000000000b00000000000000000000000000000000000000000000000000005af30b816d16000000000000000000000000000000000000000000000000000000000002027f00000000000000000000000000000000000000000000000000005ab90e0119b20000000000000000000000000000000000000000000000000000000000020136000000000000000000000000000000000000000000000000000000007509377300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000412210e8a00000000000000000000000000000000000000000000000000000000",
      gasLimit: 600000,
      value: ethers.utils.parseEther("0.00001"),
    };
    const tx = await deployer.sendTransaction(txArgs);
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
