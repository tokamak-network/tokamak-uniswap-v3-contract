// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  // _factory
  let _factory = "0x56F70e642886aAFEdc75ed7EEfA94dbbEbda280E"
  // _WETH9
  let _WETH9 = "0xF1B5DF98574C18d204fd91ec328f83Fca16337BE"

  const SwapRouter = await hre.ethers.getContractFactory("SwapRouter");
  const swapRouter = await SwapRouter.deploy(_factory, _WETH9);

  let tx = await swapRouter.deployed();

  console.log(tx);

  console.log(
    `SwapRouter deployed to ${swapRouter.address}`
  );

  console.log('finish');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
