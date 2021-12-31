const { assert } = require('chai');
const ceroContract = artifacts.require('./Cero.sol');
const exceptionsModule = require('./exception.js');

require('chai').use(require('chai-as-promised')).should();



contract('Cero', (accounts)=>{

    let contract;
    const _setupState = 0;
    const _presaleState = 1;
    const _saleState = 2;
    const _soldOutState = 3;

    before(async () => {
        contract = await ceroContract.deployed();
    });
    describe('constructor', async () => {
        const _contractName = "Cero NFT";
        const _contractSymbol = "CRO";

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
        const _defaultMintPrice = '0.05';
        const _updateMintPrice = '0.07';

        it(`default mint price is equal to ${_defaultMintPrice} ETH`, async () => {
            const currentMintPrice = await contract.mintPrice();
            const defaultMintPrice = web3.utils.toWei(_defaultMintPrice, "ether");
            assert.equal(currentMintPrice, defaultMintPrice);
        });
        
        it(`update mint price to ${_updateMintPrice} ETH`, async () => {
            const currentMintPrice = await contract.mintPrice();
            const newMintPrice = web3.utils.toWei(_updateMintPrice, "ether");
            await contract.updateMintPrice(newMintPrice);
            const updatedMintPrice = await contract.mintPrice();
            assert.notEqual(currentMintPrice, newMintPrice);
            assert.equal(updatedMintPrice, newMintPrice);
        });
        
    });

    describe('addQuantityToMint', async () => {
        const _defaultAvailableTokensMint = 0;
        const _updateAvailableTokensMint = 55;
        it(`default availableTokensMint is equal to ${_defaultAvailableTokensMint}`, async () => {
            const currentTokens = await contract.availableTokensMint();
            assert.equal(currentTokens, _defaultAvailableTokensMint);
        });

        it(`availableTokensMint is equal to ${_updateAvailableTokensMint} when addQuantityToMint(${_updateAvailableTokensMint}) is excecuted succesfully`, async () => {
            const increaseQuantity = _updateAvailableTokensMint;
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
        const _defaultBaseTokenUri = '';
        const _updateBaseTokenUri = 'https://ethereum.org/';
        const _tokenIdTestUri = 88;

        it('default baseTokenUri is empty', async () => {
            const defaultBaseTokenURI = await contract.baseTokenURI();
            assert.equal(defaultBaseTokenURI, _defaultBaseTokenUri);
        });

        it(`update baseTokenUri to ${_updateBaseTokenUri}`, async () => {
            const currentBaseTokenURI = await contract.baseTokenURI();
            const newBaseTokenURI = _updateBaseTokenUri;
            await contract.setBaseTokenURI(newBaseTokenURI);
            const updatedBaseTokenURI = await contract.baseTokenURI();
            assert.notEqual(currentBaseTokenURI, newBaseTokenURI);
            assert.equal(updatedBaseTokenURI, newBaseTokenURI);
        });
        
        it(`tokenURI for ${_tokenIdTestUri} tokenId is equal to baseTokenUri + tokenId`, async () => {
            const tokenId = _tokenIdTestUri;
            const currentBaseTokenURI = await contract.baseTokenURI();
            const tokenUri = currentBaseTokenURI + tokenId;
            const fullTokenURI = await contract.tokenURI(tokenId);
            assert.equal(tokenUri, fullTokenURI);
        });
    });

    describe('setState ', async () => {
        
        it('setStateToSetup excecute succesfully and emit event', async () => {
            const result = await contract.setStateToSetup();
            const eventStateUpdated = result.logs[0].args;
            assert.equal(eventStateUpdated[0], _setupState); //Prevoius state is Setup
            assert.equal(eventStateUpdated[1], _setupState); //Current state is Setup
        });
        
        it('setStateToPresale excecute succesfully and emit event', async () => {
            const result = await contract.setStateToPresale();
            const eventStateUpdated = result.logs[0].args;
            assert.equal(eventStateUpdated[0], _setupState); //Prevoius state is Setup
            assert.equal(eventStateUpdated[1], _presaleState); //Current state is Presale
        });

        it('setStateToSale excecute succesfully and emit event', async () => {
            const result = await contract.setStateToSale();
            const eventStateUpdated = result.logs[0].args;
            assert.equal(eventStateUpdated[0], _presaleState); //Prevoius state is Presale
            assert.equal(eventStateUpdated[1], _saleState); //Current state is Sale
        });

        it('setStateToSoldOut excecute succesfully and emit event', async () => {
            const result = await contract.setStateToSoldOut();
            const eventStateUpdated = result.logs[0].args;
            assert.equal(eventStateUpdated[0], _saleState); //Prevoius state is Sale
            assert.equal(eventStateUpdated[1], _soldOutState); //Current state is SoldOut
        });
    });
    
    describe('presaleList ', async () => {

        const _zeroAddress = '0x0000000000000000000000000000000000000000';
        const _qunatityPresale = 10;

        it('addToPresaleList address when state is Presale', async () => {
            const resultState = await contract.setStateToPresale();
            const eventState = resultState.logs[0].args[1];
            const account = accounts[1];
            await contract.addToPresaleList([account], _qunatityPresale);
            const result = await contract.isOnPresaleList(account);
            assert.isTrue(result);
            assert.equal(eventState, _presaleState); //Current state is Presale
        });

        it('addToPresaleList address when state is Setup', async () => {
            const resultState = await contract.setStateToSetup();
            const eventState = resultState.logs[0].args[1];
            const account = accounts[1];
            await contract.addToPresaleList([account], _qunatityPresale);
            const resultIsOnPresale = await contract.isOnPresaleList(account);
            assert.isTrue(resultIsOnPresale);
            assert.equal(eventState, _setupState); //Current state is Setup
        });

        it('addToPresaleList an list of address', async () => {
            const resultState = await contract.setStateToSetup();
            const eventState = resultState.logs[0].args[1];
            const accountList = [accounts[2], accounts[3], accounts[6]];
            await contract.addToPresaleList(accountList, _qunatityPresale);
            const resultAccount0 = await contract.isOnPresaleList(accountList[0]);
            const resultAccount1 = await contract.isOnPresaleList(accountList[1]);
            assert.isTrue(resultAccount0 && resultAccount1);
            assert.equal(eventState, _setupState); //Current state is Setup
        });

        it('addToPresaleList don\'t add address when list contain an zero address', async () => {
            const resultState = await contract.setStateToSetup();
            const eventState = resultState.logs[0].args[1];
            const accountList = [accounts[4], accounts[5], _zeroAddress];
            await exceptionsModule.catchRevert(contract.addToPresaleList(accountList, _qunatityPresale));
            const resultAccount0 = await contract.isOnPresaleList(accountList[0]);
            const resultAccount1 = await contract.isOnPresaleList(accountList[1]);
            const resultAccount2 = await contract.isOnPresaleList(accountList[2]);
            assert.isFalse(resultAccount0 || resultAccount1 || resultAccount2);
            assert.equal(eventState, _setupState); //Current state is Setup
        });

        it('addToPresaleList revert when address is zero', async () => {
            const resultState = await contract.setStateToPresale();
            const eventState = resultState.logs[0].args[1];
            await exceptionsModule.catchRevert(contract.addToPresaleList([_zeroAddress], _qunatityPresale));
            const result = await contract.isOnPresaleList(_zeroAddress);
            assert.isFalse(result);
            assert.equal(eventState, _presaleState); //Current state is Presale
        });

        
        it('addToPresaleList is not active when state is Sale', async () => {
            const resultState = await contract.setStateToSale();
            const eventState = resultState.logs[0].args[1];
            await exceptionsModule.catchRevert(contract.addToPresaleList([accounts[1]], _qunatityPresale));
            assert.equal(eventState, _saleState); //Current state is Sale
        });

        it('addToPresaleList is not active when state is SoldOut', async () => {
            const resultState = await contract.setStateToSoldOut();
            const eventState = resultState.logs[0].args[1];
            await exceptionsModule.catchRevert(contract.addToPresaleList([accounts[1]], _qunatityPresale));
            assert.equal(eventState, _soldOutState); //Current state is SoldOut
        });

        it('removeFromPresaleList an existing address in presaleList', async () => {
            const prevStatus = await contract.isOnPresaleList(accounts[1]);
            await contract.removeFromPresaleList([accounts[1]]);
            const currStatus = await contract.isOnPresaleList(accounts[1]);
            assert.isTrue(prevStatus);
            assert.isFalse(currStatus);
        });

        it('removeFromPresaleList an existing list of address in presaleList', async () => {
            const accountExist1 = accounts[2];
            const accountExist2 = accounts[3];
            const accountList = [accountExist1, accountExist2];
            const prevStatus2 = await contract.isOnPresaleList(accountExist1);
            const prevStatus3 = await contract.isOnPresaleList(accountExist2);
            await contract.removeFromPresaleList(accountList);
            const currStatus2 = await contract.isOnPresaleList(accountExist1);
            const currStatus3 = await contract.isOnPresaleList(accountExist2);
            assert.isTrue(prevStatus2 && prevStatus3);
            assert.isFalse(currStatus2 || currStatus3);
        });

        it('removeFromPresaleList an not existing address in presaleList', async () => {
            const accountNotExist = accounts[4];
            const prevStatus = await contract.isOnPresaleList(accountNotExist);
            await contract.removeFromPresaleList([accountNotExist]);
            const currStatus = await contract.isOnPresaleList(accountNotExist);
            assert.isFalse(prevStatus);
            assert.isFalse(currStatus);
        });

        it('removeFromPresaleList an list of address with zero address', async () => {
            const accountNotExist1 = accounts[4];
            const accountNotExist2 = accounts[6];
            const accountList = [accountNotExist1, accountNotExist2, _zeroAddress];
            const prevStatus0 = await contract.isOnPresaleList(accountNotExist2);
            const prevStatus1 = await contract.isOnPresaleList(accountNotExist1);
            const prevStatus2 = await contract.isOnPresaleList(_zeroAddress);
            await exceptionsModule.catchRevert(contract.removeFromPresaleList(accountList));
            const currStatus0 = await contract.isOnPresaleList(accountNotExist2);
            const currStatus1 = await contract.isOnPresaleList(accountNotExist1);
            const currStatus2 = await contract.isOnPresaleList(_zeroAddress);
            assert.isTrue(prevStatus0);
            assert.isFalse(prevStatus1);
            assert.isFalse(prevStatus2);
            assert.isTrue(currStatus0);
            assert.isFalse(currStatus1);
            assert.isFalse(currStatus2);
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