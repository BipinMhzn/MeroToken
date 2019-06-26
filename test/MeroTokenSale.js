var MeroTokenSale = artifacts.require('./MeroTokenSale.sol');
var MeroToken = artifacts.require('./MeroToken.sol');

contract('MeroTokenSale',function(accounts){

	var tokenSaleInstance;
	var tokenInstancd;
	var tokenPrice = 1000000000000000; // in wei
	var numberOfTokens;
	var buyer = accounts[1];
	//can control token available
	var admin = accounts[0];

	var tokensAvailable = 750000;


	it('initializes the contract with the correct values',function(){

		return MeroTokenSale.deployed().then(function(instance){
			tokenSaleInstance = instance
			return tokenSaleInstance.address
		}).then(function(address){
			assert.notEqual(address, 0x0, 'has contract address'); 
			return tokenSaleInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address, 0x0, 'has Token contract address'); 
			return tokenSaleInstance.tokenPrice();
		}).then(function(price){
			assert.equal(price, tokenPrice, 'token price is correct');
		})
	})


  it('facilitates token buying', function() {
    return MeroToken.deployed().then(function(instance) {
      // Grab token instance first
      tokenInstance = instance;
     
      return MeroTokenSale.deployed();
    }).then(function(instance) {
      // Then grab token sale instance

      tokenSaleInstance = instance;
      // Provision 75% of all tokens to the token sale
      return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
    }).then(function(receipt) {
     	 numberOfTokens = 10;
      //value is the numberOfTokens of token provided to buy the token
      return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice })
    }).then(function(receipt) {
    	// console.log("my receipt")
    	// console.log(receipt)
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
      assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
      return tokenSaleInstance.tokenSold();
    }).then(function(amount) {
      assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
      return tokenInstance.balanceOf(buyer);
    }).then(function(balance) {
   
      assert.equal(balance.toNumber(), numberOfTokens);
      return tokenInstance.balanceOf(tokenSaleInstance.address);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
      // Try to buy tokens different from the ether value
      return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
    }).then(assert.fail).catch(function(error) {
    	// console.log(error)
      	assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
        return tokenSaleInstance.buyTokens(80, { from: buyer, value: numberOfTokens * tokenPrice })
    }).then(assert.fail).catch(function(error){
    	// console.log("the super error is :")
    	// console.log(error)
    	assert(error.message.indexOf('revert') >= 0, 'cannot purhcase more tokens than tokensAvailable')
    })

})

   it("ends token sale", function(){
     return MeroToken.deployed().then(function(instance){
      tokenInstance = instance;
      return MeroTokenSale.deployed();
     }).then(function(instance){
      tokenSaleInstance = instance;

       // console.log("11the price are")
       //  console.log(tokenSaleInstance.tokenPrice())
      //try to end sale from account othe than the admin
      return tokenSaleInstance.endSale({ from: buyer });
     }).then(assert.fail).catch(function(error){
        assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
        return tokenSaleInstance.endSale({ from: admin })
     }).then(function(receipt){

         return tokenInstance.balanceOf(admin);
     }).then(function(balance){
        assert.equal(balance.toNumber(), 999990, 'return all the unsold token to admin');
        // return tokenSaleInstance.tokenPrice();
      })
     // .then(function(price){
     //    assert.equal(price.toNumber(), 0, 'token price was reset')
     //  })
  
   
  })

})



 



