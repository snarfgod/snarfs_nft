const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
const ether = tokens
describe('Crowdsale', async () => {
    let crowdsale, token, accounts, deployer, user1

    beforeEach(async () => {
        //Load contracts
        const Crowdsale = await ethers.getContractFactory('Crowdsale')
        const Token = await ethers.getContractFactory('Token')   
        //Deploy token contract   
        token = await Token.deploy('Snarfcoin', 'SNARF', '1000000000000000000000000')
        //Get accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user1 = accounts[1]
        //Deploy crowdsale contract
        crowdsale = await Crowdsale.deploy(token.address, ether(1), '1000000')
        //Send tokens to crowdsale contract
        let transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000))
        await transaction.wait()
    })
    describe('Deployment', () => {
        
        it('sends tokens to the Crowdsale contract', async() => {
            expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(1000000))
        })
        it('returns token address', async () => {
            expect(await crowdsale.token()).to.equal(token.address)
        })
        it('returns correct price', async () => {
            expect(await crowdsale.price()).to.equal(ether(1))
        })
        it('sets maxTokens', async () => {
            expect(await crowdsale.maxTokens()).to.equal('1000000')
        })
        it('sets owner', async () => {
            expect(await crowdsale.owner()).to.equal(deployer.address)
        })
    })
    describe('Buying tokens', () => {
        let amount = tokens(10)
        let transaction, result
        describe('Success', async () => {

            beforeEach(async () => {
                transaction = await crowdsale.connect(user1).buyTokens(amount, {value: ether(10)})
                result = await transaction.wait()
            })
            it('transfers tokens', async () => {
                expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(999990))
                expect(await token.balanceOf(user1.address)).to.equal(amount)
            })
            it('updates tokensSold', async () => {
                expect(await crowdsale.tokensSold()).to.equal(amount)
            })
            it('updates contracts ether balance', async() => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(amount)
            })
            it('emits a buy event', async () => {
                expect(transaction).to.emit(crowdsale, 'Buy').withArgs(amount, user1.address)
            })
        })
        describe('Failure', async () => {
            
            it('rejects incorrect purchase amount', async () => {
                await expect(crowdsale.connect(user1).buyTokens(amount, {value: ether(0)})).to.be.reverted
            })
            it('rejects when more than what contract contains', async () => {
                await expect(crowdsale.connect(user1).buyTokens(tokens(100000000), {value: ether(1)})).to.be.reverted
            })
        

        })
    })
    describe('Sending ETH', async () => {
        let amount = tokens(10)
        let transaction, result

        beforeEach(async () => {
            transaction = await user1.sendTransaction({to:crowdsale.address, value:amount})
            result = await transaction.wait()
        })

        describe('Success', () => {
            it('updates contracts ether balance', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(amount)
            })
            it('updates user balance', async () => {
                expect(await token.balanceOf(user1.address)).to.equal(amount)
            })
        })    
    })
    describe('Finalizing Sale', async () => {
        let transaction, result
        let amount = tokens(10)
        let value = ether(10)

        describe('Success', async () => {
            beforeEach(async () => {
                transaction = await crowdsale.connect(user1).buyTokens(amount, {value: value})
                result = await transaction.wait()

                transaction = await crowdsale.connect(deployer).finalize()
                result = await transaction.wait()
            })
            it('Sends remaining tokens to deployer', async () => {
                expect(token.balanceOf(crowdsale.address)) == tokens(0)
                expect(token.balanceOf(deployer.address)) == tokens(999990)
            })
            it('Sends ETH to owner', async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)) == ether(0)
            })
            it('emits a correct finalization event', async () => {
                expect(transaction).to.emit(crowdsale, 'Finalized').withArgs(amount, value)
            })
        })
        describe('Failure', async () => {
            beforeEach(async () => {
                transaction = await crowdsale.connect(user1).buyTokens(amount, {value: value})
                result = await transaction.wait()
            })
            it('only allows the owner to call', async() =>{
                await expect(crowdsale.connect(user1).finalize()).to.be.reverted
            })
        })
    })
})