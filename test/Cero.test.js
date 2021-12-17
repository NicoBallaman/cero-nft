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
});