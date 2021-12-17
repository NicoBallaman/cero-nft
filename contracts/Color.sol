// SPDX-License-Identifier: ISC
pragma solidity >=0.8.0;

import "./ERC721Enumerable.sol";

contract Color is ERC721Enumerable{
    string constant _name = "Color NFT";
    string constant _symbol = "CLR";
    string[] public colors;
    mapping(string => bool) _colorExists;

    constructor() ERC721(_name, _symbol) {}

    function mint(string memory _color) public {
        require(!_colorExists[_color]);
        colors.push(_color);
        uint _id = colors.length - 1;
        _mint(msg.sender, _id);
        _colorExists[_color] = true;
    }
}