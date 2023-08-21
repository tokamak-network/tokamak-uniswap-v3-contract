const ethers = require('ethers');
require('dotenv').config();
const hre = require('hardhat');
const {getContract, getPoolContractAddress, deployContract} = require("./helper_functions.js");
const UniswapV3PoolArtifact = require('../abis/UniswapV3Pool.sol/UniswapV3Pool.json');
const { expect } = require("chai");
const {encodePath } = require("../../utils");
const autoRouterResponse = {
    "methodParameters": {
        "calldata": "0x5ae401dc0000000000000000000000000000000000000000000000000000000064e2d798000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000fa956eb0c4b3e692ad5a6b2f08170ade55999aca00000000000000000000000042000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000bb8000000000000000000000000b68aa9e398c054da7ebaaa446292f611ca0cd52b0000000000000000000000000000000000000000000000005a34a38fc00a0000000000000000000000000000000000000000000000000000001a19ac913a7e500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000124b858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000b68aa9e398c054da7ebaaa446292f611ca0cd52b00000000000000000000000000000000000000000000000030927f74c9de0000000000000000000000000000000000000000000000000000000e0d202e2051c30000000000000000000000000000000000000000000000000000000000000042fa956eb0c4b3e692ad5a6b2f08170ade55999aca000bb86af3cb766d6cd37449bfd321d961a61b0515c1bc000bb8420000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "value": "0x00",
        "to": "0x1316822b9d2EEF86a925b753e8854F24761dA80E"
    },
    "blockNumber": "22109",
    "amount": "10000000000000000000",
    "amountDecimals": "10",
    "quote": "11358168193479925",
    "quoteDecimals": "0.011358168193479925",
    "quoteGasAdjusted": "11358091693479925",
    "quoteGasAdjustedDecimals": "0.011358091693479925",
    "gasUseEstimateQuote": "76500000000",
    "gasUseEstimateQuoteDecimals": "0.0000000765",
    "gasUseEstimate": "306000",
    "gasUseEstimateUSD": "0.000139",
    "simulationStatus": "UNATTEMPTED",
    "simulationError": false,
    "gasPriceWei": "250000",
    "route": [
        [
            {
                "type": "v3-pool",
                "address": "0x2D676468aa747f23E8dC5A9102aFa418983885B7",
                "tokenIn": {
                    "chainId": 5050,
                    "decimals": "18",
                    "address": "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa",
                    "symbol": "TON"
                },
                "tokenOut": {
                    "chainId": 5050,
                    "decimals": "18",
                    "address": "0x4200000000000000000000000000000000000006",
                    "symbol": "WETH"
                },
                "fee": "3000",
                "liquidity": "295267124098294018374",
                "sqrtRatioX96": "2346374796660857608643827361817",
                "tickCurrent": "67769",
                "amountIn": "6500000000000000000",
                "amountOut": "7383311247856493"
            }
        ],
        [
            {
                "type": "v3-pool",
                "address": "0x2C1C509942D4f55e2BfD2B670E52b7A16ec5e5C4",
                "tokenIn": {
                    "chainId": 5050,
                    "decimals": "18",
                    "address": "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa",
                    "symbol": "TON"
                },
                "tokenOut": {
                    "chainId": 5050,
                    "decimals": "18",
                    "address": "0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC",
                    "symbol": "TOS"
                },
                "fee": "3000",
                "liquidity": "10713212008910829133217",
                "sqrtRatioX96": "90779878032094045020783025270",
                "tickCurrent": "2722",
                "amountIn": "3500000000000000000"
            },
            {
                "type": "v3-pool",
                "address": "0xD305b3A89B4bc414Ea13ce891B0767340fEe720D",
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
                "liquidity": "365715536577234461815",
                "sqrtRatioX96": "2045103781648881248953277180048",
                "tickCurrent": "65020",
                "amountOut": "3974856945623432"
            }
        ]
    ],
    "routeString": "[V3] 65.00% = TON -- 0.3% [0x80d15f660d9F1F5D633D434C8E0f65EBBBB0378B] --> WETH, [V3] 35.00% = TON -- 0.3% [0xeb61DD858B8572A29e1c25E8726E617701b914a9] --> TOS -- 0.3% [0x6d79753F8dE5Fc983C2AeA4bBb205E0f44209574] --> WETH",
    "quoteId": "bd674"
};
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
  const SwapRouterContract = await getContract('SwapRouter02');
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

  let deadline = Math.floor(Date.now() / 1000) + 100000;
  let routePath;
  let paths = [];
  let fees = [];
  //let amountIns = [];
  let swapData = [];
  let route = autoRouterResponse.route;
  let swapRouterAddress = autoRouterResponse.methodParameters.to;

  for(let i = 0; i< route.length; i ++){
    routePath = route[i];
    //amountIns[i] = routePath[0]["amountIn"];
    //let amountIn = amountIns[i];
    let amountIn = routePath[0]["amountIn"];
    paths[i] = [routePath[0]["tokenIn"]['address'], routePath[0]["tokenOut"]["address"]]
    fees[i] = [parseInt(routePath[0]["fee"])]
    if(routePath.length > 1){
        for(let j=1; j< routePath.length; j++){
            paths[i].push(routePath[j]["tokenOut"]["address"])
            fees[i].push(parseInt(routePath[j]["fee"]))
        }
        let amountOutMinimum = Math.floor(routePath[routePath.length-1]["amountOut"] * 0.995);
        let path = encodePath(paths[i], fees[i]);
        const params = {
            recipient: swapRouterAddress,
            path,
            amountIn,
            amountOutMinimum,
            // deadline,
        };
        console.log(params);
        swapData.push(SwapRouterContract.interface.encodeFunctionData('exactInput', [params]));
    } else{
        let amountOutMinimum = Math.floor(routePath[0]["amountOut"] * 0.995);
        let SwapParams = 
            {
                tokenIn: routePath[0]["tokenIn"]['address'],
                tokenOut: routePath[0]["tokenOut"]["address"],
                fee: 3000,
                recipient: swapRouterAddress,
                //deadline: deadline,
                amountIn: amountIn,
                amountOutMinimum,
                sqrtPriceLimitX96: 0,
            }
        ;
        console.log(SwapParams);
        swapData.push(SwapRouterContract.interface.encodeFunctionData('exactInputSingle', [SwapParams]));
    } 
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
const amountMinimum = 0
const encData2 = SwapRouterContract.interface.encodeFunctionData('unwrapWETH9(uint256)', [amountMinimum])
swapData.push(encData2);
const encMultiCall = SwapRouterContract.interface.encodeFunctionData('multicall(uint256,bytes[])', [deadline, swapData])
console.log(encMultiCall);
try {
  // const tx = await SwapRouterContract.multicall(swapData, {gasLimit:300000});
  //const tx = await SwapRouterContract.multicall(swapData, {gasLimit:300000});
  const txArgs = {
      to: swapRouterAddress,
      from: deployer.address,
      data: encMultiCall,
      gasLimit: 600000,
  }
    //const tx = await SwapRouterContract.multicall(swapData, {gasLimit:300000});
    const tx = await deployer.sendTransaction(txArgs)
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
