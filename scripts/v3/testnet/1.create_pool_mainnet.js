const ethers = require('ethers');
const fs = require("fs");
require('dotenv').config();
const hre = require('hardhat');
const {NonfungiblePositionManager: NonfungiblePositionManagerAddress, getContract, getPoolContractAddress, Fee, deployContract} = require("./constant.js");
const { expect } = require("chai");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;
  await deployContract();

  ///=========== UniswapV3Factory
  const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
  ///=============== TONContract  
  const TONContract = await getContract('TON');
  ///=============== TOSContract  
  const TOSContract = await getContract('TOS');
  ///=============== WETHContract  
  const WETHContract = await getContract('WETH');

  let allowanceAmount = ethers.utils.parseEther('1000000000000'); //0 12개 ether
  let minimumallowanceAmount = ethers.utils.parseEther('100000000000'); //0 11개 ether
  ///=============== TON Contract Allowance
  let allowance = await TONContract.allowance(
    deployer.address,
    NonfungiblePositionManagerAddress
  );
  if (allowance.lt(minimumallowanceAmount)) {
    const tx = await TONContract.approve(
      NonfungiblePositionManagerAddress,
      allowanceAmount
    );
    await tx.wait();
    expect(await TONContract.allowance(deployer.address, NonfungiblePositionManagerAddress)).to.equal(allowanceAmount);
    console.log(`TON Contract ${allowanceAmount} ether amount Approved`);
  }
 
  ///================ TOS Contract Allowance 
  allowance = await TOSContract.allowance(
    deployer.address,
    NonfungiblePositionManagerAddress
  );
  if (allowance.lt(minimumallowanceAmount)) {
    const tx = await TOSContract.approve(
      NonfungiblePositionManagerAddress,
      allowanceAmount
    );
    await tx.wait();
    expect(await TONContract.allowance(deployer.address, NonfungiblePositionManagerAddress)).to.equal(allowanceAmount);
    console.log(`TOS Contract ${allowanceAmount} ether amount Approved`);
  }

  ///================ WETH Contract Allowance 
  allowance = await WETHContract.allowance(
    deployer.address,
    NonfungiblePositionManagerAddress
  );
  if (allowance.lt(minimumallowanceAmount)) {
    const tx = await WETHContract.approve(
      NonfungiblePositionManagerAddress,
      allowanceAmount
    );
    await tx.wait();
    expect(await TONContract.allowance(deployer.address, NonfungiblePositionManagerAddress)).to.equal(allowanceAmount);
    console.log(`WETH Contract ${allowanceAmount} ether amount Approved`);
  }
  
  ///=============== poolAddresses
  let poolAddressTOSTON = await getPoolContractAddress(UniswapV3FactoryContract, TONContract.address, TOSContract.address);
  let poolAddressWETHTOS = await getPoolContractAddress(UniswapV3FactoryContract, WETHContract.address, TOSContract.address);
  let poolAddressWETHTON = await getPoolContractAddress(UniswapV3FactoryContract, WETHContract.address, TONContract.address);
  
  ///============ poolAddressWETHTOS
  if (poolAddressWETHTOS === '0x0000000000000000000000000000000000000000') {
    const tx1 = await UniswapV3FactoryContract.createPool(WETHContract.address, TOSContract.address, Fee);
    await tx1.wait();
    const receipt = await providers.getTransactionReceipt(tx1.hash);

    const eventInterface = new ethers.utils.Interface([
      'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)'
    ]);
    const eventSignature = ethers.utils.id('PoolCreated(address,address,uint24,int24,address)');
    console.log(receipt);
    let eventIndex = -1;
    for (let i = 0; i< receipt.logs.length; i++){
      if(receipt.logs[i].topics[0] === eventSignature) {
        eventIndex = i;
        break;
      }
    }
    if(eventIndex === -1){
      console.log("Pool created Failed");
      process.exit();
    }
    const data = receipt.logs[eventIndex].data;
    const topics = receipt.logs[eventIndex].topics;
    const event = eventInterface.decodeEventLog('PoolCreated', data, topics);
    console.log('event.pool', event.pool);
    expect(event.pool).to.equal(await getPoolContractAddress(UniswapV3FactoryContract, WETHContract.address, TOSContract.address));
    poolAddressWETHTOS = event.pool;
  }
  console.log("poolAddressWETHTOS:", poolAddressWETHTOS);

  ///============ poolAddressWETHTON
  if (poolAddressWETHTON === '0x0000000000000000000000000000000000000000') {
    const tx1 = await UniswapV3FactoryContract.createPool(WETHContract.address, TONContract.address, Fee);
    await tx1.wait();
    const receipt = await providers.getTransactionReceipt(tx1.hash);

    const eventInterface = new ethers.utils.Interface([
      'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)'
    ]);
    const eventSignature = ethers.utils.id('PoolCreated(address,address,uint24,int24,address)');
    console.log(receipt);
    let eventIndex = -1;
    for (let i = 0; i< receipt.logs.length; i++){
      if(receipt.logs[i].topics[0] === eventSignature) {
        eventIndex = i;
        break;
      }
    }
    if(eventIndex === -1){
      console.log("Pool created Failed");
      process.exit();
    }
    const data = receipt.logs[eventIndex].data;
    const topics = receipt.logs[eventIndex].topics;
    const event = eventInterface.decodeEventLog('PoolCreated', data, topics);
    console.log('event.pool', event.pool);
    expect(event.pool).to.equal(await getPoolContractAddress(UniswapV3FactoryContract, WETHContract.address, TONContract.address));
    poolAddressWETHTON = event.pool;
  }
  console.log("poolAddressWETHTON:", poolAddressWETHTON);
  
  //============= deploy poolAddressTOSTON
  if (poolAddressTOSTON === '0x0000000000000000000000000000000000000000') {
    const tx1 = await UniswapV3FactoryContract.createPool(TONContract.address, TOSContract.address, Fee);
    await tx1.wait();
    const receipt = await providers.getTransactionReceipt(tx1.hash);

    const eventInterface = new ethers.utils.Interface([
      'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)'
    ]);
    const eventSignature = ethers.utils.id('PoolCreated(address,address,uint24,int24,address)');
    console.log(receipt);
    let eventIndex = -1;
    for (let i = 0; i< receipt.logs.length; i++){
      if(receipt.logs[i].topics[0] === eventSignature) {
        eventIndex = i;
        break;
      }
    }
    if(eventIndex === -1){
      console.log("Pool created Failed");
      process.exit();
    }
    const data = receipt.logs[eventIndex].data;
    const topics = receipt.logs[eventIndex].topics;
    const event = eventInterface.decodeEventLog('PoolCreated', data, topics);
    console.log('event.pool', event.pool);
    expect(event.pool).to.equal(await getPoolContractAddress(UniswapV3FactoryContract, TONContract.address, TOSContract.address));
    poolAddressTOSTON = event.pool;
  }
  console.log('poolAddressTOSTON:', poolAddressTOSTON);

  ///====================fs write
  const chainName = hre.network.name;
  if(!fs.existsSync(__dirname+`/../../../deployed.uniswap.${chainName}.poolAddress.json`)){
    fs.writeFileSync(__dirname+`/../../../deployed.uniswap.${chainName}.poolAddress.json`, '{}', {flag:'w'})
  }
  let data = JSON.parse(fs.readFileSync(__dirname+`/../../../deployed.uniswap.${chainName}.poolAddress.json`).toString());
  data['WETH_TOS'] = poolAddressWETHTOS;
  data['WETH_TON'] = poolAddressWETHTON;
  data['TON_TOS'] = poolAddressTOSTON;
  fs.writeFileSync(__dirname+`/../../../deployed.uniswap.${chainName}.poolAddress.json`, JSON.stringify(data, null, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
