const ethers = require('ethers');
require('dotenv').config();

const { FeeAmount, encodePriceSqrt, encodePath } = require('../utils');
const hre = require('hardhat');
const NonfungiblePositionManagerAddress =
  '0x0653692451011e5d9921E30193603321929fE4ef';
const UniswapV3FactoryAddress = '0x31eac92F79C2B3232174C2d5Ad4DBf810022E807';
const TON = '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2';
const TOS = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';
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
    let UniswapV3PoolContract = null;
    
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
    } else{
        console.log('poolAddressTOSTON', poolAddressTOSTON);
    };


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
    if (
        poolAddressTOSTON !== '0x0000000000000000000000000000000000000000' &&
        sqrtPriceX96.gt(ethers.constants.Zero)
      ) {
        if (UniswapV3PoolContract == null) {
          const UniswapV3Pool_ = new ethers.ContractFactory(
            UniswapV3PoolArtifact.abi,
            UniswapV3PoolArtifact.bytecode,
            deployer
          );
          UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressTOSTON);
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
              tickLower: -6900,
              tickUpper: 6900,
              amount0Desired: ethers.utils.parseEther('200'),
              amount1Desired: ethers.utils.parseEther('200'),
              amount0Min: 0,
              amount1Min: 0,
              recipient: deployer.address,
              deadline: deadline,
            }
          ];

          const tx = await NonfungiblePositionManagerContract.mint(...MintParams, {
            gasLimit: 3000000,
          });
          console.log('tx', tx);
          await tx.wait();
        }
      }
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
          tickLower: -6900,
          tickUpper: 6900,
          amount0Desired: ethers.utils.parseEther('200'),
          amount1Desired: ethers.utils.parseEther('200'),
          amount0Min: 0,
          amount1Min: 0,
          recipient: deployer.address,
          deadline: deadline,
        }
      ];

      const tx = await NonfungiblePositionManagerContract.mint(...MintParams, {
        gasLimit: 3000000,
      });
      console.log('tx', tx);
      await tx.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });