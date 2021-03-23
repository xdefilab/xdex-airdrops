const MockToken = artifacts.require("MockToken");

module.exports = async function (deployer) {
    await deployer.deploy(MockToken, 'MOCK', 'MOCK', '10000000000000000000000000');
};
