import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

const AdminControls = ({ nft, account, provider }) => {
  const [paused, setPaused] = useState(false);
  const [whitelistAddress, setWhitelistAddress] = useState('');

  const togglePause = async () => {
    try {
      const signer = provider.getSigner();
      const nftWithSigner = nft.connect(signer);
  
      if (paused) {
        await nftWithSigner.unpauseSale();
      } else {
        await nftWithSigner.pauseSale();
      }
      setPaused(!paused);
    } catch (error) {
      console.error(error);
    }
  };
  

  const addToWhitelist = async (e) => {
    const signer = provider.getSigner();
    const nftWithSigner = nft.connect(signer);
    try {
      await nftWithSigner.addtoWhitelist(whitelistAddress);
      setWhitelistAddress('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='text-center mt-4 d-flex flex-column align-items-center'>
      <h2>Admin Controls</h2>
      <Button onClick={togglePause}>
        {paused ? 'Unpause Sale' : 'Pause Sale'}
      </Button>
      <div className='text-center mt-4'>
        <input
          type="text"
          className='mt-2 text-center'
          placeholder="Address to whitelist"
          value={whitelistAddress}
          onChange={(e) => setWhitelistAddress(e.target.value)}
        />
        <Button onClick={addToWhitelist}>Add to Whitelist</Button>
      </div>
    </div>
  );
};

export default AdminControls;
