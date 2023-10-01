const chai = require("chai");
const { expect, assert } = chai;
const { ethers } = require("hardhat");
const { creationCode } = require("./constant/uniswapV3PoolCreationCode");
const sdk = require("@uniswap/v3-sdk");
const JSBI = require("jsbi"); // jsbi@3.2.5
const getSqrtRatioAtTick = sdk.TickMath.getSqrtRatioAtTick;
const getTickAtSqrtRatio = sdk.TickMath.getTickAtSqrtRatio;
const nearestUsableTick = sdk.nearestUsableTick;
const getAmount0Delta = sdk.SqrtPriceMath.getAmount0Delta;
const getAmount1Delta = sdk.SqrtPriceMath.getAmount1Delta;
const { Pool } = require("@uniswap/v3-sdk");
const { Percent, BigintIsh } = require("@uniswap/sdk-core");

function toHex(bigintIsh) {
  const bigInt = JSBI.BigInt(bigintIsh);
  let hex = bigInt.toString(16);
  if (hex.length % 2 !== 0) {
    hex = `0${hex}`;
  }
  return `0x${hex}`;
}
describe("check if poolAddress hash is wrong", async function () {
  it("compare", async () => {
    const encodePacked = ethers.utils.solidityPack(["bytes"], [creationCode]);
    const hashInitCode = ethers.utils.keccak256(encodePacked);
    console.log(hashInitCode);
    assert.equal(
      hashInitCode,
      "0xa598dd2fba360510c5a8f02f44423a4468e902df5857dbce3ca162a43a3a31ff"
    );
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
    console.log(
      await contract.getLiquidityForAmounts(
        getSqrtRatioAtTick(-200874).toString(),
        getSqrtRatioAtTick(-205980).toString(),
        getSqrtRatioAtTick(-197520).toString(),
        ethers.utils.parseEther("0.028"),
        ethers.utils.parseUnits("50", 6)
      )
    );
    console.log(
      await contract.getLiquidityForAmount0(
        getSqrtRatioAtTick(-200874).toString(),
        getSqrtRatioAtTick(-197520).toString(),
        ethers.utils.parseEther("0.028")
      )
    );
    console.log(
      await contract.getLiquidityForAmount1(
        getSqrtRatioAtTick(-205980).toString(),
        getSqrtRatioAtTick(-200874).toString(),
        ethers.utils.parseUnits("50", 6)
      )
    );
    console.log("-----");

    console.log(
      await contract.getLiquidityForAmounts(
        getSqrtRatioAtTick(201207).toString(),
        getSqrtRatioAtTick(196080).toString(),
        getSqrtRatioAtTick(204600).toString(),
        ethers.utils.parseUnits("50", 6),
        ethers.utils.parseEther("0.028")
      )
    );
    console.log(
      await contract.getLiquidityForAmount0(
        getSqrtRatioAtTick(201207).toString(),
        getSqrtRatioAtTick(204600).toString(),
        ethers.utils.parseUnits("50", 6)
      )
    );
    console.log(
      await contract.getLiquidityForAmount1(
        getSqrtRatioAtTick(196080).toString(),
        getSqrtRatioAtTick(201207).toString(),
        ethers.utils.parseEther("0.028")
      )
    );

    console.log(
      await contract.getLiquidityForAmounts(
        getSqrtRatioAtTick(201207).toString(),
        getSqrtRatioAtTick(201207 - 6932).toString(),
        getSqrtRatioAtTick(201207 + 6932).toString(),
        ethers.utils.parseEther("0.028"),
        ethers.utils.parseUnits("50", 6)
      )
    );
    console.log(
      await contract.getLiquidityForAmount0(
        getSqrtRatioAtTick(201207).toString(),
        getSqrtRatioAtTick(201207 + 6932).toString(),
        ethers.utils.parseEther("0.028")
      )
    );
    console.log(
      await contract.getLiquidityForAmount1(
        getSqrtRatioAtTick(201207 - 6932).toString(),
        getSqrtRatioAtTick(201207).toString(),
        ethers.utils.parseUnits("50", 6)
      )
    );
    //210781
    const denominator = ethers.BigNumber.from(
      getSqrtRatioAtTick(201207).toString()
    ).sub(ethers.BigNumber.from(getSqrtRatioAtTick(196080).toString()));
    console.log(denominator);
    console.log(
      ethers.BigNumber.from(ethers.utils.parseUnits("50", 6))
        .mul(ethers.BigNumber.from("0x1000000000000000000000000"))
        .div(denominator)
    );
    //return toUint128(FullMath.mulDiv(amount1, FixedPoint96.Q96, sqrtRatioBX96 - sqrtRatioAX96));

    console.log(nearestUsableTick(210781 + 60, 60));
    console.log(nearestUsableTick(210781 + 3365, 60));

    console.log(
      await contract.getLiquidityForAmount0(
        getSqrtRatioAtTick(210781).toString(),
        getSqrtRatioAtTick(210781 + 3365).toString(),
        ethers.utils.parseEther("2400")
      )
    );
    console.log(
      await contract.getLiquidityForAmount1(
        getSqrtRatioAtTick(210780 + 60).toString(),
        getSqrtRatioAtTick(210781).toString(),
        ethers.utils.parseEther("1")
      )
    );
    console.log(ethers.BigNumber.from("0x1000000000000000000000000"));

    console.log(
      "wow",
      await sqrtPriceMathcontract.getAmount0Delta(
        getSqrtRatioAtTick(204600).toString(),
        getSqrtRatioAtTick(201207).toString(),
        9453,
        true
      )
    );
    console.log(JSBI.BigInt("2505411999795360582221170761428213"));
    console.log(
      getTickAtSqrtRatio(JSBI.BigInt("2505411999795360582221170761428213"))
    );
    console.log(
      getTickAtSqrtRatio(JSBI.BigInt("250541448375047931186413801569"))
    );
    console.log(
      getTickAtSqrtRatio(JSBI.BigInt("79228162514264337593543950336"))
    );
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const now = new Date(1690260364 * 1000 + KR_TIME_DIFF);
    console.log(now);
    console.log(now.toJSON());
    console.log(now.toString());
    console.log(1690260364 * 1000 + KR_TIME_DIFF);
    console.log(new Date(2370616672));
    console.log(
      getTickAtSqrtRatio(JSBI.BigInt("250541448375047931186413801569"))
    );
    console.log(
      getAmount1Delta(
        getSqrtRatioAtTick(-60),
        getSqrtRatioAtTick(0),
        JSBI.BigInt("1000000"),
        true
      ).toString()
    );
    console.log(JSBI.BigInt(33329220265679295795561).toString());
    const oneHundred = new Percent(100, 100);
    console.log(
      oneHundred
        .multiply(JSBI.BigInt("33329220265679295795561"))
        .quotient.toString()
    );
    console.log(
      oneHundred.multiply(33329220265679295795561).quotient.toString()
    );

    console.log(getSqrtRatioAtTick(60).toString());
    console.log(
      getTickAtSqrtRatio(
        JSBI.BigInt("92979860367883423878727417014")
      ).toString()
    );
  });
});

//196080 ~ 204600, 현재 틱 : 201207
