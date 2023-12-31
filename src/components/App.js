import { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Countdown from 'react-countdown'
import { ethers } from 'ethers'

// IMG
import preview from '../5aabd603b432ce003ef39b982216c1c88b3b5a14.png';

// Components
import Navigation from './Navigation';
import Data from './Data';
import Mint from './Mint';
import Loading from './Loading';
import Admin from './Admin';

// ABIs: Import your contract ABIs here
import NFT_ABI from '../abis/NFT.json'

// Config: Import your network config here
import config from '../config.json';

function App() {
  const [provider, setProvider] = useState(null)
  const [nft, setNFT] = useState(null)

  const [account, setAccount] = useState(null)

  const [revealTime, setRevealTime] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [cost, setCost] = useState(0)
  const [balance, setBalance] = useState(0)
  const [owner, setOwner] = useState(null)

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    // Initiate contract
    const nft = new ethers.Contract(config[31337].nft.address, NFT_ABI, provider)
    setNFT(nft)

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    // Fetch owner
    const owner = await nft.owner()
    setOwner(owner)

    // Fetch Countdown
    const allowMintingOn = await nft.allowMintingOn()
    setRevealTime(allowMintingOn.toString() + '000')

    // Fetch maxSupply
    setMaxSupply(await nft.maxSupply())

    // Fetch totalSupply
    setTotalSupply(await nft.totalSupply())

    // Fetch cost
    setCost(await nft.cost())

    // Fetch account balance
    setBalance(await nft.balanceOf(account))

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
      console.log(balance.toString());
    }
  }, [balance, isLoading]);


  return(
    <Container>
      <Navigation account={account} />

      <h1 className='my-4 text-center'>Snarfs</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Row>
            <Col>
            {balance > 0 ? (
              <div className='text-center d-flex flex-column align-items-center'>
                {/* Display the most recent NFT as the largest */}
                <img
                  src={`https://gateway.pinata.cloud/ipfs/QmasBfFE6yQQH2y4SHfk5bTNm5iQiNSuMhyXxA9KuNd6Lk/${balance.toString()}.png`}
                  alt=""
                  width="400px"
                  height="400px"
                />
                <p className='text-center'><strong>#{balance.toString()}</strong></p>
                <p className='text-center'>Most Recent Snarf Purchased</p>
                
                {/* Display the rest of the owned NFTs side by side */}
                <div className='d-flex mt-4'>
                  {Array.from({ length: balance }).map((_, index) => (
                    <div key={index} className='d-flex flex-column align-items-center'>
                      <img
                        src={`https://gateway.pinata.cloud/ipfs/QmasBfFE6yQQH2y4SHfk5bTNm5iQiNSuMhyXxA9KuNd6Lk/${index+1}.png`}
                        alt=""
                        width="150px"
                        height="150px"
                      />
                      <p className='text-center'><strong>#{index + 1}</strong></p>
                    </div>                    
                  ))}
                </div>
                <p className='text-center'>Your Snarfs</p>
              </div>
            ) : (
              <img src={preview} alt="" width='300' height='300'/>
            )}
            </Col>

            <Col>
              <div className='my-4 text-center'>
                <Countdown date={parseInt(revealTime)} className='h2' />
              </div>

              <Data
                maxSupply={maxSupply}
                totalSupply={totalSupply}
                cost={cost}
                balance={balance}
              />

              <Mint
                provider={provider}
                nft={nft}
                balance={balance}
                cost={cost}
                setIsLoading={setIsLoading}
              />
              {/* Only show admin controls if the user is the owner */}
              {account === owner && (
              <Admin
                nft={nft}
                account={account}
                provider={provider}
              />
              )}
            </Col>

          </Row>
        </>
      )}
    </Container>
  )
}

export default App;
