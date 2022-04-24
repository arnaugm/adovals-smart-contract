// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Adovals is ERC721URIStorage, Ownable {
    bool public enabled = false;
    bool public inPresale = true;
    uint256 public totalPresaleSupply = 0;
    uint256 public totalSupply = 0;
    uint256 public presaleMaxSupply = 100;
    uint256 public maxSupply = 1500;
    uint256 public presaleMaxMintAmount = 2;
    uint256 public saleMaxMintAmount = 10;
    uint256 public presaleCost = 0.03 ether;
    uint256 public cost = 0.04 ether;

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {}

    function mint(uint256 mintAmount) public payable {
        require(enabled, "The contract is not enabled");
        require(
            mintAmount > 0,
            "A mint amount bigger than 0 needs to be provided"
        );
        require(
            totalSupply + mintAmount <= maxSupply,
            "There are not enough tokens left"
        );

        if (msg.sender != owner()) {
            require(
                (inPresale && mintAmount <= presaleMaxMintAmount) ||
                    (!inPresale && mintAmount <= saleMaxMintAmount),
                "The mint amount is bigger than the maximum"
            );
            require(
                (inPresale &&
                    balanceOf(msg.sender) + mintAmount <=
                    presaleMaxMintAmount) ||
                    (!inPresale &&
                        balanceOf(msg.sender) + mintAmount <=
                        saleMaxMintAmount),
                "The total mint amount for the account is bigger than the maximum"
            );
            require(
                !inPresale ||
                    totalPresaleSupply + mintAmount <= presaleMaxSupply,
                "There are not enough presale tokens left"
            );

            require(
                msg.value >= presaleCost * mintAmount,
                "Not enough ether is sent for the purchase"
            );
        }

        uint256 currentSupply = totalSupply;
        totalSupply = totalSupply + mintAmount;
        if (inPresale && msg.sender != owner()) {
            totalPresaleSupply = totalPresaleSupply + mintAmount;
        }
        for (uint256 i = 1; i <= mintAmount; i++) {
            _safeMint(msg.sender, currentSupply + i);
        }
    }

    function withdraw() public onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success);
    }

    function enable(bool setEnabled) public onlyOwner {
        enabled = setEnabled;
    }

    function presale(bool setPresale) public onlyOwner {
        inPresale = setPresale;
    }

    function setPresaleMaxSupply(uint256 newPresaleMaxSupply) public onlyOwner {
        presaleMaxSupply = newPresaleMaxSupply;
    }

    function setMaxSupply(uint256 newMaxSupply) public onlyOwner {
        maxSupply = newMaxSupply;
    }

    function setPresaleMaxMintAmount(uint256 newPresaleMaxMintAmount)
        public
        onlyOwner
    {
        presaleMaxMintAmount = newPresaleMaxMintAmount;
    }

    function setSaleMaxMintAmount(uint256 newSaleMaxMintAmount)
        public
        onlyOwner
    {
        saleMaxMintAmount = newSaleMaxMintAmount;
    }

    function setPresaleCost(uint256 newPresaleCost) public onlyOwner {
        presaleCost = newPresaleCost;
    }

    function setCost(uint256 newCost) public onlyOwner {
        cost = newCost;
    }
}
