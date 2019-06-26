App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    App.web3Provider.enable();
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("MeroTokenSale.json", function(meroTokenSale) {
      App.contracts.MeroTokenSale = TruffleContract(meroTokenSale);
      App.contracts.MeroTokenSale.setProvider(App.web3Provider);
      App.contracts.MeroTokenSale.deployed().then(function(meroTokenSale) {
        console.log("address")
        console.log("Mero Token Sale Address:", meroTokenSale.address);
      });
    }).done(function() {
      $.getJSON("MeroToken.json", function(meroToken) {
        App.contracts.MeroToken = TruffleContract(meroToken);
        App.contracts.MeroToken.setProvider(App.web3Provider);
        App.contracts.MeroToken.deployed().then(function(meroToken) {

  
          console.log("Mero Token Address:", meroToken.address);
        });
     
         App.listenForEvents();
        return App.render();
      })
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.MeroTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {

      return;
    }

    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

    console.log("the contracts")

    console.log(App.contracts)
    

  // Load token sale contract
    App.contracts.MeroTokenSale.deployed().then(function(instance) {
      meroTokenSaleInstance = instance;
      return meroTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;

       $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
     
      return meroTokenSaleInstance.tokenSold();
    }).then(function(tokensSold) {
       App.tokensSold = tokensSold.toNumber();
      // App.tokensSold = 600000;
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.MeroToken.deployed().then(function(instance) {
        meroTokenInstance = instance;
        return meroTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.dapp-balance').html(balance.toNumber());
         App.loading = false;
         loader.hide();
         content.show();
      })

    });
  },

  //buy tokens by investor
  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();

    App.contracts.MeroTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      }); 
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      createReceiptTable(result.receipt);
      App.loading = false;
      loader.hide();
      content.show();    
    });
  },
  //--------------------------------------------
  //manage token
  //--------------------------------------------
  //send Token
  sendToken: function(){
    $('#content').hide();
    $('#loader').show();
    var inputAmountSendToken = $('#inputAmountSendToken').val();
    var inputBeneficiarySendToken = $('#inputBeneficiarySendToken').val();
    
    App.contracts.MeroToken.deployed().then(function(instance) {
      return instance.transfer(inputBeneficiarySendToken, inputAmountSendToken, {from: App.account});
    }).then(function(result) {
      $('form').trigger('reset');
      createReceiptTable(result.receipt);

      // $('.dapp-balance').html(instance.balance.toNumber());
      App.loading = false;
      $('#loader').hide();
      $('#content').show(); 
    });
  },

  //allow Token
  approveToken: function(){
    $('#content').hide();
    $('#loader').show();

    var inputApproveToken = $('#inputApproveToken').val();
    var inputBeneficiaryApproveToken = $('#inputBeneficiaryApproveToken').val();

    App.contracts.MeroToken.deployed().then(function(instance) {
      return instance.approve(inputBeneficiaryApproveToken, inputApproveToken, {from: App.account});
    }).then(function(result) {
    
      createReceiptTable(result.receipt);
      App.loading = false;
      $('#loader').hide();
      $('#content').show(); 
    });
  },

  TransferFromToken: function() {
    $('#content').hide();
    $('#loader').show();

    var inputTransferFromAddress = $('#inputTransferFromAddress').val();
    var inputTransferToAddress = $('#inputTransferToAddress').val();
    var inputTransferFromToken = $('#inputTransferFromToken').val();

    App.contracts.MeroToken.deployed().then(function(instance){
      return instance.transferFrom(inputTransferFromAddress, inputTransferToAddress, inputTransferFromToken, { from: App.account });
    }).then(function(result){
      createReceiptTable(result.receipt);
      App.loading = false;
      $('#loader').hide();
      $('#content').show(); 
    })
  },

  //check allowance balance
  allowanceBalance: function() {
    var inputSenderAddress = $('#inputSenderAddress').val();

    App.contracts.MeroToken.deployed().then(function(instance){
      return instance.allowance(inputSenderAddress, App.account);
    }).then(function(result){
      alert(result);
    })
  }

}

$(function() {
  $(window).load(function() {
    App.init();
  })
});



