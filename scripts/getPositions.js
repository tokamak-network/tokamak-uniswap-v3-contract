const axios = require('axios');
const SUBGRAPH_URL =
  'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';
require('dotenv').config();

TOKEN_IDS_QUERY = `
    {
        positions(where: {owner: "0xB68AA9E398c054da7EBAaA446292f611CA0CD52B", pool: "0x2Ac6775A08327E6ce91aA7389090472327d367ED"}) {
            id
            owner
          }
    }
`;
async function main() {
  const result = await axios.post(SUBGRAPH_URL, { query: TOKEN_IDS_QUERY });
  const positions = result.data.data.positions;
  console.log(positions);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
