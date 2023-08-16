const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('NFT', () => {
  const NAME = 'Snarfs'
  const SYMBOL = 'SN'
  const COST = ether(10)
  const MAX_SUPPLY = 10
  const BASE_URI = 'ipfs://QmUM7Ng6roZNXSpP9e31JTy54XzJzfpfCMRs8P1E9g9ZLP/'

  let nft,
      deployer,
      minter

  beforeEach(async () => {
    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    minter = accounts[1]
  })

  describe('Deployment', () => {
    const ALLOW_MINTING_ON = (Date.now() + 1200).toString().slice(0,10)

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
    })

    it('has correct name', async () => {
      expect(await nft.name()).to.equal(NAME)
    })
    it('has correct symbol', async () => {
      expect(await nft.symbol()).to.equal(SYMBOL)
    })
    it('has correct cost', async () => {
      expect(await nft.cost()).to.equal(COST)
    })
    it('has correct maximum supply', async () => {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY)
    })
    it('has correct mint time', async() => {
      expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON)
    })
    it('has correct baseURI', async () => {
      expect(await nft.baseURI()).to.equal(BASE_URI)
    })
    it('adds owner', async () => {
      expect(await nft.owner()).to.equal(deployer.address)
    })
  })


  describe('Minting', () => {
    let transaction, result

    describe('Success', async () => {

      const ALLOW_MINTING_ON = (Date.now()).toString().slice(0,10)

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()
      })

      it('updates total supply', async () => {
        expect(await nft.totalSupply()).to.equal(1)
      })
      it('updates contract ether balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST)
      })
      it('emits correct Mint event', async () => {
        await expect(transaction).to.emit(nft, 'Mint').withArgs(1, minter.address)
      })
      it('returns minter address', async () => {
        expect(await nft.ownerOf(1)).to.equal(minter.address)
      })
      it('returns total NFTs owned by minter', async () => {
        expect(await nft.balanceOf(minter.address)).to.equal(1)
      })
      it('returns IPFS URI', async () => {
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`)
      })
    })

    describe('Failure', async () => {

      it('rejects insufficient payment', async () => {
        const ALLOW_MINTING_ON = (Date.now()).toString().slice(0,10)

        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(1, {value: ether(1)})).to.be.reverted
      })
      it('rejects mint outside of allowed minting time', async () => {
        const ALLOW_MINTING_ON = new Date('May 26, 2030 18:00:00').getTime().toString().slice(0,10)

        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(1, {value: COST})).to.be.reverted
      })
      it('requires at least 1 NFT purchase', async () => {
        const ALLOW_MINTING_ON = (Date.now()).toString().slice(0,10)

        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(0, {value: ether(1)})).to.be.reverted
      })
      it('rejects mint above max supply', async () => {
        const ALLOW_MINTING_ON = (Date.now()).toString().slice(0,10)

        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(11, {value: ether(1)})).to.be.reverted
      })
      it('does not return URIs for invalid tokens', async () => {
        const ALLOW_MINTING_ON = (Date.now()).toString().slice(0,10)

        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.tokenURI('99')).to.be.reverted
      })
    })

  })

  describe('Displaying NFTs', () => {
    let transaction, result

    describe('Success', async () => {
      beforeEach(async() => {
        const ALLOW_MINTING_ON = (Date.now()).toString().slice(0,10)

        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        transaction = await nft.connect(minter).mint(3, {value:ether(30)})
        result = await transaction.wait()
      })
      it('returns all the NFTs for a given owner', async () => {
        let tokenIds = await nft.walletOfOwner(minter.address)
        expect(tokenIds.length).to.equal(3)
        expect(tokenIds[0].toString()).to.equal('1')
        expect(tokenIds[1].toString()).to.equal('2')
        expect(tokenIds[2].toString()).to.equal('3')
      })
    })
  })

  describe('Withdraws', () => {

    describe('Success', async () => {
      const ALLOW_MINTING_ON = (Date.now()).toString().slice(0,10)

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()

        transaction = await nft.connect(deployer).withdraw()
        result = await transaction.wait()
      })
      it('deducts contract balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(0)
      })
      it('sends funds to the owner', async () => {
        expect(await ethers.provider.getBalance(deployer.address)).to.be.greaterThan(COST)
      })
      it('emits correct Withdraw event', async () => {
        await expect(transaction).to.emit(nft, 'Withdraw').withArgs(COST, deployer.address)
      })
    })

    describe('Failure', async () => {
    })
  })
  describe('Price changes', () => {
    beforeEach(async () => {
      const ALLOW_MINTING_ON = (Date.now()).toString().slice(0,10)

      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
    })
    it('updates price', async () => {
      await nft.connect(deployer).setCost(ether(20))
      expect(await nft.cost()).to.equal(ether(20))
    })
  })
})
