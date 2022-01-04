const { assert } = require('chai');
const ceroContract = artifacts.require('./Cero.sol');
const utils = require('./utils.js');

require('chai').use(require('chai-as-promised')).should();



contract('Cero', (accounts)=>{

    let contract;

    before(async () => {
        contract = await ceroContract.deployed();
        await contract.setStateToSetup();
    });

    describe('setState', async () => {
        
        it('setStateToSetup excecute succesfully and emit event', async () => {
            const result = await contract.setStateToSetup();
            const eventStateUpdated = result.logs[0].args;
            assert.equal(eventStateUpdated[0], utils._setupState); //Prevoius state is Setup
            assert.equal(eventStateUpdated[1], utils._setupState); //Current state is Setup
        });
        
        it('setStateToPresale excecute succesfully and emit event', async () => {
            const result = await contract.setStateToPresale();
            const eventStateUpdated = result.logs[0].args;
            assert.equal(eventStateUpdated[0], utils._setupState); //Prevoius state is Setup
            assert.equal(eventStateUpdated[1], utils._presaleState); //Current state is Presale
        });

        it('setStateToSale excecute succesfully and emit event', async () => {
            const result = await contract.setStateToSale();
            const eventStateUpdated = result.logs[0].args;
            assert.equal(eventStateUpdated[0], utils._presaleState); //Prevoius state is Presale
            assert.equal(eventStateUpdated[1], utils._saleState); //Current state is Sale
        });

        it('setStateToSoldOut excecute succesfully and emit event', async () => {
            const result = await contract.setStateToSoldOut();
            const eventStateUpdated = result.logs[0].args;
            assert.equal(eventStateUpdated[0], utils._saleState); //Prevoius state is Sale
            assert.equal(eventStateUpdated[1], utils._soldOutState); //Current state is SoldOut
        });
    });
    
});