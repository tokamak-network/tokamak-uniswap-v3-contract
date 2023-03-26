
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

SwapRouter02 deployed to 0x8b8B9a683d7Fa4E72B84415C3b5674a280832B46
*/
const NonfungiblePositionManagerAddress = "0x6A4514861c59Eb3F046Be89D47dD3123B159E768";
const UniswapV3FactoryAddress = "0x79d6318807A4d031eC4a896e3A079E115399fbcD";
const SwapRouter02Address ="0x8b8B9a683d7Fa4E72B84415C3b5674a280832B46"
//const SwapRouterAddress ="0x477935284f9310d036C3DAABdc751E94C404fcCB"
const TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
const TOS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
const Fee = ethers.BigNumber.from("3000")

const IERC20Artifact = require("../abis/IERC20.json");
const UniswapV3Factory = require("../abis/UniswapV3Factory.json");
//const SwapRouterArtifact = require("../abis/SwapRouter.json");
const SwapRouter02Artifact = require("../abis/SwapRouter02.json");

async function swap (SwapRouter, TOSContract, deployer, deadline,  data, gas ){

  let balancePrevTOS1 = await TOSContract.balanceOf(deployer.address);
  console.log("balancePrevTOS1", balancePrevTOS1.toString());

  const tx1 = await SwapRouter.connect(deployer)["multicall(uint256,bytes[])"](deadline, data, {
    gasLimit: gas
  });
  await tx1.wait();

  let balanceAfterTOS = await TOSContract.balanceOf(deployer.address);
  console.log("balanceAfterTOS", balanceAfterTOS.toString());
}

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

  let allowance = await TONContract.allowance(deployer.address, SwapRouter02Address);
  console.log("allowance 1 TON ", allowance.toString());
  console.log("allowanceAmount ", allowanceAmount);

  if(allowance.lt(allowanceAmount)){
    const tx = await TONContract.approve(
        SwapRouter02Address,
      allowanceAmount
      );
    console.log("tx", tx);
    await tx.wait();

    console.log("deployer.address ", deployer.address);
    console.log("SwapRouter02Address ", SwapRouter02Address);

  }
  ///=========== TOSContract
  const TOSContract_ = new ethers.ContractFactory(IERC20Artifact.abi, IERC20Artifact.bytecode, deployer)
  const TOSContract = TOSContract_.attach(TOS)

  let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
  console.log("balanceBeforeTOS", balanceBeforeTOS.toString());

  allowance = await TOSContract.allowance(deployer.address, SwapRouter02Address);
  console.log("allowance 1 TOS ", allowance );

  if(allowance.lt(allowanceAmount)){
    const tx = await TOSContract.approve(
        SwapRouter02Address,
      allowanceAmount
      );
    console.log("tx", tx);
    await tx.wait();
  }


  ///=========== SwapRouter
  const SwapRouter_ = new ethers.ContractFactory(
    SwapRouter02Artifact.abi, SwapRouter02Artifact.bytecode, deployer)
  const SwapRouter = SwapRouter_.attach(SwapRouter02Address)

  let swapCode  = await providers.getCode(SwapRouter02Address);
  if (swapCode === '0x')  console.log('SwapRouter02  is null')

  const amountIn = ethers.utils.parseEther("1");
  let deadline = Date.now() + 100000;
  let deadlineBN = ethers.BigNumber.from(deadline+"");
  const path = encodePath([TOS, TON], [3000]);
  const amountOutMinimum = ethers.BigNumber.from("10");
  const params = {
    path,
    recipient: deployer.address,
    amountIn,
    amountOutMinimum,
  };
  console.log("params", params);

  let calldata =  SwapRouter.interface.encodeFunctionData(
    "exactInput",
    [params]
    );


  // console.log("calldata", calldata);
  let balancePrevTOS0 = await TOSContract.balanceOf(deployer.address);
  console.log("balancePrevTOS0", balancePrevTOS0.toString());

  await providers.estimateGas(
    SwapRouter["multicall(uint256,bytes[])"](deadlineBN, [calldata])
  )
  .then((gasEstimate) => {
    console.log("gasEstimate", gasEstimate);
    const gas = parseInt(gasEstimate * 1.2)

    swap (SwapRouter, TOSContract, deployer, deadlineBN,  [calldata], gas )
  })

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});