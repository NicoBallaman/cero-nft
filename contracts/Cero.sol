// SPDX-License-Identifier: ISC
pragma solidity >=0.8.0;


import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Cero is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    string constant _name = "Cero NFT";
    string constant _symbol = "CRO";

    uint dnaDigits = 16;
    uint dnaModulus = 10 ** dnaDigits;

    enum State {
        SetUp,
        Presale,
        Sale,
        SoldOut
    }

    Counters.Counter private _tokenIds;
    State private _state;
    address private _owner;
    string private _tokenUriBase;
    uint256 public constant MAX_CEROS = 9999;
    uint256 private CERO_PRICE_IN_WEI = 5E16; // 0.05 ETH
    uint256 public totalMinted = 0;
    uint256 public availableTokensMint = 0;

    mapping(uint256 => uint256) private _cerosDna;
    mapping(address => uint256) private _whiteList;
    mapping(address => uint256) private _airdrops;

    event Minted(address minter, uint256 amount);
    event BalanceWithdrawed(address recipient, uint256 value);


    constructor() ERC721(_name, _symbol) {
        _owner = msg.sender;
        _state = State.SetUp;
    }

    function updateMintPrice(uint256 __price) external onlyOwner {
        CERO_PRICE_IN_WEI = __price;
    }

    function mintPrice() external view returns (uint256) {
        return CERO_PRICE_IN_WEI;
    }

    function addQuantityToMint(uint256 __quantity) public onlyOwner {
        availableTokensMint = __quantity;
    }

    function updateOwner(address __owner) public onlyOwner {
        _owner = __owner;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return string(abi.encodePacked(baseTokenURI(), Strings.toString(tokenId)));
    }

    function baseTokenURI() public view virtual returns (string memory) {
        return _tokenUriBase;
    }

    function setTokenURI(string memory tokenUriBase_) public onlyOwner {
        _tokenUriBase = tokenUriBase_;
    }

    function setStateToSetup() public onlyOwner {
        _state = State.SetUp;
    }
    
    function startPresale() public onlyOwner {
        _state = State.Presale;
    }

    function setStateToSale() public onlyOwner {
        _state = State.Sale;
    }
    
    function setStateToSoldOut() public onlyOwner {
        _state = State.SoldOut;
    }

    function addToPresaleList(address[] calldata _addresses, uint quantity) external onlyOwner {
        for (uint256 ind = 0; ind < _addresses.length; ind++) {
            require(_addresses[ind] != address(0), "Message: Can't add a zero address");
            _whiteList[_addresses[ind]] = _whiteList[_addresses[ind]].add(quantity);
        }
    }

    function isOnPresaleList(address _address) external view returns (bool) {
        return _whiteList[_address] > 0;
    }

    function removeFromPresaleList(address[] calldata _addresses) external onlyOwner {
        for (uint256 ind = 0; ind < _addresses.length; ind++) {
            require(_addresses[ind] != address(0), "Message: Can't remove a zero address");
            _whiteList[_addresses[ind]] = 0;
        }
    }

    function addAirdrop(address[] calldata _addresses, uint quantity) external onlyOwner {
        for (uint256 ind = 0; ind < _addresses.length; ind++) {
            require(_addresses[ind] != address(0), "Message: Can't add a zero address");
            _airdrops[_addresses[ind]] = _airdrops[_addresses[ind]].add(quantity);
        }
    }
    
    function hasAirdrop(address _address) external view returns (bool) {
        return _airdrops[_address] > 0;
    }

    function removeAirdrop(address[] calldata _addresses) external onlyOwner {
        for (uint256 ind = 0; ind < _addresses.length; ind++) {
            require(_addresses[ind] != address(0), "Message: Can't remove a zero address");
            _airdrops[_addresses[ind]] = 0;
        }
    }

    function claimAirdrop() external {
        require(_state != State.SoldOut, "Mint is not active.");
        require(_airdrops[msg.sender] > 0, "The wallet address is not allowed to mint Ceros.");
        for (uint256 ind = 0; ind < _airdrops[msg.sender]; ind++) {
            mint();
        }
       _airdrops[msg.sender] = 0;
    }
    
    function presaleMint() external payable {
        require(_state == State.Presale, "Presale is not active.");
        require(_whiteList[msg.sender] > 0, "The wallet address is not allowed to mint Ceros.");
        require(msg.value >= CERO_PRICE_IN_WEI, "Ether value sent is incorrect.");
        mint();
        _whiteList[msg.sender] = _whiteList[msg.sender].sub(1);
    }

    function ownerMint() external payable onlyOwner {
        require(_state != State.SoldOut, "Mint is not available.");
        require(msg.value >= CERO_PRICE_IN_WEI, "Ether value sent is incorrect.");
        mint();
    }

    function saleMint() external payable {
        require(_state == State.Sale, "Sale is not active.");
        require(msg.value >= CERO_PRICE_IN_WEI, "Ether value sent is incorrect.");
        mint();
    }

    function mint() internal {
        require(!Address.isContract(msg.sender), "Contracts are not allowed to mint Ceros.");
        require(_tokenIds.current().add(1) <= MAX_CEROS, "Max supply of tokens exceeded.");
        require(availableTokensMint > 0, "No tokens available to mint.");
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _tokenIds.increment();
        totalMinted = totalMinted.add(1);

        uint dna = _generateCeroDna(newTokenId);
        _cerosDna[newTokenId] = dna;
        emit Minted(msg.sender, 1);
        if (totalMinted >= MAX_CEROS) {
            _state = State.SoldOut;
        }
    }

    function _generateCeroDna(uint256 id) private view returns (uint) {
        uint rand = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, block.number, id)));
        return rand % dnaModulus;
    }

    function withdrawAll(address recipient) public onlyOwner {
        uint256 balance = address(this).balance;
        payable(recipient).transfer(balance);
        emit BalanceWithdrawed(recipient, balance);
    }

    function withdrawAllViaCall(address payable _to) public onlyOwner {
        uint256 balance = address(this).balance;
        (bool sent, bytes memory data) = _to.call{value: balance}("");
        require(sent, "Failed to send Ether");
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

//- whitelist sale
//- nft on stored on blockchain
//- minting for founder
//- public sale
//- minting for airdrop (specific number of nft)