const axios = require('axios');
const SUBGRAPH_URL =
  'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3?source=uniswap';
require('dotenv').config();

TOKEN_IDS_QUERY = `
query pools {
  pools(
    where: {id_in: [
      "0x8c0411f2ad5470a66cb2e9c64536cfb8dcd54d51", "0x86d257cdb7bc9c0df10e84c8709697f92770b335",
      "0x055284a4ca6532ecc219ac06b577d540c686669d", "0x277667eb3e34f134adf870be9550e9f323d0dc24",
      "0xa850478adaace4c08fc61de44d8cf3b64f359bec", "0xf8dbd52488978a79dfe6ffbd81a01fc5948bf9ee",
    ]}
    orderBy: totalValueLockedUSD
    orderDirection: desc
    subgraphError: allow
  ) {
    id
    feeTier
    liquidity
    sqrtPrice
    tick
    token0 {
      id
      symbol
      name
      decimals
      derivedETH
      __typename
    }
    token1 {
      id
      symbol
      name
      decimals
      derivedETH
      __typename
    }
    token0Price
    token1Price
    volumeUSD
    volumeToken0
    volumeToken1
    txCount
    totalValueLockedToken0
    totalValueLockedToken1
    totalValueLockedUSD
    __typename
  }
  bundles(where: {id: "1"}) {
    ethPriceUSD
    __typename
  }
}


`;
async function main() {
  const result = await axios.post(SUBGRAPH_URL, { query: TOKEN_IDS_QUERY });
  const pools = result.data.data.pools;
  let sum = 0n;
  const ethPriceUSD = parseFloat(result.data.data?.bundles?.[0]?.ethPriceUSD)
  for (let i = 0; i < pools.length; i++) {
    //sum of totalValueLockedUSD
    //const totalValueLockedUSD = Math.floor(pools[i].totalValueLockedUSD * 1);
    const feePercent = parseFloat(pools[i].feeTier) / 10000 / 100 
    const tvlAdjust0 = (parseFloat(pools[i].volumeToken0) * feePercent) / 2
    const tvlAdjust1 = (parseFloat(pools[i].volumeToken1) * feePercent) / 2 
    const tvlToken0 =parseFloat(pools[i].totalValueLockedToken0) - tvlAdjust0 
    const tvlToken1 =  parseFloat(pools[i].totalValueLockedToken1) - tvlAdjust1 
    let tvlUSD = parseFloat(pools[i].totalValueLockedUSD)

    // Part of TVL fix
    const tvlUpdated = tvlToken0 * parseFloat(pools[i].token0.derivedETH) * ethPriceUSD + tvlToken1 * parseFloat(pools[i].token1.derivedETH) * ethPriceUSD
    if (tvlUpdated) {
      tvlUSD = tvlUpdated
    }
    sum += BigInt(Math.floor(tvlUSD));
  }


  console.log('Total Value Locked in USD: ', sum.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
