const { assert } = require('chai');
const ceroContract = artifacts.require('./Cero.sol');


require('chai').use(require('chai-as-promised')).should();



contract('Cero', (accounts)=>{

    let contract;
    const _defaultAvailableTokensMint = 0;
    const _updateAvailableTokensMint = 55;

    before(async () => {
        contract = await ceroContract.deployed();
    });

    describe('availableTokensMint', async () => {
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

});