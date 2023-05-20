const ethers = require('ethers');
require('dotenv').config();
const { Position } = require('@uniswap/v3-sdk');

const { FeeAmount, encodePriceSqrt, encodePath } = require('../utils');
const hre = require('hardhat');

const NonfungiblePositionManagerAddress =
  '0xD7aDF2d7DB274d568399a740801c7e6Ff47e3642';
const UniswapV3FactoryAddress = '0x58314293cD17E5d7A4C12134e69690e3A740266E';
const TON = '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2';
const TOS = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';
const Fee = ethers.BigNumber.from('3000');
const UniswapV3Factory = require('./abis/UniswapV3Factory.sol/UniswapV3Factory.json');
const IERC20Artifact = require('../abis/IERC20.json');
const UniswapV3PoolArtifact = require('./abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const NonfungiblePositionManager = require('./abis/NonfungiblePositionManager.sol/NonfungiblePositionManager.json');

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

  ///=========== TONContract
  const TONContract_ = new ethers.ContractFactory(
    IERC20Artifact.abi,
    IERC20Artifact.bytecode,
    deployer
  );
  const TONContract = TONContract_.attach(TON);

  let balanceBeforeTON = await TONContract.balanceOf(deployer.address);
  console.log('balanceBeforeTON', balanceBeforeTON.toString());

  ///=========== TOSContract
  const TOSContract_ = new ethers.ContractFactory(
    IERC20Artifact.abi,
    IERC20Artifact.bytecode,
    deployer
  );
  const TOSContract = TOSContract_.attach(TOS);

  let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
  console.log('balanceBeforeTOS', balanceBeforeTOS.toString());

  //============== PoolContract
  const UniswapV3Pool_ = new ethers.ContractFactory(
    UniswapV3PoolArtifact.abi,
    UniswapV3PoolArtifact.bytecode,
    deployer
  );
  UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddress);
  let liquidity = await UniswapV3PoolContract.liquidity();
  console.log('liquidity : ', liquidity);
  let slot0 = await UniswapV3PoolContract.slot0();
  console.log('tick', slot0.tick);

  //=================== NonfungiblePositionManager
  let npmCode1 = await providers.getCode(NonfungiblePositionManagerAddress);
  if (npmCode1 === '0x')
    console.log('NonfungiblePositionManagerAddress is null');
  const NonfungiblePositionManagerContract_ = new ethers.ContractFactory(
    NonfungiblePositionManager.abi,
    NonfungiblePositionManager.bytecode,
    deployer
  );
  const NonfungiblePositionManagerContract =
    NonfungiblePositionManagerContract_.attach(
      NonfungiblePositionManagerAddress
    );

  //============ See unclaimedFees

  
  const tokenId = 1
  //   /* GET ACCRUED UNCLAIMDED FEES */
  //   // callStatic simulates a call without state changes
  var results = await NonfungiblePositionManagerContract.callStatic.collect({
    tokenId: tokenId,
    recipient: deployer.address,
    amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
    amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
  });
  console.log('Fee0:', parseFloat(results.amount0));
  console.log('Fee1:', parseFloat(results.amount1));

  //=========collect Fee
  
  if (parseFloat(results.amount0) > 0 || (results.amount1) > 0) {
    const tx = await NonfungiblePositionManagerContract.collect({
      tokenId: tokenId,
      recipient: deployer.address,
      amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
      amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
    });
    await tx.wait();
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log('receipt', receipt);
    let balanceAfterCollectFeeTON = await TONContract.balanceOf(
      deployer.address
    );
    console.log(
      'balanceAfterCollectFeeTON',
      balanceAfterCollectFeeTON.toString()
    );
    let balanceAfterCollectFeeTOS = await TOSContract.balanceOf(
      deployer.address
    );
    console.log(
      'balanceAfterCollectFeeTOS',
      balanceAfterCollectFeeTOS.toString()
    );
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
