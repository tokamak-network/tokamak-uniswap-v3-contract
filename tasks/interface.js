// const conf = require("./config");
// // const { ethers } = require("hardhat");
// const optimismSDK = require("@zena-park/tokamak-sdk")
// const { computePoolAddress } = require("@uniswap/v3-sdk")
// const { SupportedChainId, Token } = require("@uniswap/sdk-core")
// // const ERC20Artifact = require("./abis/ERC20.json");
// // const IUniswapV3PoolABI = require("./abis/UniswapV3Pool.json");
// // const { ethers } = require("hardhat");

// const getSigners = async () => {
//     const l1RpcProvider = new ethers.providers.JsonRpcProvider(conf.rpc_ndoe.l1Url)
//     const l2RpcProvider = new ethers.providers.JsonRpcProvider(conf.rpc_ndoe.l2Url)
//     const privateKey = process.env.PRIVATE_KEY
//     const l1Wallet = new ethers.Wallet(privateKey, l1RpcProvider)
//     const l2Wallet = new ethers.Wallet(privateKey, l2RpcProvider)

//     return [l1Wallet, l2Wallet]
// }   // getSigners

// const setup = async(l1Addr, l2Addr) => {
//     const [l1Signer, l2Signer] = await getSigners()
//     ourAddr = l1Signer.address
//     console.log('ourAddr', ourAddr);

//     crossChainMessenger = new optimismSDK.CrossChainMessenger({
//         l1ChainId: 5,    // Goerli value, 1 for mainnet
//         l2ChainId: 5050,  // Goerli value, 10 for mainnet
//         l1SignerOrProvider: l1Signer,
//         l2SignerOrProvider: l2Signer
//     })

//     // console.log('crossChainMessenger',crossChainMessenger);

//     l1Bridge = new ethers.Contract(conf.bridge.l1Bridge, conf.BridgeABI, l1Signer)

//     console.log('l1Addr', l1Addr);

//     l1ERC20 = new ethers.Contract(l1Addr, conf.ERC20ABI, l1Signer)
//     l2ERC20 = new ethers.Contract(l2Addr, conf.ERC20ABI, l2Signer)
//     erc20Addrs = {
//         l1Addr : l1Addr,
//         l2Addr : l2Addr
//     }
// }    // setup

// const reportBridgeBalances = async (l1Addr, l2Addr) => {
//     const decimals = await l1ERC20.decimals()
//     const deposits = (await l1Bridge.deposits(l1Addr, l2Addr)).toString().slice(0,-1*decimals)

//     console.log(`deposits in Bridge : ${deposits} `)
//     return

//   }

// const reportERC20Balances = async () => {

//     const l1Decimals = await l1ERC20.decimals()
//     const l2Decimals = await l2ERC20.decimals()
//     // console.log(`l1Decimals:${l1Decimals} `)
//     // console.log(`l2Decimals:${l2Decimals} `)

//     const l1Balance = (await l1ERC20.balanceOf(ourAddr)).toString().slice(0,-1*l1Decimals.toNumber())
//     const l2Balance = (await l2ERC20.balanceOf(ourAddr)).toString().slice(0,-1*l2Decimals.toNumber())

//     console.log(`ourAddr:${ourAddr} `)
//     console.log(`OUTb on L1:${l1Balance}     OUTb on L2:${l2Balance}`)

//     if (l1Balance != 0) {
//       return
//     }
// }

// const depositERC20 = async (amount) => {
//     console.log(`\n`)
//     console.log("Deposit ERC20")
//     await reportERC20Balances()
//     console.log(`\n`)

//     const start = new Date()
//     // let depositAmount = ethers.utils.parseEther(amount)
//     let depositAmount = amount

//     // Need the l2 address to know which bridge is responsible
//     const allowanceResponse = await crossChainMessenger.approveERC20(
//       erc20Addrs.l1Addr, erc20Addrs.l2Addr, depositAmount)
//     await allowanceResponse.wait()
//     console.log(`Allowance given by tx ${allowanceResponse.hash}`)
//     console.log(`\tMore info: https://goerli.etherscan.io/tx/${allowanceResponse.hash}`)
//     console.log(`Time so far ${(new Date()-start)/1000} seconds`)
//     console.log(`\n`)
//     const response = await crossChainMessenger.depositERC20(
//       erc20Addrs.l1Addr, erc20Addrs.l2Addr, depositAmount)
//     console.log(`Deposit transaction hash (on L1): ${response.hash}`)
//     console.log(`\tMore info: https://goerli.etherscan.io/tx/${response.hash}`)
//     await response.wait()
//     console.log("Waiting for status to change to RELAYED")
//     console.log(`Time so far ${(new Date()-start)/1000} seconds`)
//     await crossChainMessenger.waitForMessageStatus(response.hash, optimismSDK.MessageStatus.RELAYED)

//     console.log(`depositERC20 took ${(new Date()-start)/1000} seconds\n\n`)
//     await reportERC20Balances()
//     console.log(`\n`)

//   }     // depositERC20()

// task("deposit-erc20-l1-to-l2", "Deposit ERC20")
//     .addParam("l1TokenAddress", "L1 Token Address")
//     .addParam("l2TokenAddress", "L2 Token Address")
//     .addParam("amount", "Amount")
//     .setAction(async ({l1TokenAddress, l2TokenAddress, amount}) => {
//         console.log(l1TokenAddress, l2TokenAddress, amount)

//         const MessageDirection = {
//             L1_TO_L2: 0,
//             L2_TO_L1: 1,
//         }

//         await setup(l1TokenAddress, l2TokenAddress)
//         await reportBridgeBalances(l1TokenAddress, l2TokenAddress)
//         // await reportERC20Balances()
//         await depositERC20(amount)

//         await reportBridgeBalances(l1TokenAddress, l2TokenAddress)
//     })

// task("register-erc20-l2", "Create Pool")
//     .addParam("networkName", "Network Name")
//     .addParam("l1TokenAddress", "L1 Token Address")
//     .addParam("tokenName", "Token Name")
//     .addParam("tokenSymbol", "Token Symbol")
//     .setAction(async ({ networkName, l1TokenAddress, tokenName, tokenSymbol }) => {
//         console.log(networkName, l1TokenAddress, tokenName, tokenSymbol )
//         console.log(conf.uniswapInfo[networkName])
//         const accounts = await ethers.getSigners();
//         const account = accounts[0];

//         const L2StandardTokenFactory_ABI = require("./abis/L2StandardTokenFactory.json");
//         const ERC20Artifact = require("./abis/ERC20.json");
//         const L2StandardTokenFactory = new ethers.Contract(
//             "0x4200000000000000000000000000000000000012",
//             L2StandardTokenFactory_ABI.abi,
//             account);

//         try {
//            let tx = await L2StandardTokenFactory.connect(account).createStandardL2Token(
//                 l1TokenAddress,
//                 tokenName,
//                 tokenSymbol,
//                 {
//                     gasLimit: "1500000"
//                 }
//             );
//             console.log("tx", tx);

//             const receipt = await tx.wait();
//             const args = receipt.events.find(
//                 ({ event }) => event === "StandardL2TokenCreated"
//             ).args;

//             // Get the L2 token address from the emmited event and log
//             const l2TokenAddress = args._l2Token;

//             // Get the number of decimals
//             const erc20 = new ethers.Contract(
//                 l2TokenAddress,
//                 ERC20Artifact.abi,
//                 ethers.provider
//             );
//             const decimals = await erc20.decimals()

//             // Get the networks' names
//             // chainId is not immediately available, but by this time we have run a transaction
//             let l1net, l2net;
//             l1net = "goerli"
//             l2net = "tokamak-goerli"

//             // Output a usable `data.json`:
//             console.log(`
//             {
//                 "name": "${tokenName}",
//                 "symbol": "${tokenSymbol}",
//                 "decimals": ${decimals},
//                 "tokens": {
//                 "${l1net}": {
//                     "address": "${l1TokenAddress}"
//                 },
//                 "${l2net}": {
//                     "address": "${l2TokenAddress}"
//                 }
//                 }
//             }
//             `)

//         } catch(e) {
//             console.log("err", e)
//         }

//     })

// task("get-receipt", "Create Pool")
//     .addParam("transactionHash", "Transaction Hash")
//     .setAction(async ({transactionHash }) => {
//         console.log(transactionHash)

//         try {
//             const receipt = await ethers.provider.getTransactionReceipt(transactionHash);
//             console.log(receipt)
//             /*
//             //==
//             const accounts = await ethers.getSigners();
//             const account = accounts[0];
//             const L2StandardTokenFactory_ABI = require("./abis/L2StandardTokenFactory.json");
//             const L2StandardTokenFactory = new ethers.Contract(
//                 "0x4200000000000000000000000000000000000012",
//                 L2StandardTokenFactory_ABI.abi,
//                 account);

//             let interface = L2StandardTokenFactory.interface;

//             let data = receipt.logs[0].data;
//             let topics = receipt.logs[0].topics;
//             let log = interface.parseLog( {  data,  topics } );
//             console.log(log.args._l2Token);
//             */
//         } catch(e) {
//             console.log("err", e)
//         }
//     })

// task("view-lp-token", "View LP Token")
//     .addParam("networkName", "Network Name")
//     .addParam("tokenId", "Token Id")
//     .setAction(async ({ networkName, tokenId }) => {
//         console.log(networkName, tokenId)
//         const accounts = await ethers.getSigners();
//         const account = accounts[0];
//         const NPM_ABI = require("./abis/NonfungiblePositionManager.json");
//         let addressConfig  ;
//         if (networkName == "mainnet") addressConfig = conf.uniswapInfo.mainnet;
//         else if (networkName == "tokamakgoerli") addressConfig = conf.uniswapInfo.tokamakgoerli;
//         else if (networkName == "goelri") addressConfig = conf.uniswapInfo.goelri;
//         console.log("addressConfig.npm", addressConfig.npm)

//         const NpmContract = new ethers.Contract(addressConfig.npm, NPM_ABI.abi, account);

//         try {
//             let ownerOf = await NpmContract.ownerOf(ethers.BigNumber.from(tokenId));
//             console.log("ownerOf", ownerOf)

//             let positions = await NpmContract.positions(ethers.BigNumber.from(tokenId));
//             console.log("positions", positions)

//         } catch(e) {
//             console.log("err", e)
//         }

//     })

// task("balances-ether", "Balance")
//     .addParam("account", "Account")
//     .setAction(async ({ account }) => {
//         // const accounts = await ethers.getSigners();
//         // const deployer = accounts[0];

//         let bal = await ethers.provider.getBalance(account) ;
//         console.log(bal);
//         return bal
//     })

// task("create-pool-using-npm", "Create Pool Using NPM")
//     .addParam("networkName", "Network Name")
//     .addParam("token0", "Token0")
//     .addParam("token1", "Token1")
//     .addParam("fee", "Fee")
//     .addParam("token0Decimal", "Token0 Decimal")
//     .addParam("token1Decimal", "Token1 Decimal")
//     .addParam("token0Amount", "Token0 Amount for Price")
//     .addParam("token1Amount", "Token1 Amount for Price")
//     .setAction(async ({ networkName, token0, token1, fee, token0Decimal, token1Decimal, token0Amount, token1Amount}) => {
//         console.log(networkName, token0, token1, fee, token0Decimal, token1Decimal,  token0Amount, token1Amount)
//         const ERC20Artifact = require("./abis/ERC20.json");
//         const IUniswapV3PoolABI = require("./abis/UniswapV3Pool.json");

//         const accounts = await ethers.getSigners();
//         const account = accounts[0];
//         const NPM_ABI = require("./abis/NonfungiblePositionManager.json");
//         let addressConfig  ;
//         if (networkName == "mainnet") addressConfig = conf.uniswapInfo.mainnet;
//         else if (networkName == "tokamakgoerli") addressConfig = conf.uniswapInfo.tokamakgoerli;
//         else if (networkName == "goerli") addressConfig = conf.uniswapInfo.goerli;
//         console.log("addressConfig.npm", addressConfig.npm)

//         let TOKEN0 = new Token(
//             5,
//             token0,
//             18,
//             '',
//             ''
//         )
//         let TOKEN1 = new Token(
//             5,
//             token1,
//             18,
//             '',
//             ''
//         )
//         // Get the number of decimals
//         const token0Contract = new ethers.Contract(
//             token0,
//             ERC20Artifact.abi,
//             account
//         );
//         TOKEN0.decimals = await token0Contract.decimals();
//         TOKEN0.symbol = await token0Contract.symbol();
//         TOKEN0.name = await token0Contract.name();

//         const token1Contract = new ethers.Contract(
//             token1,
//             ERC20Artifact.abi,
//             account
//         );
//         TOKEN1.decimals = await token1Contract.decimals();
//         TOKEN1.symbol = await token1Contract.symbol();
//         TOKEN1.name = await token1Contract.name();
//         console.log("TOKEN0", TOKEN0);
//         console.log("TOKEN1", TOKEN1);

//         const currentPoolAddress = computePoolAddress({
//             factoryAddress: conf.uniswapInfo[networkName].poolfactory,
//             tokenA: TOKEN0,
//             tokenB: TOKEN1,
//             fee: ethers.BigNumber.from(fee),
//         })
//         console.log("currentPoolAddress", currentPoolAddress)

//         let code = await ethers.provider.getCode(currentPoolAddress)
//         console.log("code", code)
//         const univ3prices = require('@thanpolas/univ3prices');
//         console.log("addressConfig.npm", addressConfig.npm)

//         if (code == '0x') {
//             const NpmContract = new ethers.Contract(addressConfig.npm, NPM_ABI.abi, account);

//             try {
//                 const sqrtPrice = univ3prices.utils.encodeSqrtRatioX96(parseInt(token0Amount), parseInt(token1Amount));
//                 const price = univ3prices([token0Decimal, token1Decimal], sqrtPrice).toAuto();
//                 console.log('sqrtPrice', sqrtPrice.toString());
//                 console.log('price', price);
//                 /*
//                 let tx = await NpmContract.createAndInitializePoolIfNecessary(
//                     token0,
//                     token1,
//                     ethers.BigNumber.from(fee),
//                     ethers.BigNumber.from(sqrtPrice.toString()),
//                     {
//                         gasLimit: "2000000"
//                     }
//                 );

//                 console.log('createAndInitializePoolIfNecessary tx', tx);

//                 await tx.wait();
//                     */
//             } catch(e) {
//                 console.log("err", e)
//             }
//         } else {
//             const poolContract = new ethers.Contract(
//                 currentPoolAddress,
//                 IUniswapV3PoolABI.abi,
//                 account
//             )
//             const token0 = await poolContract.token0()
//             console.log("token0 ", token0);
//             const token1 = await poolContract.token1()
//             console.log("token1 ", token1);

//             const slot0After = await poolContract.slot0()
//             console.log("slot0After ", slot0After);

//             // const sqrtPrice = univ3prices.utils.encodeSqrtRatioX96(parseInt(token0Amount), parseInt(token1Amount));
//             const price = univ3prices([18, 18], slot0After.sqrtPriceX96).toAuto();
//             console.log(price);

//         }

//     })
