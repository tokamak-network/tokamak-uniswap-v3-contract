// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

const QuoterV2Artifact = require("../artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json");
const UniswapV3FactoryArtifact = require("./abis/UniswapV3Factory.json");
const UniswapV3PoolArtifact = require("./abis/UniswapV3Pool.json");
const SwapRouterArtifact = require("./abis/SwapRouter.json");
const UniswapV3PoolSwapTestArtifact = require("./abis/UniswapV3PoolSwapTest.json");

const IERC20Artifact = require("./abis/IERC20.json");



// /// tokamak goerli
// const l1Url = `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
// const l2Url = `https://goerli.optimism.tokamak.network`

// const QuoterV2Address = "0xbB4CD62E85eb9558BBC1b7b2cBFb15A55b347FbA";
// const UniswapV3FactoryAddress = "0x56F70e642886aAFEdc75ed7EEfA94dbbEbda280E";
// // const SwapRouterAddress = "0xd8EF9699eBc5b8357cbAaAbCa8af40141180aaB2";
// const SwapRouterAddress = "0x62cD88740F363b0558d20bfc5257431F049034dc";
// const UniswapV3PoolSwapTestAddress = "0x6159b5525d1Ebab5163f6A070D67C6F7F3C80753";

// const path = "0x7c6b91d9be155a6db01f749217d76ff02a7227f2000bb850c5725949a6f0c72e6c4a641f24049a917db0cb";
// const TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
// const TOS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"

// goerli
const l1Url = `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
const l2Url = `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
/// goerli
const QuoterV2Address = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";
const UniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
// const SwapRouterAddress = "0xd8EF9699eBc5b8357cbAaAbCa8af40141180aaB2";
const SwapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
// const UniswapV3PoolSwapTestAddress = "0x6159b5525d1Ebab5163f6A070D67C6F7F3C80753";

const path = "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6000bb867F3bE272b1913602B191B3A68F7C238A2D81Bb9";
const TON = "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6" // WTON on goerli
const TOS = "0x67F3bE272b1913602B191B3A68F7C238A2D81Bb9"


const Fee = 3000
// Global variable because we need them almost everywhere
let l1ERC20, l2ERC20    // OUTb contracts to show ERC-20 transfers
let ourAddr, TONContract, TOSContract             // The address of the signer we use.
let Quoter, QuoterV2, UniswapV3Factory, SwapRouter, UniswapV3PoolSwapTest


// Get signers on L1 and L2 (for the same address). Note that
// this address needs to have ETH on it, both on Optimism and
// Optimism Georli
const getSigners = async () => {
    const l1RpcProvider = new ethers.providers.JsonRpcProvider(l1Url)
    const l2RpcProvider = new ethers.providers.JsonRpcProvider(l2Url)
    const privateKey = process.env.PRIVATE_KEY
    const l1Wallet = new ethers.Wallet(privateKey, l1RpcProvider)
    const l2Wallet = new ethers.Wallet(privateKey, l2RpcProvider)

    return [l1Wallet, l2Wallet]
}   // getSigners

const setup = async() => {
    accounts = await hre.ethers.getSigners();
    [admin1, admin2, user1, user2, user3, user4, user5, user6 ] = accounts;

    const [l1Signer, l2Signer] = await getSigners()
    ourAddr = l1Signer.address
    console.log('ourAddr', ourAddr)

    console.log('IERC20Artifact.abi', IERC20Artifact.abi)


    TONContract = new ethers.Contract(TON, IERC20Artifact.abi, l2Signer)
    TOSContract = new ethers.Contract(TOS, IERC20Artifact.abi, l2Signer)

    QuoterV2 = new ethers.Contract(QuoterV2Address, QuoterV2Artifact.abi, l2Signer)
    UniswapV3Factory = new ethers.Contract(UniswapV3FactoryAddress, UniswapV3FactoryArtifact.abi, l2Signer)
    SwapRouter = new ethers.Contract(SwapRouterAddress, SwapRouterArtifact.abi, l2Signer)
    // UniswapV3PoolSwapTest = new ethers.Contract(UniswapV3PoolSwapTestAddress, UniswapV3PoolSwapTestArtifact.abi, l2Signer)

  }    // setup
  const erc20ABI = [
    // balanceOf
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
    // approve
    {
      constant: true,
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" }],
      name: "approve",
      outputs: [{ name: "", type: "bool" }],
      type: "function",
    },
    // faucet
    {
      inputs: [],
      name: "faucet",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ]    // erc20ABI

async function main() {

    accounts = await hre.ethers.getSigners();
    l2Signer = accounts[0]
    ourAddr = accounts[0].address
    console.log('ourAddr', ourAddr)

    TONContract = new ethers.Contract(TON, IERC20Artifact.abi, l2Signer)
    QuoterV2 = new ethers.Contract(QuoterV2Address, QuoterV2Artifact.abi, l2Signer)
    UniswapV3Factory = new ethers.Contract(UniswapV3FactoryAddress, UniswapV3FactoryArtifact.abi, l2Signer)
    SwapRouter = new ethers.Contract(SwapRouterAddress, SwapRouterArtifact.abi, l2Signer)

    let SwapRouterCode = await ethers.provider.getCode(SwapRouterAddress);
    console.log('SwapRouterCode', SwapRouterCode)

    const poolAddress = await UniswapV3Factory.getPool(TON, TOS, Fee);
    console.log("poolAddress", poolAddress);

    UniswapV3Pool = new ethers.Contract(poolAddress, UniswapV3PoolArtifact.abi, l2Signer)
    const slot0 = await UniswapV3Pool.slot0();
    console.log("slot0", slot0);


    let balanceBeforeTON = await TONContract.balanceOf(l2Signer.address);
    console.log("balanceBeforeTON", balanceBeforeTON.toString());

    let allowance = await TONContract.allowance(l2Signer.address, SwapRouter.address);

    let allowanceAmount = ethers.utils.parseEther("10000000000000")
    console.log("allowance 1 ", allowance.toString());

    if(allowance.lt(allowanceAmount)){
      const tx = await TONContract.connect(l2Signer).approve(
        SwapRouter.address,
        allowanceAmount
        );
      console.log("tx", tx);
      await tx.wait();

      allowance = await TONContract.allowance(l2Signer.address, SwapRouter.address);
      console.log("allowance2 ", allowance.toString());
    }

    const amountIn = ethers.utils.parseEther("1000000000");
    let deadline = Date.now() + 100000;

    const amountOutMinimum = 1000000000;
    const params = {
      recipient: l2Signer.address,
      path,
      amountIn,
      amountOutMinimum,
      deadline,
    };
    console.log("params", params);

    const estimation = await SwapRouter.estimateGas.exactInput(
        params
    );
    console.log("estimation", estimation);
    let gas = estimation.toNumber() * 2;
    console.log("gas", gas);

    const tx1 = await SwapRouter.connect(l2Signer).exactInput(params, {
      gasLimit: gas
    });

    await tx1.wait();

    let balanceAfterTON = await TONContract.balanceOf(l2Signer.address);
    console.log("balanceAfterTON", balanceAfterTON.toString());

    // let QuoteExactInputSingleParams = {
    //     tokenIn: TON,
    //     tokenOut: TOS,
    //     amountIn: amountIn,
    //     fee: Fee,
    //     sqrtPriceLimitX96: 0
    // }

    // const amountOut = await QuoterV2.callStatic.quoteExactInputSingle(
    //     QuoteExactInputSingleParams
    // );
    // console.log("amountOut", amountOut);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });