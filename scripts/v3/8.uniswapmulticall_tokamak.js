const ethers = require("ethers")
require('dotenv').config()

const { FeeAmount, encodePriceSqrt, encodePath } = require("../utils");
const hre = require("hardhat");

const QuoteAddress = "0xF0ecc7Ef16d4cB890d4B6714DF4fDFF215566633";
const UniswapInterfaceMulticallAddress = "0x846E4786805ABDe4F96D868B2aA3257e8eB1cCB9";
const TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
const TOS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"

const QuoterArtifact = require("./abis/Quoter.sol/Quoter.json");
const UniswapInterfaceMulticallArtifact = require("./abis/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json");

async function main(){
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;
  console.log("deployer", deployer.address);

  //============UniswapInterfaceMulticall
  const UniswapInterfaceMulticall_ = new ethers.ContractFactory(
    UniswapInterfaceMulticallArtifact.abi, UniswapInterfaceMulticallArtifact.bytecode, deployer)
  const UniswapInterfaceMulticall = UniswapInterfaceMulticall_.attach(UniswapInterfaceMulticallAddress)
  let multiCode  = await providers.getCode(UniswapInterfaceMulticallAddress);
  if (multiCode === '0x')  {
    console.log('UniswapInterfaceMulticall is null');
    return;
  }


  const amountIn = ethers.utils.parseEther("1");
  const path = encodePath([TOS, TON], [3000]);


    //============Quoter
  const Quoter_ = new ethers.ContractFactory(QuoterArtifact.abi, QuoterArtifact.bytecode, deployer);
  const Quoter = Quoter_.attach(QuoteAddress);
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