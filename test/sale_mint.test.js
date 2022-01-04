const { assert } = require('chai');
const ceroContract = artifacts.require('./Cero.sol');
const exceptionsModule = require('./exception.js');
const utils = require('./utils.js');

require('chai').use(require('chai-as-promised')).should();



contract('Cero', (accounts)=>{

    let contract;
    const _quantityToMint = 5000;

    before(async () => {
        contract = await ceroContract.deployed();
        await contract.addQuantityToMint(_quantityToMint);
    });

    describe('saleMint', async () => {

        it('saleMint isn\'t available on SoldOut state', async () => {
            const result = await contract.setStateToSoldOut();
            const eventStateUpdated = result.logs[0].args;
            await exceptionsModule.catchRevert(contract.saleMint());
            assert.equal(eventStateUpdated[1], utils._soldOutState);
        });
        
        it('saleMint isn\'t available on Setup state', async () => {
            const result = await contract.setStateToSetup();
            const eventStateUpdated = result.logs[0].args;
            await exceptionsModule.catchRevert(contract.saleMint());
            assert.equal(eventStateUpdated[1], utils._setupState);
        });
        
        it('saleMint isn\'t available on Presale state', async () => {
            const result = await contract.setStateToPresale();
            const eventStateUpdated = result.logs[0].args;
            await exceptionsModule.catchRevert(contract.saleMint());
            assert.equal(eventStateUpdated[1], utils._presaleState);
        });

        it('saleMint is available on Sale state', async () => {
            const result = await contract.setStateToSale();
            const eventStateUpdated = result.logs[0].args;
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            await contract.saleMint({value: currentMintPrice});
            assert.equal(eventStateUpdated[1], utils._saleState);
        });

        it('saleMint should revert when ETH sent is 0', async () => {
            await exceptionsModule.catchRevert(contract.saleMint());
        });

        it('saleMint should revert when ETH sent is less than CERO_PRICE', async () => {
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            const lessMintPrice = parseInt(currentMintPrice) - 10;    
            await exceptionsModule.catchRevert(contract.saleMint({value: lessMintPrice}));
        });

        it('saleMint should mint when ETH sent is equal to CERO_PRICE', async () => {
            const account = accounts[1];
            const result = await contract.setStateToSale();
            const eventStateUpdated = result.logs[0].args;
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            const currentBalance = await contract.balanceOf(account);
            await contract.saleMint({from: account, value: currentMintPrice});
            const newBalance = await contract.balanceOf(account);
            assert.isTrue(currentBalance < newBalance);
            assert.equal(eventStateUpdated[1], utils._saleState);
        });
        
        it('saleMint should mint when ETH sent is greater than CERO_PRICE', async () => {
            const account = accounts[1];
            const result = await contract.setStateToSale();
            const eventStateUpdated = result.logs[0].args;
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            const greaterMintPrice = parseInt(currentMintPrice) + 100;
            const currentBalance = await contract.balanceOf(account);
            await contract.saleMint({from: account, value: greaterMintPrice});
            const newBalance = await contract.balanceOf(account);
            assert.isTrue(currentBalance < newBalance);
            assert.equal(eventStateUpdated[1], utils._saleState);
        });

    });

});