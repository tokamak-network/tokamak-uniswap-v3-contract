const ethers = require('ethers');
require('dotenv').config();

const { FeeAmount, encodePriceSqrt, encodePath } = require('../utils');
const hre = require('hardhat');

const NonfungiblePositionManagerAddress =
  '0x0653692451011e5d9921E30193603321929fE4ef';
const UniswapV3FactoryAddress = '0x31eac92F79C2B3232174C2d5Ad4DBf810022E807';

const SwapRouterAddress = '0x97ef0aB96AbF9C67ad1C72fe2ceCeC3a1616d38A';
const TON = '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2';
const TOS = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';
const Fee = ethers.BigNumber.from('3000');

const IERC20Artifact = require('../abis/IERC20.json');
const UniswapV3Factory = require('./abis/UniswapV3Factory.sol/UniswapV3Factory.json');
const SwapRouterArtifact = require('./abis/SwapRouter.sol/SwapRouter.json');

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

  if (allowance.lt(ethers.utils.parseEther('1'))) {
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

  if (allowance.lt(ethers.utils.parseEther('1'))) {
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
  const path = encodePath([TON, TOS], [3000]);
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
