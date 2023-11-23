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
  if (chainId === 31337) {
    await hre.network.provider.send("hardhat_impersonateAccount", [
      "0x43700f09B582eE2BFcCe4b5Db40ee41B4649D977",
    ]);
    deployer = await providers.getSigner(
      "0x43700f09B582eE2BFcCe4b5Db40ee41B4649D977"
    );
    // await hre.network.provider.send("hardhat_setBalance", [
    //   "0x24884b9a47049b7663aedac7c7c91afd406ea09e",
    //   "0x10000000000000000000000000",
    // ]);
  }
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
  console.log("deployerAddress", deployer._address);
  try {
    const txArgs = {
      to: "0x2032206029B014233c3130CF3dc740Cd7fAAAa2d",
      from: deployer._address,
      data: "0x5ae401dc00000000000000000000000000000000000000000000000000000000655da4a900000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000042000000000000000000000000000000000000000000000000000000000000000e404e45aaf0000000000000000000000004200000000000000000000000000000000000006000000000000000000000000fa956eb0c4b3e692ad5a6b2f08170ade55999aca0000000000000000000000000000000000000000000000000000000000000bb80000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000011c37937e08000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000124b858183f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000424200000000000000000000000000000000000006000bb86af3cb766d6cd37449bfd321d961a61b0515c1bc000bb8fa956eb0c4b3e692ad5a6b2f08170ade55999aca0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e404e45aaf0000000000000000000000004200000000000000000000000000000000000006000000000000000000000000fa956eb0c4b3e692ad5a6b2f08170ade55999aca00000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000064df2ab5bb000000000000000000000000fa956eb0c4b3e692ad5a6b2f08170ade55999aca000000000000000000000000000000000000000000000004b178fc1b606c381800000000000000000000000043700f09b582ee2bfcce4b5db40ee41b4649d97700000000000000000000000000000000000000000000000000000000",
      gasLimit: 1537850,
      value: ethers.utils.parseEther("0.1"),
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
