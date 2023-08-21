const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const {getContract, getPoolContractAddress, deployContract} = require("./helper_functions.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const { expect } = require("chai");
const {encodePath } = require("../../utils.js");

async function main() {
  const chainId = hre.network.config.chainId;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;
//  if (chainId === 31337)
//   deployer = await hre.ethers.getImpersonatedSigner(
//       '0x942d6ac7A6702Bb1852676f3f22AeE38bD442E4C'
//     );
  // let totalGasUsed = ethers.BigNumber.from("0")
  // ///=========== UniswapV3Factory
  // const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  // ///=============== NonfungiblePositionManagerContract  
  // const NonfungiblePositionManagerContract = await getContract('NonfungiblePositionManager');
  // const NonfungiblePositionManagerAddress = NonfungiblePositionManagerContract.address;
  // ///=============== TONContract  
  // const TONContract = await getContract('TON');
  // const TONAddress = TONContract.address;
  // ///=============== WETHContract  
  // const WETHContract = await getContract('WETH');
  // const WETHAddress = WETHContract.address;
  //   ///=============== WETHContract
  //   const TOSContract = await getContract('TOS');
  //   const TOSAddress = TOSContract.address;
  //   ///=============== TOSContract
  // const USDCContract = await getContract('USDC');
  // const USDCAddress = USDCContract.address;
  // ///=============== SwapRouterContract  
  // const SwapRouterContract = await getContract('SwapRouter02'); //
  // const SwapRouterAddress = SwapRouterContract.address;

  // let ethBalance = await providers.getBalance(deployer.address);
  // console.log("ethBalance",ethBalance);
  // let usdcBalance = await USDCContract.balanceOf(deployer.address);
  // console.log("usdcBalance",usdcBalance);
  // console.log(NonfungiblePositionManagerContract.address);
  // let positionInfo = await NonfungiblePositionManagerContract.positions(21);
  // console.log(positionInfo);
  console.log(deployer.address);
  try {
    const txArgs = {
        to: "0x1316822b9d2EEF86a925b753e8854F24761dA80E",
        from: deployer.address,
        data: '0x5ae401dc00000000000000000000000000000000000000000000000000000000e4e2c266000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000fa956eb0c4b3e692ad5a6b2f08170ade55999aca00000000000000000000000042000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000bb8000000000000000000000000b68aa9e398c054da7ebaaa446292f611ca0cd52b0000000000000000000000000000000000000000000000005a34a38fc00a0000000000000000000000000000000000000000000000000000001a3abfb980e9c50000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000124b858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000b68aa9e398c054da7ebaaa446292f611ca0cd52b00000000000000000000000000000000000000000000000030927f74c9de0000000000000000000000000000000000000000000000000000000e1ef69e35db840000000000000000000000000000000000000000000000000000000000000042fa956eb0c4b3e692ad5a6b2f08170ade55999aca000bb86af3cb766d6cd37449bfd321d961a61b0515c1bc000bb8420000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        gasLimit: 3000000,
    }
    const tx = await deployer.sendTransaction(txArgs)
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
