const { assert } = require('chai');
const ceroContract = artifacts.require('./Cero.sol');
const exceptionsModule = require('./exception.js');
const utils = require('./utils.js');

require('chai').use(require('chai-as-promised')).should();



contract('Cero', (accounts)=>{

    let contract;
    const _qunatityPresale = 10;

    before(async () => {
        contract = await ceroContract.deployed();
    });

    describe('presaleList', async () => {


        it('addToPresaleList address when state is Presale', async () => {
            const resultState = await contract.setStateToPresale();
            const eventState = resultState.logs[0].args[1];
            const account = accounts[1];
            await contract.addToPresaleList([account], _qunatityPresale);
            const result = await contract.isOnPresaleList(account);
            assert.isTrue(result);
            assert.equal(eventState, utils._presaleState); //Current state is Presale
        });

        it('addToPresaleList address when state is Setup', async () => {
            const resultState = await contract.setStateToSetup();
            const eventState = resultState.logs[0].args[1];
            const account = accounts[1];
            await contract.addToPresaleList([account], _qunatityPresale);
            const resultIsOnPresale = await contract.isOnPresaleList(account);
            assert.isTrue(resultIsOnPresale);
            assert.equal(eventState, utils._setupState); //Current state is Setup
        });

        it('addToPresaleList an list of address', async () => {
            const resultState = await contract.setStateToSetup();
            const eventState = resultState.logs[0].args[1];
            const accountList = [accounts[2], accounts[3], accounts[6], accounts[7]];
            await contract.addToPresaleList(accountList, _qunatityPresale);
            const resultAccount0 = await contract.isOnPresaleList(accountList[0]);
            const resultAccount1 = await contract.isOnPresaleList(accountList[1]);
            assert.isTrue(resultAccount0 && resultAccount1);
            assert.equal(eventState, utils._setupState); //Current state is Setup
        });

        it('addToPresaleList don\'t add address when list contain an zero address', async () => {
            const resultState = await contract.setStateToSetup();
            const eventState = resultState.logs[0].args[1];
            const accountList = [accounts[4], accounts[5], utils._zeroAddress];
            await exceptionsModule.catchRevert(contract.addToPresaleList(accountList, _qunatityPresale));
            const resultAccount0 = await contract.isOnPresaleList(accountList[0]);
            const resultAccount1 = await contract.isOnPresaleList(accountList[1]);
            const resultAccount2 = await contract.isOnPresaleList(accountList[2]);
            assert.isFalse(resultAccount0 || resultAccount1 || resultAccount2);
            assert.equal(eventState, utils._setupState); //Current state is Setup
        });

        it('addToPresaleList revert when address is zero', async () => {
            const resultState = await contract.setStateToPresale();
            const eventState = resultState.logs[0].args[1];
            await exceptionsModule.catchRevert(contract.addToPresaleList([utils._zeroAddress], _qunatityPresale));
            const result = await contract.isOnPresaleList(utils._zeroAddress);
            assert.isFalse(result);
            assert.equal(eventState, utils._presaleState); //Current state is Presale
        });

        
        it('addToPresaleList is not active when state is Sale', async () => {
            const resultState = await contract.setStateToSale();
            const eventState = resultState.logs[0].args[1];
            await exceptionsModule.catchRevert(contract.addToPresaleList([accounts[1]], _qunatityPresale));
            assert.equal(eventState, utils._saleState); //Current state is Sale
        });

        it('addToPresaleList is not active when state is SoldOut', async () => {
            const resultState = await contract.setStateToSoldOut();
            const eventState = resultState.logs[0].args[1];
            await exceptionsModule.catchRevert(contract.addToPresaleList([accounts[1]], _qunatityPresale));
            assert.equal(eventState, utils._soldOutState); //Current state is SoldOut
        });

        it('removeFromPresaleList an existing address in presaleList', async () => {
            const prevStatus = await contract.isOnPresaleList(accounts[1]);
            await contract.removeFromPresaleList([accounts[1]]);
            const currStatus = await contract.isOnPresaleList(accounts[1]);
            assert.isTrue(prevStatus);
            assert.isFalse(currStatus);
        });

        it('removeFromPresaleList an existing list of address in presaleList', async () => {
            const accountExist1 = accounts[2];
            const accountExist2 = accounts[3];
            const accountList = [accountExist1, accountExist2];
            const prevStatus2 = await contract.isOnPresaleList(accountExist1);
            const prevStatus3 = await contract.isOnPresaleList(accountExist2);
            await contract.removeFromPresaleList(accountList);
            const currStatus2 = await contract.isOnPresaleList(accountExist1);
            const currStatus3 = await contract.isOnPresaleList(accountExist2);
            assert.isTrue(prevStatus2 && prevStatus3);
            assert.isFalse(currStatus2 || currStatus3);
        });

        it('removeFromPresaleList an not existing address in presaleList', async () => {
            const accountNotExist = accounts[4];
            const prevStatus = await contract.isOnPresaleList(accountNotExist);
            await contract.removeFromPresaleList([accountNotExist]);
            const currStatus = await contract.isOnPresaleList(accountNotExist);
            assert.isFalse(prevStatus);
            assert.isFalse(currStatus);
        });

        it('removeFromPresaleList an list of address with zero address', async () => {
            const accountNotExist1 = accounts[4];
            const accountNotExist2 = accounts[6];
            const accountList = [accountNotExist1, accountNotExist2, utils._zeroAddress];
            const prevStatus0 = await contract.isOnPresaleList(accountNotExist2);
            const prevStatus1 = await contract.isOnPresaleList(accountNotExist1);
            const prevStatus2 = await contract.isOnPresaleList(utils._zeroAddress);
            await exceptionsModule.catchRevert(contract.removeFromPresaleList(accountList));
            const currStatus0 = await contract.isOnPresaleList(accountNotExist2);
            const currStatus1 = await contract.isOnPresaleList(accountNotExist1);
            const currStatus2 = await contract.isOnPresaleList(utils._zeroAddress);
            assert.equal(prevStatus0, currStatus0);
            assert.equal(prevStatus1, currStatus1);
            assert.equal(prevStatus2, currStatus2);
        });

    });

});