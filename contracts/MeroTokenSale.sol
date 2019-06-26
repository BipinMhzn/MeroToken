pragma solidity >=0.4.21 <0.6.0; 

import "./MeroToken.sol";

contract MeroTokenSale{

	 // event test_value(uint256 indexed value1);

	address  admin;

	MeroToken public tokenContract;
	uint256 public tokenPrice;

	//stores no of token that is sold
	uint256 public tokenSold;

	//event
	event Sell(address _buyer, uint256 _amount);

	constructor(MeroToken _tokenContract, uint256 _tokenPrice) public{
		//Assign an admin(can end the token sale)
		admin = msg.sender;
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;


		//Token Contract
		

		//Token Price
	}

	// pure means it would not do any transcaction in the blockchain
	function multiply(uint x, uint y) internal pure returns(uint z){
		require(y == 0 || (z = x * y)/ y == x);
	}

	//payable because we want to transfer ether
	 function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        //require token has enough token
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

        //requier transfer is called succesfully
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokenSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }

    //ending token sale
    function endSale() public{
    	//only adminc can do it
    	require(msg.sender == admin);

    	//transfer remainin  dapp tokens to admin
    	require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));


    	 selfdestruct(address(uint160(admin)));




    	// 	address(uint160(admin)).transfer(address(this).balance);
    	//destryo contract
   		 // selfdestruct(msg.sender);
   			// In Update code
   		// 
    }
}