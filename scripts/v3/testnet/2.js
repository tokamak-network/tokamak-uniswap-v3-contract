const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const { expect } = require("chai");
const {NonfungiblePositionManager: NonfungiblePositionManagerAddress, getContract, getPoolContractAddress} = require("./constant.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const sdk = require("@uniswap/v3-sdk");
const nearestUsableTick = sdk.nearestUsableTick;
const {consoleEvents} = require("./consoleEvents.js");


async function main() {
    const accounts = await hre.ethers.getSigners();
    const deployer = accounts[0];
    providers = hre.ethers.provider;
    console.log("Deployer ETH Balance:", await providers.getBalance(deployer.address));
    let totalGasUsed = ethers.BigNumber.from("0")

    const eventInterface = new ethers.utils.Interface([
      'event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)'
    ]);
    const eventSignature = ethers.utils.id('IncreaseLiquidity(uint256,uint128,uint256,uint256)');
    const eventName = 'IncreaseLiquidity';

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
    ///=============== poolAddresses
    let poolAddressTOSTON = await getPoolContractAddress(UniswapV3FactoryContract, TONAddress, TOSAddress, 3000);
    let poolAddressWETHTOS = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, TOSAddress, 3000);
    let poolAddressWETHTON = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, TONAddress, 3000);
    let poolAddressWETHUSDC = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, USDCAddress, 500);
    let poolAddressWETHUSDT = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, USDTAddress, 500);
    let poolAddressWETHUSDT100 = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, USDTAddress, 100);

    console.log(poolAddressTOSTON);
    console.log(poolAddressWETHTOS);
    console.log(poolAddressWETHTON);
    console.log(poolAddressWETHUSDC);
    console.log(poolAddressWETHUSDT);
    console.log(poolAddressWETHUSDT100);

    //=======================poolAddressTOSTON
    if (poolAddressTOSTON !== '0x0000000000000000000000000000000000000000') {
        const UniswapV3Pool_ = new ethers.ContractFactory(
        UniswapV3PoolArtifact.abi,
        UniswapV3PoolArtifact.bytecode,
        deployer
        );
        UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressTOSTON);
        let slot0 = await UniswapV3PoolContract.slot0();
        let sqrtPriceX96 = slot0.sqrtPriceX96;
        if(sqrtPriceX96.gt(ethers.constants.Zero)){
          let liquidity = await UniswapV3PoolContract.liquidity();
          console.log("poolAddressTOSTON liquidity:", liquidity);
          if (liquidity.eq(ethers.constants.Zero)) {
            let deadline =  Math.floor(Date.now() / 1000) + 100000;
            let tickLower = nearestUsableTick(slot0.tick -5108, 60);
            let tickUpper = nearestUsableTick(slot0.tick + 3365, 60);
            if(TOSAddress < TONAddress){
              token0 = TOSAddress;
              amount0Desired = ethers.utils.parseEther('2500');
              token1 = TONAddress;
              amount1Desired =  ethers.utils.parseEther('2500');
            } else {
              token0 = TONAddress;
              amount0Desired = ethers.utils.parseEther('2500');
              token1 = TOSAddress;
              amount1Desired =  ethers.utils.parseEther('2500');
            }
            let MintParams = [
              {
                token0: token0,
                token1: token1,
                fee: 3000,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: 0,
                amount1Min: 0,
                recipient: deployer.address,
                deadline: deadline,
              }
            ];
            try{
              const tx = await NonfungiblePositionManagerContract.mint(...MintParams, {
                gasLimit: 3000000,
              });
              await tx.wait();
              const receipt = await providers.getTransactionReceipt(tx.hash);
              console.log("====== poolAddressTOSTON mint ==========")
              consoleEvents(receipt, eventInterface, eventSignature, eventName);
              totalGasUsed = totalGasUsed.add(receipt.gasUsed);
            }
            catch(e) {
              console.log("e", e.message);
            }
          }
        } else{
          console.log("2.initialize_pool first");
        }
    }
    

    //=======================poolAddressWETHTOS
    if (poolAddressWETHTOS !== '0x0000000000000000000000000000000000000000') {
      const UniswapV3Pool_ = new ethers.ContractFactory(
      UniswapV3PoolArtifact.abi,
      UniswapV3PoolArtifact.bytecode,
      deployer
      );
      UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHTOS);
      let slot0 = await UniswapV3PoolContract.slot0();
      let sqrtPriceX96 = slot0.sqrtPriceX96;
      if(sqrtPriceX96.gt(ethers.constants.Zero)){
        let liquidity = await UniswapV3PoolContract.liquidity();
        console.log("poolAddressWETHTOS liquidity:", liquidity);
        if (liquidity.eq(ethers.constants.Zero)) {
          let token0, token1, amount0Desired, amount1Desired;
          let tickLower = nearestUsableTick(slot0.tick -5108, 60);
          let tickUpper = nearestUsableTick(slot0.tick + 3365, 60);
          
          if(WETHAddress < TOSAddress){
            token0 = WETHAddress;
            amount0Desired = ethers.utils.parseEther('0.028');
            token1 = TOSAddress;
            amount1Desired =  ethers.utils.parseEther('25');
          } else {
            token0 = TOSAddress;
            amount0Desired = ethers.utils.parseEther('0.028');
            token1 = WETHAddress;
            amount1Desired =  ethers.utils.parseEther('25');
          }
          console.log("poolAddressWETHTOS liquidity:", liquidity);
          let deadline = Date.now() + 10000000000;
          let MintParams = [
            {
              token0: token0,
              token1: token1,
              fee: 3000,
              tickLower: tickLower,
              tickUpper: tickUpper,
              amount0Desired: amount0Desired,
              amount1Desired: amount1Desired,
              amount0Min: 0,
              amount1Min: 0,
              recipient: deployer.address,
              deadline: deadline,
            }
          ]
          ;
          const mintData = NonfungiblePositionManagerContract.interface.encodeFunctionData('mint', MintParams);

          const refundETHData = NonfungiblePositionManagerContract.interface.encodeFunctionData('refundETH')
          try{
            const tx = await NonfungiblePositionManagerContract.multicall([mintData, refundETHData], {
              gasLimit: 3000000, value: ethers.utils.parseEther('0.2')
            });
            //const tx = await NonfungiblePositionManagerContract.mint(...MintParams, { gasLimit: 3000000, value: ethers.utils.parseEther('0.2') });
            await tx.wait();
            const receipt = await providers.getTransactionReceipt(tx.hash);
            console.log("====== poolAddressWETHTOS mint ==========")
            consoleEvents(receipt, eventInterface, eventSignature, eventName);
            totalGasUsed = totalGasUsed.add(receipt.gasUsed);
          } catch (e)
          {
            console.log("e", e.message);
          }
          
        }
      } else{
        console.log("2.initialize_pool first");
      }
    }
  //=======================poolAddressWETHTON
  if (poolAddressWETHTON !== '0x0000000000000000000000000000000000000000') {
    const UniswapV3Pool_ = new ethers.ContractFactory(
    UniswapV3PoolArtifact.abi,
    UniswapV3PoolArtifact.bytecode,
    deployer
    );
    UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHTON);
    let slot0 = await UniswapV3PoolContract.slot0();
    let sqrtPriceX96 = slot0.sqrtPriceX96;
    
    if(sqrtPriceX96.gt(ethers.constants.Zero)){
      let liquidity = await UniswapV3PoolContract.liquidity();
      console.log("poolAddressWETHTON liquidity:", liquidity, slot0.tick);
      if (liquidity.eq(ethers.constants.Zero)) {
        let deadline = Math.floor(Date.now() / 1000) + 100000;
        

        let tickLower = nearestUsableTick(slot0.tick -5108, 60);
        let tickUpper = nearestUsableTick(slot0.tick + 3365, 60);
        // let tickLower = -600;
        // let tickUpper = 600;
        if(WETHAddress < TONAddress){
          token0 = WETHAddress;
          amount0Desired = ethers.utils.parseEther('0.028');
          token1 = TONAddress;
          amount1Desired =  ethers.utils.parseEther('35');
        } else {
          token0 = TONAddress;
          amount0Desired = ethers.utils.parseEther('35');
          token1 = WETHAddress;
          amount1Desired =  ethers.utils.parseEther('0.028');
        }

        let MintParams = [
          {
            token0: token0,
            token1: token1,
            fee: 3000,
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0Desired: amount0Desired,
            amount1Desired: amount1Desired,
            amount0Min: 0,
            amount1Min: 0,
            recipient: deployer.address,
            deadline: deadline,
          }
        ]
        ;
        const mintData = NonfungiblePositionManagerContract.interface.encodeFunctionData('mint', MintParams);

        const refundETHData = NonfungiblePositionManagerContract.interface.encodeFunctionData('refundETH')
        try{
          const tx = await NonfungiblePositionManagerContract.multicall([mintData, refundETHData], {
            gasLimit: 3000000, value: ethers.utils.parseEther('0.15')
          });
          //const tx = await NonfungiblePositionManagerContract.mint(...MintParams, { gasLimit: 3000000, value: ethers.utils.parseEther('0.2') });
          await tx.wait();
          const receipt = await providers.getTransactionReceipt(tx.hash);
          console.log("====== poolAddressWETHTON mint ==========")
          consoleEvents(receipt, eventInterface, eventSignature, eventName);
          totalGasUsed = totalGasUsed.add(receipt.gasUsed);
        } catch (e)
        {
          console.log("e", e.message);
        }
      }

    } else{
      console.log("2.initialize_pool first");
    }
  }
  //console.log("NonfungiblePositionManagerContract weth", await NonfungiblePositionManagerContract.WETH9())
  console.log("USDC Deciamls",await USDCContract.decimals());
  //=======================poolAddressWETHUSDC
  if (poolAddressWETHUSDC !== '0x0000000000000000000000000000000000000000') {
    const UniswapV3Pool_ = new ethers.ContractFactory(
    UniswapV3PoolArtifact.abi,
    UniswapV3PoolArtifact.bytecode,
    deployer
    );
    UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHUSDC);
    let slot0 = await UniswapV3PoolContract.slot0();
    let sqrtPriceX96 = slot0.sqrtPriceX96;


    if(sqrtPriceX96.gt(ethers.constants.Zero)){
      let liquidity = await UniswapV3PoolContract.liquidity();
      console.log("poolAddressWETHUSDC liquidity:", liquidity);
      if (liquidity.gt(ethers.constants.Zero)) {
        let deadline = Math.floor(Date.now() / 1000) + 100000;
        let tickLower = nearestUsableTick(slot0.tick -5108, 60);
        let tickUpper = nearestUsableTick(slot0.tick + 3365, 60);
        // let tickLower = -600;
        // let tickUpper = 600;
        if(WETHAddress < USDCAddress){
          token0 = WETHAddress;
          amount0Desired = ethers.utils.parseEther('0.028');
          token1 = USDCAddress;
          amount1Desired =  ethers.utils.parseUnits('50', 6);
        } else {
          token0 = USDCAddress;
          amount0Desired = ethers.utils.parseUnits('50', 6);
          token1 = WETHAddress;
          amount1Desired =  ethers.utils.parseEther('0.028');
        }

        let MintParams = [
          {
            token0: token0,
            token1: token1,
            fee: 500,
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0Desired: amount0Desired,
            amount1Desired: amount1Desired,
            amount0Min: 0,
            amount1Min: 0,
            recipient: deployer.address,
            deadline: deadline,
          }
        ]
        ;
        console.log(MintParams);
        const mintData = NonfungiblePositionManagerContract.interface.encodeFunctionData('mint', MintParams);

        const refundETHData = NonfungiblePositionManagerContract.interface.encodeFunctionData('refundETH')
        // try{
        //   const tx = await NonfungiblePositionManagerContract.multicall([mintData, refundETHData], {
        //     gasLimit: 3000000, value: ethers.utils.parseEther('0.1')
        //   });
        //   //const tx = await NonfungiblePositionManagerContract.mint(...MintParams, { gasLimit: 3000000, value: ethers.utils.parseEther('0.2') });
        //   await tx.wait();
        //   const receipt = await providers.getTransactionReceipt(tx.hash);
        //   console.log("====== poolAddressWETHUSDC mint ==========")
        //   consoleEvents(receipt, eventInterface, eventSignature, eventName);
        //   totalGasUsed = totalGasUsed.add(receipt.gasUsed);
        // } catch (e)
        // {
        //   console.log("e", e.message);
        // }
      }

    } else{
      console.log("2.initialize_pool first");
    }
  }

    //=======================poolAddressWETHUSDT
    if (poolAddressWETHUSDT !== '0x0000000000000000000000000000000000000000') {
      const UniswapV3Pool_ = new ethers.ContractFactory(
      UniswapV3PoolArtifact.abi,
      UniswapV3PoolArtifact.bytecode,
      deployer
      );
      UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHUSDT);
      let slot0 = await UniswapV3PoolContract.slot0();
      let sqrtPriceX96 = slot0.sqrtPriceX96;
  
      if(sqrtPriceX96.eq(ethers.constants.Zero)){
        let liquidity = await UniswapV3PoolContract.liquidity();
        console.log("poolAddressWETHUSDT liquidity:", liquidity);
        if (liquidity.eq(ethers.constants.Zero)) {
          let deadline = Math.floor(Date.now() / 1000) + 100000;
  
          let tickLower = nearestUsableTick(slot0.tick -5108, 60);
          let tickUpper = nearestUsableTick(slot0.tick + 3365, 60);
          // let tickLower = -600;
          // let tickUpper = 600;
          if(WETHAddress < USDTAddress){
            token0 = WETHAddress;
            amount0Desired = ethers.utils.parseEther('0.028');
            token1 = USDTAddress;
            amount1Desired =  ethers.utils.parseUnits('50', 6);
          } else {
            token0 = USDTAddress;
            amount0Desired = ethers.utils.parseUnits('182.875', 6);
            token1 = WETHAddress;
            amount1Desired =  ethers.utils.parseEther('50');
          }
  
          let MintParams = [
            {
              token0: token0,
              token1: token1,
              fee: 500,
              tickLower: tickLower,
              tickUpper: tickUpper,
              amount0Desired: amount0Desired,
              amount1Desired: amount1Desired,
              amount0Min: 0,
              amount1Min: 0,
              recipient: deployer.address,
              deadline: deadline,
            }
          ]
          ;
          const mintData = NonfungiblePositionManagerContract.interface.encodeFunctionData('mint', MintParams);
  
          const refundETHData = NonfungiblePositionManagerContract.interface.encodeFunctionData('refundETH')
          try{
            const tx = await NonfungiblePositionManagerContract.multicall([mintData, refundETHData], {
              gasLimit: 3000000, value: ethers.utils.parseEther('0.1')
            });
            //const tx = await NonfungiblePositionManagerContract.mint(...MintParams, { gasLimit: 3000000, value: ethers.utils.parseEther('0.2') });
            await tx.wait();
            const receipt = await providers.getTransactionReceipt(tx.hash);
            console.log("====== poolAddressWETHUSDT mint ==========")
            consoleEvents(receipt, eventInterface, eventSignature, eventName);
            totalGasUsed = totalGasUsed.add(receipt.gasUsed);
          } catch (e)
          {
            console.log("e", e.message);
          }
        }
  
      } else{
        console.log("2.initialize_pool first");
      }
    }

    const UniswapV3Pool_ = new ethers.ContractFactory(
      UniswapV3PoolArtifact.abi,
      UniswapV3PoolArtifact.bytecode,
      deployer
      );
      UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressTOSTON);
      let slot0 = await UniswapV3PoolContract.slot0();
      let sqrtPriceX96 = slot0.sqrtPriceX96;
      if(sqrtPriceX96.gt(ethers.constants.Zero)){
        let liquidity = await UniswapV3PoolContract.liquidity();
        console.log("poolAddressTOSTON liquidity:", liquidity);
        if (liquidity.gt(ethers.constants.Zero)) {
          let deadline =  Math.floor(Date.now() / 1000) + 100000;
          let tickLower = nearestUsableTick(slot0.tick + 80, 60);
          let tickUpper = nearestUsableTick(slot0.tick + 3365, 60);
          if(TOSAddress < TONAddress){
            token0 = TOSAddress;
            amount0Desired = ethers.utils.parseEther('0.1');
            token1 = TONAddress;
            amount1Desired =  ethers.utils.parseEther('2400');
          } else {
            token0 = TONAddress;
            amount0Desired = ethers.utils.parseEther('2400');
            token1 = TOSAddress;
            amount1Desired =  ethers.utils.parseEther('0.1');
          }
          let MintParams = [
            {
              token0: token0,
              token1: token1,
              fee: 3000,
              tickLower: tickLower,
              tickUpper: tickUpper,
              amount0Desired: amount0Desired,
              amount1Desired: amount1Desired,
              amount0Min: 0,
              amount1Min: 0,
              recipient: deployer.address,
              deadline: deadline,
            }
          ];
          try{
            const tx = await NonfungiblePositionManagerContract.mint(...MintParams, {
              gasLimit: 3000000,
            });
            await tx.wait();
            const receipt = await providers.getTransactionReceipt(tx.hash);
            console.log("====== poolAddressTOSTON mint ==========")
            consoleEvents(receipt, eventInterface, eventSignature, eventName);
            totalGasUsed = totalGasUsed.add(receipt.gasUsed);
          }
          catch(e) {
            console.log("e", e.message);
          }
        }
      } else{
        console.log("2.initialize_pool first");
      }
    //=======================poolAddressWETHUSDT100
    // if (poolAddressWETHUSDT100 !== '0x0000000000000000000000000000000000000000') {
    //   const UniswapV3Pool_ = new ethers.ContractFactory(
    //   UniswapV3PoolArtifact.abi,
    //   UniswapV3PoolArtifact.bytecode,
    //   deployer
    //   );
    //   UniswapV3PoolContract = UniswapV3Pool_.attach(poolAddressWETHUSDT100);
    //   let slot0 = await UniswapV3PoolContract.slot0();
    //   let sqrtPriceX96 = slot0.sqrtPriceX96;
  
    //   if(sqrtPriceX96.gt(ethers.constants.Zero)){
    //     let liquidity = await UniswapV3PoolContract.liquidity();
    //     console.log("poolAddressWETHUSDT liquidity:", liquidity);
    //     if (liquidity.eq(ethers.constants.Zero)) {
    //       let deadline = Math.floor(Date.now() / 1000) + 100000;
  
    //       let tickLower = nearestUsableTick(slot0.tick -5108, 60);
    //       let tickUpper = nearestUsableTick(slot0.tick + 3365, 60);
    //       // let tickLower = -600;
    //       // let tickUpper = 600;
    //       if(WETHAddress < USDTAddress){
    //         token0 = WETHAddress;
    //         amount0Desired = ethers.utils.parseEther('0.028');
    //         token1 = USDTAddress;
    //         amount1Desired =  ethers.utils.parseUnits('50', 6);
    //       } else {
    //         token0 = USDTAddress;
    //         amount0Desired = ethers.utils.parseUnits('182.875', 6);
    //         token1 = WETHAddress;
    //         amount1Desired =  ethers.utils.parseEther('50');
    //       }
  
    //       let MintParams = [
    //         {
    //           token0: token0,
    //           token1: token1,
    //           fee: 500,
    //           tickLower: tickLower,
    //           tickUpper: tickUpper,
    //           amount0Desired: amount0Desired,
    //           amount1Desired: amount1Desired,
    //           amount0Min: 0,
    //           amount1Min: 0,
    //           recipient: deployer.address,
    //           deadline: deadline,
    //         }
    //       ]
    //       ;
    //       const mintData = NonfungiblePositionManagerContract.interface.encodeFunctionData('mint', MintParams);
  
    //       const refundETHData = NonfungiblePositionManagerContract.interface.encodeFunctionData('refundETH')
    //       try{
    //         const tx = await NonfungiblePositionManagerContract.multicall([mintData, refundETHData], {
    //           gasLimit: 3000000, value: ethers.utils.parseEther('0.1')
    //         });
    //         //const tx = await NonfungiblePositionManagerContract.mint(...MintParams, { gasLimit: 3000000, value: ethers.utils.parseEther('0.2') });
    //         await tx.wait();
    //         const receipt = await providers.getTransactionReceipt(tx.hash);
    //         console.log("====== poolAddressWETHUSDT mint ==========")
    //         consoleEvents(receipt, eventInterface, eventSignature, eventName);
    //         totalGasUsed = totalGasUsed.add(receipt.gasUsed);
    //       } catch (e)
    //       {
    //         console.log("e", e.message);
    //       }
    //     }
  
    //   } else{
    //     console.log("2.initialize_pool first");
    //   }
    // }
    // console.log("totalGasUsed:", totalGasUsed);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });