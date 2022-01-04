const { assert } = require('chai');
const ceroContract = artifacts.require('./Cero.sol');
const utils = require('./utils.js');

require('chai').use(require('chai-as-promised')).should();



contract('Cero', (accounts)=>{

    let contract;

    const _updateMintPrice = '0.07';

    before(async () => {
        contract = await ceroContract.deployed();
    });

    describe('mintPrice', async () => {

        it(`default mint price is equal to ${utils._defaultMintPrice} ETH`, async () => {
            const currentMintPrice = await contract.mintPrice();
            const defaultMintPrice = web3.utils.toWei(utils._defaultMintPrice, "ether");
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

});