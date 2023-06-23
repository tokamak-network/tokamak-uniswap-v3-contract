const chai = require("chai");
const { expect, assert } = chai;
const { ethers } = require("hardhat");
const {creationCode } = require('./constant/uniswapV3PoolCreationCode');
const sdk = require("@uniswap/v3-sdk");
const { default: JSBI } = require("jsbi");
const getSqrtRatioAtTick = sdk.TickMath.getSqrtRatioAtTick;
const nearestUsableTick = sdk.nearestUsableTick;
const getAmount0Delta = sdk.SqrtPriceMath.getAmount0Delta;
const getAmount1Delta = sdk.SqrtPriceMath.getAmount1Delta;

describe("check if poolAddress hash is wrong", async function () {
    it("compare", async() => {
        const encodePacked = ethers.utils.solidityPack(["bytes"],[creationCode]);
        const hashInitCode = ethers.utils.keccak256(encodePacked);
        console.log(hashInitCode);
        assert.equal(hashInitCode, '0xa598dd2fba360510c5a8f02f44423a4468e902df5857dbce3ca162a43a3a31ff');
        let MyContract = await ethers.getContractFactory("LiquidityAmountsTest");
        const contract = await MyContract.deploy();
        MyContract = await ethers.getContractFactory("SqrtPriceMathTest");
        const sqrtPriceMathcontract = await MyContract.deploy();
        console.log(getSqrtRatioAtTick(201207).toString());
        console.log(getSqrtRatioAtTick(196080).toString());
        console.log(getSqrtRatioAtTick(204600).toString());
        console.log(getSqrtRatioAtTick(201207 - 6932).toString());
        console.log(getSqrtRatioAtTick(201207 + 6932).toString());
        console.log("-----");
        console.log(getSqrtRatioAtTick(-200874).toString());
        console.log(getSqrtRatioAtTick(-197520).toString());
        console.log(getSqrtRatioAtTick(-205980).toString());
            console.log(await contract.getLiquidityForAmounts(
                getSqrtRatioAtTick(-200874).toString(),
                getSqrtRatioAtTick(-205980).toString(),
                getSqrtRatioAtTick(-197520).toString(),
                ethers.utils.parseEther('0.028'),
                ethers.utils.parseUnits('50', 6)
            ));
            console.log(await contract.getLiquidityForAmount0(
                getSqrtRatioAtTick(-200874).toString(),
                getSqrtRatioAtTick(-197520).toString(),
                ethers.utils.parseEther('0.028'),
            ));
            console.log(await contract.getLiquidityForAmount1(
                getSqrtRatioAtTick(-205980).toString(),
                getSqrtRatioAtTick(-200874).toString(),
                ethers.utils.parseUnits('50', 6)
            ));
        console.log("-----")



        console.log(await contract.getLiquidityForAmounts(
            getSqrtRatioAtTick(201207).toString(),
            getSqrtRatioAtTick(196080).toString(),
            getSqrtRatioAtTick(204600).toString(),
            ethers.utils.parseUnits('50', 6),
            ethers.utils.parseEther('0.028')
        ));
        console.log(await contract.getLiquidityForAmount0(
            getSqrtRatioAtTick(201207).toString(),
            getSqrtRatioAtTick(204600).toString(),
            ethers.utils.parseUnits('50', 6),
        ));
        console.log(await contract.getLiquidityForAmount1(
            getSqrtRatioAtTick(196080).toString(),
            getSqrtRatioAtTick(201207).toString(),
            ethers.utils.parseEther('0.028'),
        ));

        console.log(await contract.getLiquidityForAmounts(
            getSqrtRatioAtTick(201207).toString(),
            getSqrtRatioAtTick(201207 - 6932).toString(),
            getSqrtRatioAtTick(201207 + 6932).toString(),
            ethers.utils.parseEther('0.028'),
            ethers.utils.parseUnits('50', 6)
        ));
        console.log(await contract.getLiquidityForAmount0(
            getSqrtRatioAtTick(201207).toString(),
            getSqrtRatioAtTick(201207 + 6932).toString(),
            ethers.utils.parseEther('0.028'),
        ));
        console.log(await contract.getLiquidityForAmount1(
            getSqrtRatioAtTick(201207 - 6932).toString(),
            getSqrtRatioAtTick(201207).toString(),
            ethers.utils.parseUnits('50', 6)
        ));
        //210781
        const denominator = ethers.BigNumber.from(getSqrtRatioAtTick(201207).toString()).sub(ethers.BigNumber.from(getSqrtRatioAtTick(196080).toString()));
        console.log(denominator);
        console.log(ethers.BigNumber.from(ethers.utils.parseUnits('50', 6)).mul(ethers.BigNumber.from("0x1000000000000000000000000")).div(denominator) )
        //return toUint128(FullMath.mulDiv(amount1, FixedPoint96.Q96, sqrtRatioBX96 - sqrtRatioAX96));

        console.log(nearestUsableTick(210781+60, 60));
        console.log(nearestUsableTick(210781 + 3365, 60));

        console.log(await contract.getLiquidityForAmount0(
            getSqrtRatioAtTick(210781).toString(),
            getSqrtRatioAtTick(210781 + 3365).toString(),
            ethers.utils.parseEther('2400')
        ));
        console.log(await contract.getLiquidityForAmount1(
            getSqrtRatioAtTick(210780+60).toString(),
            getSqrtRatioAtTick(210781).toString(),
            ethers.utils.parseEther('1')
        ));
        console.log(ethers.BigNumber.from("0x1000000000000000000000000"));

        console.log("wow",await sqrtPriceMathcontract.getAmount0Delta(getSqrtRatioAtTick(204600).toString(),getSqrtRatioAtTick(201207).toString(), 9453, true));

    })
})

//196080 ~ 204600, 현재 틱 : 201207