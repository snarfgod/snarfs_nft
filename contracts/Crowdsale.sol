// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.18;

import "./Token.sol";

contract Crowdsale {
    Token public token;
    uint256 public price;
    uint256 public tokensSold;
    uint256 public maxTokens;
    address public owner;

    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);
    event PriceChange(uint256 price);

    // Need code and address from token.sol file

    constructor(Token _token, uint256 _price, uint256 _maxTokens) {
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;

    }

    modifier onlyOwner () {
        require(msg.sender == owner, "You cannot call this function.");
        _;
    }

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    function buyTokens(uint256 _amount) public payable {
        require(msg.value == (_amount / 1e18) * price);
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount));
        tokensSold += _amount;
        emit Buy(_amount, msg.sender);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
        emit PriceChange(_price);
    }

     //finalize the sale of the token by sending Eth and tokens from the contract to the deployer
    function finalize() public onlyOwner {
        //Send ETH from contract to deployer
        uint256 value = address(this).balance;
        (bool sent, ) = owner.call{value: value}("");
        require(sent);
        //Send remaining tokens to deployer
        require(token.transfer(owner, token.balanceOf(address(this))));
        emit Finalize(tokensSold, value);
    }
}



