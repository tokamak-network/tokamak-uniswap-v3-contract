const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const {getContract, getPoolContractAddress, deployContract} = require("./helper_functions.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const { expect } = require("chai");
const {encodePath } = require("../../utils.js");
const route = [
    [
        {
            "type": "v3-pool",
            "address": "0x2C1C509942D4f55e2BfD2B670E52b7A16ec5e5C4",
            "tokenIn": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC",
                "symbol": "TOS"
            },
            "tokenOut": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa",
                "symbol": "TON"
            },
            "fee": "3000",
            "liquidity": "5605106253043575907591450994",
            "sqrtRatioX96": "2887528827939485573582432026463000",
            "tickCurrent": "210082",
            "amountIn": "100000000000000",
            "amountOut": "0"
        }
    ],
    [
        {
            "type": "v3-pool",
            "address": "0xC29271E3a68A7647Fd1399298Ef18FeCA3879F59",
            "tokenIn": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC",
                "symbol": "TOS"
            },
            "tokenOut": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0x4200000000000000000000000000000000000006",
                "symbol": "WETH"
            },
            "fee": "3000",
            "liquidity": "467661815974142552840177978",
            "sqrtRatioX96": "87675192818046527211323511644296966",
            "tickCurrent": "278350",
            "amountIn": "100000000000000"
        },
        {
            "type": "v3-pool",
            "address": "0x2AD99c938471770DA0cD60E08eaf29EbfF67a92A",
            "tokenIn": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0x4200000000000000000000000000000000000006",
                "symbol": "WETH"
            },
            "tokenOut": {
                "chainId": 5050,
                "decimals": "18",
                "address": "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa",
                "symbol": "TON"
            },
            "fee": "3000",
            "liquidity": "624609388650731509655",
            "sqrtRatioX96": "2627335598792441369020188625",
            "tickCurrent": "-68131",
            "amountOut": "708966411580302936410"
        }
    ]
  ];
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
  ///=============== WETHContract  
  const WETHContract = await getContract('WETH');
  const WETHAddress = WETHContract.address;
    ///=============== WETHContract
    const TOSContract = await getContract('TOS');
    const TOSAddress = TOSContract.address;
  ///=============== SwapRouterContract  
  const SwapRouterContract = await getContract('SwapRouter');
  const SwapRouterAddress = SwapRouterContract.address;
  
  let poolAddressTOSTON = await getPoolContractAddress(UniswapV3FactoryContract, TONAddress, TOSAddress, 3000);
  let poolAddressWETHTON = await getPoolContractAddress(UniswapV3FactoryContract, WETHAddress, TONAddress, 3000);
  
  // address tokenIn;
  // address tokenOut;
  // uint24 fee;
  // address recipient;
  // uint256 deadline;
  // uint256 amountIn;
  // uint256 amountOutMinimum;
  // uint160 sqrtPriceLimitX96;

  let deadline = Date.now() + 100000;
  console.log(deadline);
  let amountIn = ethers.utils.parseEther('1');
  let routePath;
  let paths = [];
  let fees = [];
  let amountIns = [];
  let swapData = [];
  for(let i = 0; i< route.length; i ++){
    routePath = route[i];
    amountIns[i] = routePath[0]["amountIn"];
    let amountIn = amountIns[i];
    const amountOutMinimum = 0;

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
    deadline,
    };
    console.log(params);
    swapData.push(SwapRouterContract.interface.encodeFunctionData('exactInput', [params]));
    }


  
//   for(let i=0; i<1; i++){
//     console.log(paths[i], fees[i]);
//     console.log(amountIns[i]);
//     let path = encodePath(paths[i], fees[i]);
//     let amountIn = amountIns[i];
    
//     await SwapRouter.connect(deployer).exactInput(params, {
//      gasLimit: 300000
//     });
//     const burnData = nft.interface.encodeFunctionData('burn', [tokenId]);
//   }
  console.log(swapData);
  try {
    // const tx = await SwapRouterContract.multicall(swapData, {gasLimit:300000});
    const tx = await SwapRouterContract.multicall(swapData, {gasLimit:300000});
    await tx.wait();
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log(receipt);
  } catch (e) {
    console.log(e.message);
  }

//   //==============TOS => TON (ERC20->ERC20)
//   let SwapParams = 
//     {
//       tokenIn: TONAddress,
//       tokenOut: TOSAddress,
//       fee: 3000,
//       recipient: deployer.address,
//       deadline: deadline,
//       amountIn: amountIn,
//       amountOutMinimum: 0,
//       sqrtPriceLimitX96: 0,
//     }
//   ;
//   try{
//       const tx = await SwapRouterContract.exactInputSingle(SwapParams, {
//         gasLimit: 3000000,
//       });
//       await tx.wait();
//       const receipt = await providers.getTransactionReceipt(tx.hash);
//       console.log("===TON => TOS (ERC20->ERC20)");
//       console.log("transactionHash:", receipt.transactionHash);
//       console.log("gasUsed: ",receipt.gasUsed);
//       console.log();
//       totalGasUsed = totalGasUsed.add(receipt.gasUsed);
//     }
//     catch(e) {
//       console.log("e", e.message);
//     }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
