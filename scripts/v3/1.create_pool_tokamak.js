const ethers = require('ethers');
require('dotenv').config();

const { FeeAmount, encodePriceSqrt, encodePath } = require('../utils');
const hre = require('hardhat');

const NonfungiblePositionManagerAddress =
  '0x0653692451011e5d9921E30193603321929fE4ef';
const UniswapV3FactoryAddress = '0x31eac92F79C2B3232174C2d5Ad4DBf810022E807';
const TON = '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2';
const TOS = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';
const LYDA = '0x3bB4445D30AC020a84c1b5A8A2C6248ebC9779D0';
const Fee = ethers.BigNumber.from('3000');

const IERC20Artifact = require('../abis/IERC20.json');
const UniswapV3Factory = require('./abis/UniswapV3Factory.sol/UniswapV3Factory.json');
const NonfungiblePositionManager = require('./abis/NonfungiblePositionManager.sol/NonfungiblePositionManager.json');
const UniswapV3PoolArtifact = require('./abis/UniswapV3Pool.sol/UniswapV3Pool.json');

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
  const poolAddressTOSTON = await UniswapV3FactoryContract.getPool(TON, TOS, Fee);
  
  let poolCode1 = await providers.getCode(poolAddressTOSTON);
  if (poolCode1 === '0x') {
    console.log('poolAddressTOSTON is null')
  } 
    
  let allowanceAmount = ethers.utils.parseEther('1000000000000'); //0 12개 + ether

  ///===============TONContract
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
    NonfungiblePositionManagerAddress
  );
  console.log('allowance TON ', allowance.toString());
  console.log('allowanceAmount ', allowanceAmount);

  if (allowance.lt(allowanceAmount)) {
    const tx = await TONContract.approve(
      NonfungiblePositionManagerAddress,
      allowanceAmount
    );
    console.log('approve TON tx', tx);
    await tx.wait();
  }

  ///===================================TOSContract
  const TOSContract_ = new ethers.ContractFactory(
    IERC20Artifact.abi,
    IERC20Artifact.bytecode,
    deployer
  );
  const TOSContract = TOSContract_.attach(TOS);
  let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
  console.log('balanceBeforeTOS', balanceBeforeTOS.toString());

  allowance = await TOSContract.allowance(
    deployer.address,
    NonfungiblePositionManagerAddress
  );
  console.log('allowance TOS ', allowance);
  if (allowance.lt(allowanceAmount)) {
    const tx = await TOSContract.approve(
      NonfungiblePositionManagerAddress,
      allowanceAmount
    );
    console.log('approve TOS tx', tx);
    await tx.wait();
  }

  if (poolAddressTOSTON === '0x0000000000000000000000000000000000000000') {
    const tx1 = await UniswapV3FactoryContract.createPool(TON, TOS, Fee);
    console.log('createPool', tx1);
    await tx1.wait();
    const receipt = await providers.getTransactionReceipt(tx1.hash);
    console.log('receipt', receipt);

    // const interface = new ethers.utils.Interface([
    //   'event PoolCreated(address token0, address token1, uint24 fee, int24 tickSpacing, address pool)',
    // ]);
    // const data = receipt.logs[0].data;
    // const topics = receipt.logs[0].topics;
    // const event = interface.decodeEventLog('PoolCreated', data, topics);
    // console.log('event', event);
    // console.log('event.pool', event.pool);

    // poolAddressTOSTON = event.pool;
    process.exitCode = 1;
  }

  let sqrtPriceX96 = ethers.constants.Zero;
  let tick = 0;
  let UniswapV3PoolContract = null;
  if (poolAddressTOSTON !== '0x0000000000000000000000000000000000000000') {
    const UniswapV3Pool_ = new ethers.ContractFactory(
      UniswapV3PoolArtifact.abi,
      UniswapV3PoolArtifact.bytecode,
      deployer
    );
    UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressTOSTON);

    let slot0 = await UniswapV3PoolContract.slot0();
    console.log('slot0', slot0);
    sqrtPriceX96 = slot0.sqrtPriceX96;
    tick = slot0.tick;

    let liquidity = await UniswapV3PoolContract.liquidity();
    console.log('liquidity', liquidity);
  }
  
  console.log('poolAddressTOSTON', poolAddressTOSTON);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
