const ethers = require("ethers");
require("dotenv").config();
const hre = require("hardhat");
const JSBI = require("jsbi"); // jsbi@3.2.5
const {
  NonfungiblePositionManager: NonfungiblePositionManagerAddress,
  getContract,
  getPoolContractAddress,
} = require("./helper_functions.js");
const UniswapV3PoolArtifact = require("../abis/UniswapV3Pool.sol/UniswapV3Pool.json");
const { encodePriceSqrt } = require("../../utils.js");
const sdk = require("@uniswap/v3-sdk");
const getTickAtSqrtRatio = sdk.TickMath.getTickAtSqrtRatio;
const { consoleEvents } = require("../testnet/consoleEvents.js");
const nearestUsableTick = sdk.nearestUsableTick;
const { expect } = require("chai");
const getSqrtRatioAtTick = sdk.TickMath.getSqrtRatioAtTick;
const getNextSqrtPriceFromAmount0RoundingUp =
  sdk.SqrtPriceMath.getNextSqrtPriceFromAmount0RoundingUp;
const getNextSqrtPriceFromAmount1RoundingDown =
  sdk.SqrtPriceMath.getNextSqrtPriceFromAmount1RoundingDown;

async function main() {
  const chainName = hre.network.name;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;
  if (chainName === "hardhat")
    deployer = await hre.ethers.getImpersonatedSigner(
      "0xB68AA9E398c054da7EBAaA446292f611CA0CD52B"
    );

  const eventInterface = new ethers.utils.Interface([
    "event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
  ]);
  const eventSignature = ethers.utils.id(
    "IncreaseLiquidity(uint256,uint128,uint256,uint256)"
  );
  const eventName = "IncreaseLiquidity";
  let totalGasUsed = ethers.BigNumber.from("0");
  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract("UniswapV3Factory");

  ///=============== WETHContract
  const WETHContract = await getContract("WETH");
  const WETHAddress = WETHContract.address;
  ///=============== USDCContract
  const TONContract = await getContract("TON");
  const TONAddress = TONContract.address;
  ///=============== USDCContract
  const TOSContract = await getContract("TOS");
  const TOSAddress = TOSContract.address;
  ///=============== USDCContract
  const USDCContract = await getContract("USDC");
  const USDCAddress = USDCContract.address;
  ///=============== USDTContract
  const USDTContract = await getContract("USDT");
  const USDTAddress = USDTContract.address;

  ///=============== NonfungiblePositionManagerContract
  const NonfungiblePositionManagerContract = (
    await getContract("NonfungiblePositionManager")
  ).connect(deployer);
  const SwapRouterContract = (await getContract("SwapRouter")).connect(
    deployer
  );
  const SwapRouterAddress = SwapRouterContract.address;

  ///=========== ETHContract
  let balanceBeforeETH = await providers.getBalance(deployer.address);
  console.log("balanceBeforeETH", balanceBeforeETH.toString());
  ///=========== TONContract
  let balanceBeforeTON = await TONContract.balanceOf(deployer.address);
  console.log("balanceBeforeTON", balanceBeforeTON.toString());

  //  // ===============burn liquidity
  //  positionInfo = await NonfungiblePositionManagerContract.positions(2);
  // console.log(positionInfo);
  //   if (positionInfo.liquidity > 0) {
  //     await exit(NonfungiblePositionManagerContract, positionInfo.liquidity, 9, 0, 0, deployer.address)
  //   }

  // positionInfo = await NonfungiblePositionManagerContract.positions(2);
  // console.log(positionInfo);
  // if (positionInfo.liquidity > 0) {
  //   await exitForETH(NonfungiblePositionManagerContract, positionInfo.liquidity, 5, 0, 0, deployer.address, USDTAddress)
  // }

  ///=========== USDTContract
  let balanceAfterTON = await TONContract.balanceOf(deployer.address);
  console.log("balanceAfterTON", balanceAfterTON.toString());
  ///=========== ETHContract
  let balanceAfterETH = await providers.getBalance(deployer.address);
  console.log("balanceBeforeETH", balanceAfterETH.toString());

  let poolAddressWETHTON = await getPoolContractAddress(
    UniswapV3FactoryContract,
    TONAddress,
    WETHAddress,
    3000
  );
  const UniswapV3Pool_ = new ethers.ContractFactory(
    UniswapV3PoolArtifact.abi,
    UniswapV3PoolArtifact.bytecode,
    deployer
  );
  UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHTON);

  console.log(poolAddressWETHTON);
  console.log(await UniswapV3PoolContract.slot0());
  console.log(await UniswapV3PoolContract.token0());
  console.log(WETHAddress);
  console.log(await UniswapV3PoolContract.token1());
  console.log(TONAddress);
  //1 USDC = 0.00053 ETH ==>
  //1 ETH = 1,890.48 USDC
  //token1 = USDC, token0 = WETH

  //1 ETH = 1,231.38 WTON TON
  //1 WTON = 0.00081 ETH

  // let token0, token1, reserve0, reserve1;
  // if (WETHAddress < TONAddress) {
  //   token0 = WETHAddress;
  //   reserve0 = 0.00081;
  //   token1 = TONAddress;
  //   reserve1 = 1;
  // } else {
  //   token0 = TONAddress;
  //   reserve0 = 1;
  //   token1 = WETHAddress;
  //   reserve1 = 0.00081;
  // }
  // let shouldSqrtPricex96 = encodePriceSqrt(reserve1, reserve0);
  // console.log(shouldSqrtPricex96);
  // console.log(
  //   "shouldTick: ",
  //   getTickAtSqrtRatio(JSBI.BigInt(shouldSqrtPricex96))
  // );

  // const slot0 = await UniswapV3PoolContract.slot0();
  // let sqrtPriceX96 = slot0.sqrtPriceX96;
  // console.log(slot0);

  ///should Tick 71188
  // positionInfo = await NonfungiblePositionManagerContract.positions(2);
  // console.log(positionInfo);
  // if (positionInfo.liquidity > 0) {
  //   await exitForETH(NonfungiblePositionManagerContract, positionInfo.liquidity, 2, 0, 0, deployer.address, TONAddress)
  // }

  //=======================poolAddressWETHTON
  // if (poolAddressWETHTON !== "0x0000000000000000000000000000000000000000") {
  //   const UniswapV3Pool_ = new ethers.ContractFactory(
  //     UniswapV3PoolArtifact.abi,
  //     UniswapV3PoolArtifact.bytecode,
  //     deployer
  //   );
  //   UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHTON);
  //   let slot0 = await UniswapV3PoolContract.slot0();
  //   let sqrtPriceX96 = slot0.sqrtPriceX96;

  //   if (sqrtPriceX96.gt(ethers.constants.Zero)) {
  //     let liquidity = await UniswapV3PoolContract.liquidity();
  //     console.log("poolAddressWETHTON liquidity:", liquidity, slot0.tick);
  //     if (liquidity.eq(ethers.constants.Zero)) {
  //       let deadline = Date.now() + 100000;
  //       let tickLower = nearestUsableTick(slot0.tick - 60, 60);
  //       let tickUpper = nearestUsableTick(
  //         getTickAtSqrtRatio(JSBI.BigInt(shouldSqrtPricex96)) + 60,
  //         60
  //       );

  //       if (WETHAddress < TONAddress) {
  //         token0 = WETHAddress;
  //         amount0Desired = ethers.utils.parseEther("0.0001");
  //         token1 = TONAddress;
  //         amount1Desired = ethers.utils.parseEther("1");
  //       } else {
  //         token0 = TONAddress;
  //         amount0Desired = ethers.utils.parseEther("1");
  //         token1 = WETHAddress;
  //         amount1Desired = ethers.utils.parseEther("0.0001");
  //       }

  //       let MintParams = [
  //         {
  //           token0: token0,
  //           token1: token1,
  //           fee: 3000,
  //           tickLower: tickLower,
  //           tickUpper: tickUpper,
  //           amount0Desired: amount0Desired,
  //           amount1Desired: amount1Desired,
  //           amount0Min: 0,
  //           amount1Min: 0,
  //           recipient: deployer.address,
  //           deadline: deadline,
  //         },
  //       ];
  //       console.log(MintParams);
  //       const mintData =
  //         NonfungiblePositionManagerContract.interface.encodeFunctionData(
  //           "mint",
  //           MintParams
  //         );

  //       const refundETHData =
  //         NonfungiblePositionManagerContract.interface.encodeFunctionData(
  //           "refundETH"
  //         );
  //       try {
  //         const tx = await NonfungiblePositionManagerContract.multicall(
  //           [mintData, refundETHData],
  //           {
  //             gasLimit: 3000000,
  //             value: ethers.utils.parseEther("0.0001"),
  //           }
  //         );
  //         await tx.wait();
  //         const receipt = await providers.getTransactionReceipt(tx.hash);
  //         console.log("====== poolAddressWETHUSDC mint ==========");
  //         consoleEvents(receipt, eventInterface, eventSignature, eventName);
  //         totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  //       } catch (e) {
  //         console.log("e", e.message);
  //       }
  //     }
  //   } else {
  //     console.log("2.initialize_pool first");
  //   }
  // }

  positionInfo = await NonfungiblePositionManagerContract.positions(13);
  console.log(positionInfo);
  await exit(
    NonfungiblePositionManagerContract,
    positionInfo.liquidity,
    13,
    0,
    0,
    deployer.address
  );

  // positionInfo = await NonfungiblePositionManagerContract.positions(4);
  // await exitForETH(
  //   NonfungiblePositionManagerContract,
  //   positionInfo.liquidity,
  //   4,
  //   0,
  //   0,
  //   deployer.address,
  //   USDCAddress
  // );

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

  // let deadline = Date.now() + 100000;

  // let amountIn = ethers.utils.parseEther('0.00000085');
  // //==============TON => TOS (ERC20->ERC20)
  // let SwapParams =
  //   {
  //     tokenIn: TOSAddress,
  //     tokenOut: TONAddress,
  //     fee: 3000,
  //     recipient: deployer.address,
  //     deadline: deadline,
  //     amountIn: amountIn,
  //     amountOutMinimum: 0,
  //     sqrtPriceLimitX96: 0,
  //   }
  // ;
  // try{
  //     const tx = await SwapRouterContract.exactInputSingle(SwapParams, {
  //       gasLimit: 3000000,
  //     });
  //     await tx.wait();
  //     const receipt = await providers.getTransactionReceipt(tx.hash);
  //     console.log("===TON => TOS (ERC20->ERC20)");
  //     console.log("transactionHash:", receipt.transactionHash);
  //     console.log("gasUsed: ",receipt.gasUsed);
  //     console.log();
  //     totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  //   }
  //   catch(e) {
  //     console.log("e", e.message);
  //   }

  //   console.log(await UniswapV3PoolContract.slot0());

  // ///Swap WETH -> USDC
  // let deadline = Date.now() + 100000;
  //   //let amountIn = ethers.utils.parseEther('0.00000000001');
  //   let amountIn = 930000;
  //   SwapParams =
  //     {
  //       tokenIn: WETHAddress,
  //       tokenOut: USDCAddress,
  //       fee: 500,
  //       recipient: deployer.address,
  //       deadline: deadline,
  //       amountIn: amountIn,
  //       amountOutMinimum: 0,
  //       sqrtPriceLimitX96: 0,
  //     }
  //   ;
  //   try{
  //       const tx = await SwapRouterContract.exactInputSingle(SwapParams, {
  //         gasLimit: 3000000, value: amountIn
  //       });
  //       await tx.wait();
  //       const receipt = await providers.getTransactionReceipt(tx.hash);
  //       console.log("===ETH => USDC (ETH->ERC20)");
  //       console.log("transactionHash:", receipt.transactionHash);
  //       console.log("gasUsed: ",receipt.gasUsed);
  //       console.log();
  //       totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  //     }
  //     catch(e) {
  //       console.log("e", e.message);
  //     }
  //     console.log(await UniswapV3PoolContract.slot0());
  //-200894

  // //==============TOS => ETH (ERC20->ETH)
  // let deadline = Date.now() + 100000;
  // let amountIn = ethers.utils.parseEther('0.000099');
  //   const params1 =
  //     {
  //       tokenIn: TOSAddress,
  //       tokenOut: WETHAddress,
  //       fee: 3000,
  //       recipient: SwapRouterAddress,
  //       deadline: deadline,
  //       amountIn: amountIn,
  //       amountOutMinimum: 0,
  //       sqrtPriceLimitX96: 0,
  //     }
  //   ;
  //   const encData1 = SwapRouterContract.interface.encodeFunctionData('exactInputSingle', [params1]);
  //   const amountMinimum = 0
  //   const encData2 = SwapRouterContract.interface.encodeFunctionData('unwrapWETH9', [amountMinimum, deployer.address])
  //   // const calls = [encData1, encData2]
  //   // const encMultiCall = SwapRouterContract.interface.encodeFunctionData('multicall', [calls])

  //   // const txArgs = {
  //   //   to: SwapRouterAddress,
  //   //   from: deployer.address,
  //   //   data: encMultiCall,
  //   //   gasLimit: 3000000,
  //   // }
  //   try{
  //       // const tx = await deployer.sendTransaction(txArgs)
  //       const tx = await SwapRouterContract.multicall([encData1, encData2], {
  //         gasLimit: 3000000
  //       });
  //       await tx.wait();
  //       const receipt = await providers.getTransactionReceipt(tx.hash);
  //       console.log("===TOS => ETH (ERC20->ETH)");
  //       console.log("transactionHash:", receipt.transactionHash);
  //       console.log("gasUsed: ",receipt.gasUsed);
  //       console.log();
  //       totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  //     }
  //     catch(e) {
  //       console.log("e", e.message);
  //     }
  //     console.log(await UniswapV3PoolContract.slot0());

  if (chainName === "hardhat") {
    let MyContract = await hre.ethers.getContractFactory(
      "LiquidityAmountsTest"
    );
    const contract = await MyContract.deploy();
    console.log(
      "liquidity: ",
      await contract.getLiquidityForAmount1(
        getSqrtRatioAtTick(nearestUsableTick(-201210 - 5108, 10)).toString(),
        getSqrtRatioAtTick(-201210 - 1).toString(),
        49999999
      )
    );
    const sqrtPx96 = (
      await UniswapV3PoolContract.slot0()
    ).sqrtPriceX96.toString();
    console.log((await UniswapV3PoolContract.slot0()).tick);
    const liquidity = (
      await contract.getLiquidityForAmount1(
        getSqrtRatioAtTick(nearestUsableTick(-201210 - 5108, 10)).toString(),
        getSqrtRatioAtTick(-201210 - 1).toString(),
        49999999
      )
    ).toString();
    const amount = ethers.utils.parseUnits("0.1", 18).toString();
    const add = true;
    console.log(sqrtPx96, liquidity, amount, add);
    const nextSqrtPrice = getNextSqrtPriceFromAmount0RoundingUp(
      JSBI.BigInt(sqrtPx96),
      JSBI.BigInt(liquidity),
      JSBI.BigInt(amount),
      false
    );
    console.log(nextSqrtPrice.toString());
    console.log("next Tick : ", getTickAtSqrtRatio(nextSqrtPrice).toString());
  }
  //-199158 nextTick

  //
  //   //=======================poolAddressWETHTOS
  //   if (poolAddressWETHUSDT !== '0x0000000000000000000000000000000000000000') {
  //     const UniswapV3Pool_ = new ethers.ContractFactory(
  //     UniswapV3PoolArtifact.abi,
  //     UniswapV3PoolArtifact.bytecode,
  //     deployer
  //     );
  //     UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHUSDT);
  //     let slot0 = await UniswapV3PoolContract.slot0();
  //     let sqrtPriceX96 = slot0.sqrtPriceX96;

  //     if(sqrtPriceX96.gt(ethers.constants.Zero)){
  //       let liquidity = await UniswapV3PoolContract.liquidity();
  //       console.log("poolAddressWETHTON liquidity:", liquidity, slot0.tick);
  //       if (liquidity.eq(ethers.constants.Zero)) {
  //         let deadline = Date.now() + 100000;

  //         let tickLower = nearestUsableTick(slot0.tick -5108, 10);
  //         let tickUpper = nearestUsableTick(-166442, 10);
  //         // let tickLower = -600;
  //         // let tickUpper = 600;
  //         if(WETHAddress < USDTAddress){
  //           token0 = WETHAddress;
  //           amount0Desired = ethers.utils.parseEther('0.1');
  //           token1 = USDTAddress;
  //           amount1Desired =  49999999;
  //         } else {
  //           token0 = USDTAddress;
  //           amount0Desired = 49999999;
  //           token1 = WETHAddress;
  //           amount1Desired =  ethers.utils.parseEther('0.1');
  //         }

  //         let MintParams = [
  //           {
  //             token0: token0,
  //             token1: token1,
  //             fee: 500,
  //             tickLower: tickLower,
  //             tickUpper: tickUpper,
  //             amount0Desired: amount0Desired,
  //             amount1Desired: amount1Desired,
  //             amount0Min: 0,
  //             amount1Min: 0,
  //             recipient: deployer.address,
  //             deadline: deadline,
  //           }
  //         ]
  //         ;
  //         const mintData = NonfungiblePositionManagerContract.interface.encodeFunctionData('mint', MintParams);

  //         const refundETHData = NonfungiblePositionManagerContract.interface.encodeFunctionData('refundETH')
  //         try{
  //           const tx = await NonfungiblePositionManagerContract.multicall([mintData, refundETHData], {
  //             gasLimit: 3000000, value: ethers.utils.parseEther('0.1')
  //           });
  //           //const tx = await NonfungiblePositionManagerContract.mint(...MintParams, { gasLimit: 3000000, value: ethers.utils.parseEther('0.2') });
  //           await tx.wait();
  //           const receipt = await providers.getTransactionReceipt(tx.hash);
  //           console.log("====== poolAddressWETHTON mint ==========")
  //           consoleEvents(receipt, eventInterface, eventSignature, eventName);
  //           totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  //         } catch (e)
  //         {
  //           console.log("e", e.message);
  //         }
  //       }

  //     } else{
  //       console.log("2.initialize_pool first");
  //     }
  //   }

  // positionInfo = await NonfungiblePositionManagerContract.positions(15);
  //    await exitForETH(NonfungiblePositionManagerContract, positionInfo.liquidity, 15, 0, 0, deployer.address, USDCAddress)
}

async function exit(
  nft,
  liquidity,
  tokenId,
  amount0Min,
  amount1Min,
  recipient
) {
  const decreaseLiquidityData = nft.interface.encodeFunctionData(
    "decreaseLiquidity",
    [
      {
        tokenId,
        liquidity,
        amount0Min,
        amount1Min,
        deadline: Date.now() + 100000,
      },
    ]
  );
  const collectData = nft.interface.encodeFunctionData("collect", [
    {
      tokenId,
      recipient,
      amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
      amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
    },
  ]);
  const burnData = nft.interface.encodeFunctionData("burn", [tokenId]);
  try {
    const tx = await nft.multicall([
      decreaseLiquidityData,
      collectData,
      burnData,
    ]);
    await tx.wait();
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log(receipt);
  } catch (e) {
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
  sweepTokenAddress
) {
  const decreaseLiquidityData = nft.interface.encodeFunctionData(
    "decreaseLiquidity",
    [
      {
        tokenId,
        liquidity,
        amount0Min,
        amount1Min,
        deadline: Date.now() + 100000,
      },
    ]
  );
  const collectData = nft.interface.encodeFunctionData("collect", [
    {
      tokenId,
      recipient: "0x0000000000000000000000000000000000000000",
      amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
      amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
    },
  ]);
  const amountMinimum = 0;
  const unwrapWETH9 = nft.interface.encodeFunctionData("unwrapWETH9", [
    amountMinimum,
    recipient,
  ]);

  const sweepToken = nft.interface.encodeFunctionData("sweepToken", [
    sweepTokenAddress,
    amountMinimum,
    recipient,
  ]);

  //     Function: sweepToken(address, uint256, address)
  // #	Name	Type	Data
  // 1	token	address	af88d065e77c8cc2239327c5edb3a432268e5831
  // 2	amountMinimum	uint256	44642212
  // 3	recipient	address	8e85abd6de597cd75f40980990feec0526444637

  const burnData = nft.interface.encodeFunctionData("burn", [tokenId]);

  try {
    const tx = await nft.multicall(
      [decreaseLiquidityData, collectData, unwrapWETH9, sweepToken, burnData],
      { gasLimit: 3000000 }
    );
    await tx.wait();
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log(receipt);
    console.log("what");
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
