const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const JSBI = require('jsbi') // jsbi@3.2.5
const {NonfungiblePositionManager: NonfungiblePositionManagerAddress, getContract, getPoolContractAddress} = require("./helper_functions.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const {encodePriceSqrt} = require('../../utils.js');
const sdk = require("@uniswap/v3-sdk");
const getTickAtSqrtRatio = sdk.TickMath.getTickAtSqrtRatio;
const {consoleEvents} = require("../testnet/consoleEvents.js");
const nearestUsableTick = sdk.nearestUsableTick;
const { expect } = require("chai");
const getSqrtRatioAtTick = sdk.TickMath.getSqrtRatioAtTick;
const getNextSqrtPriceFromAmount0RoundingUp = sdk.SqrtPriceMath.getNextSqrtPriceFromAmount0RoundingUp;
const getNextSqrtPriceFromAmount1RoundingDown = sdk.SqrtPriceMath.getNextSqrtPriceFromAmount1RoundingDown;
const getAmount0Delta = sdk.SqrtPriceMath.getAmount0Delta;
const getAmount1Delta = sdk.SqrtPriceMath.getAmount1Delta;
const { Pool } = require('@uniswap/v3-sdk');
const { Token } = require('@uniswap/sdk-core')
const IERC20Artifact = require('@openzeppelin/contracts/build/contracts/ERC20PresetFixedSupply.json');
// const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))
// const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2))

function token({
  sortOrder,
  decimals = 18,
  chainId = 1
}) {
  if (sortOrder > 9 || sortOrder % 1 !== 0) throw new Error('invalid sort order')
  return new Token(
    chainId,
    `0x${new Array(40).fill(`${sortOrder}`).join('')}`,
    decimals,
    `T${sortOrder}`,
    `token${sortOrder}`
  )
}
async function main() {
    const chainName = hre.network.name;
    const chainId = hre.network.config.chainId;
    const accounts = await hre.ethers.getSigners();
    let deployer = accounts[0];
    providers = hre.ethers.provider;
    ///=========== UniswapV3Factory
    const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
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
    ///=============== NonfungiblePositionManagerContract  
    const NonfungiblePositionManagerContract = (await getContract('NonfungiblePositionManager')).connect(deployer);
    const UniswapV3Pool_ = new ethers.ContractFactory(
        UniswapV3PoolArtifact.abi,
        UniswapV3PoolArtifact.bytecode,
        deployer
        );

    let poolAddressTOSTON = await getPoolContractAddress(
      UniswapV3FactoryContract,
      TONAddress,
      TOSAddress,
      3000
    );
    let poolAddressWETHTOS = await getPoolContractAddress(
      UniswapV3FactoryContract,
      WETHAddress,
      TOSAddress,
      3000
    );
    let poolAddressWETHTON = await getPoolContractAddress(
      UniswapV3FactoryContract,
      WETHAddress,
      TONAddress,
      3000
    );
    let poolAddressWETHUSDC500 = await getPoolContractAddress(
      UniswapV3FactoryContract,
      WETHAddress,
      USDCAddress,
      500
    );
    let poolAddressWETHUSDT500 = await getPoolContractAddress(
      UniswapV3FactoryContract,
      WETHAddress,
      USDTAddress,
      500
    );
    let poolAddressWETHUSDC100 = await getPoolContractAddress(
      UniswapV3FactoryContract,
      WETHAddress,
      USDCAddress,
      100
    );
    let poolAddressWETHUSDT100 = await getPoolContractAddress(
      UniswapV3FactoryContract,
      WETHAddress,
      USDTAddress,
      100
    );
    const pools = [poolAddressTOSTON, poolAddressWETHTOS, poolAddressWETHTON, poolAddressWETHUSDC500, poolAddressWETHUSDT500, poolAddressWETHUSDC100, poolAddressWETHUSDT100];
    // const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))
    // const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2))
    const Q96 = (ethers.BigNumber.from(2)).pow(ethers.BigNumber.from(96))
    const Q192 = Q96.pow(2);
    console.log(Q96, Q192);
    for (poolAddress of pools){
      let UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddress);
      let slot0 = await UniswapV3PoolContract.slot0();
      let tick = slot0.tick;

      token0Contract = new ethers.Contract(await UniswapV3PoolContract.token0(), IERC20Artifact.abi, deployer)
      token1Contract = new ethers.Contract(await UniswapV3PoolContract.token1(), IERC20Artifact.abi, deployer)
      const token0 = token({sortOrder:0, decimals: await token0Contract.decimals(), chainId:chainId})
      const token1 = token({sortOrder:1, decimals: await token1Contract.decimals(), chainId:chainId})
      let token0Price = sdk.tickToPrice(token0, token1, tick).toSignificant(72);
      let token1Price = sdk.tickToPrice(token0, token1, tick).invert().toSignificant(72);
      let volume;
      console.log("{");
      console.log('"id":', poolAddress)
      console.log('"tick":', slot0.tick)
      console.log('"feeTier:"', await UniswapV3PoolContract.fee())
      console.log('"liquidity":', await UniswapV3PoolContract.liquidity())
      console.log('"token0Price":', token0Price);
      console.log('"token1Price":', token1Price);
      console.log('"sqrtPrice":', slot0.sqrtPriceX96);
      console.log('"token0": {')
      console.log('    "id":', token0Contract.address);
      console.log('    "symbol":', await token0Contract.symbol());
      //console.log('    "volume":', token0Contract.address);
      console.log("},")
      console.log('"token1": {')
      console.log('    "id":', token1Contract.address);
      console.log('    "symbol":', await token1Contract.symbol());
      //console.log('    "volume":', token0Contract.address);
      console.log("  },")
      console.log("}");
    }


      
    // let UniswapV3PoolContract = UniswapV3Pool_.attach('0x124C9eE4fe1f7eC5aDBFC9d475ae2a52eBC50365');
    // let positionInfo = await NonfungiblePositionManagerContract.positions(1);
    // let liquidity = JSBI.BigInt(positionInfo.liquidity.toString());
    // const tickLower =positionInfo.tickLower;
    // const tickUpper = positionInfo.tickUpper;
    // const lowersqrtPriceX96 = getSqrtRatioAtTick(tickLower);
    // const uppersqrtPriceX96 = getSqrtRatioAtTick(tickUpper);
    // const sqrtPriceX96 = JSBI.BigInt((await UniswapV3PoolContract.slot0()).sqrtPriceX96.toString());
    // console.log(getAmount0Delta(sqrtPriceX96, uppersqrtPriceX96, liquidity, false).toString());
    // console.log(getAmount1Delta(lowersqrtPriceX96, sqrtPriceX96, liquidity, false).toString());
    // let deadline = Math.floor(Date.now() / 1000) + 100000;
    // let results = await NonfungiblePositionManagerContract.callStatic.decreaseLiquidity({
    //     tokenId: 1,
    //     liquidity: positionInfo.liquidity,
    //     deadline: deadline,
    //     amount0Min: 0,
    //     amount1Min: 0,
    //   });
    //   let results2 = await NonfungiblePositionManagerContract.callStatic.collect({
    //     tokenId: 1,
    //     recipient: deployer.address,
    //     amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
    //     amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
    //   });
    //   console.log(results2.amount0);
    //   console.log(results2.amount1);
    //   console.log(results.amount0.add(results2.amount0)); // amount0 + fee = 44071833809710618407
    //   console.log(results.amount1.add(results2.amount1)); // amount1 + fee = 18546165554919205637
    // if(chainName === 'localhost'){
    //     ///=========== TONContract
    //     let balanceBeforeTON = await TONContract.balanceOf(deployer.address);
    //     console.log('balanceBeforeTON', balanceBeforeTON.toString());
    //     let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
    //     console.log('balanceBeforeTOS', balanceBeforeTOS.toString());
    //     let tx = await NonfungiblePositionManagerContract.decreaseLiquidity({
    //         tokenId: 1,
    //         liquidity: positionInfo.liquidity,
    //         deadline: deadline,
    //         amount0Min: 0,
    //         amount1Min: 0,
    //       });
    //       await tx.wait();
    //       tx = await NonfungiblePositionManagerContract.collect({
    //         tokenId: 1,
    //         recipient: deployer.address,
    //         amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
    //         amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
    //       });
    //       await tx.wait();
    //       ///=========== TONContract
    //     let balanceAfterTON = await TONContract.balanceOf(deployer.address);
    //     console.log('balanceAfterTON', balanceAfterTON.toString());
    //       let balanceAfterTOS = await TOSContract.balanceOf(deployer.address);
    //     console.log('balanceAfterTOS', balanceAfterTOS.toString());
    //     console.log("amount0 + fee", balanceAfterTON.sub(balanceBeforeTON));
    //     console.log("amount1 + fee", balanceAfterTOS.sub(balanceBeforeTOS));
    // }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });