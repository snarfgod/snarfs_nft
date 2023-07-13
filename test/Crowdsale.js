const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Crowdsale', async () => {
    let crowdsale, token

    beforeEach(async () => {
        const Crowdsale = await ethers.getContractFactory('Crowdsale')
        const Token = await ethers.getContractFactory('Token')
        
        token = await Token.deploy('Snarfcoin', 'SNARF', '1000000000000000000000000')

        crowdsale = await Crowdsale.deploy(token.address)
    })
    describe('Deployment', () => {
        
        it('token has correct name', async () => {
            expect(await token.name()).to.eq('Snarfcoin')
        })
    })
})