pragma solidity ^0.8.0;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

 // Task 1: Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    constructor() ERC721('Star Token', 'STC') {    }

    struct Star {
        string name;
    }

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;


    // Create Star using the Struct
    // Passing the name and tokenId as a parameters
    function createStar(string memory _name, uint256 _tokenId) public { 
        // Star is a struct, create a new star
        Star memory newStar = Star(_name); 
        // Creating the Star in memory -> tokenId mapping
        tokenIdToStarInfo[_tokenId] = newStar; 
        // _mint assign the star with _tokenId to the sender address (ownership)
        _mint(msg.sender, _tokenId); 
    }

    // Putting a Star up for sale
    // (Adding the star tokenId into the mapping starsForSale, first verifying that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You cannot sell a Star you do not own.");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows converting an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return payable (address(uint160(x)));
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale.");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You do not have enough Ether.");
        transferFrom(ownerAddress, msg.sender, _tokenId); 
        // need to make this conversion to be able to use transfer() function to transfer ether
        address payable ownerAddressPayable = _make_payable(ownerAddress); 
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            payable(msg.sender).transfer(msg.value - starCost);
        }
    }

   
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
            // return the Star saved in tokenIdToStarInfo mapping
            if (bytes(tokenIdToStarInfo[_tokenId].name).length > 0 ) {
                return tokenIdToStarInfo[_tokenId].name;
            } else {
                return "* Unknown Star *";
            }
           
           
    }

      // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        require(ownerOf(_tokenId) == msg.sender, "You can't transfer a star you don't own");
        //2. Use the transferFrom(from, to, tokenId) function to transfer the Star
        transferFrom(msg.sender, _to1, _tokenId);
    }


    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //1. pass _tokenId1 and _tokenId2, check if the owner of one of them is the sender
        //2. no need to check for the price of the token (star) in this exercise
        //3. get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId1)
        //4. use _transfer function to exchange the tokens.

        address owner1 = ownerOf(_tokenId1);
        address owner2 = ownerOf(_tokenId2);
        require(owner1 == msg.sender || owner2 == msg.sender, "You can't exchange a Star you don't own");
        _transfer(owner1, owner2, _tokenId1);
        _transfer(owner2, owner1, _tokenId2);
      
    }

    function getOwner(uint256 _tokenId) public view returns (address) {
        address owner = ownerOf(_tokenId);
        return owner;
            
    }

}
