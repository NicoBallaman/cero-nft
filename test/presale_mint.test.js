const { assert } = require('chai');
const ceroContract = artifacts.require('./Cero.sol');
const exceptionsModule = require('./exception.js');
const utils = require('./utils.js');

require('chai').use(require('chai-as-promised')).should();



contract('Cero', (accounts)=>{

    let contract;
    const _quantityToMint = 5000;
    const accountNotWhiteList = accounts[1];
    const accountInWhiteList = accounts[2];

    before(async () => {
        contract = await ceroContract.deployed();
        await contract.addQuantityToMint(_quantityToMint);
        await contract.addToPresaleList([accountInWhiteList], 10);
    });

    
   
    describe('presaleMint', async () => {

        it('presaleMint isn\'n available on Setup state', async () => {
            const result = await contract.setStateToSetup();
            const eventStateUpdated = result.logs[0].args;
            await exceptionsModule.catchRevert(contract.presaleMint({from: accountInWhiteList}));
            assert.equal(eventStateUpdated[1], utils._setupState);
        });

        it('presaleMint isn\'t available on Sale state', async () => {
            const result = await contract.setStateToSale();
            const eventStateUpdated = result.logs[0].args;
            await exceptionsModule.catchRevert(contract.presaleMint({from: accountInWhiteList}));
            assert.equal(eventStateUpdated[1], utils._saleState);
        });

        it('presaleMint isn\'t available on SoldOut state', async () => {
            const result = await contract.setStateToSoldOut();
            const eventStateUpdated = result.logs[0].args;
            await exceptionsModule.catchRevert(contract.presaleMint({from: accountInWhiteList}));
            assert.equal(eventStateUpdated[1], utils._soldOutState);
        });

        it('presaleMint should revert when account isn\'t in whiteList', async () => {
            const result = await contract.setStateToPresale();
            const eventStateUpdated = result.logs[0].args;
            const isOnPresaleList = await contract.isOnPresaleList(accountNotWhiteList);

            await exceptionsModule.catchRevert(contract.presaleMint({from: accountNotWhiteList}));

            assert.equal(eventStateUpdated[1], utils._presaleState);
            assert.isFalse(isOnPresaleList);
        });

        it('presaleMint should revert when ETH sent is 0', async () => {
            const result = await contract.setStateToPresale();
            const eventStateUpdated = result.logs[0].args;
            const isOnPresaleList = await contract.isOnPresaleList(accountInWhiteList);
            
            await exceptionsModule.catchRevert(contract.presaleMint({from: accountInWhiteList}));
            
            assert.equal(eventStateUpdated[1], utils._presaleState);
            assert.isTrue(isOnPresaleList);
        });

        it('presaleMint should revert when ETH sent is less than CERO_PRICE', async () => {
            const result = await contract.setStateToPresale();
            const eventStateUpdated = result.logs[0].args;
            const isOnPresaleList = await contract.isOnPresaleList(accountInWhiteList);
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            const lessMintPrice = parseInt(currentMintPrice) - 10;
            
            await exceptionsModule.catchRevert(contract.presaleMint({from: accountInWhiteList, value: lessMintPrice}));
            
            assert.equal(eventStateUpdated[1], utils._presaleState);
            assert.isTrue(isOnPresaleList);
        });
        
        it('presaleMint should mint when ETH sent is equal to CERO_PRICE', async () => {
            const result = await contract.setStateToPresale();
            const eventStateUpdated = result.logs[0].args;
            const isOnPresaleList = await contract.isOnPresaleList(accountInWhiteList);
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            const currentBalance = await contract.balanceOf(accountInWhiteList);
            await contract.presaleMint({from: accountInWhiteList, value: currentMintPrice});
            const newBalance = await contract.balanceOf(accountInWhiteList);
            assert.equal(eventStateUpdated[1], utils._presaleState);
            assert.isTrue(isOnPresaleList);
            assert.isTrue(currentBalance < newBalance);
        });
        
        it('presaleMint should mint when ETH sent is greater than CERO_PRICE', async () => {
            const result = await contract.setStateToPresale();
            const eventStateUpdated = result.logs[0].args;
            const isOnPresaleList = await contract.isOnPresaleList(accountInWhiteList);
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            const greaterMintPrice = parseInt(currentMintPrice) + 100;
            const currentBalance = await contract.balanceOf(accountInWhiteList);
            await contract.presaleMint({from: accountInWhiteList, value: greaterMintPrice});
            const newBalance = await contract.balanceOf(accountInWhiteList);
            assert.equal(eventStateUpdated[1], utils._presaleState);
            assert.isTrue(isOnPresaleList);
            assert.isTrue(currentBalance < newBalance);
        });
        
    });

});