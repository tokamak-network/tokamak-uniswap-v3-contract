
const ethers = require("ethers")
require('dotenv').config()
const { FeeAmount, encodePriceSqrt, encodePath } = require("../utils");
const hre = require("hardhat");
const QuoteAddress = "0xE3a8EbF3f0bC0f752C44737533E4a5273b201dE4";
const TON = "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa";
const WETH = "0x4200000000000000000000000000000000000006";
const TOS = "0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC";
const Fee = ethers.BigNumber.from("3000")
const QuoterArtifact = require("./abis/Quoter.sol/Quoter.json");
const USDC = '0x9c53338c48181035D96884946C34ea81818F743C';
const USDT = '0xd1e405F1154BE88aC84f748C1BcE22442B12309F';

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
    WETH,
    USDC,
    100,
    ethers.utils.parseEther('1'),
    0
  )
  console.log("amountOut1", quotedAmountOut1.toString());
  const quotedAmountOut2 = await Quoter.callStatic.quoteExactInputSingle(
    USDC,
    WETH,
    100,
    ethers.utils.parseUnits('1', 6),
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