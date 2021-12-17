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
            //failure: can't mint same color twice
            await contract.mint('#000000').should.be.rejected;
            
        });
    });
    describe('indexing', async () => {
        it('lists colors', async () => {
            let expected = ['#000000', '#000001', '#000002', '#000003']
            await contract.mint('#000001');
            await contract.mint('#000002');
            await contract.mint('#000003');
            const totalSupply = await contract.totalSupply();
            let result= [];
            for (let i = 0; i < totalSupply; i++) {
                const color = await contract.colors(i);
                result.push(color);   
            }
            assert.equal(result.join(','), expected.join(','))
        });
    });
});