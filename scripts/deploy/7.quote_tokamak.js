
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
const QuoteAddress = "0xE3a8EbF3f0bC0f752C44737533E4a5273b201dE4";
const TON = "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa"
const TOS = "0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC"
const Fee = ethers.BigNumber.from("3000")
const QuoterArtifact = require("../abis/Quoter.json");


async function main() {

  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;

  console.log("deployer", deployer.address);

  ///=========== SwapRouter
  const Quoter_ = new ethers.ContractFactory(
    QuoterArtifact.abi, QuoterArtifact.bytecode, deployer)
  const Quoter = Quoter_.attach(QuoteAddress)

  let qouteCode  = await providers.getCode(QuoteAddress);
  if (qouteCode === '0x')  console.log('Quoter is null')

  const amountIn = ethers.utils.parseEther("1");
  const path = encodePath([TOS, TON], [3000]);

  const amountOut = await Quoter.callStatic.quoteExactInput(path, amountIn, {
    gasLimit: 3000000
  });

  console.log("amountOut", amountOut.toString());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});