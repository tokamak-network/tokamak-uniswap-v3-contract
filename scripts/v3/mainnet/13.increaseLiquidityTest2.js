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
const sdk = require("@uniswap/v3-sdk");
const { sqrt } = require("@uniswap/sdk-core");
const getSqrtRatioAtTick = sdk.TickMath.getSqrtRatioAtTick;

async function main() {
  const chainId = hre.network.config.chainId;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;

  //  if (chainId === 31337)
  //   deployer = await hre.ethers.getImpersonatedSigner(
  //       '0x942d6ac7A6702Bb1852676f3f22AeE38bD442E4C'
  //     );
  let totalGasUsed = ethers.BigNumber.from("0");
  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract("UniswapV3Factory");
  ///=============== NonfungiblePositionManagerContract
  const NonfungiblePositionManagerContract = await getContract(
    "NonfungiblePositionManager"
  );
  const NonfungiblePositionManagerAddress =
    NonfungiblePositionManagerContract.address;
  ///=============== TONContract
  const TONContract = await getContract("TON");
  const TONAddress = TONContract.address;
  ///=============== WETHContract
  const WETHContract = await getContract("WETH");
  const WETHAddress = WETHContract.address;
  ///=============== WETHContract
  const TOSContract = await getContract("TOS");
  const TOSAddress = TOSContract.address;
  ///=============== TOSContract
  const USDCContract = await getContract("USDC");
  const USDCAddress = USDCContract.address;
  ///=============== SwapRouterContract
  const SwapRouterContract = await getContract("SwapRouter02"); //
  const SwapRouterAddress = SwapRouterContract.address;

  let ethBalance = await providers.getBalance(deployer.address);
  console.log("ethBalance", ethBalance);
  let usdcBalance = await USDCContract.balanceOf(deployer.address);
  console.log("usdcBalance", usdcBalance);
  console.log(NonfungiblePositionManagerContract.address);
  let positionInfo = await NonfungiblePositionManagerContract.positions(11);
  console.log(positionInfo);
  console.log(deployer.address);
  const UniswapV3Pool_ = new ethers.ContractFactory(
    UniswapV3PoolArtifact.abi,
    UniswapV3PoolArtifact.bytecode,
    deployer
  );
  UniswapV3PoolContract = UniswapV3Pool_.attach(
    "0xcd55aa8bec623e17147059ab5cf91c77299c2cee"
  );
  const slot0 = await UniswapV3PoolContract.slot0();
  console.log(slot0);
  const sqrtPriceX96 = slot0.sqrtPriceX96;
  const sqrtRatioAX96 = ethers.BigNumber.from(
    getSqrtRatioAtTick(positionInfo.tickLower).toString()
  );
  const sqrtRatioBX96 = ethers.BigNumber.from(
    getSqrtRatioAtTick(positionInfo.tickUpper).toString()
  );
  console.log(sqrtPriceX96);
  console.log(sqrtRatioAX96);
  console.log(sqrtRatioBX96);
  console.log(sqrtPriceX96.gte(sqrtRatioAX96));
  console.log(sqrtPriceX96.lt(sqrtRatioAX96));

  let liquidity, liquidity0, liquidity1;
  const amount0 = ethers.BigNumber.from("99999916584214");
  const amount1 = ethers.BigNumber.from("131711");
  if (sqrtRatioAX96.gte(sqrtPriceX96)) {
    console.log("1");
    liquidity = getLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0);
  } else if (sqrtPriceX96.lt(sqrtRatioBX96)) {
    liquidity0 = getLiquidityForAmount0(sqrtPriceX96, sqrtRatioBX96, amount0);
    console.log(liquidity0);
    liquidity1 = getLiquidityForAmount1(sqrtRatioAX96, sqrtPriceX96, amount1);
    console.log(liquidity1);
    console.log("2");
    liquidity = liquidity0.lt(liquidity1) ? liquidity0 : liquidity1;
  } else {
    console.log("3");
    liquidity = getLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1);
  }
  console.log("liquidity", liquidity);
  // try {
  //   const txArgs = {
  //       to: "0x1316822b9d2EEF86a925b753e8854F24761dA80E",
  //       from: deployer.address,
  //       data: '0x5ae401dc00000000000000000000000000000000000000000000000000000000e4e2c266000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000fa956eb0c4b3e692ad5a6b2f08170ade55999aca00000000000000000000000042000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000bb8000000000000000000000000b68aa9e398c054da7ebaaa446292f611ca0cd52b0000000000000000000000000000000000000000000000005a34a38fc00a0000000000000000000000000000000000000000000000000000001a3abfb980e9c50000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000124b858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000b68aa9e398c054da7ebaaa446292f611ca0cd52b00000000000000000000000000000000000000000000000030927f74c9de0000000000000000000000000000000000000000000000000000000e1ef69e35db840000000000000000000000000000000000000000000000000000000000000042fa956eb0c4b3e692ad5a6b2f08170ade55999aca000bb86af3cb766d6cd37449bfd321d961a61b0515c1bc000bb8420000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  //       gasLimit: 3000000,
  //   }
  //   const tx = await deployer.sendTransaction(txArgs)
  //   await tx.wait();
  //   console.log(tx);
  //   const receipt = await providers.getTransactionReceipt(tx.hash);
  //   console.log(receipt);
  // } catch (e) {
  //   console.log(e.message);
  // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function getLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1) {
  if (sqrtRatioAX96.gt(sqrtRatioBX96)) {
    let temp;
    temp = sqrtRatioAX96;
    sqrtRatioAX96 = sqrtRatioBX96;
    sqrtRatioBX96 = temp;
  }
  let FixedPoint96Q96 = ethers.BigNumber.from("0x1000000000000000000000000");
  return amount1.mul(FixedPoint96Q96).div(sqrtRatioBX96.sub(sqrtRatioAX96));
  //.toString();
}
function getLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0) {
  if (sqrtRatioAX96.gt(sqrtRatioBX96)) {
    let temp;
    temp = sqrtRatioAX96;
    sqrtRatioAX96 = sqrtRatioBX96;
    sqrtRatioBX96 = temp;
  }
  let FixedPoint96Q96 = ethers.BigNumber.from("0x1000000000000000000000000");
  let intermediate = sqrtRatioAX96.mul(sqrtRatioBX96).div(FixedPoint96Q96);
  return amount0.mul(intermediate).div(sqrtRatioBX96.sub(sqrtRatioAX96));
  //.toString();
}
