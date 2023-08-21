const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const {getContract, getPoolContractAddress, deployContract} = require("./helper_functions.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const { expect } = require("chai");
const {encodePath } = require("../../utils.js");

async function main() {
  const chainId = hre.network.config.chainId;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;
//  if (chainId === 31337)
//   deployer = await hre.ethers.getImpersonatedSigner(
//       '0x942d6ac7A6702Bb1852676f3f22AeE38bD442E4C'
//     );
  // let totalGasUsed = ethers.BigNumber.from("0")
  // ///=========== UniswapV3Factory
  // const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  ///=============== NonfungiblePositionManagerContract  
  const NonfungiblePositionManagerContract = await getContract('NonfungiblePositionManager');
  const NonfungiblePositionManagerAddress = NonfungiblePositionManagerContract.address;
  // ///=============== TONContract  
  // const TONContract = await getContract('TON');
  // const TONAddress = TONContract.address;
  // ///=============== WETHContract  
  // const WETHContract = await getContract('WETH');
  // const WETHAddress = WETHContract.address;
  //   ///=============== WETHContract
  //   const TOSContract = await getContract('TOS');
  //   const TOSAddress = TOSContract.address;
  ///=============== TOSContract
  const USDCContract = await getContract('USDC');
  const USDCAddress = USDCContract.address;
  const FRAXContract = await getContract('FRAX');
  const FRAXAddress = FRAXContract.address;
  // ///=============== SwapRouterContract  
  // const SwapRouterContract = await getContract('SwapRouter02'); //
  // const SwapRouterAddress = SwapRouterContract.address;

  // let ethBalance = await providers.getBalance(deployer.address);
  // console.log("ethBalance",ethBalance);
  // let usdcBalance = await USDCContract.balanceOf(deployer.address);
  // console.log("usdcBalance",usdcBalance);
  // console.log(NonfungiblePositionManagerContract.address);
  // let positionInfo = await NonfungiblePositionManagerContract.positions(21);
  // console.log(positionInfo);

  console.log(deployer.address);
  console.log(NonfungiblePositionManagerContract.address);
  try {
    await allowFunction(
      'USDC',
      USDCContract,
      deployer.address,
      NonfungiblePositionManagerAddress
    )
    await allowFunction(
      'FRAX',
      FRAXContract,
      deployer.address,
      NonfungiblePositionManagerAddress
    )
    const tx = await NonfungiblePositionManagerContract.increaseLiquidity({
      tokenId:1004115,
      amount0Desired:0,
      amount1Desired:175988251,
      amount0Min:0,
      amount1Min:174988251,
      deadline: Math.floor(Date.now() / 1000) + 1000000000,
    }, {
      gasLimit: 3000000
    })
    await tx.wait();
    console.log(tx);
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log(receipt);
  } catch (e) {
    console.log(e.message);
  }


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function allowFunction(tokenName, tokenContract, sender, spender) {
  let minimumallowanceAmount = ethers.utils.parseEther('100000000000');
  let allowance = await tokenContract.allowance(sender, spender);
  console.log(`${tokenName} approved amount:`, allowance);
  if (allowance.lt(minimumallowanceAmount)) {
    const tx = await tokenContract.approve(spender, allowanceAmount);
    await tx.wait();
    expect(await tokenContract.allowance(sender, spender)).to.equal(
      allowanceAmount
    );
    console.log(`${tokenName} ${allowanceAmount} * 10e18 amount Approved`);
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log('transactionHash:', receipt.transactionHash);
    console.log('gasUsed: ', receipt.gasUsed);
    console.log();
    return receipt.gasUsed;
  } else {
    return ethers.BigNumber.from('0');
  }
}