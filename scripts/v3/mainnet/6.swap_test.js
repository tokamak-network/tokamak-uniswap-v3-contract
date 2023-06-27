const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const {getContract, getPoolContractAddress, deployContract} = require("./helper_functions.js");
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
  ///=============== WETHContract  
  const WETHContract = await getContract('WETH');
  const WETHAddress = WETHContract.address;
    ///=============== WETHContract  
    const TOSContract = await getContract('WETH');
    const TOSAddress = TOSContract.address;
  ///=============== SwapRouterContract  
  const SwapRouterContract = await getContract('SwapRouter');
  const SwapRouterAddress = SwapRouterContract.address;

  let poolAddressTOSTON = await getPoolContractAddress(UniswapV3FactoryContract, TONAddress, TOSAddress, 3000);
  let poolAddressWETHTON = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, TONAddress, 3000);
  
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
  //==============TON => TOS (ERC20->ERC20)
  let SwapParams = 
    {
      tokenIn: TONAddress,
      tokenOut: TOSAddress,
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
        gasLimit: 3000000,
      });
      await tx.wait();
      const receipt = await providers.getTransactionReceipt(tx.hash);
      console.log("===TON => TOS (ERC20->ERC20)");
      console.log("transactionHash:", receipt.transactionHash);
      console.log("gasUsed: ",receipt.gasUsed);
      console.log();
      totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    }
    catch(e) {
      console.log("e", e.message);
    }

//   //==============ETH => TON (ETH->ERC20)
//   amountIn = ethers.utils.parseEther('0.001');
//   amountIn = 53267;
//   SwapParams = 
//     {
//       tokenIn: WETHAddress,
//       tokenOut: TONAddress,
//       fee: 3000,
//       recipient: deployer.address,
//       deadline: deadline,
//       amountIn: amountIn,
//       amountOutMinimum: 0,
//       sqrtPriceLimitX96: 0,
//     }
//   ;
//   try{
//       const tx = await SwapRouterContract.exactInputSingle(SwapParams, {
//         gasLimit: 3000000, value: amountIn
//       });
//       await tx.wait();
//       const receipt = await providers.getTransactionReceipt(tx.hash);
//       console.log("===ETH => TON (ETH->ERC20)");
//       console.log("transactionHash:", receipt.transactionHash);
//       console.log("gasUsed: ",receipt.gasUsed);
//       console.log();
//       totalGasUsed = totalGasUsed.add(receipt.gasUsed);
//     }
//     catch(e) {
//       console.log("e", e.message);
//     }

//   //==============TON => ETH (ERC20->ETH)
//   amountIn = ethers.utils.parseEther('1');
//   const params1 = 
//     {
//       tokenIn: TONAddress,
//       tokenOut: WETHAddress,
//       fee: 3000,
//       recipient: SwapRouterAddress,
//       deadline: deadline,
//       amountIn: amountIn,
//       amountOutMinimum: 0,
//       sqrtPriceLimitX96: 0,
//     }
//   ;
//   const encData1 = SwapRouterContract.interface.encodeFunctionData('exactInputSingle', [params1]);
//   const amountMinimum = 0
//   const encData2 = SwapRouterContract.interface.encodeFunctionData('unwrapWETH9', [amountMinimum, deployer.address])
//   try{
//       const tx = await SwapRouterContract.multicall([encData1, encData2], {
//         gasLimit: 3000000
//       });
//       await tx.wait();
//       const receipt = await providers.getTransactionReceipt(tx.hash);
//       console.log("===TON => ETH (ERC20->ETH)");
//       console.log("transactionHash:", receipt.transactionHash);
//       console.log("gasUsed: ",receipt.gasUsed);
//       console.log();
//       totalGasUsed = totalGasUsed.add(receipt.gasUsed);
//     }
//     catch(e) {
//       console.log("e", e.message);
//     }
//     console.log("totalGasUsed:",totalGasUsed);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
