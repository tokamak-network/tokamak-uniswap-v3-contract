const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const JSBI = require('jsbi') // jsbi@3.2.5
const {NonfungiblePositionManager: NonfungiblePositionManagerAddress, getContract, getPoolContractAddress, Fee, deployContract} = require("./constant.js");
const {encodePriceSqrt} = require('../../utils');
const UniswapV3PoolArtifact = require('./../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const sdk = require("@uniswap/v3-sdk");
const getTickAtSqrtRatio = sdk.TickMath.getTickAtSqrtRatio;
const nearestUsableTick = sdk.nearestUsableTick;
async function main() {
    const accounts = await hre.ethers.getSigners();
    const deployer = accounts[0];
    providers = hre.ethers.provider;

    ///=========== UniswapV3Factory
    const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
    ///=============== TONContract  
    const TONContract = await getContract('TON');
    const TON = TONContract.address;
    ///=============== TOSContract  
    const TOSContract = await getContract('TOS');
    const TOS = TOSContract.address;
    ///=============== WETHContract  
    const WETHContract = await getContract('WETH');
    const WETH = WETHContract.address;
    ///=============== WETHContract  
    const NonfungiblePositionManagerContract = await getContract('NonfungiblePositionManager');
    ///=============== poolAddresses
    let poolAddressTOSTON = await getPoolContractAddress(UniswapV3FactoryContract, TON, TOS);
    let poolAddressWETHTOS = await getPoolContractAddress(UniswapV3FactoryContract, WETH, TOS);
    let poolAddressWETHTON = await getPoolContractAddress(UniswapV3FactoryContract, WETH, TON);
    

    //=======================poolAddressTOSTON
    if (poolAddressTOSTON !== '0x0000000000000000000000000000000000000000') {
        const UniswapV3Pool_ = new ethers.ContractFactory(
        UniswapV3PoolArtifact.abi,
        UniswapV3PoolArtifact.bytecode,
        deployer
        );
        UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressTOSTON);
        let slot0 = await UniswapV3PoolContract.slot0();
        let sqrtPriceX96 = slot0.sqrtPriceX96;
        if(sqrtPriceX96.gt(ethers.constants.Zero)){
          let liquidity = await UniswapV3PoolContract.liquidity();
          if (liquidity.eq(ethers.constants.Zero)) {
            let deadline =  Math.floor(Date.now() / 1000) + 100000;
            let tickLower = nearestUsableTick(getTickAtSqrtRatio(JSBI.BigInt(encodePriceSqrt(0.35, 1))), 60);
            let tickUpper = nearestUsableTick(getTickAtSqrtRatio(JSBI.BigInt(encodePriceSqrt(1.4082, 1))), 60);

            if(TOS < TON){
              token0 = TOS;
              amount0Desired = ethers.utils.parseEther('140.345');
              token1 = TON;
              amount1Desired =  ethers.utils.parseEther('200');
            } else {
              token0 = TON;
              amount0Desired = ethers.utils.parseEther('200');
              token1 = TOS;
              amount1Desired =  ethers.utils.parseEther('140.345');
            }
            let MintParams = [
              {
                token0: token0,
                token1: token1,
                fee: 3000,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: 0,
                amount1Min: 0,
                recipient: deployer.address,
                deadline: deadline,
              }
            ];
            const tx = await NonfungiblePositionManagerContract.mint(...MintParams, {
              gasLimit: 3000000,
            });
            await tx.wait();
            const receipt = await providers.getTransactionReceipt(tx.hash);
            console.log('receipt:', receipt);
          }
        } else{
          console.log("2.initialize_pool first");
        }
    }

    //=======================poolAddressWETHTOS
    if (poolAddressWETHTOS !== '0x0000000000000000000000000000000000000000') {
      const UniswapV3Pool_ = new ethers.ContractFactory(
      UniswapV3PoolArtifact.abi,
      UniswapV3PoolArtifact.bytecode,
      deployer
      );
      UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHTOS);
      let slot0 = await UniswapV3PoolContract.slot0();
      let sqrtPriceX96 = slot0.sqrtPriceX96;
      if(sqrtPriceX96.gt(ethers.constants.Zero)){
        let liquidity = await UniswapV3PoolContract.liquidity();
        console.log('liquidity : ', liquidity);
        let token0, token1, amount0Desired, amount1Desired;
        
        let tickLower = nearestUsableTick(getTickAtSqrtRatio(JSBI.BigInt(encodePriceSqrt(471.39, 1))),60);
        let tickUpper = nearestUsableTick(getTickAtSqrtRatio(JSBI.BigInt(encodePriceSqrt(1884.9, 1))), 60);
        
        let tick = (await UniswapV3PoolContract.slot0()).tick;
        console.log(tick);
        
        if(WETH < TOS){
          token0 = WETH;
          amount0Desired = ethers.utils.parseEther('0.2');
          token1 = TOS;
          amount1Desired =  ethers.utils.parseEther('187.198');
        } else {
          token0 = TOS;
          amount0Desired = ethers.utils.parseEther('187.198');
          token1 = WETH;
          amount1Desired =  ethers.utils.parseEther('0.2');
        }

        // let allowance = await WETHContract.allowance(
        //   deployer.address,
        //   NonfungiblePositionManagerAddress
        // );
        // const tx = await WETHContract.approve(
        //   NonfungiblePositionManagerAddress,
        //   0
        // );
        // await tx.wait();
        // const receipt = await providers.getTransactionReceipt(tx.hash);
        // console.log(receipt);
        

        if (liquidity.eq(ethers.constants.Zero)) {
          let deadline = Date.now() + 10000000000;
          let MintParams = [
            {
              token0: token0,
              token1: token1,
              fee: 3000,
              tickLower: tickLower,
              tickUpper: tickUpper,
              amount0Desired: amount0Desired,
              amount1Desired: amount1Desired,
              amount0Min: 0,
              amount1Min: 0,
              recipient: deployer.address,
              deadline: deadline,
            }
          ]
          ;
          console.log(MintParams);
          const mintData = NonfungiblePositionManagerContract.interface.encodeFunctionData('mint', MintParams);

          const refundETHData = NonfungiblePositionManagerContract.interface.encodeFunctionData('refundETH')
          try{
            const tx = await NonfungiblePositionManagerContract.multicall([mintData, refundETHData], {
              gasLimit: 3000000, value: ethers.utils.parseEther('0.2')
            });
            //const tx = await NonfungiblePositionManagerContract.mint(...MintParams, { gasLimit: 3000000, value: ethers.utils.parseEther('0.2') });
            await tx.wait();
            const receipt = await providers.getTransactionReceipt(tx.hash);
            console.log(receipt);
          } catch (e)
          {
            console.log("e", e.message);
          }
          
        }
      } else{
        console.log("2.initialize_pool first");
      }
    }
  //=======================poolAddressWETHTON
  if (poolAddressWETHTON !== '0x0000000000000000000000000000000000000000') {
    const UniswapV3Pool_ = new ethers.ContractFactory(
    UniswapV3PoolArtifact.abi,
    UniswapV3PoolArtifact.bytecode,
    deployer
    );
    UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHTON);
    let slot0 = await UniswapV3PoolContract.slot0();
    let sqrtPriceX96 = slot0.sqrtPriceX96;

    if(sqrtPriceX96.gt(ethers.constants.Zero)){
      let liquidity = await UniswapV3PoolContract.liquidity();
      console.log('liquidity : ', liquidity);
      if (liquidity.eq(ethers.constants.Zero)) {
        let deadline = Math.floor(Date.now() / 1000) + 100000;

        let tickLower = nearestUsableTick(getTickAtSqrtRatio(JSBI.BigInt(encodePriceSqrt(655.48, 1))),60);
        let tickUpper = nearestUsableTick(getTickAtSqrtRatio(JSBI.BigInt(encodePriceSqrt(2621, 1))),60);
        if(WETH < TON){
          token0 = WETH;
          amount0Desired = ethers.utils.parseEther('0.15');
          token1 = TON;
          amount1Desired =  ethers.utils.parseEther('196.9362');
        } else {
          token0 = TON;
          amount0Desired = ethers.utils.parseEther('196.9362');
          token1 = WETH;
          amount1Desired =  ethers.utils.parseEther('0.15');
        }

        let MintParams = [
          {
            token0: token0,
            token1: token1,
            fee: 3000,
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0Desired: amount0Desired,
            amount1Desired: amount1Desired,
            amount0Min: 0,
            amount1Min: 0,
            recipient: deployer.address,
            deadline: deadline,
          }
        ]
        ;
        console.log(MintParams);
        const mintData = NonfungiblePositionManagerContract.interface.encodeFunctionData('mint', MintParams);

        const refundETHData = NonfungiblePositionManagerContract.interface.encodeFunctionData('refundETH')
        try{
          const tx = await NonfungiblePositionManagerContract.multicall([mintData, refundETHData], {
            gasLimit: 3000000, value: ethers.utils.parseEther('0.15')
          });
          //const tx = await NonfungiblePositionManagerContract.mint(...MintParams, { gasLimit: 3000000, value: ethers.utils.parseEther('0.2') });
          await tx.wait();
          const receipt = await providers.getTransactionReceipt(tx.hash);
          console.log(receipt);
        } catch (e)
        {
          console.log("e", e.message);
        }
      }

    } else{
      console.log("2.initialize_pool first");
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });