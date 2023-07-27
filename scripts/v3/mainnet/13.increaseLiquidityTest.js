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
//       '0x8c595DA827F4182bC0E3917BccA8e654DF8223E1'
//     );
  let totalGasUsed = ethers.BigNumber.from("0")
  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  ///=============== NonfungiblePositionManagerContract  
  const NonfungiblePositionManagerContract = await getContract('NonfungiblePositionManager');
  const NonfungiblePositionManagerAddress = NonfungiblePositionManagerContract.address;
  ///=============== TONContract  
  const TONContract = await getContract('TON');
  const TONAddress = TONContract.address;
  ///=============== WETHContract  
  const WETHContract = await getContract('WETH');
  const WETHAddress = WETHContract.address;
    ///=============== WETHContract
    const TOSContract = await getContract('TOS');
    const TOSAddress = TOSContract.address;
    ///=============== TOSContract
  const USDCContract = await getContract('USDC');
  const USDCAddress = USDCContract.address;
  ///=============== SwapRouterContract  
  const SwapRouterContract = await getContract('SwapRouter02'); //
  const SwapRouterAddress = SwapRouterContract.address;

  let ethBalance = await providers.getBalance(deployer.address);
  console.log("ethBalance",ethBalance);
  let usdcBalance = await USDCContract.balanceOf(deployer.address);
  console.log("usdcBalance",usdcBalance);
  console.log(NonfungiblePositionManagerContract.address);
  let positionInfo = await NonfungiblePositionManagerContract.positions(21);
  console.log(positionInfo);

  try {
    const txArgs = {
        to: NonfungiblePositionManagerAddress,
        from: deployer.address,
        data: '0x883164560000000000000000000000006af3cb766d6cd37449bfd321d961a61b0515c1bc000000000000000000000000fa956eb0c4b3e692ad5a6b2f08170ade55999aca0000000000000000000000000000000000000000000000000000000000000bb8ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe4d000000000000000000000000000000000000000000000000000000000000d89b40000000000000000000000000000000000000000000000056bb79a502ca0d292000000000000000000000000000000000000000000000002d9f5daf6e2aacb300000000000000000000000000000000000000000000000056842c7cdc3501d28000000000000000000000000000000000000000000000002d549e9687238b5480000000000000000000000008c595da827f4182bc0e3917bcca8e654df8223e10000000000000000000000000000000000000000000000000000000064be0bd1',
        gasLimit: 300000,
    }
    const tx = await deployer.sendTransaction(txArgs)
    await tx.wait();
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
