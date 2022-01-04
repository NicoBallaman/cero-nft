const { assert } = require('chai');
const ceroContract = artifacts.require('./Cero.sol');

require('chai').use(require('chai-as-promised')).should();



contract('Cero', (accounts)=>{

    let contract;
    const _defaultBaseTokenUri = '';
    const _updateBaseTokenUri = 'https://ethereum.org/';
    const _tokenIdTestUri = 88;

    before(async () => {
        contract = await ceroContract.deployed();
    });

    describe('baseTokenUri', async () => {

        it('default baseTokenUri is empty', async () => {
            const defaultBaseTokenURI = await contract.baseTokenURI();
            assert.equal(defaultBaseTokenURI, _defaultBaseTokenUri);
        });

        it(`update baseTokenUri to ${_updateBaseTokenUri}`, async () => {
            const currentBaseTokenURI = await contract.baseTokenURI();
            const newBaseTokenURI = _updateBaseTokenUri;
            await contract.setBaseTokenURI(newBaseTokenURI);
            const updatedBaseTokenURI = await contract.baseTokenURI();
            assert.notEqual(currentBaseTokenURI, newBaseTokenURI);
            assert.equal(updatedBaseTokenURI, newBaseTokenURI);
        });
        
        it(`tokenURI for ${_tokenIdTestUri} tokenId is equal to baseTokenUri + tokenId`, async () => {
            const tokenId = _tokenIdTestUri;
            const currentBaseTokenURI = await contract.baseTokenURI();
            const tokenUri = currentBaseTokenURI + tokenId;
            const fullTokenURI = await contract.tokenURI(tokenId);
            assert.equal(tokenUri, fullTokenURI);
        });
    });

});