
require("dotenv/config");
require("dotenv").config();

let uniswapInfo_mainnet = {
    poolfactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    npm: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    wethUsdcPool: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
    wtonWethPool: "0xc29271e3a68a7647fd1399298ef18feca3879f59",
    wtonTosPool: "0x1c0ce9aaa0c12f53df3b4d8d77b82d6ad343b4e4",
    tosethPool: "0x2ad99c938471770da0cd60e08eaf29ebff67a92a",
    wton: "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2",
    tos: "0x409c4D8cd5d2924b9bc5509230d16a61289c8153",
    weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    usdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    fee: 3000,
    NonfungibleTokenPositionDescriptor: "0x91ae842A5Ffd8d12023116943e72A606179294f3",
    UniswapV3Staker: "0xe34139463bA50bD61336E0c446Bd8C0867c6fE65",
    ton: "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5",
    lockTOSaddr: "0x69b4A202Fa4039B42ab23ADB725aA7b1e9EEBD79"
}


// goerli
let uniswapInfo_goerli = {
    poolfactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    npm: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    wethUsdcPool: "",
    wtonWethPool: "",
    wtonTosPool: "",
    tosethPool: "0x3b466f5d9b49aedd65f6124d5986a9f30b1f5442",
    wton: "",
    tos: "0x67F3bE272b1913602B191B3A68F7C238A2D81Bb9",
    weth: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    usdc: "",
    fee: 3000,
    NonfungibleTokenPositionDescriptor: "0x91ae842A5Ffd8d12023116943e72A606179294f3",
    UniswapV3Staker: "0xe34139463bA50bD61336E0c446Bd8C0867c6fE65",
    ton: "",
    lockTOSaddr: "0x770e0d682277A4a9167971073f1Aa6d6403bb315"
}

let uniswapInfo_tokamakgoerli = {
    poolfactory: "0xcad3A069a1E4607eA204A889FDEbF29B4aC78F00",
    npm: "0x8A17F0454684C443a8e65813493Bf7Ed4501Ba99",
    swapRouter: "0xE8F5B90FEc34B16fcf5AFD2e9B9c9525307f55a0",
    wethUsdcPool: "",
    wtonWethPool: "",
    wtonTosPool: "",
    tosethPool: "",
    wton: "",
    tos: "",
    weth: "0x67F3bE272b1913602B191B3A68F7C238A2D81Bb9",
    usdc: "0xD08a2917653d4E460893203471f0000826fb4034",
    fee: 3000,
    NonfungibleTokenPositionDescriptor: "0xDC517250D682186e2fCedF378d4A4aAC43C4F15b",
    UniswapV3Staker: "",
    ton: "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2",
    lockTOSaddr: "",
    L2StandardTokenFactory: "0x4200000000000000000000000000000000000012"
}

// let uniswapInfo_tokamakgoerli = {
//     poolfactory: "0xcad3A069a1E4607eA204A889FDEbF29B4aC78F00",
//     npm: "0x8A17F0454684C443a8e65813493Bf7Ed4501Ba99",
//     swapRouter: "0xE8F5B90FEc34B16fcf5AFD2e9B9c9525307f55a0",
//     wethUsdcPool: "",
//     wtonWethPool: "",
//     wtonTosPool: "",
//     tosethPool: "",
//     wton: "",
//     tos: "",
//     weth: "0x67F3bE272b1913602B191B3A68F7C238A2D81Bb9",
//     usdc: "0xD08a2917653d4E460893203471f0000826fb4034",
//     fee: 3000,
//     NonfungibleTokenPositionDescriptor: "0x712489e2D3ed9026702f72E34270c7e05ba1d003",
//     UniswapV3Staker: "",
//     ton: "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2",
//     lockTOSaddr: ""
// }
let uniswapInfo = {
    "mainnet": uniswapInfo_mainnet,
    "goerli" : uniswapInfo_goerli,
    "tokamakgoerli": uniswapInfo_tokamakgoerli
}

const bridge = {
    l1Bridge: "0x7377F3D0F64d7a54Cf367193eb74a052ff8578FD",
    l2Bridge: "0x4200000000000000000000000000000000000010"
  }

const rpc_ndoe = {
    l1Url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
    l2Url:  `https://goerli.optimism.tokamak.network`
}
const ERC20ABI = [
    // balanceOf
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
    // approve
    {
      constant: true,
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" }],
      name: "approve",
      outputs: [{ name: "", type: "bool" }],
      type: "function",
    },
    // faucet
    {
      inputs: [],
      name: "faucet",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ]    // erc20ABI

  const BridgeABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "deposits",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
module.exports = {
    uniswapInfo,
    bridge,
    rpc_ndoe,
    ERC20ABI,
    BridgeABI
}