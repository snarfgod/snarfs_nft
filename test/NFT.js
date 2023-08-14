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

        transaction = await nft.connect(minter).mint(1, {value: COST})
        result = await transaction.wait()
      })

      it('updates total supply', async () => {
        expect(await nft.totalSupply()).to.equal(1)
      })
      it('updates contract ether balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST)
      })

    })

    describe('Failure', async () => {
    })

  })

  describe('Displaying NFTs', () => {
  })

  describe('Minting', () => {

    describe('Success', async () => {
    })

    describe('Failure', async () => {
    })
  })
})
