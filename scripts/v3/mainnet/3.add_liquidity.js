const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const JSBI = require('jsbi'); // jsbi@3.2.5
const fs = require('fs');
const {
  getContract,
  getPoolContractAddress,
} = require('./helper_functions.js');
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const { encodePriceSqrt } = require('../../utils.js');
const sdk = require('@uniswap/v3-sdk');
const getTickAtSqrtRatio = sdk.TickMath.getTickAtSqrtRatio;
const { consoleEvents } = require('./../testnet/consoleEvents.js');
const nearestUsableTick = sdk.nearestUsableTick;
const { expect } = require('chai');
const getSqrtRatioAtTick = sdk.TickMath.getSqrtRatioAtTick;
const getNextSqrtPriceFromAmount0RoundingUp =
  sdk.SqrtPriceMath.getNextSqrtPriceFromAmount0RoundingUp;
const getNextSqrtPriceFromAmount1RoundingDown =
  sdk.SqrtPriceMath.getNextSqrtPriceFromAmount1RoundingDown;
const chainName = hre.network.name;
const Fee = ethers.BigNumber.from('3000');
const eventInterface = new ethers.utils.Interface([
  'event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)',
]);
const eventSignature = ethers.utils.id(
  'IncreaseLiquidity(uint256,uint128,uint256,uint256)'
);
const eventName = 'IncreaseLiquidity';
let totalGasUsed = ethers.BigNumber.from('0');

async function main() {
  const chainName = hre.network.name;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;
  if (chainName === 'hardhat')
    deployer = await hre.ethers.getImpersonatedSigner(
      '0xB68AA9E398c054da7EBAaA446292f611CA0CD52B'
    );

  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  ///=============== NonfungiblePositionManagerContract
  const NonfungiblePositionManagerContract = (
    await getContract('NonfungiblePositionManager')
  ).connect(deployer);
  const NonfungiblePositionManagerAddress =
    NonfungiblePositionManagerContract.address;
  ///=============== TONContract
  const TONContract = (await getContract('TON')).connect(deployer);
  const TONAddress = TONContract.address;
  ///=============== WETHContract
  const WETHContract = (await getContract('WETH')).connect(deployer);
  const WETHAddress = WETHContract.address;
  ///=============== TOSContract
  const TOSContract = (await getContract('TOS')).connect(deployer);
  const TOSAddress = TOSContract.address;
  ///=============== USDCContract
  const USDCContract = (await getContract('USDC')).connect(deployer);
  const USDCAddress = USDCContract.address;
  ///=============== USDTContract
  const USDTContract = (await getContract('USDT')).connect(deployer);
  const USDTAddress = USDTContract.address;

  await checkBalances(
    providers,
    TONContract,
    TOSContract,
    USDCContract,
    USDTContract,
    deployer
  );

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

  // // TOS/TON addLiquidity
  // console.log('====== poolAddressTOSTON mint ==========');
  // let token0, token1, amount0Desired, amount1Desired;
  // if (TONAddress < TOSAddress) {
  //   token0 = TONAddress;
  //   amount0Desired = ethers.utils.parseEther('35');
  //   token1 = TOSAddress;
  //   amount1Desired = ethers.utils.parseEther('25');
  // } else {
  //   token0 = TOSAddress;
  //   amount0Desired = ethers.utils.parseEther('25');
  //   token1 = TONAddress;
  //   amount1Desired = ethers.utils.parseEther('35');
  // }
  // await addLiquidity(
  //   NonfungiblePositionManagerContract,
  //   poolAddressTOSTON,
  //   token0,
  //   token1,
  //   amount0Desired,
  //   amount1Desired,
  //   deployer
  // );

  // ETH/TON addLiquidity
  console.log('====== poolAddressWETHTON mint ==========');
  if (TONAddress < WETHAddress) {
    token0 = TONAddress;
    amount0Desired = ethers.utils.parseEther('35');
    token1 = WETHAddress;
    amount1Desired = ethers.utils.parseEther('0.028');
  } else {
    token0 = WETHAddress;
    amount0Desired = ethers.utils.parseEther('0.028');
    token1 = TONAddress;
    amount1Desired = ethers.utils.parseEther('35');
  }
  await addLiquidity(
    NonfungiblePositionManagerContract,
    poolAddressWETHTON,
    token0,
    token1,
    amount0Desired,
    amount1Desired,
    deployer
  );

  // // ETH/TOS addLiquidity
  // console.log('====== poolAddressWETHTOS mint ==========');
  // if (TOSAddress < WETHAddress) {
  //   token0 = TOSAddress;
  //   amount0Desired = ethers.utils.parseEther('25');
  //   token1 = WETHAddress;
  //   amount1Desired = ethers.utils.parseEther('0.028');
  // } else {
  //   token0 = WETHAddress;
  //   amount0Desired = ethers.utils.parseEther('0.028');
  //   token1 = TOSAddress;
  //   amount1Desired = ethers.utils.parseEther('25');
  // }
  // await addLiquidity(
  //   NonfungiblePositionManagerContract,
  //   poolAddressWETHTOS,
  //   token0,
  //   token1,
  //   amount0Desired,
  //   amount1Desired,
  //   deployer
  // );

  // // ETH/USDC addLiquidity
  // console.log('====== poolAddressWETHUSDC mint ==========');
  // if (USDCAddress < WETHAddress) {
  //   token0 = USDCAddress;
  //   amount0Desired = ethers.utils.parseUnits('50', 6);
  //   token1 = WETHAddress;
  //   amount1Desired = ethers.utils.parseEther('0.028');
  // } else {
  //   token0 = WETHAddress;
  //   amount0Desired = ethers.utils.parseEther('0.028');
  //   token1 = USDCAddress;
  //   amount1Desired = ethers.utils.parseUnits('50', 6);
  // }
  // await addLiquidity(
  //   NonfungiblePositionManagerContract,
  //   poolAddressWETHUSDC,
  //   token0,
  //   token1,
  //   amount0Desired,
  //   amount1Desired,
  //   deployer
  // );

  // // ETH/USDT addLiquidity
  // console.log('====== poolAddressWETHUSDT mint ==========');
  // if (USDTAddress < WETHAddress) {
  //   token0 = USDTAddress;
  //   amount0Desired = ethers.utils.parseUnits('50', 6);
  //   token1 = WETHAddress;
  //   amount1Desired = ethers.utils.parseEther('0.028');
  // } else {
  //   token0 = WETHAddress;
  //   amount0Desired = ethers.utils.parseEther('0.028');
  //   token1 = USDTAddress;
  //   amount1Desired = ethers.utils.parseUnits('50', 6);
  // }
  // await addLiquidity(
  //   NonfungiblePositionManagerContract,
  //   poolAddressWETHUSDT,
  //   token0,
  //   token1,
  //   amount0Desired,
  //   amount1Desired,
  //   deployer
  // );

  console.log('totalGasUsed:', totalGasUsed);
}

async function checkBalances(
  providers,
  TONContract,
  TOSContract,
  USDCContract,
  USDTContract,
  deployer
) {
  ///=========== ETHContract
  // let balanceETH = await providers.getBalance(deployer.address);
  // console.log('balanceBeforeETH', balanceETH.toString());
  // expect(balanceETH).to.gte(ethers.utils.parseEther('0.112'));
  ///=========== TONContract
  // let balanceTON = await TONContract.balanceOf(deployer.address);
  // console.log('balanceBeforeTON', balanceTON.toString());
  // expect(balanceTON).to.gte(ethers.utils.parseEther('70'));
  // ///=========== TOSContract
  // let balanceTOS = await TOSContract.balanceOf(deployer.address);
  // console.log('balanceBeforeTOS', balanceTOS.toString());
  // expect(balanceTOS).to.gte(ethers.utils.parseEther('50'));
  // ///=========== USDCContract
  // let balanceUSDC = await USDCContract.balanceOf(deployer.address);
  // console.log('balanceBeforeUSDC', balanceUSDC.toString());
  // expect(balanceUSDC).to.gte(ethers.utils.parseUnits('50', 6));
  // ///=========== USDTContract
  // let balanceUSDT = await USDTContract.balanceOf(deployer.address);
  // console.log('balanceBeforeUSDT', balanceUSDT.toString());
  // expect(balanceUSDT).to.gte(ethers.utils.parseUnits('50', 6));
}

/**
 *   getLiquidityForAmount1(
    ethers.BigNumber.from(
      getSqrtRatioAtTick(nearestUsableTick(-200894 - 5108, 1)).toString()
    ),
    ethers.BigNumber.from(getSqrtRatioAtTick(-200894 - 1).toString()),
    ethers.utils.parseUnits('5000', 6)
  );
 */
function getLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1) {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    let temp;
    temp = sqrtRatioAX96;
    sqrtRatioAX96 = sqrtRatioBX96;
    sqrtRatioBX96 = temp;
  }
  let FixedPoint96Q96 = ethers.BigNumber.from('0x1000000000000000000000000');
  return amount1
    .mul(FixedPoint96Q96)
    .div(sqrtRatioBX96.sub(sqrtRatioAX96))
    .toString();
}

async function getNextTick() {}

async function addLiquidity(
  NonfungiblePositionManagerContract,
  poolAddress,
  token0,
  token1,
  amount0Desired,
  amount1Desired,
  deployer
) {
  const UniswapV3Pool_ = new ethers.ContractFactory(
    UniswapV3PoolArtifact.abi,
    UniswapV3PoolArtifact.bytecode,
    deployer
  );
  UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddress);
  let slot0 = await UniswapV3PoolContract.slot0();
  let sqrtPriceX96 = slot0.sqrtPriceX96.toString();
  let tickCurrent = slot0.tick;
  const liquidityForAmount1 = getLiquidityForAmount1(
    ethers.BigNumber.from(
      getSqrtRatioAtTick(nearestUsableTick(tickCurrent - 5108, 60)).toString()
    ),
    ethers.BigNumber.from(getSqrtRatioAtTick(tickCurrent - 1).toString()),
    amount1Desired
  );
  const add = false;
  const nextSqrtPrice = getNextSqrtPriceFromAmount0RoundingUp(
    JSBI.BigInt(sqrtPriceX96),
    JSBI.BigInt(liquidityForAmount1),
    JSBI.BigInt(amount0Desired.toString()),
    add
  );
  const tickLower = ethers.BigNumber.from(
    nearestUsableTick(tickCurrent - 5108, 60).toString()
  );
  const tickUpper = ethers.BigNumber.from(
    nearestUsableTick(getTickAtSqrtRatio(nextSqrtPrice), 60).toString()
  );
  let liquidity = await UniswapV3PoolContract.liquidity();
  console.log('tickLower:', tickLower.toString());
  console.log('tickCurrent:', tickCurrent);
  console.log('tickUpper:', tickUpper.toString());
  if (poolAddress !== '0x0000000000000000000000000000000000000000') {
    if (
      ethers.BigNumber.from(sqrtPriceX96.toString()).gt(ethers.constants.Zero)
    ) {
      console.log('liquidity:', liquidity);
      if (liquidity.eq(ethers.constants.Zero)) {
        let deadline = Date.now() + 100000;
        let MintParams = [
          {
            token0: token0,
            token1: token1,
            fee: Fee,
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0Desired: amount0Desired,
            amount1Desired: amount1Desired,
            amount0Min: 0,
            amount1Min: 0,
            recipient: deployer.address,
            deadline: deadline,
          },
        ];
        if (
          token0 === '0x4200000000000000000000000000000000000006' ||
          token1 === '0x4200000000000000000000000000000000000006'
        ) {
          const mintData =
            NonfungiblePositionManagerContract.interface.encodeFunctionData(
              'mint',
              MintParams
            );
          const refundETHData =
            NonfungiblePositionManagerContract.interface.encodeFunctionData(
              'refundETH'
            );
          try {
            const tx = await NonfungiblePositionManagerContract.multicall(
              [mintData, refundETHData],
              {
                gasLimit: 3000000,
                value: ethers.utils.parseEther('0.028'),
              }
            );
            await tx.wait();
            const receipt = await providers.getTransactionReceipt(tx.hash);
            consoleEvents(receipt, eventInterface, eventSignature, eventName);
            totalGasUsed = totalGasUsed.add(receipt.gasUsed);
          } catch (e) {
            console.log('e', e.message);
          }
        } else {
          try {
            const tx = await NonfungiblePositionManagerContract.mint(
              ...MintParams,
              {
                gasLimit: 3000000,
              }
            );
            await tx.wait();
            const receipt = await providers.getTransactionReceipt(tx.hash);
            consoleEvents(receipt, eventInterface, eventSignature, eventName);
            totalGasUsed = totalGasUsed.add(receipt.gasUsed);
          } catch (e) {
            console.log('e', e.message);
          }
        }
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
