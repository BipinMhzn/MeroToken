const MeroToken = artifacts.require("./MeroToken.sol");
const MeroTokenSale = artifacts.require("./MeroTokenSale.sol");



module.exports = function (deployer) {
	//first paratmeter in MeroToken and rest parameter are for the constructor parameter
	deployer.deploy(MeroToken, 1000000).then(function () {
		// Token price is 0.001 Ehter
		var tokenPrice = 1000000000000000;
		return deployer.deploy(MeroTokenSale, MeroToken.address, tokenPrice);
	});

};