import React, { useState } from 'react';
import { ethers } from 'ethers';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

const Mint = ({ provider, nft, cost, setIsLoading }) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [numNFTs, setNumNFTs] = useState(1);

  const mintHandler = async (e) => {
    e.preventDefault();
    setIsWaiting(true);

    try {
      const signer = await provider.getSigner();
      const totalCostWei = cost.mul(numNFTs); // Calculate the total cost in Wei
      const transaction = await nft.connect(signer).mint(numNFTs, { value: totalCostWei });
      await transaction.wait();
    } catch (error) {
      console.error('Transaction error:', error);
      window.alert('User rejected or transaction reverted');
    }

    setIsLoading(true);
  };

  return (
    <Form onSubmit={mintHandler} style={{ maxWidth: '450px', margin: '50px auto' }}>
      <Form.Group>
        <Form.Label>Number of NFTs to buy:</Form.Label>
        <Form.Control
          type="number"
          value={numNFTs}
          onChange={(e) => setNumNFTs(parseInt(e.target.value))}
          min={1}
          step={1}
        />
      </Form.Group>
      {isWaiting ? (
        <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} />
      ) : (
        <Form.Group>
          <Button variant="primary" type="submit" style={{ width: '100%' }}>
            Mint
          </Button>
        </Form.Group>
      )}
    </Form>
  );
};

export default Mint;
