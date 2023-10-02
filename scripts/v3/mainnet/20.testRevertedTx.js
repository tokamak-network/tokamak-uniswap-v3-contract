const ethers = require("ethers");
require("dotenv").config();
const hre = require("hardhat");
const JSBI = require("jsbi"); // jsbi@3.2.5
const fs = require("fs");
const {
  getContract,
  getPoolContractAddress,
} = require("./helper_functions.js");
const UniswapV3PoolArtifact = require("../abis/UniswapV3Pool.sol/UniswapV3Pool.json");
const { encodePriceSqrt } = require("../../utils.js");
const sdk = require("@uniswap/v3-sdk");
const getTickAtSqrtRatio = sdk.TickMath.getTickAtSqrtRatio;
const { consoleEvents } = require("./../testnet/consoleEvents.js");
const nearestUsableTick = sdk.nearestUsableTick;
const { expect } = require("chai");
const getSqrtRatioAtTick = sdk.TickMath.getSqrtRatioAtTick;
const getNextSqrtPriceFromAmount0RoundingUp =
  sdk.SqrtPriceMath.getNextSqrtPriceFromAmount0RoundingUp;
const getNextSqrtPriceFromAmount1RoundingDown =
  sdk.SqrtPriceMath.getNextSqrtPriceFromAmount1RoundingDown;
const chainName = hre.network.name;
const Fee = ethers.BigNumber.from("3000");
const eventInterface = new ethers.utils.Interface([
  "event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
]);
const eventSignature = ethers.utils.id(
  "IncreaseLiquidity(uint256,uint128,uint256,uint256)"
);
const eventName = "IncreaseLiquidity";
let totalGasUsed = ethers.BigNumber.from("0");
let allowanceAmount = ethers.constants.MaxUint256;
let minimumallowanceAmount = ethers.constants.MaxUint256;
async function main() {
  let totalGasUsed = ethers.BigNumber.from("0");
  const chainName = hre.network.name;
  const chainId = network.config.chainId;
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;
  console.log(deployer.address);

  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract("UniswapV3Factory");
  ///=============== NonfungiblePositionManagerContract
  const NonfungiblePositionManagerContract = (
    await getContract("NonfungiblePositionManager")
  ).connect(deployer);
  const NonfungiblePositionManagerAddress =
    NonfungiblePositionManagerContract.address;
  ///=============== TONContract
  const TONContract = (await getContract("TON")).connect(deployer);
  const TONAddress = TONContract.address;
  ///=============== WETHContract
  const WETHContract = (await getContract("WETH")).connect(deployer);
  const WETHAddress = WETHContract.address;
  ///=============== TOSContract
  const TOSContract = (await getContract("TOS")).connect(deployer);
  const TOSAddress = TOSContract.address;
  ///=============== USDCContract
  const USDCContract = (await getContract("USDC")).connect(deployer);
  const USDCAddress = USDCContract.address;
  ///=============== USDTContract
  const USDTContract = (await getContract("USDT")).connect(deployer);
  const USDTAddress = USDTContract.address;

  const SwapRouterContract = await getContract("SwapRouter02");
  const SwapRouterAddress = SwapRouterContract.address;

  //approve
  totalGasUsed = totalGasUsed.add(
    await allowFunction("TON", TONContract, deployer.address, SwapRouterAddress)
  );
  totalGasUsed = totalGasUsed.add(
    await allowFunction("TOS", TOSContract, deployer.address, SwapRouterAddress)
  );
  const minTick = -887220;
  const maxTick = 887220;
  //positionKey
  let positionKey = ethers.utils.solidityKeccak256(
    ["address", "int24", "int24"],
    [NonfungiblePositionManagerContract.address, minTick, maxTick]
  );
  console.log("positionKey", positionKey);
  let poolAddress = await UniswapV3FactoryContract.getPool(
    TONAddress,
    TOSAddress,
    3000
  );
  let poolContract = await hre.ethers.getContractAt(
    UniswapV3PoolArtifact.abi,
    poolAddress
  );
  let positions = await poolContract.positions(positionKey);
  console.log("core position info", positions);

  ////////////////////////////////////mint
  let mintArgs;
  let tx;
  let receipt;
  let swapArgs;

  let token0Address = TOSAddress < TONAddress ? TOSAddress : TONAddress;
  let token1Address = TOSAddress < TONAddress ? TONAddress : TOSAddress;
  /////////////////////// mint liquidity
  mintArgs = {
    token0: token0Address,
    token1: token1Address,
    fee: 3000,
    tickLower: minTick,
    tickUpper: maxTick,
    amount0Desired: ethers.BigNumber.from("20000000000000000000"),
    amount1Desired: ethers.BigNumber.from("20000000000000000000"),
    amount0Min: ethers.BigNumber.from("0"),
    amount1Min: ethers.BigNumber.from("0"),
    recipient: "0xB68AA9E398c054da7EBAaA446292f611CA0CD52B",
    deadline: ethers.BigNumber.from("11963744845"),
  };
  tx = await NonfungiblePositionManagerContract.mint(mintArgs, {
    gasLimit: 3000000,
  });
  await tx.wait();
  receipt = await providers.getTransactionReceipt(tx.hash);
  console.log(receipt);

  //core position info
  positions = await poolContract.positions(positionKey);
  console.log("core position info", positions);

  //get Position Info
  const balance = await NonfungiblePositionManagerContract.balanceOf(
    deployer.address
  );
  console.log(balance);
  let tokenId = await NonfungiblePositionManagerContract.tokenOfOwnerByIndex(
    deployer.address,
    balance - 1
  );
  //let tokenId = 10;
  console.log(tokenId.toString());
  const token = await NonfungiblePositionManagerContract.positions(tokenId);
  console.log(token);

  //./////////////////// swap
  swapArgs = {
    tokenIn: token0Address,
    tokenOut: token1Address,
    fee: 3000,
    recipient: "0xB68AA9E398c054da7EBAaA446292f611CA0CD52B",
    deadline: ethers.BigNumber.from("11963744845"),
    amountIn: ethers.BigNumber.from("500000000000000000"),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };
  tx = await SwapRouterContract.exactInputSingle(swapArgs, {
    gasLimit: 3000000,
  });
  await tx.wait();
  receipt = await providers.getTransactionReceipt(tx.hash);
  console.log(receipt);
  //core position info
  //   positions = await poolContract.positions(positionKey);
  //   console.log("core position info", positions);

  ////////////////////////decrease liquidity
  let liquidity = (await NonfungiblePositionManagerContract.positions(tokenId))
    .liquidity;
  console.log(liquidity);
  let decreaseArgs = {
    tokenId: tokenId,
    liquidity: liquidity,
    amount0Min: 0,
    amount1Min: 0,
    deadline: ethers.BigNumber.from("11963744845"),
  };
  let decreaseEncoded =
    NonfungiblePositionManagerContract.interface.encodeFunctionData(
      "decreaseLiquidity",
      [decreaseArgs]
    );
  let collectArgs = {
    tokenId: tokenId,
    recipient: deployer.address,
    amount0Max: ethers.BigNumber.from("2").pow(128).sub(1), //MaxUint128
    amount1Max: ethers.BigNumber.from("2").pow(128).sub(1),
  };
  let collectEncoded =
    NonfungiblePositionManagerContract.interface.encodeFunctionData("collect", [
      collectArgs,
    ]);
  tx = await NonfungiblePositionManagerContract.multicall([
    decreaseEncoded,
    collectEncoded,
  ]);
  await tx.wait();

  //core position info
  //   positions = await poolContract.positions(positionKey);
  //   console.log("core position info", positions);
  //   liquidity = (await NonfungiblePositionManagerContract.positions(tokenId)).liquidity;
  //   console.log(liquidity);
  //   const token1 = await NonfungiblePositionManagerContract.positions(1);
  //   console.log(token1);

  //   console.log("here???");
  //////////////////////////////////increase liquidity
  let increaseArgs = {
    tokenId: tokenId,
    amount0Desired: ethers.BigNumber.from("2000000000000000000"),
    amount1Desired: ethers.BigNumber.from("2000000000000000000"),
    amount0Min: ethers.BigNumber.from("0"),
    amount1Min: ethers.BigNumber.from("0"),
    deadline: ethers.BigNumber.from("11963744845"),
  };
  tx = await NonfungiblePositionManagerContract.increaseLiquidity(
    increaseArgs,
    { gasLimit: 3000000 }
  );
  await tx.wait();

  //core position info
  positions = await poolContract.positions(positionKey);
  console.log("core position info", positions);
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
    console.log(`${tokenName} ${allowanceAmount} * 10e18 amount Approved`);
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
