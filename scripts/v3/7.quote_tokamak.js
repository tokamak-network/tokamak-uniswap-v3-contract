
const ethers = require("ethers")
require('dotenv').config()
const { FeeAmount, encodePriceSqrt, encodePath } = require("../utils");
const hre = require("hardhat");
const QuoteAddress = "0xd71774356db1036148DFB418EE709933F963B603";
const TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
const TOS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
const Fee = ethers.BigNumber.from("3000")
const QuoterArtifact = require("./abis/Quoter.sol/Quoter.json");


async function main() {
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;
  console.log("deployer", deployer.address);

  ///=========== Quote
  const Quoter_ = new ethers.ContractFactory(
    QuoterArtifact.abi, QuoterArtifact.bytecode, deployer)
  const Quoter = Quoter_.attach(QuoteAddress)

  let qouteCode  = await providers.getCode(QuoteAddress);
  if (qouteCode === '0x')  console.log('Quoter is null')

  const amountIn = ethers.utils.parseEther("1");
  //const path = encodePath([TOS, TON], [3000]);
  // const path = encodePath([TON, TOS], [3000]);
  // const amountOut = await Quoter.callStatic.quoteExactInput(path, amountIn, {
  //   gasLimit: 3000000
  // });
  // console.log("amountOut", amountOut.toString());
  const quotedAmountOut1 = await Quoter.callStatic.quoteExactInputSingle(
    TOS,
    TON,
    Fee,
    ethers.utils.parseEther("1"),
    0
  )
  console.log("amountOut1", quotedAmountOut1.toString());
  const quotedAmountOut2 = await Quoter.callStatic.quoteExactInputSingle(
    TON,
    TOS,
    Fee,
    ethers.utils.parseEther("1"),
    0
  )
  console.log("amountOut2", quotedAmountOut2.toString());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});