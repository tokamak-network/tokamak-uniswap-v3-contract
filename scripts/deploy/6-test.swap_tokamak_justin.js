const ethers = require('ethers');
require('dotenv').config();

const { FeeAmount, encodePriceSqrt, encodePath } = require('../utils');
const hre = require('hardhat');

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
const NonfungiblePositionManagerAddress =
  '0x709C67488edC9fd8BdAf267BFA276B49CD62c217';
const UniswapV3FactoryAddress = '0x5CAd93cdC22B7B5A7Cc81CaA374520944505Af8d';

const SwapRouterAddress = '0x898250afef5611fB9D16B992fA0cABb12966e978';
const TON = '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2';
const TOS = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';
const Fee = ethers.BigNumber.from('3000');

const IERC20Artifact = require('../abis/IERC20.json');
const UniswapV3Factory = require('../abis/UniswapV3Factory.json');
const SwapRouterArtifact = require('../abis/SwapRouter.json');

async function swap(SwapRouter, TOSContract, deployer, params, gas) {
  const tx1 = await SwapRouter.connect(deployer).exactInput(params, {
    gasLimit: gas,
  });
  await tx1.wait();
  console.log(tx1);
  const receipt = await providers.getTransactionReceipt(tx1.hash);
  console.log('receipt', receipt);

  let balanceAfterTOS = await TOSContract.balanceOf(deployer.address);
  console.log('balanceAfterTOS', balanceAfterTOS.toString());
}

async function main() {
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;

  console.log('deployer', deployer.address);

  let UniswapV3FactoryAddressCode1 = await providers.getCode(
    UniswapV3FactoryAddress
  );
  if (UniswapV3FactoryAddressCode1 === '0x')
    console.log('UniswapV3Factory is null');

  ///=========== UniswapV3Factory
  const UniswapV3Factory_ = new ethers.ContractFactory(
    UniswapV3Factory.abi,
    UniswapV3Factory.bytecode,
    deployer
  );
  const UniswapV3FactoryContract = UniswapV3Factory_.attach(
    UniswapV3FactoryAddress
  );

  const poolAddress = await UniswapV3FactoryContract.getPool(TON, TOS, Fee);
  console.log('poolAddress', poolAddress);
  let poolCode1 = await providers.getCode(poolAddress);
  if (poolCode1 === '0x') console.log('poolAddress is null');

  let allowanceAmount = ethers.utils.parseEther('100');

  ///=========== TONContract
  const TONContract_ = new ethers.ContractFactory(
    IERC20Artifact.abi,
    IERC20Artifact.bytecode,
    deployer
  );
  const TONContract = TONContract_.attach(TON);

  let balanceBeforeTON = await TONContract.balanceOf(deployer.address);
  console.log('balanceBeforeTON', balanceBeforeTON.toString());

  let allowance = await TONContract.allowance(
    deployer.address,
    SwapRouterAddress
  );
  console.log('allowance 1 TON ', allowance.toString());
  console.log('allowanceAmount ', allowanceAmount);

  if (allowance.lt(allowanceAmount)) {
    const tx = await TONContract.approve(SwapRouterAddress, allowanceAmount);
    console.log('tx', tx);
    await tx.wait();

    console.log('deployer.address ', deployer.address);
    console.log('SwapRouterAddress ', SwapRouterAddress);
  }
  ///=========== TOSContract
  const TOSContract_ = new ethers.ContractFactory(
    IERC20Artifact.abi,
    IERC20Artifact.bytecode,
    deployer
  );
  const TOSContract = TOSContract_.attach(TOS);

  let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
  console.log('balanceBeforeTOS', balanceBeforeTOS.toString());

  allowance = await TOSContract.allowance(deployer.address, SwapRouterAddress);
  console.log('allowance 1 TOS ', allowance);

  if (allowance.lt(allowanceAmount)) {
    const tx = await TOSContract.approve(SwapRouterAddress, allowanceAmount);
    console.log('tx', tx);
    await tx.wait();
  }

  ///=========== SwapRouter
  const SwapRouter_ = new ethers.ContractFactory(
    SwapRouterArtifact.abi,
    SwapRouterArtifact.bytecode,
    deployer
  );
  const SwapRouter = SwapRouter_.attach(SwapRouterAddress);

  let swapCode = await providers.getCode(SwapRouterAddress);
  if (swapCode === '0x') console.log('SwapRouter is null');

  const amountIn = ethers.utils.parseEther('1');
  let deadline = Date.now() + 100000;
  const path = encodePath([TOS, TON], [3000]);
  const amountOutMinimum = 10;
  const params = {
    recipient: deployer.address,
    path,
    amountIn,
    amountOutMinimum,
    deadline,
  };
  console.log('params', params);

  await providers
    .estimateGas(SwapRouter.exactInput(params))
    .then((gasEstimate) => {
      console.log('gasEstimate', gasEstimate);
      const gas = parseInt(gasEstimate * 1.2);
      swap(SwapRouter, TOSContract, deployer, params, gas);
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
