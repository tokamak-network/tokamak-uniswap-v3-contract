const ethers = require("ethers")
require('dotenv').config()
const hre = require('hardhat');
async function main() {
    const provider = hre.ethers.provider;
    
    //hre.network.provider.send("hardhat_setBalance",["0x3fAB184622Dc19b6109349B94811493BF2a45362", "0x111111111111111111111"] )
    
    let balance = await provider.getBalance("0x3fAB184622Dc19b6109349B94811493BF2a45362");
    console.log(balance);

    let tx;
    
    try {
        tx = await provider.sendTransaction('0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222');
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