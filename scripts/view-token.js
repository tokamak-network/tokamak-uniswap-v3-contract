// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

const L2StandardTokenFactoryArtifact = require(`@eth-optimism/contracts/artifacts/contracts/L2/messaging/L2StandardTokenFactory.sol/L2StandardTokenFactory.json`);
const ERC20Artifact = require('@openzeppelin/contracts/build/contracts/ERC20.json')

async function main() {
//   const L1TokenAddress = "0x67F3bE272b1913602B191B3A68F7C238A2D81Bb9";
//   const L2TokenName = "TOS";
//   const L2TokenSymbol = "TOS";

  const L2TokenAddress = "0xD08a2917653d4E460893203471f0000826fb4034";

  // Get the number of decimals
  const erc20 = new ethers.Contract(
    L2TokenAddress,
    ERC20Artifact.abi,
    ethers.provider
  );
  const decimals = await erc20.decimals()
  const L2TokenName = await erc20.name()
  const L2TokenSymbol = await erc20.symbol()


  // Get the networks' names
  // chainId is not immediately available, but by this time we have run a transaction
  let l1net, l2net;
  if (ethers.provider._network.chainId == 10) {
    // mainnet
    l1net = "ethereum"
    l2net = "optimism"
  } else {
    l1net = "goerli"
    l2net = "tokamak-goerli"
  }

  // Output a usable `data.json`:
  console.log(`
{
    "name": "${L2TokenName}",
    "symbol": "${L2TokenSymbol}",
    "decimals": ${decimals},
    "tokens": {
      "${l2net}": {
        "address": "${L2TokenAddress}"
      }
    }
}
  `)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });