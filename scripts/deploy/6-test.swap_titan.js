
const ethers = require("ethers")
require('dotenv').config()
const { FeeAmount, encodePriceSqrt, encodePath } = require("../utils");
const hre = require("hardhat");

const NonfungiblePositionManagerAddress = "0x324d7015E30e7C231e4aC155546b8AbfEAB00977";
const UniswapV3FactoryAddress = "0x8C2351935011CfEccA4Ea08403F127FB782754AC";

const SwapRouterAddress ="0x365FC907394A4858EcdbF24b874048C0bBF54CE9"
const SwapRouter02Address = '0x9Cabe266e34C7B60858BD55B0a3C00b83e511619'
const TON = "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa"
const TOS = "0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC"
const Fee = 3000
const IERC20Artifact = require("../abis/IERC20.json");
const UniswapV3Factory = require("../abis/UniswapV3Factory.json");
const SwapRouterArtifact = require("../abis/SwapRouter.json");
const SwapRouter02Artifact = require("../abis/SwapRouter02.json");

const route = [
  [
      {
          "type": "v3-pool",
          "address": "0x2C1C509942D4f55e2BfD2B670E52b7A16ec5e5C4",
          "tokenIn": {
              "chainId": 5050,
              "decimals": "18",
              "address": "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa",
              "symbol": "WTON"
          },
          "tokenOut": {
              "chainId": 5050,
              "decimals": "18",
              "address": "0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC",
              "symbol": "TOS"
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
              "address": "0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa",
              "symbol": "WTON"
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
              "address": "0x6AF3cb766D6cd37449bfD321D961A61B0515c1BC",
              "symbol": "TOS"
          },
          "fee": "3000",
          "liquidity": "624609388650731509655",
          "sqrtRatioX96": "2627335598792441369020188625",
          "tickCurrent": "-68131",
          "amountOut": "708966411580302936410"
      }
  ]
];

async function swap (SwapRouter, deployer, params, gas ) {
  const tx1 = await SwapRouter.connect(deployer).exactInput(params, {
    gasLimit: 300000
  });
  await tx1.wait();
}

async function main() {

  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  providers = hre.ethers.provider;

  console.log("deployer", deployer.address);

  let UniswapV3FactoryAddressCode1 = await providers.getCode(UniswapV3FactoryAddress);
  if (UniswapV3FactoryAddressCode1 === '0x')  console.log('UniswapV3Factory is null')
  ///=========== UniswapV3Factory
  const UniswapV3Factory_ = new ethers.ContractFactory(
      UniswapV3Factory.abi, UniswapV3Factory.bytecode, deployer)
  const UniswapV3FactoryContract = UniswapV3Factory_.attach(UniswapV3FactoryAddress)
  console.log(UniswapV3FactoryContract.address, TON, TOS, Fee);
  const poolAddress = await UniswapV3FactoryContract.getPool(TON, TOS, Fee);
  console.log("poolAddress", poolAddress);
  let poolCode1 = await providers.getCode(poolAddress);
  if (poolCode1 === '0x')  console.log('poolAddress is null')

  let allowanceAmount =  ethers.utils.parseEther("100000000")
  ///=========== TONContract
  const TONContract_ = new ethers.ContractFactory(IERC20Artifact.abi, IERC20Artifact.bytecode, deployer)
  const TONContract = TONContract_.attach(TON)
  let allowance = await TONContract.allowance(deployer.address, SwapRouterAddress);
  if(allowance.lt(allowanceAmount)){
    const tx = await TONContract.approve(
      SwapRouterAddress,
      allowanceAmount
      );
    console.log("tx", tx);
    await tx.wait();
  }
  ///=========== TOSContract
  const TOSContract_ = new ethers.ContractFactory(IERC20Artifact.abi, IERC20Artifact.bytecode, deployer)
  const TOSContract = TOSContract_.attach(TOS)
  allowance = await TOSContract.allowance(deployer.address, SwapRouterAddress);
  if(allowance.lt(allowanceAmount)){
    const tx = await TOSContract.approve(
      SwapRouterAddress,
      allowanceAmount
      );
    console.log("tx", tx);
    await tx.wait();
  }

  ///=========== SwapRouter
  const SwapRouter_ = new ethers.ContractFactory(
    SwapRouterArtifact.abi, SwapRouterArtifact.bytecode, deployer)
  const SwapRouter = SwapRouter_.attach(SwapRouterAddress)
  let swapCode  = await providers.getCode(SwapRouterAddress);
  if (swapCode === '0x')  console.log('SwapRouter is null')
  ///=========== SwapRouter02
  const SwapRouter02_ = new ethers.ContractFactory(
    SwapRouter02Artifact.abi, SwapRouter02Artifact.bytecode, deployer)
  const SwapRouter02 = SwapRouter02_.attach(SwapRouter02Address)
  let swap02Code  = await providers.getCode(SwapRouter02Address);
  if (swap02Code === '0x')  console.log('SwapRouter02 is null')

  const amountIn = ethers.utils.parseEther("1");
  let deadline = Date.now() + 100000;
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
    if(route.length > 1) {
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
      swapData.push(SwapRouter.interface.encodeFunctionData('exactInput', [params]));
    } else{
      const params = {
        tokenIn:routePath[0]["tokenIn"]['address'],
        tokenOut:routePath[0]["tokenOut"]["address"],
        fee: parseInt(routePath[0]["fee"]),
        recipient :deployer.address,
        deadline,
        amountIn,
        amountOutMinimum,
        sqrtPriceLimitX96 :0
      }
      swapData.push(SwapRouter.interface.encodeFunctionData('exactInputSingle', [params]));
      // let tx = await SwapRouter.exactInputSingle(params,{gasLimit:3000});
      // console.log(tx);
    }
    
  }
  
  // for(let i=0; i<1; i++){
  //   console.log(paths[i], fees[i]);
  //   console.log(amountIns[i]);
  //   let path = encodePath(paths[i], fees[i]);
  //   let amountIn = amountIns[i];
    
    // await SwapRouter.connect(deployer).exactInput(params, {
    //  gasLimit: 300000
    // });
    //const burnData = nft.interface.encodeFunctionData('burn', [tokenId]);
  //}
  console.log(swapData);
  try {
    const tx = await SwapRouter.multicall(swapData, {gasLimit:300000});
    await tx.wait();
    const receipt = await providers.getTransactionReceipt(tx.hash);
    console.log(receipt);
  } catch (e) {
    console.log(e.message);
  }
  


  // await providers.estimateGas(
  //   SwapRouter.exactInput(params, {gasLimit: 300000})
  // )
  // .then((gasEstimate) => {
  //   console.log("gasEstimate", gasEstimate);
  //   const gas = parseInt(gasEstimate * 1.2)
    //swap(SwapRouter, TOSContract, deployer, params, gas )
  //})

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});