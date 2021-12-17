const { assert } = require('chai');

const colorContract = artifacts.require('./Color.sol');

require('chai')
.use(require('chai-as-promised'))
.should();

contract('Color', (accounts)=>{

    const _contractName = "Color NFT";
    const _contractSymbol = "CLR";
    let contract;

    before(async () => {
        contract = await colorContract.deployed();
    });
    describe('deployment', async () => {

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