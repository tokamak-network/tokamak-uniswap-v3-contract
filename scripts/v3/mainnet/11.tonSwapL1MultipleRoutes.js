const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const {getContract, getPoolContractAddress, deployContract} = require("./helper_functions.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const { expect } = require("chai");
const {encodePath } = require("../../utils");

async function main() {
  const chainId = hre.network.config.chainId;
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  let tokamakAccount;
  if (chainId === 31337)
  tokamakAccount = await hre.ethers.getImpersonatedSigner(
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    );
  providers = hre.ethers.provider;
  let totalGasUsed = ethers.BigNumber.from("0")
  ///=============== TONContract
  const TONContract = await getContract('TON');
  const TONAddress = TONContract.address;
  ///=============== TONContract
  const WTONContract = await getContract('WTON');
  const WTONAddress = WTONContract.address;
  ///=============== TOSContract
  const TOSContract = await getContract('TOS');
  const TOSAddress = TOSContract.address;
  ///=============== WETHContract
  const WETHContract = await getContract('WETH');
  const WETHAddress = WETHContract.address;
  ///=============== SwapRouterContract  
  const SwapRouterContract = await getContract('SwapRouter02');
  const SwapRouterAddress = SwapRouterContract.address;
  let Multicall2Contract;
  if(chainId === 31337){
    const Multicall2Factory = await hre.ethers.getContractFactory("Multicall2");
    Multicall2Contract = await Multicall2Factory.deploy();
    await Multicall2Contract.deployed();
  } else{
    Multicall2Contract = await getContract('Multicall2');
  }
  //const Multicall2Contract = await getContract('Multicall2');
  const Multicall2Address = Multicall2Contract.address;
  const route = [
    [
        {
            "type": "v3-pool",
            "address": "0x8DF54aDA313293E80634f981820969BE7542CEe9",
            "tokenIn": {
                "chainId": 1,
                "decimals": "18",
                "address": "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6",
                "symbol": "WTON"
            },
            "tokenOut": {
                "chainId": 1,
                "decimals": "18",
                "address": "0x67F3bE272b1913602B191B3A68F7C238A2D81Bb9",
                "symbol": "TOS"
            },
            "fee": "3000",
            "liquidity": "104880",
            "sqrtRatioX96": "83095197869223157896060286990",
            "tickCurrent": "953",
            "amountIn": "10",
            "amountOut": "7"
        }
    ],
    [
        {
            "type": "v3-pool",
            "address": "0x9EF32Ae2acAF105557DB0E98E68c6CD4f1A1aE63",
            "tokenIn": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6",
                "symbol": "WTON"
            },
            "tokenOut": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
                "symbol": "WETH"
            },
            "fee": "3000",
            "liquidity": "100000",
            "sqrtRatioX96": "79228162514264337593543950336",
            "tickCurrent": "0",
            "amountIn": "10000000000000000000"
        },
        {
            "type": "v3-pool",
            "address": "0x3B466f5d9b49AEDd65F6124D5986A9F30B1f5442",
            "tokenIn": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
                "symbol": "WETH"
            },
            "tokenOut": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0x67F3bE272b1913602B191B3A68F7C238A2D81Bb9",
                "symbol": "TOS"
            },
            "fee": "3000",
            "liquidity": "109544",
            "sqrtRatioX96": "72325086331246324823858696437",
            "tickCurrent": "-1824",
            "amountOut": "620"
        }
    ]
  ];
  let tx, receipt;

  //============= Multicall approves tonContract.approve(WTONContract, uint256.max), wTonContract.approve(SwapRouterAddress, uint256.max)
  let allowance = await TONContract.allowance(Multicall2Address, WTONAddress);
  let allowance2 = await WTONContract.allowance(Multicall2Address, SwapRouterAddress);
  if(allowance.lt(ethers.utils.parseEther('100000000000000')) || allowance2.lt(ethers.utils.parseEther('100000000000000'))){
    const multicall2ApprovesWTONContractCall = {
      target: TONAddress,
      callData: TONContract.interface.encodeFunctionData('approve',[WTONAddress, ethers.constants.MaxUint256])
    }
    const multicall2ApprovesSwapRouterContractCall = {
      target: WTONAddress,
      callData: WTONContract.interface.encodeFunctionData('approve',[SwapRouterAddress, ethers.constants.MaxUint256])
    }
    let tx = await Multicall2Contract.connect(tokamakAccount).aggregate([multicall2ApprovesWTONContractCall, multicall2ApprovesSwapRouterContractCall], {gasLimit: ethers.BigNumber.from('30000000')});
    await tx.wait();
    let receipt = await providers.getTransactionReceipt(tx.hash);
    console.log("==== Multicall approves tonContract.approve(WTONContract, uint256.max), wTonContract.approve(SwapRouterAddress, uint256.max) ======");
    console.log(receipt);
    console.log(receipt.gasUsed);
  }

  //============= approve
  allowance = await TONContract.allowance(deployer.address, Multicall2Address);
  if(allowance.lt(ethers.utils.parseEther('100000'))){
    const tx = await TONContract.approve(Multicall2Address, ethers.utils.parseEther('100000000000'))
        await tx.wait();
        const receipt = await providers.getTransactionReceipt(tx.hash);
        console.log("==== user approves tonContract.approve(Multicall2Address, 100000000000 TON) ====");
        console.log(receipt);
        console.log(receipt.gasUsed);
  }


  
  //============ swapAmount
  let totalAmountIn = ethers.BigNumber.from('0');
  for(let routes of route){
    totalAmountIn = totalAmountIn.add(ethers.BigNumber.from(routes[0].amountIn));
  }
  console.log(totalAmountIn);

  //============ tonContract.transferFrom(user, multicall2, swapAmount);
  const transferFromUserToMulticall2Call = {
    target: TONAddress,
    callData: TONContract.interface.encodeFunctionData('transferFrom',[deployer.address, Multicall2Address, totalAmountIn])
  }

  //============= SwapFromTonAndTransfer
  const swapFromTonAndTransferParams = [SwapRouterAddress, totalAmountIn]
  const swapFromTonAndTransferCall = {
    target: WTONAddress,
    callData: WTONContract.interface.encodeFunctionData('swapFromTONAndTransfer', swapFromTonAndTransferParams)
  }
  const swapFromTonCall = {
    target: WTONAddress,
    callData: WTONContract.interface.encodeFunctionData('swapFromTON', [totalAmountIn])
  }

  //============== exactInput
  let deadline = Math.floor(Date.now() / 1000) + 1000000;
  let routePath;
  let paths = [];
  let fees = [];
  let swapData = [];
  for(let i = 0; i< route.length; i ++){
    routePath = route[i];
    const amountOutMinimum = 0;
    const sqrtPriceLimitX96 = 0;
    let amountIn = routePath[0]["amountIn"];
    console.log("amountIn : ",amountIn);
    if (routePath.length > 1){ //exact Input
        paths[i] = [routePath[0]["tokenIn"]['address'], routePath[0]["tokenOut"]["address"]]
        fees[i] = [parseInt(routePath[0]["fee"])]
        for(let j=1; j< routePath.length; j++){
            paths[i].push(routePath[j]["tokenOut"]["address"])
            fees[i].push(parseInt(routePath[j]["fee"]))
        }
        let path = encodePath(paths[i], fees[i]);
        const params = {
            recipient: deployer.address,
            path,
            amountIn,
            amountOutMinimum,
        };
        swapData.push(SwapRouterContract.interface.encodeFunctionData('exactInput', [params]));
      } else{ // exact Input Single
        const params = {
          tokenIn:routePath[0]["tokenIn"]['address'],
          tokenOut:routePath[0]["tokenOut"]["address"],
          fee:parseInt(routePath[0]["fee"]),
          recipient: deployer.address,
          amountIn,
          amountOutMinimum,
          sqrtPriceLimitX96
        }
        swapData.push(SwapRouterContract.interface.encodeFunctionData('exactInputSingle', [params]))
      }
  }
  console.log(swapData);
  const exactInputCall = {
    target: SwapRouterAddress,
    callData: SwapRouterContract.interface.encodeFunctionData('multicall(uint256,bytes[])', [deadline,swapData])
  }

  // ========= ton, tos balance check
  let balanceBeforeTON = await TONContract.balanceOf(deployer.address);
  console.log("balanceBeforeTON:",balanceBeforeTON);
  let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
  console.log("balanceBeforeTOS:",balanceBeforeTOS);
  let balanceBeforeETH = await providers.getBalance(deployer.address);
  console.log("balanceBeforeETH", balanceBeforeETH);

  // ==========aggregate
  const aggregateParams = [transferFromUserToMulticall2Call, swapFromTonCall, exactInputCall];
  tx = await Multicall2Contract.aggregate(aggregateParams);
  await tx.wait();
  receipt = await providers.getTransactionReceipt(tx.hash);
  console.log(receipt);
  console.log("==== aggregate =====")
  console.log(receipt.gasUsed);


  // ========= ton, tos balance check
  let balanceAfterTON = await TONContract.balanceOf(deployer.address);
  console.log("balanceAfterTON:",balanceAfterTON);
  let balanceAfterTOS = await TOSContract.balanceOf(deployer.address);
  console.log("balanceAfterTOS:",balanceAfterTOS);
  let balanceAfterETH = await providers.getBalance(deployer.address);
  console.log("balanceAfterETH", balanceAfterETH);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  
