const chai = require("chai");
const { expect, assert } = chai;
const _ = require("lodash");

const { ethers } = require("hardhat");
const Web3EthAbi = require('web3-eth-abi');
const {
  keccak256,
} = require("web3-utils");

let { uniswapInfo, config, deployed} = require('./tokamak-goerli-config.js');
const { FeeAmount, encodePath } = require("./utils");

let tosAdmin = "0x12a936026f072d4e97047696a9d11f97eae47d21";
let TosV2Admin = "0x15280a52E79FD4aB35F4B9Acbb376DCD72b44Fd1";

async function quoteExactInput(quoteContract, path, amountIn) {
    const amountOut = await quoteContract.callStatic.quoteExactInput(
        path,
        amountIn
    );
    return amountOut;
}

const QuoterV2ABI = require("../artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json");

describe("Price Calculate with uniswap pools", function () {

  let provider;

  let tosContract;
  let pricePathes, oracleLibrary;
    let quoterV2;

  let _TosV2Admin;
  let _tosAdmin;

  let choice = 0; // max, min,average
  let pricePathInfos = [];


  before(async () => {
    accounts = await ethers.getSigners();
    [admin1, admin2, user1, user2, user3, user4, user5, user6 ] = accounts;
    //console.log('admin1',admin1.address);
    console.log('admin1',admin1.address);
    provider = ethers.provider;

    // await hre.ethers.provider.send("hardhat_setBalance", [
    //   admin1.address,
    //   "0x4EE2D6D415B85ACEF8100000000",
    // ]);
    // await hre.ethers.provider.send("hardhat_setBalance", [
    //   user1.address,
    //   "0x4EE2D6D415B85ACEF8100000000",
    // ]);
    // await hre.ethers.provider.send("hardhat_setBalance", [
    //   user2.address,
    //   "0x4EE2D6D415B85ACEF8100000000",
    // ]);

    // await hre.ethers.provider.send("hardhat_impersonateAccount",[TosV2Admin]);

    // _TosV2Admin = await ethers.getSigner(TosV2Admin);

  });

  describe("QuoterV2 ", () => {
    it("setting the quoter", async () => {
        quoterV2 = new ethers.Contract(uniswapInfo.QuoterV2, QuoterV2ABI.abi, ethers.provider);
    })
    it("#2-2. Quoter get balance, before qutoerCall", async () => {
        beforeBalance = await quoteExactInput(
            quoterV2,
            '0x7c6b91d9be155a6db01f749217d76ff02a7227f2000bb850c5725949a6f0c72e6c4a641f24049a917db0cb',
            ethers.utils.parseEther("5")
        )
        console.log("beforeBalance :",Number(beforeBalance));
    })

  })

})