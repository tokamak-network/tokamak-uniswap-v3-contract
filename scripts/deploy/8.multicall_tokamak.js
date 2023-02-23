
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
const QuoteAddress = "0xAC49B1F2Bf9AaC284609abF5eb1b90f352b18a77";
const UniswapInterfaceMulticallAddress = "0x4D2cfb9300f58225057c9c139B459c2B64bA5681";
const TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
const TOS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
const Fee = ethers.BigNumber.from("3000")

const IERC20Artifact = require("../abis/IERC20.json");
const WETH9 = require("../abis/WETH9.json");
const UniswapV3Factory = require("../abis/UniswapV3Factory.json");
const SwapRouterArtifact = require("../abis/SwapRouter.json");
const NFTDescriptor = require("../abis/NFTDescriptor.json");
const NonfungibleTokenPositionDescriptor = require("../abis/NonfungibleTokenPositionDescriptor.json");
const NonfungiblePositionManager = require("../abis/NonfungiblePositionManager.json");
const QuoterArtifact = require("../abis/Quoter.json");
const QuoterV2 = require("../abis/QuoterV2.json");
const TickLens = require("../abis/TickLens.json");
const UniswapInterfaceMulticallArtifact = require("../abis/UniswapInterfaceMulticall.json");
const UniswapV3PoolArtifact = require("../abis/UniswapV3Pool.json");


async function main() {

  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;

  console.log("deployer", deployer.address);

  ///=========== SwapRouter
  const UniswapInterfaceMulticall_ = new ethers.ContractFactory(
    UniswapInterfaceMulticallArtifact.abi, UniswapInterfaceMulticallArtifact.bytecode, deployer)
  const UniswapInterfaceMulticall = UniswapInterfaceMulticall_.attach(UniswapInterfaceMulticallAddress)

  let multiCode  = await providers.getCode(UniswapInterfaceMulticallAddress);
  if (multiCode === '0x')  console.log('UniswapInterfaceMulticall is null')

  const amountIn = ethers.utils.parseEther("1");
  const path = encodePath([TOS, TON], [3000]);

  const Quoter_ = new ethers.ContractFactory(QuoterArtifact.abi, QuoterArtifact.bytecode, deployer)
  const Quoter = Quoter_.attach(QuoteAddress)
  let ABI = ["function quoteExactInput(bytes, uint256)"];
  let iface = new ethers.utils.Interface(ABI);
  let data = iface.encodeFunctionData("quoteExactInput", [path, amountIn]);
  let callData = {target: QuoteAddress, gasLimit: 3000000, callData: data};
  let calls = [callData, callData, callData];

  const results = await UniswapInterfaceMulticall.callStatic.multicall(calls, {
    gasLimit: 9000000
  });

  console.log("results", results);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});