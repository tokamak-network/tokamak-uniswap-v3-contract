// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

const L2StandardTokenFactoryArtifact = require(`../node_modules/@eth-optimism/contracts/artifacts/contracts/L2/messaging/L2StandardTokenFactory.sol/L2StandardTokenFactory.json`);
const ERC20Artifact = require('../node_modules/@openzeppelin/contracts/build/contracts/ERC20.json')

async function main() {
//   const L1TokenAddress = "0x67F3bE272b1913602B191B3A68F7C238A2D81Bb9";
//   const L2TokenName = "TOS";
//   const L2TokenSymbol = "TOS";

  const L1TokenAddress = "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6";
  const L2TokenName = "WTON";
  const L2TokenSymbol = "WTON";

  console.log(
    "Creating instance of L2StandardERC20 on",
    hre.network.name,
    "network"
  );

  // Instantiate the Standard token factory
  const l2StandardTokenFactory = new ethers.Contract(
    "0x4200000000000000000000000000000000000012",
    L2StandardTokenFactoryArtifact.abi,
    await ethers.getSigner()
  );

  const tx = await l2StandardTokenFactory.createStandardL2Token(
    L1TokenAddress,
    L2TokenName,
    L2TokenSymbol
  );

  const receipt = await tx.wait();
  const args = receipt.events.find(
    ({ event }) => event === "StandardL2TokenCreated"
  ).args;

  // Get the L2 token address from the emmited event and log
  const l2TokenAddress = args._l2Token;

  // Get the number of decimals
  const erc20 = new ethers.Contract(
    l2TokenAddress,
    ERC20Artifact.abi,
    ethers.provider
  );
  const decimals = await erc20.decimals()

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
      "${l1net}": {
        "address": "${L1TokenAddress}"
      },
      "${l2net}": {
        "address": "${l2TokenAddress}"
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