const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const fs = require('fs');
const {
  getContract,
  getPoolContractAddress,
} = require('./helper_functions.js');
const { encodePriceSqrt } = require('../../utils.js');
const Fee = ethers.BigNumber.from('3000');
let deployer
async function main() {
  const chainName = hre.network.name;
  const accounts = await hre.ethers.getSigners();
  deployer = accounts[0];
  providers = hre.ethers.provider;
  let totalGasUsed = ethers.BigNumber.from('0');
  if (chainName === 'hardhat')
    deployer = await hre.ethers.getImpersonatedSigner(
      '0xB68AA9E398c054da7EBAaA446292f611CA0CD52B'
    );

  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  ///=============== NonfungiblePositionManagerContract
  const NonfungiblePositionManagerContract = (
    await getContract('NonfungiblePositionManager')
  ).connect(deployer);
  console.log('');
  ///=============== TONContract
  const WTONContract = await getContract('WTON');
  const WTONAddress = WTONContract.address;
  ///=============== TOSContract
  const TOSContract = await getContract('TOS');
  const TOSAddress = TOSContract.address;

  let poolAddressTOSWTON = await getPoolContractAddress(
    UniswapV3FactoryContract,
    WTONAddress,
    TOSAddress,
    500
  );

  if (poolAddressTOSWTON === '0x0000000000000000000000000000000000000000') {
    //1 WTON = 0.75058 TOS
    //1 TOS = 1.3323 WTON
    let token0, token1, sqrtPriceX96, reserve0, reserve1;
    if (WTONAddress < TOSAddress) {
      token0 = WTONAddress;
      reserve0 = 1;
      token1 = TOSAddress;
      reserve1 = 0.75058;
    } else {
      token0 = TOSAddress;
      reserve0 = 1;
      token1 = WTONAddress;
      reserve1 = 1.3323;
    }
    sqrtPriceX96 = encodePriceSqrt(reserve1, reserve0);
    console.log('======createAndInitialize poolAddressWETHTON=======');
    totalGasUsed = totalGasUsed.add(
      await createPool(
        token0,
        token1,
        sqrtPriceX96,
        NonfungiblePositionManagerContract
      )
    );
  }
}

async function createPool(
  token0,
  token1,
  sqrtPriceX96,
  NonfungiblePositionManagerContract
) {
  const encData1 = NonfungiblePositionManagerContract.interface.encodeFunctionData('createAndInitializePoolIfNecessary(address,address,uint24,uint160)', [token0, token1, 500, ethers.BigNumber.from('2505411999795360582221170761428213')])
  console.log(token0, token1);
  const encMultiCall = NonfungiblePositionManagerContract.interface.encodeFunctionData('multicall(bytes[])', [[encData1]])
  //console.log(encMultiCall);
  deadline = Math.floor(Date.now() / 1000) + 100000;
  try {
    // const tx = await SwapRouterContract.multicall(swapData, {gasLimit:300000});
    //const tx = await SwapRouterContract.multicall(swapData, {gasLimit:300000});
    const txArgs = {
        to: NonfungiblePositionManagerContract.address,
        from: deployer.address,
        data: encMultiCall,
        gasLimit: 5615052,
    }
    let tx = await deployer.sendTransaction(txArgs)
    // let tx =
    //   await NonfungiblePositionManagerContract.createAndInitializePoolIfNecessary(
    //     token0,
    //     token1,
    //     Fee,
    //     sqrtPriceX96
    //   );
    await tx.wait();
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log('transactionHash:', receipt.transactionHash);
    console.log('gasUsed: ', receipt.gasUsed);
    console.log();
    return receipt.gasUsed;
  } catch (e){
    console.log('e', e.message);
  }
}
async function writeAddresses(
  UniswapV3FactoryContract,
  chainName,
  TONAddress,
  TOSAddress,
  WETHAddress,
  USDCAddress,
  USDTAddress
) {
  let poolAddressTOSTON = await getPoolContractAddress(
    UniswapV3FactoryContract,
    TONAddress,
    TOSAddress,
    Fee
  );
  let poolAddressWETHTOS = await getPoolContractAddress(
    UniswapV3FactoryContract,
    WETHAddress,
    TOSAddress,
    Fee
  );
  let poolAddressWETHTON = await getPoolContractAddress(
    UniswapV3FactoryContract,
    WETHAddress,
    TONAddress,
    Fee
  );
  let poolAddressWETHUSDC = await getPoolContractAddress(
    UniswapV3FactoryContract,
    WETHAddress,
    USDCAddress,
    Fee
  );
  let poolAddressWETHUSDT = await getPoolContractAddress(
    UniswapV3FactoryContract,
    WETHAddress,
    USDTAddress,
    Fee
  );
  console.log('poolAddressTOSTON:', poolAddressTOSTON);
  console.log('poolAddressWETHTOS:', poolAddressWETHTOS);
  console.log('poolAddressWETHTON:', poolAddressWETHTON);
  console.log('poolAddressWETHUSDC:', poolAddressWETHUSDC);
  console.log('poolAddressWETHUSDT:', poolAddressWETHUSDT);
  if (!fs.existsSync(`deployed.uniswap.${chainName}.poolAddress.json`)) {
    fs.writeFileSync(`deployed.uniswap.${chainName}.poolAddress.json`, '{}', {
      flag: 'w',
    });
  }
  let data = JSON.parse(
    fs.readFileSync(`deployed.uniswap.${chainName}.poolAddress.json`).toString()
  );
  data['TOS_TON'] = poolAddressTOSTON;
  data['WETH_TOS'] = poolAddressWETHTOS;
  data['WETH_TON'] = poolAddressWETHTON;
  data['WETH_USDC'] = poolAddressWETHUSDC;
  data['WETH_USDT'] = poolAddressWETHUSDT;
  fs.writeFileSync(
    `deployed.uniswap.${chainName}.poolAddress.json`,
    JSON.stringify(data, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
