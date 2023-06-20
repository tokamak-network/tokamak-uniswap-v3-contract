const fs = require("fs");
const ethers = require('ethers');
const hre = require('hardhat');
const ERC20PresetFixedSupplyJson =  require("@openzeppelin/contracts/build/contracts/ERC20PresetFixedSupply.json")
const WETH9Json = require("./../../abis/WETH9.json");

//contractAddress
const chainName = hre.network.name;
let contractAddresses = JSON.parse(fs.readFileSync(__dirname+`/../../../deployed.uniswap.${chainName}.json`).toString()); 


const deployContract = async() => {
  if((chainName ==='localhost' || chainName ==='hardhat')){
    contractAddresses = JSON.parse(fs.readFileSync(__dirname+`/../../../deployed.uniswap.${chainName}.json`).toString());
    if(contractAddresses['TON'] === undefined){
      console.log(true);
      const accounts = await hre.ethers.getSigners();
      const deployer = accounts[0];
        let contractFactory = new ethers.ContractFactory(
          ERC20PresetFixedSupplyJson.abi,
          ERC20PresetFixedSupplyJson.bytecode,
          deployer
        );
        const TONcontract =  await contractFactory.deploy("TON", "TON", ethers.utils.parseEther('10000000000000'), deployer.address);
        const TOScontract =  await contractFactory.deploy("TOS", "TOS", ethers.utils.parseEther('10000000000000'), deployer.address);
        contractFactory = new ethers.ContractFactory(
          WETH9Json.abi,
          WETH9Json.bytecode,
          deployer
        )
        const WETHcontract =  await contractFactory.deploy();
        contractAddresses.TON = TONcontract.address;
        contractAddresses.TOS = TOScontract.address;
        contractAddresses.WETH = WETHcontract.address;
        fs.writeFileSync(__dirname+`/../../../deployed.uniswap.${chainName}.json`, JSON.stringify(contractAddresses, null, 2));
    }
  }
}

//Pool Create Parameter
const Fee = ethers.BigNumber.from('3000');

//Return Contract
const  getContract = async (contractName) => {
    const accounts = await hre.ethers.getSigners();
    const deployer = accounts[0];
    providers = hre.ethers.provider;
    contractAddresses = JSON.parse(fs.readFileSync(__dirname+`/../../../deployed.uniswap.${chainName}.json`).toString());
    
    let jsonFile;  
    if(contractName === 'TON' || contractName === 'TOS' || contractName ==='WETH'){
        jsonFile = JSON.parse(fs.readFileSync(__dirname+ '/../../abis//IERC20.json').toString());
    } else{
        jsonFile = JSON.parse(fs.readFileSync(__dirname+ `/../abis/${contractName}.sol/${contractName}.json`).toString());
    }
    if(chainName!=='localhost' && chainName !== 'hardhat'){
      contractAddresses.TON = '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2';
      contractAddresses.TOS = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';
      contractAddresses.WETH = '0x4200000000000000000000000000000000000006';    
    }
    let contractAddress = contractAddresses[contractName];
    
    let contractCode = await providers.getCode(
        contractAddress
      );
    if (contractCode === '0x'){
        console.log(contractName + 'Contract Code is null, exit');
        process.exit();
    }
    const contractFactory = new ethers.ContractFactory(
        jsonFile.abi,
        jsonFile.bytecode,
        deployer
    );
    const contract = contractFactory.attach(
    contractAddress
    );
    return contract;
}

//Return Pool Contract
const  getPoolContractAddress = async (UniswapV3FactoryContract, token0Address, token1Address) => {
    const poolAddress = await UniswapV3FactoryContract.getPool(token0Address, token1Address, Fee);  
  let poolCode = await providers.getCode(poolAddress);
  if (poolCode === '0x') {
    console.log('poolAddress is null, so you should deploy');
  } 
  return poolAddress;
}

module.exports = {
    ...contractAddresses, Fee, getContract, getPoolContractAddress, deployContract
  };