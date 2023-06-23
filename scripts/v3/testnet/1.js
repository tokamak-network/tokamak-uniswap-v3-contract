const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const fs = require("fs");
const {getContract, getPoolContractAddress, deployContract} = require("./constant.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const {consoleEvents} = require("./consoleEvents.js");

async function main() {
    const accounts = await hre.ethers.getSigners();
    const deployer = accounts[0];
    providers = hre.ethers.provider;
    let totalGasUsed = ethers.BigNumber.from("0")

    ///=========== UniswapV3Factory
    const UniswapV3FactoryContract = await getContract('UniswapV3Factory');
    ///=============== NonfungiblePositionManagerContract  
    const NonfungiblePositionManagerContract = await getContract('NonfungiblePositionManager');
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


    
    let poolAddressTOSTON = await getPoolContractAddress(UniswapV3FactoryContract, TONAddress, TOSAddress, 3000);
    let poolAddressWETHTOS = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, TOSAddress, 3000);
    let poolAddressWETHTON = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, TONAddress, 3000);
    let poolAddressWETHUSDC = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, USDCAddress, 500);
    let poolAddressWETHUSDT = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, USDTAddress, 500);
    let poolAddressWETHUSDT100 = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, USDTAddress, 100);
    
    //=======================poolAddressTOSTON
    if (poolAddressTOSTON === '0x0000000000000000000000000000000000000000') {
        //1 WTON = 0.69988 TOS 2023.06.21 12:21am 기준
        //1 TOS = 1.42882 WTON
        //encodePriceSqrt(reserve1, reserve0)
        let token0, token1;
        
        if(TONAddress < TOSAddress){
            token0 = TONAddress
            token1 = TOSAddress
        } else{
            token0 = TOSAddress;
            token1 = TONAddress;
        }
        let tx = await NonfungiblePositionManagerContract.createAndInitializePoolIfNecessary(
            token0,
            token1,
            3000,
            ethers.BigNumber.from('2990295844712018212030196559742641')
        )
        await tx.wait();
        const receipt = await providers.getTransactionReceipt(tx.hash);
        console.log("======createAndInitialize poolAddressTOSTON=======")
        console.log("transactionHash:", receipt.transactionHash);
        console.log("gasUsed: ",receipt.gasUsed);
        console.log();
        totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    }

    //=======================poolAddressWETHTOS
    if (poolAddressWETHTOS === '0x0000000000000000000000000000000000000000') {
        //1 WTON = 0.00077 ETH 2023.06.21 12:21am 기준
        //1 ETH = 1,304.25 WTON
        //encodePriceSqrt(reserve1, reserve0)
        let token0, token1;
        if(WETHAddress < TOSAddress){
            token0 = WETHAddress;
            token1 = TOSAddress;
        } else{
            token0 =TOSAddress;
            token1 = WETHAddress;
        }
        let tx = await NonfungiblePositionManagerContract.createAndInitializePoolIfNecessary(
            token0,
            token1,
            3000,
            ethers.BigNumber.from('2583216200895513280038780992')
        )
        await tx.wait();
        const receipt = await providers.getTransactionReceipt(tx.hash);
        console.log("======createAndInitialize poolAddressWETHTOS=======")
        console.log("transactionHash:", receipt.transactionHash);
        console.log("gasUsed: ",receipt.gasUsed);
        console.log();
        totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    }

    //=======================poolAddressWETHTON
    if (poolAddressWETHTON === '0x0000000000000000000000000000000000000000') {
        //1 WTON = 0.00077 ETH 2023.06.21 12:21am 기준
        //1 ETH = 1,304.25 WTON
        //encodePriceSqrt(reserve1, reserve0)
        let token0, token1;
        if(WETHAddress < TONAddress){
            token0 = WETHAddress
            token1 = TONAddress
        } else{
            token0 = TONAddress;
            token1 = WETHAddress;
        }
        let tx = await NonfungiblePositionManagerContract.createAndInitializePoolIfNecessary(
            token0,
            token1,
            3000,
            ethers.BigNumber.from('90728086610218973648330084594723118')
        )
        await tx.wait();
        const receipt = await providers.getTransactionReceipt(tx.hash);
        console.log("======createAndInitialize poolAddressWETHTON=======")
        console.log("transactionHash:", receipt.transactionHash);
        console.log("gasUsed: ",receipt.gasUsed);
        console.log();
        totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    }
    
    //=======================poolAddressWETHUSDC
    if (poolAddressWETHUSDC === '0x0000000000000000000000000000000000000000') {
        //1 USDC = 0.00055 ETH 2023.06.21 12:21am 기준 //6decimals
        //1 ETH = 1,807.41 USDC // 근데 18decimals
        //=> 1000000000000000000 = 1807410000
        //=> 1000000000 = 1.80741
        //encodePriceSqrt(reserve1, reserve0)
        // tick 201293
        let token0, token1;

        if(WETHAddress < USDCAddress){
            token0 = WETHAddress
            token1 = USDCAddress
        } else{
            token0 = USDCAddress;
            token1 = WETHAddress;
        }

        let tx = await NonfungiblePositionManagerContract.createAndInitializePoolIfNecessary(
            token0,
            token1,
            500,
            ethers.BigNumber.from('1852826990250527434372994649008279')
        )
        await tx.wait();
        const receipt = await providers.getTransactionReceipt(tx.hash);
        console.log("======createAndInitialize poolAddressWETHUSDC=======")
        console.log("transactionHash:", receipt.transactionHash);
        console.log("gasUsed: ",receipt.gasUsed);
        console.log();
        totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    }

    //=======================poolAddressWETHUSDT
    if (poolAddressWETHUSDT === '0x0000000000000000000000000000000000000000') {
        let token0, token1;

        if(WETHAddress < USDTAddress){
            token0 = WETHAddress
            token1 = USDTAddress
        } else{
            token0 = USDTAddress;
            token1 = WETHAddress;
        }
        let tx = await NonfungiblePositionManagerContract.createAndInitializePoolIfNecessary(
            token0,
            token1,
            500,
            ethers.BigNumber.from('3387649038864965938133741')
        )
        await tx.wait();
        const receipt = await providers.getTransactionReceipt(tx.hash);
        console.log("======createAndInitialize poolAddressWETHUSDT=======")
        console.log("transactionHash:", receipt.transactionHash);
        console.log("gasUsed: ",receipt.gasUsed);
        console.log();
        totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    }

    // //=======================poolAddressWETHUSDT
    // if (poolAddressWETHUSDT100 === '0x0000000000000000000000000000000000000000') {
    //     let token0, token1;

    //     if(WETHAddress < USDTAddress){
    //         token0 = WETHAddress
    //         token1 = USDTAddress
    //     } else{
    //         token0 = USDTAddress;
    //         token1 = WETHAddress;
    //     }
    //     let tx = await NonfungiblePositionManagerContract.createAndInitializePoolIfNecessary(
    //         token0,
    //         token1,
    //         100,
    //         ethers.BigNumber.from('3387649038864965938133741')
    //     )
    //     await tx.wait();
    //     const receipt = await providers.getTransactionReceipt(tx.hash);
    //     console.log("======createAndInitialize poolAddressWETHUSDT=======")
    //     console.log("transactionHash:", receipt.transactionHash);
    //     console.log("gasUsed: ",receipt.gasUsed);
    //     console.log();
    //     totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    // }

    console.log("totalGasUsed:",totalGasUsed);
    if( poolAddressTOSTON !== '0x0000000000000000000000000000000000000000'){
        console.log("poolAddressTOSTON:", poolAddressTOSTON);
        console.log("poolAddressWETHTOS:", poolAddressWETHTOS);
        console.log("poolAddressWETHTON:", poolAddressWETHTON);
        console.log("poolAddressWETHUSDC:", poolAddressWETHUSDC);
        console.log("poolAddressWETHUSDT:", poolAddressWETHUSDT);
        console.log("poolAddressWETHUSDT100:", poolAddressWETHUSDT100);
        
        const chainName = hre.network.name;
        if(!fs.existsSync(`deployed.uniswap.${chainName}.poolAddress.json`)){
            fs.writeFileSync(`deployed.uniswap.${chainName}.poolAddress.json`, '{}', {flag:'w'})
        }
        let data = JSON.parse(fs.readFileSync(`deployed.uniswap.${chainName}.poolAddress.json`).toString());
        data["TOS_TON"] = poolAddressTOSTON;
        data["WETH_TOS"] = poolAddressWETHTOS;
        data["WETH_TON"] = poolAddressWETHTON;
        data["WETH_USDC"] = poolAddressWETHUSDC;
        data["WETH_USDT"] = poolAddressWETHUSDT;
        data["WETH_USDT100"] = poolAddressWETHUSDT100;
        fs.writeFileSync(`deployed.uniswap.${chainName}.poolAddress.json`, JSON.stringify(data, null, 2));
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  