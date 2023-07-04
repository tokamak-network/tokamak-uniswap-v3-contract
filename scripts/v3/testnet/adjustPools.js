const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const JSBI = require('jsbi') // jsbi@3.2.5
const {NonfungiblePositionManager: NonfungiblePositionManagerAddress, getContract, getPoolContractAddress, Fee, deployContract} = require("./constant.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const {encodePriceSqrt} = require('../../utils.js');
const sdk = require("@uniswap/v3-sdk");
const getTickAtSqrtRatio = sdk.TickMath.getTickAtSqrtRatio;
const {consoleEvents} = require("./consoleEvents.js");
const nearestUsableTick = sdk.nearestUsableTick;
const getAmount0Delta = sdk.SqrtPriceMath.getAmount0Delta;
const getAmount1Delta = sdk.SqrtPriceMath.getAmount1Delta;
const getSqrtRatioAtTick = sdk.TickMath.getSqrtRatioAtTick;
const getNextSqrtPriceFromAmount0RoundingUp = sdk.SqrtPriceMath.getNextSqrtPriceFromAmount0RoundingUp;
const getNextSqrtPriceFromAmount1RoundingDown = sdk.SqrtPriceMath.getNextSqrtPriceFromAmount1RoundingDown;
const { expect } = require("chai");

async function main() {
  const chainName = hre.network.name;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;
  if(chainName === 'hardhat') deployer = await hre.ethers.getImpersonatedSigner("0xB68AA9E398c054da7EBAaA446292f611CA0CD52B");


  const eventInterface = new ethers.utils.Interface([
    'event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)'
  ]);
  const eventSignature = ethers.utils.id('IncreaseLiquidity(uint256,uint128,uint256,uint256)');
  const eventName = 'IncreaseLiquidity';
  let totalGasUsed = ethers.BigNumber.from("0")
  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  ///=============== TONContract  
  const TONContract = await getContract('TON');
  const TONAddress = TONContract.address;
  ///=============== TOSContract  
  const TOSContract = await getContract('TOS');
  const TOSAddress = TOSContract.address;
  ///=============== WETHContract  
  const WETHContract = await getContract('WETH');
  const WETHAddress = WETHContract.address;
  const NonfungiblePositionManagerContract = await getContract('NonfungiblePositionManager');
  const SwapRouterContract = await getContract('SwapRouter');
  const SwapRouterAddress = SwapRouterContract.address;


    ///=========== TONContract
    let balanceBeforeTON = await TONContract.balanceOf(deployer.address);
    console.log('balanceBeforeTON', balanceBeforeTON.toString());

    ///=========== ETH Balance
    let balanceBeforeETH = await providers.getBalance(deployer.address);
    console.log('balanceBeforeETH', balanceBeforeETH.toString());

    // ///=========== TOSContract
    // let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
    // console.log('balanceBeforeTOS', balanceBeforeTOS.toString());

//  // ===============burn liquidity
//   let positionInfo = await NonfungiblePositionManagerContract.positions(1);
//   console.log(positionInfo);
//     if (positionInfo.liquidity > 0) {
//       await exit(NonfungiblePositionManagerContract, positionInfo.liquidity, 1, 0, 0, deployer.address)
//     }
    //  positionInfo = await NonfungiblePositionManagerContract.positions(9);
    // console.log(positionInfo);
    //   if (positionInfo.liquidity > 0) {
    //     await exit(NonfungiblePositionManagerContract, positionInfo.liquidity, 9, 0, 0, deployer.address)
    //   }

    //=========== TONContract
    let balanceAfterTON = await TONContract.balanceOf(deployer.address);
    console.log('balanceAfterTON', balanceAfterTON.toString());
    ////=========== TOSContract
    // let balanceAfterTOS = await TOSContract.balanceOf(deployer.address);
    // console.log('balanceAfterTOS', balanceAfterTOS.toString());
    ////=========== ETH Balance
    let balanceAfterETH = await providers.getBalance(deployer.address);
    console.log('balanceBeforeETH', balanceAfterETH.toString());
    


    let poolAddressTOSTON = await getPoolContractAddress(UniswapV3FactoryContract, TONAddress, WETHAddress, 3000);
    const UniswapV3Pool_ = new ethers.ContractFactory(
    UniswapV3PoolArtifact.abi,
    UniswapV3PoolArtifact.bytecode,
    deployer
    );
    UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressTOSTON);
    console.log(nearestUsableTick(279025 -5108, 60));
    if(chainName ==='hardhat'){
        let MyContract = await hre.ethers.getContractFactory("LiquidityAmountsTest");
        const contract = await MyContract.deploy();
        console.log("liquidity: ", await contract.getLiquidityForAmount1(
            getSqrtRatioAtTick(nearestUsableTick(279025 -5108, 60)).toString(),
            getSqrtRatioAtTick(279024).toString(),
            ethers.utils.parseUnits('2500', 18)
        ));
        const sqrtPx96 = ((await UniswapV3PoolContract.slot0()).sqrtPriceX96).toString();
        console.log((await UniswapV3PoolContract.slot0()).tick);
        const liquidity = (await contract.getLiquidityForAmount1(
            getSqrtRatioAtTick(nearestUsableTick(279025 -5108, 60)).toString(),
            getSqrtRatioAtTick(279024).toString(),
            ethers.utils.parseUnits('2500', 18)
        )).toString();
        const amount = (ethers.utils.parseUnits('0.5', 18)).toString();
        const add = true;
        console.log(sqrtPx96, liquidity, amount, add);
        const nextSqrtPrice = (getNextSqrtPriceFromAmount0RoundingUp(JSBI.BigInt(sqrtPx96), JSBI.BigInt(liquidity), JSBI.BigInt(amount), false));
        console.log(nextSqrtPrice.toString());
        console.log("next Tick : ",getTickAtSqrtRatio(nextSqrtPrice).toString());
    }
    


    // console.log(poolAddressTOSTON)
    // console.log(await UniswapV3PoolContract.slot0());
    // console.log(await UniswapV3PoolContract.token0());
    // console.log(await TOSAddress);
    // console.log(await UniswapV3PoolContract.token1());
    // console.log(await TONAddress);
    //1 TOS = 1.42882 WTON
    //1 WTON = 0.69988 TOS
    //token1 = TOS, token1 = TON

    // let reserve0, reserve1;
    // if(TONAddress < TOSAddress){
    //   reserve0 = 1;
    //   reserve1 = 0.69988;
    // } else{
    //   reserve0 = 0.69988;
    //   reserve1 = 1;
    // }
    // let shouldSqrtPricex96 = encodePriceSqrt(reserve1, reserve0);
    // console.log(shouldSqrtPricex96);
    // console.log(getTickAtSqrtRatio(JSBI.BigInt(shouldSqrtPricex96)))


    const slot0 = await UniswapV3PoolContract.slot0()
    let sqrtPriceX96 = slot0.sqrtPriceX96;
    console.log(slot0);
    console.log(sqrtPriceX96);
    console.log(await UniswapV3PoolContract.token0());
        // let liquidity = await UniswapV3PoolContract.liquidity();
        // console.log("poolAddressTOSTON liquidity:", liquidity);
        // if (liquidity.eq(ethers.constants.Zero)) {
        //   let deadline =  Math.floor(Date.now() / 1000) + 100000;
        //   let tickLower = nearestUsableTick(getTickAtSqrtRatio(JSBI.BigInt(shouldSqrtPricex96)) - 60, 60);
        //   let tickUpper = nearestUsableTick(210782 + 60, 60);
        //   if(TOSAddress < TONAddress){
        //     token0 = TOSAddress;
        //     amount0Desired = ethers.utils.parseEther('1');
        //     token1 = TONAddress;
        //     amount1Desired =  ethers.utils.parseEther('1');
        //   } else {
        //     token0 = TONAddress;
        //     amount0Desired = ethers.utils.parseEther('1');
        //     token1 = TOSAddress;
        //     amount1Desired =  ethers.utils.parseEther('1');
        //   }
        //   let MintParams = [
        //     {
        //       token0: token0,
        //       token1: token1,
        //       fee: 3000,
        //       tickLower: tickLower,
        //       tickUpper: tickUpper,
        //       amount0Desired: amount0Desired,
        //       amount1Desired: amount1Desired,
        //       amount0Min: 0,
        //       amount1Min: 0,
        //       recipient: deployer.address,
        //       deadline: deadline,
        //     }
        //   ];
        //   try{
        //     const tx = await NonfungiblePositionManagerContract.mint(...MintParams, {
        //       gasLimit: 3000000,
        //     });
        //     await tx.wait();
        //     const receipt = await providers.getTransactionReceipt(tx.hash);
        //     console.log("====== poolAddressTOSTON mint ==========")
        //     consoleEvents(receipt, eventInterface, eventSignature, eventName);
        //     totalGasUsed = totalGasUsed.add(receipt.gasUsed);
        //   }
        //   catch(e) {
        //     console.log("e", e.message);
        //   }
        // }
         positionInfo = await NonfungiblePositionManagerContract.positions(1);
        console.log(positionInfo);


//   //=======================approve
//   let allowanceAmount = ethers.utils.parseEther('1000000000000'); //0 12개 ether
//   let minimumallowanceAmount = ethers.utils.parseEther('100000000000'); //0 11개 ether
//   ///=============== TON Contract Allowance
//   let allowance = await TONContract.allowance(
//     deployer.address,
//     SwapRouterAddress
//   );
//   if (allowance.lt(minimumallowanceAmount)) {
//     const tx = await TONContract.approve(
//       SwapRouterAddress,
//       allowanceAmount
//     );
//     await tx.wait();
//     expect(await TONContract.allowance(deployer.address, SwapRouterAddress)).to.equal(allowanceAmount);
//     console.log(`TON Contract ${allowanceAmount} ether amount Approved`);
//     const receipt = await providers.getTransactionReceipt(tx.hash);
//     console.log("transactionHash:", receipt.transactionHash);
//     console.log("gasUsed: ",receipt.gasUsed);
//     console.log();
//     totalGasUsed = totalGasUsed.add(receipt.gasUsed);
//   }

//   ///================ TOS Contract Allowance 
//   allowance = await TOSContract.allowance(
//     deployer.address,
//     SwapRouterAddress
//   );
//   if (allowance.lt(minimumallowanceAmount)) {
//     const tx = await TOSContract.approve(
//       SwapRouterAddress,
//       allowanceAmount
//     );
//     await tx.wait();
//     expect(await TONContract.allowance(deployer.address, SwapRouterAddress)).to.equal(allowanceAmount);
//     console.log(`TOS Contract ${allowanceAmount} ether amount Approved`);
//     const receipt = await providers.getTransactionReceipt(tx.hash);
//     console.log("transactionHash:", receipt.transactionHash);
//     console.log("gasUsed: ",receipt.gasUsed);
//     console.log();
//     totalGasUsed = totalGasUsed.add(receipt.gasUsed);
//   }



//   let deadline = Date.now() + 100000;

//   let amountIn = ethers.utils.parseEther('0.00000085');
//   //==============TON => TOS (ERC20->ERC20)
//   let SwapParams = 
//     {
//       tokenIn: TOSAddress,
//       tokenOut: TONAddress,
//       fee: 3000,
//       recipient: deployer.address,
//       deadline: deadline,
//       amountIn: amountIn,
//       amountOutMinimum: 0,
//       sqrtPriceLimitX96: 0,
//     }
//   ;
//   try{
//       const tx = await SwapRouterContract.exactInputSingle(SwapParams, {
//         gasLimit: 3000000,
//       });
//       await tx.wait();
//       const receipt = await providers.getTransactionReceipt(tx.hash);
//       console.log("===TON => TOS (ERC20->ERC20)");
//       console.log("transactionHash:", receipt.transactionHash);
//       console.log("gasUsed: ",receipt.gasUsed);
//       console.log();
//       totalGasUsed = totalGasUsed.add(receipt.gasUsed);
//     }
//     catch(e) {
//       console.log("e", e.message);
//     }

//     console.log(await UniswapV3PoolContract.slot0());



    // if (poolAddressTOSTON !== '0x0000000000000000000000000000000000000000') {
    //     const UniswapV3Pool_ = new ethers.ContractFactory(
    //     UniswapV3PoolArtifact.abi,
    //     UniswapV3PoolArtifact.bytecode,
    //     deployer
    //     );
    //     UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressTOSTON);
    //     let slot0 = await UniswapV3PoolContract.slot0();
    //     let sqrtPriceX96 = slot0.sqrtPriceX96;
    //     if(sqrtPriceX96.gt(ethers.constants.Zero)){
    //       let liquidity = await UniswapV3PoolContract.liquidity();
    //       console.log("poolAddressTOSTON liquidity:", liquidity);
    //       if (liquidity.gt(ethers.constants.Zero)) {
    //         let deadline =  Math.floor(Date.now() / 1000) + 100000;
    //         let tickLower = nearestUsableTick(slot0.tick -5108, 60);
    //         let tickUpper = nearestUsableTick(slot0.tick + 3365, 60);
    //         if(TOSAddress < TONAddress){
    //           token0 = TOSAddress;
    //           amount0Desired = ethers.utils.parseEther('2500');
    //           token1 = TONAddress;
    //           amount1Desired =  ethers.utils.parseEther('2500');
    //         } else {
    //           token0 = TONAddress;
    //           amount0Desired = ethers.utils.parseEther('2500');
    //           token1 = TOSAddress;
    //           amount1Desired =  ethers.utils.parseEther('2500');
    //         }
    //         let MintParams = [
    //           {
    //             token0: token0,
    //             token1: token1,
    //             fee: 3000,
    //             tickLower: tickLower,
    //             tickUpper: tickUpper,
    //             amount0Desired: amount0Desired,
    //             amount1Desired: amount1Desired,
    //             amount0Min: 0,
    //             amount1Min: 0,
    //             recipient: deployer.address,
    //             deadline: deadline,
    //           }
    //         ];
    //         try{
    //           const tx = await NonfungiblePositionManagerContract.mint(...MintParams, {
    //             gasLimit: 3000000,
    //           });
    //           await tx.wait();
    //           const receipt = await providers.getTransactionReceipt(tx.hash);
    //           console.log("====== poolAddressTOSTON mint ==========")
    //           consoleEvents(receipt, eventInterface, eventSignature, eventName);
    //           totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    //         }
    //         catch(e) {
    //           console.log("e", e.message);
    //         }
    //       }
    //     } else{
    //       console.log("2.initialize_pool first");
    //     }
    // }
}

async function exit(
  nft,
  liquidity,
  tokenId,
  amount0Min,
  amount1Min,
  recipient,
) {
  const decreaseLiquidityData = nft.interface.encodeFunctionData('decreaseLiquidity', [
    { tokenId, liquidity, amount0Min, amount1Min, deadline: Date.now() + 100000 },
  ])
  const collectData = nft.interface.encodeFunctionData('collect', [
    {
      tokenId,
      recipient,
      amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
      amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
    },
  ])
  const burnData = nft.interface.encodeFunctionData('burn', [tokenId])
  try{
    const tx = await nft.multicall([decreaseLiquidityData, collectData, burnData])
    await tx.wait();
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log(receipt);
  } catch(e){
    console.log(e.message);
  }
}

async function exitForETH(
    nft,
    liquidity,
    tokenId,
    amount0Min,
    amount1Min,
    recipient,
  ) {

    const decreaseLiquidityData = nft.interface.encodeFunctionData('decreaseLiquidity', [
      { tokenId, liquidity, amount0Min, amount1Min, deadline: Date.now() + 100000 },
    ])
    const collectData = nft.interface.encodeFunctionData('collect', [
      {
        tokenId,
        recipient: '0x0000000000000000000000000000000000000000',
        amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
        amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
      },
    ])
    const amountMinimum = 0
    const unwrapWETH9 = nft.interface.encodeFunctionData('unwrapWETH9', [amountMinimum, recipient]);

    const burnData = nft.interface.encodeFunctionData('burn', [tokenId])
    
    try{
        
      const tx = await nft.multicall([decreaseLiquidityData, collectData, unwrapWETH9, burnData])
      await tx.wait();
      const receipt = await providers.getTransactionReceipt(tx.hash);
      console.log(receipt);
    } catch(e) {
      console.log(e.message);
    }
    
  }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});