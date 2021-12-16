// SPDX-License-Identifier: ISC
pragma solidity >=0.8.0;

import "./ERC721.sol";

contract Color is ERC721{
    string constant _name = "Color NFT";
    string constant _symbol = "CLR";
    constructor() ERC721(_name, _symbol) {

    }
}