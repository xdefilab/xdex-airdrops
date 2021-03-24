const isKovanEnv = () => {
  return Boolean(window.location.host.includes('kovan'))
}
const network = isKovanEnv() ? 'kovan' : 'mainnet';
const constants = {
    mainnet: {
        etherscanBase: 'https://etherscan.io',
        airdropAddress: '0x25fb9a4a430120e945c48f4a0dc7ce9b41ffde4f',
    },
    kovan: {
        etherscanBase: 'https://kovan.etherscan.io',
        airdropAddress: '0x93628AbB3CdeE99a6aE083813778303617F578E8'
    }
};

function loadMerkleAirdropContract(web3) {
    console.log('Loading contract', merkleAirdropAddress);
    return new web3.eth.Contract(merkleAirdropABI, merkleAirdropAddress);
}

const etherscanBase = constants[network].etherscanBase;
const merkleAirdropAddress = constants[network].airdropAddress;
const merkleAirdropABI = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Award","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"bool","name":"paused","type":"bool"}],"name":"PauseChange","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"}],"name":"Start","type":"event"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"airdrops","outputs":[{"internalType":"bytes32","name":"root","type":"bytes32"},{"internalType":"string","name":"dataURI","type":"string"},{"internalType":"bool","name":"paused","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"airdropsCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"bytes32[]","name":"_proof","type":"bytes32[]"}],"name":"award","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256[]","name":"_ids","type":"uint256[]"},{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256[]","name":"_amounts","type":"uint256[]"},{"internalType":"bytes","name":"_proofs","type":"bytes"},{"internalType":"uint256[]","name":"_proofLengths","type":"uint256[]"}],"name":"awardFromMany","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"address","name":"_recipient","type":"address"}],"name":"awarded","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"core","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes","name":"_proofs","type":"bytes"},{"internalType":"uint256","name":"_marker","type":"uint256"},{"internalType":"uint256","name":"proofLength","type":"uint256"}],"name":"extractProof","outputs":[{"internalType":"bytes32[]","name":"proof","type":"bytes32[]"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[],"name":"removeToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"bool","name":"_paused","type":"bool"}],"name":"setPause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"setToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"_root","type":"bytes32"},{"internalType":"string","name":"_dataURI","type":"string"}],"name":"start","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"root","type":"bytes32"},{"internalType":"bytes32[]","name":"proof","type":"bytes32[]"},{"internalType":"bytes32","name":"hash","type":"bytes32"}],"name":"validate","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"}]
export {
    network,
    etherscanBase,
    merkleAirdropAddress,
    merkleAirdropABI,
    loadMerkleAirdropContract
};