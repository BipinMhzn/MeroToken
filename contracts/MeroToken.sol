pragma solidity >=0.4.21 <0.6.0;

contract MeroToken{



	//Name
	string public name = "Mero Token";
	string public symbol = "MERO";
	string public standard = "Mero Token v1.0"; //standard is not needed in ERC20s


	mapping(address => uint256) public balanceOf;
	mapping(address => mapping(address => uint256)) public allowance;


	//Constructor


	//Set the total number of token

	//Read the the total number of  token

	//declaring state variable
	//for state variable getter function is auto generated by solidity
	uint256 public totalSupply;


	//events
	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
		);
	event Approval(
		address indexed _owner,
		address indexed _spender,
		uint256 _value
		);


	constructor(uint256 _initialSupply) public 
	{
		//msg is global variable in solidity
		//here it sends the migration account from ganache
		balanceOf[msg.sender] = _initialSupply; 

		//state variable :it accessible to entire contracts;
		totalSupply = _initialSupply;

		//allocate the initial supply


	}

	// Transfer
	//address is special data type in solidity
	function transfer(address _to,uint256 _value) public returns (bool success){

		require(balanceOf[msg.sender]>=_value);

		//Transfer
		balanceOf[msg.sender] -= _value;
		balanceOf[_to]  += _value;

		emit Transfer(msg.sender, _to, _value);

		return true;



	}



	//approve delegate
	function approve(address _spender, uint256 _value) public returns (bool success){
		//allowance: how is allowed to spend
		allowance[msg.sender][_spender] = _value;
		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
		//Require _from has enough tokens
		require(_value <= balanceOf[_from]);
		//Require allowance is big enough
		require(_value <= allowance[_from][msg.sender]);
		//Change balance
		allowance[_from][msg.sender] -= _value;

		balanceOf[_from] -= _value;
		balanceOf	[_to] += _value;

		//Update the allowance
		//Transfer event

		emit Transfer(_from, _to, _value);
		//return a boolean
		return true;
	}

}