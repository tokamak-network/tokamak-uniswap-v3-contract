const ethers = require("ethers");
require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const {
  getContract,
  getPoolContractAddress,
} = require("./helper_functions.js");
const { encodePriceSqrt } = require("../../utils.js");
const Fee = ethers.BigNumber.from("3000");

async function main() {
  const chainName = hre.network.name;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;
  let totalGasUsed = ethers.BigNumber.from("0");
  if (chainName === "hardhat")
    deployer = await hre.ethers.getImpersonatedSigner(
      "0xB68AA9E398c054da7EBAaA446292f611CA0CD52B"
    );

  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract("UniswapV3Factory");
  ///=============== NonfungiblePositionManagerContract
  const NonfungiblePositionManagerContract = (
    await getContract("NonfungiblePositionManager")
  ).connect(deployer);
  console.log("");
  ///=============== TONContract
  const TONContract = await getContract("TON");
  const TONAddress = TONContract.address;
  ///=============== TOSContract
  const TOSContract = await getContract("TOS");
  const TOSAddress = TOSContract.address;
  ///=============== WETHContract
  const WETHContract = await getContract("WETH");
  const WETHAddress = WETHContract.address;
  ///=============== TOSContract
  const USDCContract = await getContract("USDC");
  const USDCAddress = USDCContract.address;
  ///=============== WETHContract
  const USDTContract = await getContract("USDT");
  const USDTAddress = USDTContract.address;

  let poolAddressTOSTON = await getPoolContractAddress(
    UniswapV3FactoryContract,
    TONAddress,
    TOSAddress,
    Fee
  );
  let poolAddressWETHTOS = await getPoolContractAddress(
    UniswapV3FactoryContract,
    WETHAddress,
    TOSAddress,
    Fee
  );
  let poolAddressWETHTON = await getPoolContractAddress(
    UniswapV3FactoryContract,
    WETHAddress,
    TONAddress,
    Fee
  );
  let poolAddressWETHUSDC = await getPoolContractAddress(
    UniswapV3FactoryContract,
    WETHAddress,
    USDCAddress,
    Fee
  );
  let poolAddressWETHUSDT = await getPoolContractAddress(
    UniswapV3FactoryContract,
    WETHAddress,
    USDTAddress,
    Fee
  );

  if (poolAddressTOSTON === "0x0000000000000000000000000000000000000000") {
    //1 WTON = 0.75058 TOS
    //1 TOS = 1.3323 WTON
    let token0, token1, sqrtPriceX96, reserve0, reserve1;
    if (TONAddress < TOSAddress) {
      token0 = TONAddress;
      reserve0 = 1;
      token1 = TOSAddress;
      reserve1 = 1.18874;
    } else {
      token0 = TOSAddress;
      reserve0 = 1.18874;
      token1 = TONAddress;
      reserve1 = 1;
    }
    sqrtPriceX96 = encodePriceSqrt(reserve1, reserve0);
    console.log("======createAndInitialize poolAddressWETHTON=======");
    totalGasUsed = totalGasUsed.add(
      await createPool(
        token0,
        token1,
        sqrtPriceX96,
        NonfungiblePositionManagerContract
      )
    );
  }

  if (poolAddressWETHTOS === "0x0000000000000000000000000000000000000000") {
    //1 TOS = 0.0011 ETH
    //1 ETH = 912.128 TOS
    let token0, token1, sqrtPriceX96, reserve0, reserve1;
    if (WETHAddress < TOSAddress) {
      token0 = WETHAddress;
      reserve0 = 1;
      token1 = TOSAddress;
      reserve1 = 1192.55;
    } else {
      token0 = TOSAddress;
      reserve0 = 1192.55;
      token1 = WETHAddress;
      reserve1 = 1;
    }
    sqrtPriceX96 = encodePriceSqrt(reserve1, reserve0);
    console.log("======createAndInitialize poolAddressWETHTOS=======");
    totalGasUsed = totalGasUsed.add(
      await createPool(
        token0,
        token1,
        sqrtPriceX96,
        NonfungiblePositionManagerContract
      )
    );
  }

  if (poolAddressWETHTON === "0x0000000000000000000000000000000000000000") {
    //1 ETH = 1,231.38 WTON TON
    //1 WTON = 0.00081 ETH
    let token0, token1, sqrtPriceX96, reserve0, reserve1;
    if (WETHAddress < TONAddress) {
      token0 = WETHAddress;
      reserve0 = 1;
      token1 = TONAddress;
      reserve1 = 1050.68;
    } else {
      token0 = TONAddress;
      reserve0 = 1050.68;
      token1 = WETHAddress;
      reserve1 = 1;
    }
    sqrtPriceX96 = encodePriceSqrt(reserve1, reserve0);
    console.log("======createAndInitialize poolAddressWETHTON=======");
    totalGasUsed = totalGasUsed.add(
      await createPool(
        token0,
        token1,
        sqrtPriceX96,
        NonfungiblePositionManagerContract
      )
    );
  }

  if (poolAddressWETHUSDC === "0x0000000000000000000000000000000000000000") {
    //1 ETH = 1,853.50 USDC
    //1000000000 000000000 == 1.853500000
    // 1000000000ETH = 1.9178 USDC
    // 1 USDC = 0.00054 ETH ETH
    // 1USDC = 540000000 ETH
    let token0, token1, sqrtPriceX96, reserve0, reserve1;
    if (WETHAddress < USDCAddress) {
      token0 = WETHAddress;
      reserve0 = 1000000;
      token1 = USDCAddress;
      reserve1 = 1718.79;
    } else {
      token0 = USDCAddress;
      reserve0 = 1718.79;
      token1 = WETHAddress;
      reserve1 = 1000000;
    }
    sqrtPriceX96 = encodePriceSqrt(reserve1, reserve0);
    console.log("======createAndInitialize poolAddressWETHUSDC=======");
    totalGasUsed = totalGasUsed.add(
      await createPool(
        token0,
        token1,
        sqrtPriceX96,
        NonfungiblePositionManagerContract
      )
    );
  }

  if (poolAddressWETHUSDT === "0x0000000000000000000000000000000000000000") {
    //1 ETH = 1,853.50 USDC
    //1000000000 000000000 == 1.853500000
    // 1000000000ETH = 1.9178 USDC
    // 1 USDC = 0.00054 ETH ETH
    // 1USDC = 540000000 ETH
    let token0, token1, sqrtPriceX96, reserve0, reserve1;
    if (WETHAddress < USDTAddress) {
      token0 = WETHAddress;
      reserve0 = 1000000;
      token1 = USDTAddress;
      reserve1 = 1718.79;
    } else {
      token0 = USDTAddress;
      reserve0 = 1718.79;
      token1 = WETHAddress;
      reserve1 = 1000000;
    }
    sqrtPriceX96 = encodePriceSqrt(reserve1, reserve0);
    console.log("======createAndInitialize poolAddressWETHUSDT=======");
    totalGasUsed = totalGasUsed.add(
      await createPool(
        token0,
        token1,
        sqrtPriceX96,
        NonfungiblePositionManagerContract
      )
    );
  }
  console.log("totalGasUsed:", totalGasUsed);
  await writeAddresses(
    UniswapV3FactoryContract,
    chainName,
    TONAddress,
    TOSAddress,
    WETHAddress,
    USDCAddress,
    USDTAddress
  );
}

async function createPool(
  token0,
  token1,
  sqrtPriceX96,
  NonfungiblePositionManagerContract
) {
  let tx =
    await NonfungiblePositionManagerContract.createAndInitializePoolIfNecessary(
      token0,
      token1,
      Fee,
      sqrtPriceX96
    );
  await tx.wait();
  const receipt = await providers.getTransactionReceipt(tx.hash);
  console.log("transactionHash:", receipt.transactionHash);
  console.log("gasUsed: ", receipt.gasUsed);
  console.log();
  return receipt.gasUsed;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});