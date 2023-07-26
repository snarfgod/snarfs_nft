// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.18;

import "./Token.sol";

contract Crowdsale {
    Token public token;
    uint256 public price;
    uint256 public tokensSold;
    uint256 public maxTokens;
    address public owner;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public minPurchase = 1e18;
    uint256 public maxPurchase = 10000e18;

    
    mapping(address => bool) public whitelist;

    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);
    event PriceChange(uint256 price);

    // Need code and address from token.sol file

    constructor(Token _token, uint256 _price, uint256 _maxTokens) {
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
        startTime = block.timestamp;
        endTime = block.timestamp + 1555000;
    }

    modifier onlyOwner () {
        require(msg.sender == owner, "You cannot call this function.");
        _;
    }

    modifier isWhitelisted () {
        require(whitelist[msg.sender], "You are not whitelisted.");
        _;
    }

    receive() external payable isWhitelisted {
        require(startTime <= block.timestamp && block.timestamp <= endTime, 'Sale is not active');
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    function addToWhitelist(address _user) public onlyOwner {
        whitelist[_user] = true;
    }

    function buyTokens(uint256 _amount) public payable isWhitelisted {
        require(_amount >= minPurchase, 'You must buy at least 1 token');
        require(tokensSold + _amount <= maxTokens, 'Not enough tokens left for sale');
        require(_amount <= maxPurchase, 'You cannot buy that many tokens at once');
        require(msg.value == (_amount / 1e18) * price);
        require(token.balanceOf(address(this)) >= _amount);
        require(_amount >= minPurchase && _amount <= maxPurchase , 'You must buy at least 1 token, but no more than 10000');
        require(token.transfer(msg.sender, _amount));
        require(startTime <= block.timestamp && block.timestamp <= endTime, 'Sale is not active');
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



