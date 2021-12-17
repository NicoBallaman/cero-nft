// SPDX-License-Identifier: ISC
pragma solidity >=0.8.0;

import "./ERC721Enumerable.sol";

contract Cero is ERC721Enumerable{
    string constant _name = "Cero NFT";
    string constant _symbol = "CRO";
    string[] public ceros;
    mapping(string => bool) _ceroExists;

    constructor() ERC721(_name, _symbol) {}

    function mint(string memory _cero) public {
        require(!_ceroExists[_cero]);
        ceros.push(_cero);
        uint _id = ceros.length - 1;
        _mint(msg.sender, _id);
        _ceroExists[_cero] = true;
    }
}