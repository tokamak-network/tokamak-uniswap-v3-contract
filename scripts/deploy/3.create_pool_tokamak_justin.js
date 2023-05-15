const ethers = require('ethers');
require('dotenv').config();

const { FeeAmount, encodePriceSqrt, encodePath } = require('../utils');
const hre = require('hardhat');

const NonfungiblePositionManagerAddress =
  '0x709C67488edC9fd8BdAf267BFA276B49CD62c217';
const UniswapV3FactoryAddress = '0x5CAd93cdC22B7B5A7Cc81CaA374520944505Af8d';
const TON = '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2';
const TOS = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';
const Fee = ethers.BigNumber.from('3000');

const IERC20Artifact = require('../abis/IERC20.json');
const UniswapV3Factory = require('../abis/UniswapV3Factory.json');
const NonfungiblePositionManager = require('../abis/NonfungiblePositionManager.sol/NonfungiblePositionManager.json');
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.json');

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
    console.log('tx', tx);
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
    console.log('tx', tx);
    await tx.wait();
  }
  if (poolAddress === '0x0000000000000000000000000000000000000000') {
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

    // poolAddress = event.pool;
    process.exitCode = 1;
  }

  let sqrtPriceX96 = ethers.constants.Zero;
  let tick = 0;
  let UniswapV3PoolContract = null;
  if (poolAddress !== '0x0000000000000000000000000000000000000000') {
    const UniswapV3Pool_ = new ethers.ContractFactory(
      UniswapV3PoolArtifact.abi,
      UniswapV3PoolArtifact.bytecode,
      deployer
    );
    UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddress);

    let slot0 = await UniswapV3PoolContract.slot0();
    console.log('slot0', slot0);
    sqrtPriceX96 = slot0.sqrtPriceX96;
    tick = slot0.tick;

    let liquidity = await UniswapV3PoolContract.liquidity();
    console.log('liquidity', liquidity);
  }
  if (
    poolAddress !== '0x0000000000000000000000000000000000000000' &&
    sqrtPriceX96.eq(ethers.constants.Zero)
  ) {
    if (UniswapV3PoolContract == null) {
      const UniswapV3Pool_ = new ethers.ContractFactory(
        UniswapV3PoolArtifact.abi,
        UniswapV3PoolArtifact.bytecode,
        deployer
      );
      UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddress);
    }
    let tx2 = await UniswapV3PoolContract.initialize(encodePriceSqrt(1, 1));
    console.log('initialize', tx2);
    await tx2.wait();
  }

  if (
    poolAddress !== '0x0000000000000000000000000000000000000000' &&
    sqrtPriceX96.gt(ethers.constants.Zero)
  ) {
    if (UniswapV3PoolContract == null) {
      const UniswapV3Pool_ = new ethers.ContractFactory(
        UniswapV3PoolArtifact.abi,
        UniswapV3PoolArtifact.bytecode,
        deployer
      );
      UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddress);
    }
    let liquidity = await UniswapV3PoolContract.liquidity();
    console.log('liquidity : ', liquidity);
    if (liquidity.eq(ethers.constants.Zero)) {
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
      let deadline = Date.now() + 100000;
      let MintParams = [
        {
          token0: TOS,
          token1: TON,
          fee: 3000,
          tickLower: -120,
          tickUpper: 120,
          amount0Desired: ethers.utils.parseEther('10'),
          amount1Desired: ethers.utils.parseEther('10'),
          amount0Min: 0,
          amount1Min: 0,
          recipient: deployer.address,
          deadline: deadline,
        },
      ];
      const tx = await NonfungiblePositionManagerContract.mint(...MintParams, {
        gasLimit: 3000000,
      });
      console.log('tx', tx);
      await tx.wait();
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
