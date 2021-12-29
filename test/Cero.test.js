const { assert } = require('chai');

const ceroContract = artifacts.require('./Cero.sol');

require('chai')
.use(require('chai-as-promised'))
.should();

contract('Cero', (accounts)=>{

    const _contractName = "Cero NFT";
    const _contractSymbol = "CRO";
    let contract;

    before(async () => {
        contract = await ceroContract.deployed();
    });
    describe('constructor', async () => {
        
        it('deploys syccessfully', async () => {
            const contractAddress = contract.address;
            assert.notEqual(contractAddress, '');
            assert.notEqual(contractAddress, null);
            assert.notEqual(contractAddress, undefined);
            assert.notEqual(contractAddress, 0x0);
        });
        
        it('has a name', async () => {
            const contractName = await contract.name();
            assert.equal(contractName, _contractName);
        });
        
        it('has a symbol', async () => {
            const contractSymbol = await contract.symbol();
            assert.equal(contractSymbol, _contractSymbol);
        });
        
    });

    describe('mintPrice', async () => {
        
        it('default mint price is equal to 0.05 ETH', async () => {
            const currentMintPrice = await contract.mintPrice();
            const defaultMintPrice = web3.utils.toWei('0.05', "ether");
            assert.equal(currentMintPrice, defaultMintPrice);
        });
        
        it('update mint price to 0.07 ETH', async () => {
            const currentMintPrice = await contract.mintPrice();
            const newMintPrice = web3.utils.toWei('0.07', "ether");
            await contract.updateMintPrice(newMintPrice);
            const updatedMintPrice = await contract.mintPrice();
            assert.notEqual(currentMintPrice, newMintPrice);
            assert.equal(updatedMintPrice, newMintPrice);
        });
        
    });
    describe('addQuantityToMint', async () => {
        
        it('default availableTokensMint is equal to 0', async () => {
            const currentTokens = await contract.availableTokensMint();
            assert.equal(currentTokens, 0);
        });

        it('availableTokensMint is equal to 55 when addQuantityToMint(55) is excecuted succesfully', async () => {
            const increaseQuantity = 55;
            const currentTokens = await contract.availableTokensMint();
            await contract.addQuantityToMint(increaseQuantity);
            const updatedTokens = await contract.availableTokensMint();
            assert.equal(updatedTokens, increaseQuantity);
        });

        it('availableTokensMint increase when addQuantityToMint is excecuted succesfully', async () => {
            const increaseQuantity = 5000;
            const currentTokens = await contract.availableTokensMint();
            await contract.addQuantityToMint(increaseQuantity);
            const updatedTokens = await contract.availableTokensMint();
            assert.isTrue(currentTokens >= updatedTokens);
            assert.isTrue(updatedTokens >= increaseQuantity);
        });
        
    });
    describe('setBaseTokenURI', async () => {
        
        it('default baseTokenUri is empty', async () => {
            const defaultBaseTokenURI = await contract.baseTokenURI();
            assert.equal(defaultBaseTokenURI, '');
        });
        it('update baseTokenUri to https://ethereum.org/', async () => {
            const currentBaseTokenURI = await contract.baseTokenURI();
            const newBaseTokenURI = 'https://ethereum.org/';
            await contract.setBaseTokenURI(newBaseTokenURI);
            const updatedBaseTokenURI = await contract.baseTokenURI();
            assert.notEqual(currentBaseTokenURI, newBaseTokenURI);
            assert.equal(updatedBaseTokenURI, newBaseTokenURI);
        });
        const tokenId = 88;
        it(`tokenURI for ${tokenId} tokenId is equal to baseTokenUri + tokenId`, async () => {
            const currentBaseTokenURI = await contract.baseTokenURI();
            const tokenUri = currentBaseTokenURI + tokenId;
            const fullTokenURI = await contract.tokenURI(tokenId);
            assert.equal(tokenUri, fullTokenURI);
        });
    });
    /*
    describe('minting', async () => {
        it('creates a new token', async () => {
            const result = await contract.mint('#000000');
            const totalSupply = await contract.totalSupply();
            //success
            assert.equal(totalSupply, 1);
            const event = result.logs[0].args;
            assert.equal(event.tokenId.toNumber(), 0, 'tokenId is correct');
            assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct');
            assert.equal(event.to, accounts[0], 'to is correct');
            //failure: can't mint same cero twice
            await contract.mint('#000000').should.be.rejected;
            
        });
    });
    describe('indexing', async () => {
        it('lists ceros', async () => {
            let expected = ['#000000', '#000001', '#000002', '#000003']
            await contract.mint('#000001');
            await contract.mint('#000002');
            await contract.mint('#000003');
            const totalSupply = await contract.totalSupply();
            let result= [];
            for (let i = 0; i < totalSupply; i++) {
                const cero = await contract.ceros(i);
                result.push(cero);   
            }
            assert.equal(result.join(','), expected.join(','))
        });
    });
    */
});