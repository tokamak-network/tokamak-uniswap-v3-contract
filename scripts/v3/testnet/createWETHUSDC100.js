const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const fs = require("fs");
const {getContract, getPoolContractAddress, deployContract} = require("./constant.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const {consoleEvents} = require("./consoleEvents.js");
const {encodePriceSqrt} = require('../../utils.js');

async function main() {
    const chainName = hre.network.name;
    const accounts = await hre.ethers.getSigners();
    let deployer = accounts[0];
    providers = hre.ethers.provider;
    if(chainName === 'hardhat') deployer = await hre.ethers.getImpersonatedSigner("0xB68AA9E398c054da7EBAaA446292f611CA0CD52B");
    let totalGasUsed = ethers.BigNumber.from("0")

    ///=========== UniswapV3Factory
    const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
    ///=============== NonfungiblePositionManagerContract  
    const NonfungiblePositionManagerContract = await getContract('NonfungiblePositionManager');
    ///=============== WETHContract  
    const WETHContract = await getContract('WETH');
    const WETHAddress = WETHContract.address;
    ///=============== TOSContract  
    const USDCContract = await getContract('USDC');
    const USDCAddress = USDCContract.address;

    let poolAddressWETHUSDC100 = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, USDCAddress, 100);
    // const UniswapV3Pool_ = new ethers.ContractFactory(
    //     UniswapV3PoolArtifact.abi,
    //     UniswapV3PoolArtifact.bytecode,
    //     deployer
    //     );
    // UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHUSDC100);
    // console.log(await UniswapV3PoolContract.slot0());

    //=======================poolAddressWETHUSDC
    if (poolAddressWETHUSDC100 === '0x0000000000000000000000000000000000000000') {
        //1 USDC = 0.00055 ETH 2023.06.21 12:21am 기준 //6decimals
        //1 ETH = 1,807.41 USDC // 근데 18decimals
        //=> 1000000000000000000 = 1807410000
        //=> 1000000000 = 1.80741
        //encodePriceSqrt(reserve1, reserve0)
        // tick 201293
        let token0, token1, reserve0, reserve1;

        if(WETHAddress < USDCAddress){
            token0 = WETHAddress
            token1 = USDCAddress
            reserve0 = 530000000;
            reserve1 = 1;
        } else{
            token0 = USDCAddress;
            token1 = WETHAddress;
            reserve0 = 1;
            reserve1 = 530000000;
        }
        let shouldSqrtPricex96 = encodePriceSqrt(reserve1, reserve0);
        console.log(USDCAddress);
        console.log(WETHAddress);
        let tx = await NonfungiblePositionManagerContract.createAndInitializePoolIfNecessary(
            token0,
            token1,
            100,
            shouldSqrtPricex96
        )
        await tx.wait();
        const receipt = await providers.getTransactionReceipt(tx.hash);
        console.log("======createAndInitialize poolAddressWETHUSDC=======")
        console.log("transactionHash:", receipt.transactionHash);
        console.log("gasUsed: ",receipt.gasUsed);
        console.log();
        totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    }
    console.log("totalGasUsed:",totalGasUsed);

    if( poolAddressWETHUSDC100 !== '0x0000000000000000000000000000000000000000'){
        console.log("poolAddressTOSTON:", poolAddressWETHUSDC100);
    }
    if(!fs.existsSync(`deployed.uniswap.${chainName}.poolAddress.json`)){
        fs.writeFileSync(`deployed.uniswap.${chainName}.poolAddress.json`, '{}', {flag:'w'})
    }
    let data = JSON.parse(fs.readFileSync(`deployed.uniswap.${chainName}.poolAddress.json`).toString());
    data["WETH_USDC100"] = poolAddressWETHUSDC100;
    fs.writeFileSync(`deployed.uniswap.${chainName}.poolAddress.json`, JSON.stringify(data, null, 2));
}



main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });