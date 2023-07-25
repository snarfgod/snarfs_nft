const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
const ether = tokens
describe('Crowdsale', async () => {
    let crowdsale, token, accounts, deployer, user1
    let name, symbol, max_supply
    let startTime, endTime
    let minPurchase, maxPurchase
    

    beforeEach(async () => {
        name = 'Snarfcoin'
        symbol = 'SNARF'
        max_supply = ethers.utils.parseUnits('1000000', 'ether')
        startTime = (await ethers.provider.getBlock('latest')).timestamp + 5
        endTime = (await ethers.provider.getBlock('latest')).timestamp + 999999999
        minPurchase = 1;
        maxPurchase = 10000;
        //Load contracts
        const Crowdsale = await ethers.getContractFactory('Crowdsale')
        const Token = await ethers.getContractFactory('Token')   
        //Deploy token contract   
        token = await Token.deploy(name, symbol, max_supply)
        //Get accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user1 = accounts[1]
        //Deploy crowdsale contract
        crowdsale = await Crowdsale.deploy(token.address, ether(1), max_supply, startTime, endTime)
        //Send tokens to crowdsale contract
        let transaction = await token.connect(deployer).transfer(crowdsale.address, max_supply)
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
            expect(await crowdsale.maxTokens()).to.equal(max_supply)
        })
        it('sets owner', async () => {
            expect(await crowdsale.owner()).to.equal(deployer.address)
        })
        it('sets start time', async () => {
            expect(await crowdsale.startTime()).to.equal(startTime)
        })
        it('sets end time', async () => {
            expect(await crowdsale.endTime()).to.equal(endTime)
        })
    }) 
    
    describe('Buying tokens', () => {
        let amount = tokens(10)
        let transaction, result
        describe('Success', async () => {

            beforeEach(async () => {
                await crowdsale.connect(deployer).addToWhitelist(user1.address)
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

            beforeEach(async () => {
                await crowdsale.connect(deployer).addToWhitelist(user1.address)
            })
            
            it('rejects incorrect purchase amount', async () => {
                await expect(crowdsale.connect(user1).buyTokens(amount, {value: ether(0)})).to.be.reverted
            })
            it('rejects when more than what contract contains', async () => {
                await expect(crowdsale.connect(user1).buyTokens(tokens(100000000000), {value: ether(1)})).to.be.reverted
            })
            it('rejects when outside of the purchase limits', async () => {
                await expect(crowdsale.connect(user1).buyTokens(tokens(10001), {value: ether(1)})).to.be.reverted
            })
            it('rejects when buying less than 1 token', async () => {
                await expect(crowdsale.connect(user1).buyTokens(tokens(0), {value: ether(1)})).to.be.reverted
            })
        

        })
    })
    describe('Sending ETH', async () => {
        let amount = tokens(10)
        let transaction, result

        beforeEach(async () => {
            await crowdsale.connect(deployer).addToWhitelist(user1.address)
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
    describe('Sets Price', async () => {
        let transaction, result
        let newPrice = ether(2)
        describe('Success', async () => {
            beforeEach(async () => {
                transaction = await crowdsale.connect(deployer).setPrice(newPrice)
                result = await transaction.wait()
            })
            it('updates price', async () => {
                expect(await crowdsale.price()).to.equal(newPrice)
            })
            it('emits a correct event', async () => {
                expect(transaction).to.emit(crowdsale, 'PriceSet').withArgs(newPrice)
            })
        })
        describe('Failure', async () => {
            it('only allows the owner to call', async() => {
                await expect(crowdsale.connect(user1).setPrice(newPrice)).to.be.reverted
            })
        })
    })
    describe('Finalizing Sale', async () => {
        let transaction, result
        let amount = tokens(10)
        let value = ether(10)

        describe('Success', async () => {
            beforeEach(async () => {
                await crowdsale.connect(deployer).addToWhitelist(user1.address)

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
                await crowdsale.connect(deployer).addToWhitelist(user1.address)
                transaction = await crowdsale.connect(user1).buyTokens(amount, {value: value})
                result = await transaction.wait()
            })
            it('only allows the owner to call', async() =>{
                await expect(crowdsale.connect(user1).finalize()).to.be.reverted
            })
        })
    })
    describe('Whitelist', () => {
        let amount = tokens(10)

        describe('Success', async () => {
            

            beforeEach(async () => {
                await crowdsale.connect(deployer).addToWhitelist(user1.address)
            })

            it('adds user to whitelist', async () => {            
                expect(await crowdsale.whitelist(user1.address)).to.equal(true)
            })
            it('allows whitelisted users to buy tokens during sale', async () => {
                const transaction = await crowdsale.connect(user1).buyTokens(amount, {value: ether(10)})
                const result = await transaction.wait()
                expect(transaction).to.emit(crowdsale, 'Buy').withArgs(amount, user1.address)
            })

        })

        describe('Failure', async () => {
            it('only allows owner to add users to whitelist', async () => {
                await expect(crowdsale.connect(user1).addToWhitelist(user1.address)).to.be.reverted
            })
            it('prevents purchases from nonwhitelisted addresses', async () => {
                await expect(crowdsale.connect(user1).buyTokens(amount, {value: ether(10)})).to.be.reverted
            })
            it('prevents purchases outside of the sale', async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [(await ethers.provider.getBlock('latest')).timestamp + 1000000000000000]);
                await ethers.provider.send('evm_mine');

                await crowdsale.connect(deployer).addToWhitelist(user1.address)
                await expect(crowdsale.connect(user1).buyTokens(amount, {value: ether(10)})).to.be.reverted
            })
        })
        
    })  
})