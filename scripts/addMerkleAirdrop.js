// USAGE:
//  WORKDIR='./tmp/airdrop1' DRYRUN=1 truffle exec ./scripts/addMerkleAirdrop.js --network development
//  WORKDIR='./tmp/airdrop1' DRYRUN=1 truffle exec ./scripts/addMerkleAirdrop.js --network kovan
//  WORKDIR='./tmp/prod/airdrop1' DRYRUN=1 truffle exec ./scripts/addMerkleAirdrop.js --network mainnet

require('dotenv').config()

const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const pinataSDK = require('@pinata/sdk');
const { merklize, toMaterializable } = require('@phala/merkledrop-lib');

const MerkleAirdrop = artifacts.require('MerkleAirdrop');
//const PHAToken = artifacts.require('PHAToken');

const dryrun = parseInt(process.env.DRYRUN || '1');
const workdir = process.env.WORKDIR;
const pinataApi = process.env.PINATA_API;
const pinataKey = process.env.PINATA_KEY;
// const network = process.env.NETWORK || 'mainnet';

const csvFile = `${workdir}/inputs.csv`;
const outJson = `${workdir}/plan.json`;
const outManifest = `${workdir}/manifest.json`;

// const constants = {
//     mainnet: {
//         root: '0x25fb9a4a430120e945c48f4a0dc7ce9b41ffde4f',
//         xdexTokenAddress: '0x000000000000d0151e748d25b766e77efe2a6c83',
//     },
//     kovan: {
//         root: '0x93628AbB3CdeE99a6aE083813778303617F578E8',
//         xdexTokenAddress: '0xD88b39C71b183AC37362d5A8E620b676502F8F91',
//     }
// };
// const netConsts = constants[network];


function loadcsv(path) {
    const input = fs.readFileSync(path, 'utf-8');
    return parse(input, {
        columns: true,
        skip_empty_lines: true
    })
}

async function initPinata() {
    const pinata = pinataSDK(pinataApi, pinataKey);
    await pinata.testAuthentication();
    return pinata;
}

async function publishPlanToIpfs(pinata, path, name) {
    const { IpfsHash } = await pinata.pinFromFS(path, {
        pinataMetadata: { name },
    });
    return IpfsHash;
}

async function main() {
    console.log('Start with', { dryrun });

    const airdrop = await MerkleAirdrop.deployed();
    //const pha = await PHAToken.deployed();
    const [account] = await web3.eth.getAccounts();

    const curDrops = await airdrop.airdropsCount();
    console.log('Current airdrops:', curDrops.toNumber());

    console.log('csvFile:' + csvFile.toString());

    // suppose to be: address,amount,xxx,yyy...
    let airdropData = loadcsv(csvFile);
    // check csv columns
    airdropData = airdropData
        .map(r => { return { ...r, amount: parseFloat(r.amount) } })
        .filter(r => r.address && r.amount);
    if (airdropData.length == 0) {
        console.error('Empty csv file or missing columns');
        return;
    }
    console.log(airdropData);

    // create merkle tree
    const merklized = merklize(airdropData, 'address', 'amount');
    const plan = toMaterializable(merklized);
    plan.id = curDrops.toNumber() + 1;
    console.log("Got plan.id:" + plan.id.toString());

    // materilize airdrop plan
    const planJson = JSON.stringify(plan);
    fs.writeFileSync(outJson, planJson, { encoding: 'utf-8' });

    // publish the plan to IPFS
    console.log('Publishing to IPFS...');
    const contractAddrPrefix = airdrop.address.substring(2, 8);

    //const pinata = await initPinata();
    //const hash = await publishPlanToIpfs(pinata, outJson, `merkle-airdrop-${contractAddrPrefix}-${plan.id}`);
    const hash = 'https://static.xdefi.com/airdrop/plan.json';

    // save manifest
    const manifest = {
        id: plan.id,
        ipfsHash: hash,
        timestamp: (new Date()).getTime(),
    };
    const manifestJson = JSON.stringify(manifest);
    fs.writeFileSync(outManifest, manifestJson, { encoding: 'utf-8' });

    // !!!
    const total = merklized.awards.map(a => parseFloat(a.amount)).reduce((a, x) => a + x, 0);
    console.log('About to add merkle airdrop', {
        root: merklized.root,
        size: merklized.awards.length,
        total,
        manifest
    });

    if (dryrun) {
        console.log('Dryrun enabled. Exiting...');
        return;
    }

    const uri = '/ipfs/' + hash;
    console.log('Adding airdrop', { root: merklized.root, uri });
    const r = await airdrop.start(merklized.root, uri, { gas: 150000, gasPrice: 125 * 1e9, nonce: undefined });
    console.log('Done', r);
}


module.exports = async function (callback) {
    try {
        await main();
        callback();
    } catch (err) {
        console.error(err.message);
        callback(err);
    }
}