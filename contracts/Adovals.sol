// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Adovals is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bool public enabled;
    bool public inPresale;

    constructor() ERC721("Adovals", "ADV") {
        enabled = false;
        inPresale = true;
    }

    function presale(bool setPresale) public onlyOwner {
        inPresale = setPresale;
    }

    function mint(address recipient, string memory tokenURI)
    public onlyOwner
    returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}


//1500 tokens:
//1280 public
//100 presale
//100 giveaways
//10 creators
//10 especials per subasta
//
//
//- Primer es fa Whitelist, els primers 100 que entren es farà presale a un preu menor.
//
//- Es comença presale i es deixa una setmana per mintejar.
//
//- Els tokens reservats per presale que no s’hagin mintejat tornaran a la venta pública quan el temps de presale s’hagi acabat.
//
//- Durant el presale es poden mintejar 2 tokens màxim per persona. Al cap d’uns dies 10 màxim per persona.
//
//- El minting públic comença un o dos dies després del final del presale.
//
//- Els 1490 que no es mintegin en ordre, que vagin sortint números de tokens random.
//
//- Durant el minting públic, es poden mintejar 10 tokens per transacció i només es poden tenir 10 tokens per wallet.
//
//- Els tokens del presale costaràn 0.03ETH i al mint públic 0.04ETH
//
//- S’aplicarà un 7,5% de resale fee (royalties per l’artista) en cada venta secundària.
//
//- Només s’accepta Metamask.
//
//- Vigilar el tema del gas fee durant el presale i després. Mirar lo dels nivells del gas fee.
//
//- Poder utilitzar els 100 reservats per giveaways per quan es vulgui fer donacions, subastes, regals, etc.
//
//- Quan s’hagin mintejat els 1490 fer subasta del 10 especials.
