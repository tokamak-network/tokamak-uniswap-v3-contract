const { ethers } = require("hardhat");

let config = {}

let deployed = {
    TON : "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2",
    WTON : "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3",
    TOS : "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    USDC : "0x713733bda7F5f9C15fd164242dF4d6292B412bAE",
    AURA : "0x3e7eF8f50246f725885102E8238CBba33F276747",
    DOC : "0x9e1028F5F1D5eDE59748FFceE5532509976840E0",
    LYDA : "0x3bB4445D30AC020a84c1b5A8A2C6248ebC9779D0",
    WETH : "0xF1B5DF98574C18d204fd91ec328f83Fca16337BE"
  }

let uniswapInfo = {
    poolfactory: "0x56F70e642886aAFEdc75ed7EEfA94dbbEbda280E",
    npm: "0x2a3507eDF83338D7952Af30446e1fEBBb8534B5E",
    swapRouter: "0xd8EF9699eBc5b8357cbAaAbCa8af40141180aaB2",
    wethUsdcPool: "",
    wtonWethPool: "",
    wtonTosPool: "",
    tosethPool: "",
    fee: ethers.BigNumber.from("3000"),
    NonfungibleTokenPositionDescriptor: "",
    Quoter: "0xdfBEf1c5D4e659B11E6A3e862487e390Dbba0bc5",
    QuoterV2: "0xbB4CD62E85eb9558BBC1b7b2cBFb15A55b347FbA",
    UniswapInterfaceMulticall: "0x2FC413d3883B477c846D006853C235E4F86e602D",
    weth9: "0xF1B5DF98574C18d204fd91ec328f83Fca16337BE",
    TickLens:"0xaFA02156194bDB040eE929F78cB218FF27Ec2335"
}

let networkName = "tokamak-goerli";

module.exports = {
    networkName, uniswapInfo, config, deployed
}