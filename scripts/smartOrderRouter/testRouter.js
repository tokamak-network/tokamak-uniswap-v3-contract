const { AlphaRouter } = require('@uniswap/smart-order-router');
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const { ethers, BigNumber } = require('ethers')
const JSBI  = require('jsbi') // jsbi@3.2.5

const V3_SWAP_ROUTER02 = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'

require('dotenv').config()
const WALLET_ADDRESS = '0xB68AA9E398c054da7EBAaA446292f611CA0CD52B'
const WALLET_SECRET = process.env.PRIVATE_KEY1
const INFURA_TEST_URL = `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`

const web3Provider = new ethers.providers.JsonRpcProvider(INFURA_TEST_URL)

const chainId = 5
const router = new AlphaRouter({ chainId: chainId, provider: web3Provider})

const name0 = 'Tokamak Network Ton'
const symbol0 = 'TON'
const decimals0 = 18
const address0 = '0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00'

const name1 = 'TONStarter'
const symbol1 = 'TOS'
const decimals1 = 18
const address1 = '0x67F3bE272b1913602B191B3A68F7C238A2D81Bb9'

const TON = new Token(chainId, address0, decimals0, symbol0, name0)
const TOS = new Token(chainId, address1, decimals1, symbol1, name1)

const wei = ethers.utils.parseUnits('0.01', 18)
const inputAmount = CurrencyAmount.fromRawAmount(TON, JSBI.BigInt(wei))

async function main() {
    console.log("what");
  const route = await router.route(
    inputAmount,
    TOS,
    TradeType.EXACT_INPUT,
    {
      type : 1, //SwapRouter02
      recipient: WALLET_ADDRESS,
      slippageTolerance: new Percent(50, 100),
      deadline: Date.now() + 180000,
    }
  )
  console.log(route.route);
  console.log(`Quote Exact In: ${route.quote.toFixed(10)}`)

  const transaction = {
    data: route.methodParameters.calldata,
    to: V3_SWAP_ROUTER02,
    value: BigNumber.from(route.methodParameters.value),
    from: WALLET_ADDRESS,
    gasPrice: BigNumber.from(route.gasPriceWei),
    gasLimit: ethers.utils.hexlify(1000000)
  }

  const wallet = new ethers.Wallet(WALLET_SECRET)
  const connectedWallet = wallet.connect(web3Provider)

  const approvalAmount = ethers.utils.parseUnits('100', 18).toString()
  const ERC20ABI = require('./abi.json')
  const contract0 = new ethers.Contract(address0, ERC20ABI, web3Provider)
//   await contract0.connect(connectedWallet).approve(
//     V3_SWAP_ROUTER02,
//     approvalAmount
//   )

  //const tradeTransaction = await connectedWallet.sendTransaction(transaction)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  