const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const {getContract, getPoolContractAddress, deployContract} = require("./constant.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const { expect } = require("chai");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;
  let totalGasUsed = ethers.BigNumber.from("0")
  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  ///=============== NonfungiblePositionManagerContract  
  const NonfungiblePositionManagerContract = await getContract('NonfungiblePositionManager');
  ///=============== TONContract  
  const TONContract = await getContract('TON');
  const TONAddress = TONContract.address;
  ///=============== TOSContract  
  const TOSContract = await getContract('TOS');
  const TOSAddress = TOSContract.address;
  ///=============== WETHContract  
  const WETHContract = await getContract('WETH');
  const WETHAddress = WETHContract.address;
  ///=============== TOSContract  
  const USDCContract = await getContract('USDC');
  const USDCAddress = USDCContract.address;
  ///=============== WETHContract  
  const USDTContract = await getContract('USDT');
  const USDTAddress = USDTContract.address;
  ///=============== SwapRouterContract  
  const SwapRouterContract = await getContract('SwapRouter');
  const SwapRouterAddress = SwapRouterContract.address;

  let poolAddressTOSTON = await getPoolContractAddress(UniswapV3FactoryContract, TONAddress, TOSAddress, 3000);
  let poolAddressWETHTOS = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, TOSAddress, 3000);
  let poolAddressWETHTON = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, TONAddress, 3000);
  let poolAddressWETHUSDC = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, USDCAddress, 500);
  let poolAddressWETHUSDT = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, USDTAddress, 500);

  //=======================approve
  let allowanceAmount = ethers.utils.parseEther('1000000000000'); //0 12개 ether
  let minimumallowanceAmount = ethers.utils.parseEther('100000000000'); //0 11개 ether
  ///=============== TON Contract Allowance
  let allowance = await TONContract.allowance(
    deployer.address,
    SwapRouterAddress
  );
  if (allowance.lt(minimumallowanceAmount)) {
    const tx = await TONContract.approve(
      SwapRouterAddress,
      allowanceAmount
    );
    await tx.wait();
    expect(await TONContract.allowance(deployer.address, SwapRouterAddress)).to.equal(allowanceAmount);
    console.log(`TON Contract ${allowanceAmount} ether amount Approved`);
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log("transactionHash:", receipt.transactionHash);
    console.log("gasUsed: ",receipt.gasUsed);
    console.log();
    totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  }

  ///================ TOS Contract Allowance 
  allowance = await TOSContract.allowance(
    deployer.address,
    SwapRouterAddress
  );
  if (allowance.lt(minimumallowanceAmount)) {
    const tx = await TOSContract.approve(
      SwapRouterAddress,
      allowanceAmount
    );
    await tx.wait();
    expect(await TONContract.allowance(deployer.address, SwapRouterAddress)).to.equal(allowanceAmount);
    console.log(`TOS Contract ${allowanceAmount} ether amount Approved`);
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log("transactionHash:", receipt.transactionHash);
    console.log("gasUsed: ",receipt.gasUsed);
    console.log();
    totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  }

  ///================ WETH Contract Allowance 
  allowance = await WETHContract.allowance(
    deployer.address,
    SwapRouterAddress
  );
  if (allowance.lt(minimumallowanceAmount)) {
    const tx = await WETHContract.approve(
      SwapRouterAddress,
      allowanceAmount
    );
    await tx.wait();
    expect(await WETHContract.allowance(deployer.address, SwapRouterAddress)).to.equal(allowanceAmount);
    console.log(`WETH Contract ${allowanceAmount} ether amount Approved`);
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log("transactionHash:", receipt.transactionHash);
    console.log("gasUsed: ",receipt.gasUsed);
    console.log();
    totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  }

  ///================ USDC Contract Allowance 
  allowance = await USDCContract.allowance(
    deployer.address,
    SwapRouterAddress
  );
  if (allowance.lt(minimumallowanceAmount)) {
    const tx = await USDCContract.approve(
      SwapRouterAddress,
      allowanceAmount
    );
    await tx.wait();
    expect(await USDCContract.allowance(deployer.address, SwapRouterAddress)).to.equal(allowanceAmount);
    console.log(`USDCContract Contract ${allowanceAmount} ether amount Approved`);
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log("transactionHash:", receipt.transactionHash);
    console.log("gasUsed: ",receipt.gasUsed);
    console.log();
    totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  }

  ///================ USDC Contract Allowance 
  allowance = await USDTContract.allowance(
    deployer.address,
    SwapRouterAddress
  );
  if (allowance.lt(minimumallowanceAmount)) {
    const tx = await USDTContract.approve(
      SwapRouterAddress,
      allowanceAmount
    );
    await tx.wait();
    expect(await USDTContract.allowance(deployer.address, SwapRouterAddress)).to.equal(allowanceAmount);
    console.log(`USDTContract Contract ${allowanceAmount} ether amount Approved`);
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log("transactionHash:", receipt.transactionHash);
    console.log("gasUsed: ",receipt.gasUsed);
    console.log();
    totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  }

  
  // address tokenIn;
  // address tokenOut;
  // uint24 fee;
  // address recipient;
  // uint256 deadline;
  // uint256 amountIn;
  // uint256 amountOutMinimum;
  // uint160 sqrtPriceLimitX96;

  let deadline = Date.now() + 100000;

  let amountIn = ethers.utils.parseEther('1');
  // //==============TOS => TON (ERC20->ERC20)
  // let SwapParams = 
  //   {
  //     tokenIn: TOSAddress,
  //     tokenOut: TONAddress,
  //     fee: 3000,
  //     recipient: deployer.address,
  //     deadline: deadline,
  //     amountIn: amountIn,
  //     amountOutMinimum: 0,
  //     sqrtPriceLimitX96: 0,
  //   }
  // ;
  // try{
  //     const tx = await SwapRouterContract.exactInputSingle(SwapParams, {
  //       gasLimit: 3000000,
  //     });
  //     await tx.wait();
  //     const receipt = await providers.getTransactionReceipt(tx.hash);
  //     console.log("===TOS => TON (ERC20->ERC20)");
  //     console.log("transactionHash:", receipt.transactionHash);
  //     console.log("gasUsed: ",receipt.gasUsed);
  //     console.log();
  //     totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  //   }
  //   catch(e) {
  //     console.log("e", e.message);
  //   }

  //==============ETH => TON (ETH->ERC20)
  amountIn = ethers.utils.parseEther('0.001');
  amountIn = 53267;
  SwapParams = 
    {
      tokenIn: WETHAddress,
      tokenOut: TONAddress,
      fee: 3000,
      recipient: deployer.address,
      deadline: deadline,
      amountIn: amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    }
  ;
  try{
      const tx = await SwapRouterContract.exactInputSingle(SwapParams, {
        gasLimit: 3000000, value: amountIn
      });
      await tx.wait();
      const receipt = await providers.getTransactionReceipt(tx.hash);
      console.log("===ETH => TOS (ETH->ERC20)");
      console.log("transactionHash:", receipt.transactionHash);
      console.log("gasUsed: ",receipt.gasUsed);
      console.log();
      totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    }
    catch(e) {
      console.log("e", e.message);
    }

  // //==============TOS => ETH (ERC20->ETH)
  // amountIn = ethers.utils.parseEther('1');
  // const params1 = 
  //   {
  //     tokenIn: TOSAddress,
  //     tokenOut: WETHAddress,
  //     fee: 3000,
  //     recipient: SwapRouterAddress,
  //     deadline: deadline,
  //     amountIn: amountIn,
  //     amountOutMinimum: 0,
  //     sqrtPriceLimitX96: 0,
  //   }
  // ;
  // const encData1 = SwapRouterContract.interface.encodeFunctionData('exactInputSingle', [params1]);
  // const amountMinimum = 0
  // const encData2 = SwapRouterContract.interface.encodeFunctionData('unwrapWETH9', [amountMinimum, deployer.address])
  // // const calls = [encData1, encData2]
  // // const encMultiCall = SwapRouterContract.interface.encodeFunctionData('multicall', [calls])

  // // const txArgs = {
  // //   to: SwapRouterAddress,
  // //   from: deployer.address,
  // //   data: encMultiCall,
  // //   gasLimit: 3000000,
  // // }
  // try{
  //     // const tx = await deployer.sendTransaction(txArgs)
  //     const tx = await SwapRouterContract.multicall([encData1, encData2], {
  //       gasLimit: 3000000
  //     });
  //     await tx.wait();
  //     const receipt = await providers.getTransactionReceipt(tx.hash);
  //     console.log("===TOS => ETH (ERC20->ETH)");
  //     console.log("transactionHash:", receipt.transactionHash);
  //     console.log("gasUsed: ",receipt.gasUsed);
  //     console.log();
  //     totalGasUsed = totalGasUsed.add(receipt.gasUsed);
  //   }
  //   catch(e) {
  //     console.log("e", e.message);
  //   }
    console.log("totalGasUsed:",totalGasUsed);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
