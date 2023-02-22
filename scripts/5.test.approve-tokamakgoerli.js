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
const l1Url = `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
const l2Url = `https://goerli.optimism.tokamak.network`

const QuoterV2Address = "0xbB4CD62E85eb9558BBC1b7b2cBFb15A55b347FbA";
const UniswapV3FactoryAddress = "0x56F70e642886aAFEdc75ed7EEfA94dbbEbda280E";
const SwapRouterAddress = "0x62cD88740F363b0558d20bfc5257431F049034dc";
const UniswapV3PoolSwapTestAddress = "0x6159b5525d1Ebab5163f6A070D67C6F7F3C80753";

const path = "0x7c6b91d9be155a6db01f749217d76ff02a7227f2000bb850c5725949a6f0c72e6c4a641f24049a917db0cb";
const TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
const TOS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"


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

async function main() {

    const [l1Signer, l2Signer] = await getSigners()
    ourAddr = l1Signer.address
    console.log('ourAddr', ourAddr)

    TONContract = new ethers.Contract(TON, IERC20Artifact.abi, l2Signer)

    let balanceBeforeTON = await TONContract.balanceOf(l2Signer.address);
    console.log("balanceBeforeTON", balanceBeforeTON.toString());

    let allowance = await TONContract.allowance(l2Signer.address, QuoterV2Address);

    let allowanceAmount = ethers.utils.parseEther("10000");
    console.log("allowance 1 ", allowance.toString());

    if(allowance.lt(allowanceAmount)){
      const tx = await TONContract.connect(l2Signer).approve(
        QuoterV2Address, ethers.utils.parseEther("10000")
        );
      console.log("approve tx", tx);
      await tx.wait();

      allowance = await TONContract.allowance(l2Signer.address, QuoterV2Address);
      console.log("allowance2 ", allowance.toString());
    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });