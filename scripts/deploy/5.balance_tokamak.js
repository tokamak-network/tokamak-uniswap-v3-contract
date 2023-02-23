const ethers = require("ethers")

const TON = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2"
const TOS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"

const IERC20Artifact = require("../abis/IERC20.json");


async function main() {

    const accounts = await hre.ethers.getSigners();
    const deployer = accounts[0];
    providers = hre.ethers.provider;

    console.log("deployer", deployer.address);

    ///=========== TOSContract
    const TOSContract_ = new ethers.ContractFactory(IERC20Artifact.abi, IERC20Artifact.bytecode, deployer)
    const TOSContract = TOSContract_.attach(TOS)

    let balanceBeforeTOS = await TOSContract.balanceOf(deployer.address);
    console.log("balanceBeforeTOS", balanceBeforeTOS.toString());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});