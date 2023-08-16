// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.18;

import "./ERC721Enumerable.sol";
import "./Ownable.sol";

contract NFT is ERC721Enumerable, Ownable {

    using Strings for uint256;
    
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public allowMintingOn;
    string public baseURI;
    string public baseExtension = '.json';
    bool public salePaused = false;

    event Mint(uint256 amount, address minter);
    event Withdraw(uint256 amount, address owner);
    event SalePaused(bool paused);

    mapping(address => bool) public whitelist;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _allowMintingOn,
        string memory _baseURI
        ) ERC721(_name,_symbol) {
        cost = _cost;
        maxSupply = _maxSupply;
        allowMintingOn = _allowMintingOn;
        baseURI = _baseURI;
    }

    modifier whenNotPaused() {
        require(!salePaused, "Sale is paused");
        _;
    }
    modifier isWhitelisted () {
        require(whitelist[msg.sender], "You are not whitelisted.");
        _;
    }

    function mint(uint256 _mintAmount) public payable whenNotPaused isWhitelisted {

        require(msg.value >= cost * _mintAmount);
        require(block.timestamp >= allowMintingOn);
        require(_mintAmount > 0);

        uint256 supply = totalSupply();
        require(supply + _mintAmount <= maxSupply);

        for(uint256 i = 1; i<= _mintAmount; i++) {
            _safeMint(msg.sender, supply + i);
        }

        emit Mint(_mintAmount, msg.sender);

    }

    //Get metadata IPFS url
    function tokenURI(uint256 _tokenId) public view virtual override returns(string memory) 
    {
        require(_exists(_tokenId), 'token does not exist');
        return(string(abi.encodePacked(baseURI, _tokenId.toString(), baseExtension)));
    }

    function addtoWhitelist(address _user) public onlyOwner {
        whitelist[_user] = true;
    }

    function walletOfOwner(address _owner) public view returns(uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for(uint256 i; i<ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Failed to withdraw Ether");
        emit Withdraw(balance, msg.sender);
    }

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function pauseSale() public onlyOwner {
        salePaused = true;
        emit SalePaused(true);
    }

    function unpauseSale() public onlyOwner {
        salePaused = false;
        emit SalePaused(false);
    }
}
