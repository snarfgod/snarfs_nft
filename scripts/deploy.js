// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const NAME = 'Snarfcoin'
    const SYMBOL = 'SNARF'
    const MAX_SUPPLY = '1000000000000000000000000'
    const PRICE = ethers.utils.parseUnits('.025', 'ether')
    
    const Token = await hre.ethers.getContractFactory("Token");
    let token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY);

    await token.deployed();
    console.log("Token deployed to:", token.address);

    const Crowdsale = await hre.ethers.getContractFactory("Crowdsale");
    let crowdsale = await Crowdsale.deploy(token.address, PRICE, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'));
    await crowdsale.deployed();
    console.log("Crowdsale deployed to:", crowdsale.address);

    const transaction = await token.transfer(crowdsale.address, ethers.utils.parseUnits('1000000', 'ether'));
    await transaction.wait();
    console.log("Transfered tokens to crowdsale");

    console.log(await token.balanceOf(crowdsale.address));
    console.log(transaction);
    console.log(await token.balanceOf(token.address));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
