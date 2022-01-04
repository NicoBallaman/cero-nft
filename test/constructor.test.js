const { assert } = require('chai');
const ceroContract = artifacts.require('./Cero.sol');

require('chai').use(require('chai-as-promised')).should();



contract('Cero', (accounts)=>{

    let contract;

    const _contractName = "Cero NFT";
    const _contractSymbol = "CRO";

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

});