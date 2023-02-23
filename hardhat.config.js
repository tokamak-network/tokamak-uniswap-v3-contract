require("@nomicfoundation/hardhat-toolbox");
require("@uniswap/hardhat-v3-deploy");

require("dotenv/config");
require("dotenv").config();

require("./tasks/interface");

module.exports = {
  defaultNetwork: "hardhat",
  live: false,
  networks: {
    hardhat: {
      chainId: 31337,
    },
    local: {
      chainId: 31337,
      url: `http://127.0.0.1:8545/`,
      timeout: 1000000,
      accounts: [`${process.env.PRIVATE_KEY}` ],
      // gas: 1
      // accounts: [`${process.env.PRIVATE_KEY}`,`${process.env.LOCAL_KEY}`,`${process.env.LOCAL_KEY2}`,`${process.env.LOCAL_KEY3}`,`${process.env.LOCAL_KEY4}`,`${process.env.LOCAL_KEY5}`,`${process.env.LOCAL_KEY6}`,`${process.env.LOCAL_KEY7}`]
    },
    goerli: {
      chainId: 5,
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      timeout: 200000,
      accounts: [`${process.env.PRIVATE_KEY}` ]
    },
    tokamakgoerli: {
      chainId: 5050,
      url: `https://goerli.optimism.tokamak.network`,
      timeout: 200000,
      accounts: [`${process.env.PRIVATE_KEY}` ]
    },
    // for mainnet
    'optimism': {
      chainId: 5,
      url: "https://mainnet.optimism.io",
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    // for testnet
    'optimism-goerli': {
      chainId: 420,
      url: `https://goerli.optimism.io`,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    // for the local dev environment
    'optimism-local': {
      url: "http://localhost:8545",
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
