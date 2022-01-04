const { assert } = require('chai');
const ceroContract = artifacts.require('./Cero.sol');
const exceptionsModule = require('./exception.js');
const utils = require('./utils.js');

require('chai').use(require('chai-as-promised')).should();



contract('Cero', (accounts)=>{

    let contract;
    const _quantityToMint = 5000;
    const accountNotOwner = accounts[1];

    before(async () => {
        contract = await ceroContract.deployed();
        await contract.addQuantityToMint(_quantityToMint);
    });

    
   
    describe('ownerMint', async () => {

        it('ownerMint should revert when from account is not the owner', async () => {
            await exceptionsModule.catchRevert(contract.ownerMint({from: accountNotOwner}));
        });

        it('ownerMint isn\'t available on SoldOut state', async () => {
            const result = await contract.setStateToSoldOut();
            const eventStateUpdated = result.logs[0].args;
            await exceptionsModule.catchRevert(contract.ownerMint());
            assert.equal(eventStateUpdated[1], utils._soldOutState);
        });
        
        it('ownerMint is available on Setup state', async () => {
            const result = await contract.setStateToSetup();
            const eventStateUpdated = result.logs[0].args;
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            await contract.ownerMint({value: currentMintPrice});
            assert.equal(eventStateUpdated[1], utils._setupState);
        });
        
        it('ownerMint is available on Sale state', async () => {
            const result = await contract.setStateToSale();
            const eventStateUpdated = result.logs[0].args;
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            await contract.ownerMint({value: currentMintPrice});
            assert.equal(eventStateUpdated[1], utils._saleState);
        });

        it('ownerMint is available on Presale state', async () => {
            const result = await contract.setStateToPresale();
            const eventStateUpdated = result.logs[0].args;
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            await contract.ownerMint({value: currentMintPrice});
            assert.equal(eventStateUpdated[1], utils._presaleState);
        });

        it('ownerMint should revert when ETH sent is 0', async () => {
            await exceptionsModule.catchRevert(contract.ownerMint());
        });
        
        it('ownerMint should revert when ETH sent is less than CERO_PRICE', async () => {
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            const lessMintPrice = parseInt(currentMintPrice) - 10;
            
            await exceptionsModule.catchRevert(contract.ownerMint({value: lessMintPrice}));
        });

        it('ownerMint should mint when ETH sent is equal to CERO_PRICE', async () => {
            const ownerAccount = accounts[0];
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            const currentBalance = await contract.balanceOf(ownerAccount);

            await contract.ownerMint({value: currentMintPrice});
            const newBalance = await contract.balanceOf(ownerAccount);
            
            assert.isTrue(currentBalance < newBalance);
        });

        it('ownerMint should mint when ETH sent is greater than CERO_PRICE', async () => {
            const ownerAccount = accounts[0];
            const currentMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
            const greaterMintPrice = parseInt(currentMintPrice) + 100;
            const currentBalance = await contract.balanceOf(ownerAccount);
            await contract.ownerMint({value: greaterMintPrice});
            const newBalance = await contract.balanceOf(ownerAccount);
            assert.isTrue(currentBalance < newBalance);
        });
        
    });

});