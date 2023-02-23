
const ethers = require("ethers")
require('dotenv').config()

const { FeeAmount, encodePriceSqrt, encodePath } = require("../utils");
const hre = require("hardhat");

/*
WETH9 deployed to 0x04C91015CC8910B031F2399E04802b51bf6582A1
UniswapV3Factory deployed to 0x79d6318807A4d031eC4a896e3A079E115399fbcD

SwapRouter deployed to 0x477935284f9310d036C3DAABdc751E94C404fcCB
NFTDescriptor deployed to 0xE32B142dBb6cAE60447284D598530677cA1505f0
NonfungibleTokenPositionDescriptor deployed to 0x95AC058b12C1A43368758C0dda2a12ceFe6ad5f7
NonfungiblePositionManager deployed to 0x6A4514861c59Eb3F046Be89D47dD3123B159E768
Quoter deployed to 0xAC49B1F2Bf9AaC284609abF5eb1b90f352b18a77
QuoterV2 deployed to 0xD073E3ad1B4603cF6B5AA9aFc11B31529A2D213D
TickLens deployed to 0xCf1AADc5E8e7e8bC52204f06F1414FBA99e6f932
UniswapInterfaceMulticall deployed to 0x4D2cfb9300f58225057c9c139B459c2B64bA5681
*/
const NonfungiblePositionManagerAddress = "0x6A4514861c59Eb3F046Be89D47dD3123B159E768";
const UniswapV3FactoryAddress = "0x79d6318807A4d031eC4a896e3A079E115399fbcD";
const TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
const TOS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
const Fee = ethers.BigNumber.from("3000")

const IERC20Artifact = require("../abis/IERC20.json");
const UniswapV3Factory = require("../abis/UniswapV3Factory.json");
const NonfungiblePositionManager = require("../abis/NonfungiblePositionManager.json");
const UniswapV3PoolArtifact = require("../abis/UniswapV3Pool.json");

async function main() {

  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;

  console.log("deployer", deployer.address);

  let UniswapV3FactoryAddressCode1 = await providers.getCode(UniswapV3FactoryAddress);
  if (UniswapV3FactoryAddressCode1 === '0x')  console.log('UniswapV3Factory is null')

  ///=========== UniswapV3Factory
  const UniswapV3Factory_ = new ethers.ContractFactory(
      UniswapV3Factory.abi, UniswapV3Factory.bytecode, deployer)
  const UniswapV3FactoryContract = UniswapV3Factory_.attach(UniswapV3FactoryAddress)

  const poolAddress = await UniswapV3FactoryContract.getPool(TON, TOS, Fee);
  console.log("poolAddress", poolAddress);
  let poolCode1 = await providers.getCode(poolAddress);
  if (poolCode1 === '0x')  console.log('poolAddress is null')

  let allowanceAmount =  ethers.utils.parseEther("10000000000000")

  ///=========== TONContract
  const TONContract_ = new ethers.ContractFactory(IERC20Artifact.abi, IERC20Artifact.bytecode, deployer)
  const TONContract = TONContract_.attach(TON)

  let balanceBeforeTON = await TONContract.balanceOf(deployer.address);
  console.log("balanceBeforeTON", balanceBeforeTON.toString());

  let allowance = await TONContract.allowance(deployer.address, NonfungiblePositionManagerAddress);
  console.log("allowance TON ", allowance.toString());
  console.log("allowanceAmount ", allowanceAmount);

  if(allowance.lt(allowanceAmount)){
      const tx = await TONContract.approve(
        NonfungiblePositionManagerAddress,
        allowanceAmount
        );
      console.log("tx", tx);
      await tx.wait();
  }
  ///=========== TOSContract
  const TOSContract_ = new ethers.ContractFactory(IERC20Artifact.abi, IERC20Artifact.bytecode, deployer)
  const TOSContract = TOSContract_.attach(TOS)

  let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
  console.log("balanceBeforeTOS", balanceBeforeTOS.toString());

  allowance = await TOSContract.allowance(deployer.address, NonfungiblePositionManagerAddress);
  console.log("allowance 1 TOS ", allowance );

  if(allowance.lt(allowanceAmount)){
      const tx = await TOSContract.approve(
        NonfungiblePositionManagerAddress,
        allowanceAmount
        );
      console.log("tx", tx);
      await tx.wait();
  }

  //----
  if(poolAddress === '0x0000000000000000000000000000000000000000') {
    const tx1 = await UniswapV3FactoryContract.createPool(TON, TOS, Fee);
    console.log("createPool", tx1);
    await tx1.wait();
    const receipt = await providers.getTransactionReceipt(tx1.hash);
    console.log('receipt',receipt);

    // const interface = new ethers.utils.Interface(["event PoolCreated(address token0, address token1, uint24 fee, int24 tickSpacing, address pool)"]);
    // const data = receipt.logs[0].data;
    // const topics = receipt.logs[0].topics;
    // const event = interface.decodeEventLog("PoolCreated", data, topics);
    // console.log('event',event);
    // console.log('event.pool',event.pool);

    // poolAddress = event.pool;
  }

  let sqrtPriceX96 = ethers.constants.Zero;
  let tick = 0;
  let UniswapV3PoolContract = null;
  if(poolAddress !== '0x0000000000000000000000000000000000000000') {
      const UniswapV3Pool_ = new ethers.ContractFactory(
        UniswapV3PoolArtifact.abi, UniswapV3PoolArtifact.bytecode, deployer)
      UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddress)

      let slot0 = await UniswapV3PoolContract.slot0();
      console.log("slot0", slot0);
      sqrtPriceX96 = slot0.sqrtPriceX96;
      tick = slot0.tick;

      let liquidity = await UniswapV3PoolContract.liquidity();
      console.log("liquidity", liquidity);
  }

  if (poolAddress !== '0x0000000000000000000000000000000000000000'
      && sqrtPriceX96.eq(ethers.constants.Zero) ) {
      if(UniswapV3PoolContract == null) {
        const UniswapV3Pool_ = new ethers.ContractFactory(
          UniswapV3PoolArtifact.abi, UniswapV3PoolArtifact.bytecode, deployer)
        UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddress);
      }
      let tx2 = await UniswapV3PoolContract.initialize(encodePriceSqrt(1, 1));
      console.log("initialize", tx2);
      await tx2.wait();
  }

  if (poolAddress !== '0x0000000000000000000000000000000000000000'
    && sqrtPriceX96.gt(ethers.constants.Zero) ) {
      if(UniswapV3PoolContract == null) {
        const UniswapV3Pool_ = new ethers.ContractFactory(
          UniswapV3PoolArtifact.abi, UniswapV3PoolArtifact.bytecode, deployer)
        UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddress);
      }

      let npmCode1 = await providers.getCode(NonfungiblePositionManagerAddress);
      if (npmCode1 === '0x')  console.log('NonfungiblePositionManagerAddress is null')

      const NonfungiblePositionManagerContract_ = new ethers.ContractFactory(
        NonfungiblePositionManager.abi, NonfungiblePositionManager.bytecode, deployer)
      const NonfungiblePositionManagerContract = NonfungiblePositionManagerContract_.attach(NonfungiblePositionManagerAddress)
      let deadline = Date.now() + 100000;
      let MintParams = [
        {
          token0: TOS,
          token1: TON,
          fee: 3000,
          tickLower: -60,
          tickUpper: 60,
          amount0Desired: ethers.utils.parseEther("10"),
          amount1Desired: ethers.utils.parseEther("10"),
          amount0Min:  ethers.BigNumber.from("0"),
          amount1Min:  ethers.BigNumber.from("0"),
          recipient: deployer.address,
          deadline: deadline
        }
      ];

      // if(TON > TOS ) {
      //   MintParams.token0 = TOS;
      //   MintParams.token1 = TON;
      // }
      console.log('MintParams ', MintParams)

      const tx = await NonfungiblePositionManagerContract.mint(...MintParams, {
        gasLimit: 3000000
      });

      console.log("tx",tx);

      await tx.wait();

  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});