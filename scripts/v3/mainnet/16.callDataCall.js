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
        to: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        from: deployer.address,
        data: '0x5ae401dc0000000000000000000000000000000000000000000000000000000064f03bae000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000e404e45aaf00000000000000000000000067f3be272b1913602b191b3a68f7c238a2d81bb9000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d60000000000000000000000000000000000000000000000000000000000000bb800000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc450000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000182d22ab3b9b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002449616997000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
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