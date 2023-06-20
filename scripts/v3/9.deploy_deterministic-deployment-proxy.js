const ethers = require("ethers")
require('dotenv').config()
const hre = require('hardhat');
const {OVM_GasPriceOracleABI} = require('./constant.js');

async function main() {
    const provider = hre.ethers.provider;
    let balance = await provider.getBalance("0x3fAB184622Dc19b6109349B94811493BF2a45362");
    console.log(balance);
    const accounts = await hre.ethers.getSigners();
    deployer = accounts[0];
//0x420000000000000000000000000000000000000F OVM_GasPriceOracle 

    
    // let OVM_GasPriceOracleContract = new ethers.Contract('0x420000000000000000000000000000000000000F', OVM_GasPriceOracleABI, deployer);
    // console.log("OVM_GasPriceOracleContract Addres: ", OVM_GasPriceOracleContract.address);
    // const owner = await OVM_GasPriceOracleContract.owner();
    // console.log("owner: ", owner);
    // const gasPrice = await OVM_GasPriceOracleContract.gasPrice();
    // console.log("gasPrice: ", gasPrice);

    hre.network.provider.send("hardhat_setBalance",["0x3fAB184622Dc19b6109349B94811493BF2a45362", "0x16345785D8A0000"] )
    balance = await provider.getBalance("0x3fAB184622Dc19b6109349B94811493BF2a45362");
    console.log(balance);

    let tx;
    
    try {
        tx = await provider.sendTransaction('0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222',{gasPrice: 249999});
    } catch (e) {
        console.log(e.message);
        throw e;
    }

    console.log(tx);
    await tx.wait();
    const receipt = await provider.getTransactionReceipt(tx.hash);
    console.log('receipt', receipt);
    
    balance = await provider.getBalance("0x3fAB184622Dc19b6109349B94811493BF2a45362");
    console.log(balance);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });