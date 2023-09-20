require("@nomicfoundation/hardhat-toolbox");
require("@uniswap/hardhat-v3-deploy");
require("@tokamak-network/tokamak-uniswap-v3-deploy");
require("dotenv/config");
require("dotenv").config();
require("./tasks/interface");

module.exports = {
  defaultNetwork: "hardhat",
  live: false,
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        //url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY2}`,
        //blockNumber: 21186,
        //url:`https://goerli.optimism.tokamak.network`
        url: "https://rpc.titan.tokamak.network",
        //blockNumber: 1308,
        //url: 'https://rpc.titan-goerli.tokamak.network',
        //url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
        //url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
        //url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      },
    },
    localhost: {
      chainId: 31337,
      forking: {
        //url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
        //blockNumber: 21186,
        //url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
        url: "https://rpc.titan.tokamak.network",
        //blockNumber: 1308,
        //url: 'https://rpc.titan-goerli.tokamak.network',
        //url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
        //url:`https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY2}`,
        //url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      },
      accounts: [`${process.env.PRIVATE_KEY1}`],
      // gas: 1
      // accounts: [`${process.env.PRIVATE_KEY}`,`${process.env.LOCAL_KEY}`,`${process.env.LOCAL_KEY2}`,`${process.env.LOCAL_KEY3}`,`${process.env.LOCAL_KEY4}`,`${process.env.LOCAL_KEY5}`,`${process.env.LOCAL_KEY6}`,`${process.env.LOCAL_KEY7}`]
    },
    polygon: {
      chainId: 137,
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY2}`,
      accounts: [`${process.env.PRIVATE_KEY1}`],
    },
    goerli: {
      chainId: 5,
      //url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_GOERLI_KEY}`,
      timeout: 200000,
      accounts: [`${process.env.PRIVATE_KEY1}`],
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`${process.env.PRIVATE_KEY1}`],
      chainId: 11155111,
      blockConfirmations: 6,
    },
    tokamakgoerli: {
      chainId: 5050,
      url: `https://rpc.titan-goerli.tokamak.network`,
      timeout: 200000,
      accounts: [`${process.env.PRIVATE_KEY1}`],
    },
    titan: {
      url: "https://rpc.titan.tokamak.network",
      accounts: [`${process.env.PRIVATE_KEY1}`],
      chainId: 55004,
      gasPrice: 1000000000,
      deploy: ["deploy_titan"],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "tokamakgoerli",
        chainId: 5050,
        urls: {
          apiURL: "https://goerli.explorer.tokamak.network/api",
          browserURL: "https://goerli.explorer.tokamak.network",
        },
      },
      {
        network: "titan",
        chainId: 55004,
        urls: {
          apiURL: "https://explorer.titan.tokamak.network/api",
          browserURL: "https://explorer.titan.tokamak.network",
        },
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.7.6",
      },
    ],
  },
};
