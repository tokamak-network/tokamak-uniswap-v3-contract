const ethers = require('ethers');
require('dotenv').config();

const { FeeAmount, encodePriceSqrt, encodePath } = require('../utils');
const hre = require('hardhat');

const NonfungiblePositionManagerAddress =
  '0xD7aDF2d7DB274d568399a740801c7e6Ff47e3642';
const UniswapV3FactoryAddress = '0x58314293cD17E5d7A4C12134e69690e3A740266E';
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
