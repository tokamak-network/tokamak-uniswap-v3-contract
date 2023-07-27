const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const JSBI = require('jsbi'); // jsbi@3.2.5
const {
  NonfungiblePositionManager: NonfungiblePositionManagerAddress,
  getContract,
  getPoolContractAddress,
} = require('./helper_functions.js');
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const { encodePriceSqrt } = require('../../utils.js');
const sdk = require('@uniswap/v3-sdk');
const getTickAtSqrtRatio = sdk.TickMath.getTickAtSqrtRatio;
const { consoleEvents } = require('../testnet/consoleEvents.js');
const nearestUsableTick = sdk.nearestUsableTick;
const { expect } = require('chai');
const getSqrtRatioAtTick = sdk.TickMath.getSqrtRatioAtTick;
const getNextSqrtPriceFromAmount0RoundingUp =
  sdk.SqrtPriceMath.getNextSqrtPriceFromAmount0RoundingUp;
const getNextSqrtPriceFromAmount1RoundingDown =
  sdk.SqrtPriceMath.getNextSqrtPriceFromAmount1RoundingDown;
const getAmount0Delta = sdk.SqrtPriceMath.getAmount0Delta;
const getAmount1Delta = sdk.SqrtPriceMath.getAmount1Delta;
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
  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  ///=============== TOSContract
  const TOSContract = await getContract('TOS');
  const TOSAddress = TOSContract.address;
  ///=============== USDCContract
  const TONContract = await getContract('TON');
  const TONAddress = TONContract.address;
  ///=============== NonfungiblePositionManagerContract
  const NonfungiblePositionManagerContract = (
    await getContract('NonfungiblePositionManager')
  ).connect(deployer);
  const UniswapV3Pool_ = new ethers.ContractFactory(
    UniswapV3PoolArtifact.abi,
    UniswapV3PoolArtifact.bytecode,
    deployer
  );
  let UniswapV3PoolContract = UniswapV3Pool_.attach(
    '0x2c1c509942d4f55e2bfd2b670e52b7a16ec5e5c4'
  );
  // let positionInfo = await NonfungiblePositionManagerContract.positions(1);
  // let liquidity = JSBI.BigInt(positionInfo.liquidity.toString());
  // const tickLower = positionInfo.tickLower;
  // const tickUpper = positionInfo.tickUpper;
  // const lowersqrtPriceX96 = getSqrtRatioAtTick(tickLower);
  // const uppersqrtPriceX96 = getSqrtRatioAtTick(tickUpper);
  // const sqrtPriceX96 = JSBI.BigInt(
  //   (await UniswapV3PoolContract.slot0()).sqrtPriceX96.toString()
  // );
  // console.log(
  //   getAmount0Delta(
  //     sqrtPriceX96,
  //     uppersqrtPriceX96,
  //     liquidity,
  //     false
  //   ).toString()
  // );
  // console.log(
  //   getAmount1Delta(
  //     lowersqrtPriceX96,
  //     sqrtPriceX96,
  //     liquidity,
  //     false
  //   ).toString()
  // );

  // let liquidity = getLiquidityForAmount1()

  let deadline = Math.floor(Date.now() / 1000) + 100000;
  let results2 = await NonfungiblePositionManagerContract.callStatic.mint({
    token0: '0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC',
    token1: '0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa',
    fee: 3000,
    tickLower: -887220,
    tickUpper: 887220,
    amount0Desired: ethers.BigNumber.from('7435567864198790116'),
    amount1Desired: ethers.BigNumber.from('10000000000000000000'),
    amount0Min: 0,
    amount1Min:0,
    recipient: '0xB68AA9E398c054da7EBAaA446292f611CA0CD52B',
    deadline: deadline
  });
  console.log(results2.amount0);
  console.log(results2.amount1);

  // positionInfo = await NonfungiblePositionManagerContract.positions(25);
  // console.log(positionInfo);
  //   if (positionInfo.liquidity > 0) {
  //     await exit(NonfungiblePositionManagerContract, positionInfo.liquidity, 25, 0, 0, deployer.address)
  //   }

  // let tx = await NonfungiblePositionManagerContract.mint({
  //   token0: '0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC',
  //   token1: '0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa',
  //   fee: 3000,
  //   tickLower: -887220,
  //   tickUpper: 887220,
  //   amount0Desired: ethers.BigNumber.from('743556786419879012'),
  //   amount1Desired: ethers.BigNumber.from('1000000000000000000'),
  //   amount0Min: ethers.BigNumber.from('741704836380018506'),
  //   amount1Min: ethers.BigNumber.from('997496867163000167'),
  //   recipient: '0xB68AA9E398c054da7EBAaA446292f611CA0CD52B',
  //   deadline: deadline
  // });
  // await tx.wait();
  // const receipt = await providers.getTransactionReceipt(tx.hash);
  // console.log(receipt);

  const encMultiCall = NonfungiblePositionManagerContract.interface.encodeFunctionData('mint', [{
    token0: '0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC',
    token1: '0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa',
    fee: 3000,
    tickLower: -887220,
    tickUpper: 887220,
    amount0Desired: ethers.BigNumber.from('371778393209939506'),
    amount1Desired: ethers.BigNumber.from('500000000000000000'),
    amount0Min: ethers.BigNumber.from('370852418190009253'),
    amount1Min: ethers.BigNumber.from('498748433581500084'),
    recipient: '0xB68AA9E398c054da7EBAaA446292f611CA0CD52B',
    deadline: deadline
  }])
  console.log(encMultiCall);

  try {
    const tx = await NonfungiblePositionManagerContract.multicall(
      [encMultiCall],
      {
        gasLimit: 500000,
      }
    );
    await tx.wait();
    const receipt = await providers.getTransactionReceipt(tx.hash);
    consoleEvents(receipt, eventInterface, eventSignature, eventName);
    totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  } catch (e) {
    console.log('e', e.message);
  }

  // if (chainName === 'localhost') {
  //   ///=========== TONContract
  //   let balanceBeforeTON = await TONContract.balanceOf(deployer.address);
  //   console.log('balanceBeforeTON', balanceBeforeTON.toString());
  //   let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
  //   console.log('balanceBeforeTOS', balanceBeforeTOS.toString());
  //   let tx = await NonfungiblePositionManagerContract.decreaseLiquidity({
  //     tokenId: 1,
  //     liquidity: positionInfo.liquidity,
  //     deadline: deadline,
  //     amount0Min: 0,
  //     amount1Min: 0,
  //   });
  //   await tx.wait();
  //   tx = await NonfungiblePositionManagerContract.collect({
  //     tokenId: 1,
  //     recipient: deployer.address,
  //     amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
  //     amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
  //   });
  //   await tx.wait();
  //   ///=========== TONContract
  //   let balanceAfterTON = await TONContract.balanceOf(deployer.address);
  //   console.log('balanceAfterTON', balanceAfterTON.toString());
  //   let balanceAfterTOS = await TOSContract.balanceOf(deployer.address);
  //   console.log('balanceAfterTOS', balanceAfterTOS.toString());
  //   console.log('amount0 + fee', balanceAfterTON.sub(balanceBeforeTON));
  //   console.log('amount1 + fee', balanceAfterTOS.sub(balanceBeforeTOS));
  // }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

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
    //.toString();
}
function getLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0) {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    let temp;
    temp = sqrtRatioAX96;
    sqrtRatioAX96 = sqrtRatioBX96;
    sqrtRatioBX96 = temp;
  }
  let FixedPoint96Q96 = ethers.BigNumber.from('0x1000000000000000000000000');
  let intermediate = sqrtRatioAX96.mul(sqrtRatioBX96).div(FixedPoint96Q96);
  return amount0
    .mul(intermediate)
    .div(sqrtRatioBX96.sub(sqrtRatioAX96))
    //.toString();
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