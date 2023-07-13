// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.18;

import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply;
        balanceOf[msg.sender] = _totalSupply;
    }

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(
        address indexed from, 
        address indexed to,
        uint256 amount
    );
    event Approval(
        address indexed owner,
        address indexed exchange,
        uint256 value
    );

    function _transfer(address _from, address _to, uint256 _amount) internal {
        require(_from != address(0), "Cannot transfer from zero address");
        require(_to != address(0), "Cannot transfer to zero address");
        require(balanceOf[_from] >= _amount, "Not enough tokens");
        require(_to != address(0));
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(_from, _to, _amount);
    }


    function transfer(address _to, uint256 _amount) public returns (bool success){
        _transfer(msg.sender, _to, _amount);
        return true;
    }

    function approve(address _exchange, uint256 _amount) public returns (bool success){
        require(_exchange != address(0), "Cannot approve zero address");
        allowance[msg.sender][_exchange] = _amount;
        emit Approval(msg.sender, _exchange, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success){
        require(allowance[_from][msg.sender] >= _amount, "Not enough allowance");
        _transfer(_from, _to, _amount);
        allowance[_from][msg.sender] -= _amount;
        return true;
    }

    
}
