const { assert } = require('chai');
const ceroContract = artifacts.require('./Cero.sol');
const exceptionsModule = require('./exception.js');
const utils = require('./utils.js');

require('chai').use(require('chai-as-promised')).should();



contract('Cero', (accounts)=>{

    let contract;
    const _qunatityAirdrop = 20;
    const _quantityToMint = 5000;

    before(async () => {
        contract = await ceroContract.deployed();
        await contract.addQuantityToMint(_quantityToMint);
    });

    
    describe('airdrop', async () => {

        it('addAirdrop is excecuted succesfully', async () => {
            const account = accounts[1];
            await contract.addAirdrop([account], _qunatityAirdrop);
            const result = await contract.hasAirdrop(account);
            assert.isTrue(result);
        });
        
        it('addAirdrop is excecuted succesfully with an list of address', async () => {
            const accountList = [accounts[2], accounts[3], accounts[5]];
            await contract.addAirdrop(accountList, _qunatityAirdrop);
            const resultAccount0 = await contract.hasAirdrop(accountList[0]);
            const resultAccount1 = await contract.hasAirdrop(accountList[1]);
            const resultAccount2 = await contract.hasAirdrop(accountList[2]);
            assert.isTrue(resultAccount0 && resultAccount1 && resultAccount2);
        });
        
        it('addAirdrop don\'t should add address when list contain an zero address', async () => {
            const accountList = [accounts[4], utils._zeroAddress];
            await exceptionsModule.catchRevert(contract.addAirdrop(accountList, _qunatityAirdrop));
            const resultAccount0 = await contract.hasAirdrop(accountList[0]);
            const resultAccount1 = await contract.hasAirdrop(accountList[1]);
            assert.isFalse(resultAccount0 || resultAccount1);
        });
        
        it('addAirdrop should revert when address is zero', async () => {
            await exceptionsModule.catchRevert(contract.addAirdrop([utils._zeroAddress], _qunatityAirdrop));
            const result = await contract.hasAirdrop(utils._zeroAddress);
            assert.isFalse(result);
        });

        it('removeAirdrop an existing address in airdropList', async () => {
            const prevStatus = await contract.hasAirdrop(accounts[1]);
            await contract.removeAirdrop([accounts[1]]);
            const currStatus = await contract.hasAirdrop(accounts[1]);
            assert.isTrue(prevStatus);
            assert.isFalse(currStatus);
        });
        
        
        it('removeAirdrop an existing list of address in airdropList', async () => {
            const accountExist1 = accounts[2];
            const accountExist2 = accounts[3];
            const accountList = [accountExist1, accountExist2];
            const prevStatus2 = await contract.hasAirdrop(accountExist1);
            const prevStatus3 = await contract.hasAirdrop(accountExist2);
            await contract.removeAirdrop(accountList);
            const currStatus2 = await contract.hasAirdrop(accountExist1);
            const currStatus3 = await contract.hasAirdrop(accountExist2);
            assert.isTrue(prevStatus2 && prevStatus3);
            assert.isFalse(currStatus2 || currStatus3);
        });
        
        it('removeAirdrop an not existing address in airdropList', async () => {
            const accountNotExist = accounts[4];
            const prevStatus = await contract.hasAirdrop(accountNotExist);
            await contract.removeAirdrop([accountNotExist]);
            const currStatus = await contract.hasAirdrop(accountNotExist);
            assert.isFalse(prevStatus);
            assert.isFalse(currStatus);
        });
        
        it('removeAirdrop an list of address with zero address', async () => {
            const accountExist = accounts[5];
            const accountNotExist = accounts[6];
            const accountList = [accountExist, accountNotExist, utils._zeroAddress];
            const prevStatus0 = await contract.hasAirdrop(accountExist);
            const prevStatus1 = await contract.hasAirdrop(accountNotExist);
            const prevStatus2 = await contract.hasAirdrop(utils._zeroAddress);
            await exceptionsModule.catchRevert(contract.removeAirdrop(accountList));
            const currStatus0 = await contract.hasAirdrop(accountExist);
            const currStatus1 = await contract.hasAirdrop(accountNotExist);
            const currStatus2 = await contract.hasAirdrop(utils._zeroAddress);
            assert.equal(prevStatus0, currStatus0);
            assert.equal(prevStatus1, currStatus1);
            assert.equal(prevStatus2, currStatus2);
        });
        
        it('claimAirdrop an address in airdrop list', async () => {
            const accountExist = accounts[7];
            const resultState = await contract.setStateToSale();
            const eventStateUpdated = resultState.logs[0].args;
            
            await contract.addAirdrop([accountExist], _qunatityAirdrop);
            const hasAirdrop = await contract.hasAirdrop(accountExist)
            await contract.claimAirdrop({from: accountExist});
            const hasAirdropAfter = await contract.hasAirdrop(accountExist);
            const balanceAccount = await contract.balanceOf(accountExist);
            
            
            assert.isTrue(eventStateUpdated[1] != utils._soldOutState);
            assert.isTrue(hasAirdrop);
            assert.isFalse(hasAirdropAfter);
            assert.equal(balanceAccount, _qunatityAirdrop);
        });
        
        it('claimAirdrop an not exist address in airdrop list', async () => {
            const accountNotExist = accounts[1];
            const resultState = await contract.setStateToSale();
            const eventStateUpdated = resultState.logs[0].args;
            
            const hasAirdrop = await contract.hasAirdrop(accountNotExist)
            await exceptionsModule.catchRevert(contract.claimAirdrop({from: accountNotExist}));
            const hasAirdropAfter = await contract.hasAirdrop(accountNotExist);
            const balanceAccount = await contract.balanceOf(accountNotExist);
            
            
            assert.isTrue(eventStateUpdated[1] != utils._soldOutState);
            assert.isFalse(hasAirdrop);
            assert.isFalse(hasAirdropAfter);
            assert.equal(balanceAccount, 0);
        });
        
        it('claimAirdrop is available on Setup state', async () => {
            const account = accounts[1];
            const result = await contract.setStateToSetup();
            const eventStateUpdated = result.logs[0].args;
            
            await contract.addAirdrop([account], _qunatityAirdrop);
            await contract.claimAirdrop({from: account});
            
            assert.equal(eventStateUpdated[1], utils._setupState);
        });
        
        it('claimAirdrop is available on Presale state', async () => {
            const account = accounts[1];
            const result = await contract.setStateToPresale();
            const eventStateUpdated = result.logs[0].args;
            
            await contract.addAirdrop([account], _qunatityAirdrop);
            await contract.claimAirdrop({from: account});
            
            assert.equal(eventStateUpdated[1], utils._presaleState);
        });
        
        it('claimAirdrop is available on Sale state', async () => {
            const account = accounts[1];
            const result = await contract.setStateToSale();
            const eventStateUpdated = result.logs[0].args;
            
            await contract.addAirdrop([account], _qunatityAirdrop);
            await contract.claimAirdrop({from: account});
            
            assert.equal(eventStateUpdated[1], utils._saleState);
        });
        
        it('claimAirdrop isn\'t available on SoldOut state', async () => {
            const account = accounts[1];
            const result = await contract.setStateToSoldOut();
            const eventStateUpdated = result.logs[0].args;
            
            await contract.addAirdrop([account], _qunatityAirdrop);
            await exceptionsModule.catchRevert(contract.claimAirdrop({from: account}));
            
            assert.equal(eventStateUpdated[1], utils._soldOutState);
        });
    });
});