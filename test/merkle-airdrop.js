const truffleAssert = require('truffle-assertions');

const MerkleAirdrop = artifacts.require('MerkleAirdrop');
const MockToken = artifacts.require('MockToken');
const BN = web3.utils.BN;
const { combineProofs, merklize } = require('@phala/merkledrop-lib');
const bn1e18 = new BN('1000000000000000000');

contract('MerkleAirdrop', accounts => {
    const { fromWei, toWei } = web3.utils;

    let airdrop;
    let mock;
    let testSetup;
    const root = accounts[0];
    const testData = [
        { address: accounts[1], amount: 123.4567 },
        { address: accounts[2], amount: 0.001 },
        { address: accounts[3], amount: 2.001 },
    ];

    before(async () => {
        airdrop = await MerkleAirdrop.deployed();
        mock = await MockToken.deployed();

        // prepare
        await airdrop.setToken(mock.address);
        await mock.transfer(airdrop.address, toWei('129.4587')); // 125.4587 + 4

        // add merkle airdrop
        testSetup = merklize(testData, 'address', 'amount');
        await airdrop.start(testSetup.root, 'mock-data-uri');
    });

    it('should have enough mock token balance', async () => {
        const bn0 = new BN(0);
        const [balance, allowance] = await Promise.all([
            mock.balanceOf(root),
            mock.allowance(root, airdrop.address)]);
        assert(balance.gt(bn0));
    });

    it('should have one airdrop', async () => {
        assert(await airdrop.airdropsCount() == 1);
    });

    it('allows users to claim airdrop', async () => {
        for (let i = 0; i < testData.length - 1; i++) {
            const award = testSetup.awards[i];
            const address = accounts[i + 1];
            await airdrop.award(1, address, award.amountBN.toString(), award.proof);
            const received = await mock.balanceOf(address);
            assert(received.toString() == award.amountBN.toString());
        }
    });

    it('allows a user to claim multiple airdrops', async () => {
        const testData1 = [{ address: accounts[4], amount: 1 }, { address: accounts[5], amount: 1 }];
        const testData2 = [{ address: accounts[4], amount: 1 }, { address: accounts[5], amount: 1 }];

        const setup1 = merklize(testData1, 'address', 'amount');
        const setup2 = merklize(testData2, 'address', 'amount');

        const id1 = (await airdrop.airdropsCount()).toNumber() + 1;
        const id2 = id1 + 1;

        await airdrop.start(setup1.root, 'mock-data-uri');
        await airdrop.start(setup2.root, 'mock-data-uri');

        const curAirdropId = await airdrop.airdropsCount();
        assert(curAirdropId.eq(new BN(id2)), 'Airdrop count mismatch');

        const { combinedProof, proofLengths } = combineProofs([setup1.awards[0].proof, setup2.awards[0].proof]);
        await airdrop.awardFromMany(
            [id1, id2], accounts[4],
            [setup1.awards[0].amountBN.toString(), setup2.awards[0].amountBN.toString()],
            combinedProof, proofLengths
        );

        const balanceBN = await mock.balanceOf(accounts[4]);
        assert(balanceBN.eq(bn1e18.muln(2)), 'Wrong amount from airdrop');
    });

    it('refuses to claim when paused', async () => {
        await airdrop.setPause(1, true);

        const award = testSetup.awards[2];
        const address = accounts[3];
        await truffleAssert.reverts(
            airdrop.award(1, address, award.amountBN.toString(), award.proof),
            "PAUSED"
        );

        await airdrop.setPause(1, false);
        await airdrop.award(1, address, award.amountBN.toString(), award.proof);
        const received = await mock.balanceOf(address);

        console.log('received:' + received.toString());
        console.log('award.amountBN:' + award.amountBN.toString());

        assert(received.toString() == award.amountBN.toString(), "Wrong received");
    });

    it('refuses to change token without owner permission', async () => {
        await truffleAssert.reverts(
            airdrop.setToken(mock.address, { from: accounts[1] }), "Not Authorized");
    });

    it('refuses to pause an airdrop without owner permission', async () => {
        await truffleAssert.reverts(
            airdrop.setPause(1, true, { from: accounts[1] }), "Not Authorized");
    });

});
