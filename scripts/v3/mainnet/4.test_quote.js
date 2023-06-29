const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const {
  getContract,
  getPoolContractAddress,
} = require('./helper_functions.js');
//enableFeeAmount 100 1

async function main() {
  const chainName = hre.network.name;
  const accounts = await hre.ethers.getSigners();
  let deployer = accounts[0];
  providers = hre.ethers.provider;
  let totalGasUsed = ethers.BigNumber.from('0');
  if (chainName === 'hardhat')
    deployer = await hre.ethers.getImpersonatedSigner(
      '0xB68AA9E398c054da7EBAaA446292f611CA0CD52B'
    );
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

  const Quoter = await getContract('Quoter');
  // let quotedAmountOut1 = await Quoter.callStatic.quoteExactInputSingle(
  //   TONAddress,
  //   TOSAddress,
  //   3000,
  //   ethers.utils.parseEther('1'),
  //   0
  // );
  // console.log(
  //   `1 TON => ${ethers.utils.formatUnits(quotedAmountOut1.toString(), 18)} TOS`
  // );
  quotedAmountOut1 = await Quoter.callStatic.quoteExactInputSingle(
    TOSAddress,
    TONAddress,
    3000,
    ethers.utils.parseEther('100'),
    0
  );
  console.log(
    `1 TOS => ${ethers.utils.formatUnits(quotedAmountOut1.toString(), 18)} TON`
  );
  quotedAmountOut1 = await Quoter.callStatic.quoteExactInputSingle(
    TONAddress,
    WETHAddress,
    3000,
    ethers.utils.parseEther('1'),
    0
  );
  console.log(
    `1 TON => ${ethers.utils.formatUnits(quotedAmountOut1.toString(), 18)} ETH`
  );
  quotedAmountOut1 = await Quoter.callStatic.quoteExactInputSingle(
    WETHAddress,
    TONAddress,
    3000,
    ethers.utils.parseEther('0.000804204211611148'),
    0
  );
  console.log(
    `0.000804204211611148 ETH => ${ethers.utils.formatUnits(quotedAmountOut1.toString(), 18)} TON`
  );
  quotedAmountOut1 = await Quoter.callStatic.quoteExactInputSingle(
    TOSAddress,
    WETHAddress,
    3000,
    ethers.utils.parseEther('1'),
    0
  );
  console.log(
    `1 TOS => ${ethers.utils.formatUnits(quotedAmountOut1.toString(), 18)} ETH`
  );
  quotedAmountOut1 = await Quoter.callStatic.quoteExactInputSingle(
    WETHAddress,
    TOSAddress,
    3000,
    ethers.utils.parseEther('0.001083322483507678'),
    0
  );
  console.log(
    `0.001083322483507678 ETH => ${ethers.utils.formatUnits(quotedAmountOut1.toString(), 18)} TOS`
  );
  quotedAmountOut1 = await Quoter.callStatic.quoteExactInputSingle(
    USDCAddress,
    WETHAddress,
    3000,
    ethers.utils.parseUnits('1', 6),
    0
  );
  console.log(
    `1 USDC => ${ethers.utils.formatUnits(quotedAmountOut1.toString(), 18)} ETH`
  );
  quotedAmountOut1 = await Quoter.callStatic.quoteExactInputSingle(
    WETHAddress,
    USDCAddress,
    3000,
    ethers.utils.parseUnits('0.000535502894904843', 18),
    0
  );
  console.log(
    `0.000535502894904843 ETH => ${ethers.utils.formatUnits(quotedAmountOut1.toString(), 6)} USDC`
  );
  quotedAmountOut1 = await Quoter.callStatic.quoteExactInputSingle(
    USDTAddress,
    WETHAddress,
    3000,
    ethers.utils.parseUnits('1', 6),
    0
  );
  console.log(
    `1 USDT => ${ethers.utils.formatUnits(quotedAmountOut1.toString(), 18)} ETH`
  );
  quotedAmountOut1 = await Quoter.callStatic.quoteExactInputSingle(
    WETHAddress,
    USDTAddress,
    3000,
    ethers.utils.parseUnits('0.000535577420106933', 18),
    0
  );
  console.log(
    `0.000535577420106933 ETH => ${ethers.utils.formatUnits(quotedAmountOut1.toString(), 6)} USDT`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
