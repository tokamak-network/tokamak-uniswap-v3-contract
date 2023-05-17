const chai = require("chai");
const { expect, assert } = chai;
const { ethers } = require("hardhat");
const {creationCode } = require('./constant/uniswapV3PoolCreationCode');

describe("check if poolAddress hash is wrong", function () {
    it("compare", async() => {
        const encodePacked = ethers.utils.solidityPack(["bytes"],[creationCode]);
        const hashInitCode = ethers.utils.keccak256(encodePacked);
        console.log(hashInitCode);
        assert.equal(hashInitCode, '0xa598dd2fba360510c5a8f02f44423a4468e902df5857dbce3ca162a43a3a31ff');
    })
})