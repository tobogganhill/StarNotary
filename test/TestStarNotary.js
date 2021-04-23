const StarNotary = artifacts.require('StarNotary');

var accounts;
var owner;

contract('StarNotary', (accs) => {
	accounts = accs;
	owner = accounts[0];
});

it('can create a star', async () => {
	let tokenId = 1;
	let instance = await StarNotary.deployed();
	await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] });
	assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!');
});

it('lets user1 put up their star for sale', async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[1];
	let starId = 2;
	let starPrice = web3.utils.toWei('.01', 'ether');
	await instance.createStar('awesome star', starId, { from: user1 });
	await instance.putStarUpForSale(starId, starPrice, { from: user1 });
	assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[1];
	let user2 = accounts[2];
	let starId = 3;
	let starPrice = web3.utils.toWei('.01', 'ether');
	let balance = web3.utils.toWei('.05', 'ether');
	await instance.createStar('awesome star', starId, { from: user1 });
	await instance.putStarUpForSale(starId, starPrice, { from: user1 });
	let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
	//
	await instance.approve(user2, starId, { from: user1, gasPrice: 0 });
	//
	await instance.buyStar(starId, { from: user2, value: balance });
	let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
	let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
	let value2 = Number(balanceOfUser1AfterTransaction);
	assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[1];
	let user2 = accounts[2];
	let starId = 4;
	let starPrice = web3.utils.toWei('.01', 'ether');
	let balance = web3.utils.toWei('.05', 'ether');
	await instance.createStar('awesome star', starId, { from: user1 });
	await instance.putStarUpForSale(starId, starPrice, { from: user1 });
	let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
	//
	await instance.approve(user2, starId, { from: user1, gasPrice: 0 });
	//
	await instance.buyStar(starId, { from: user2, value: balance });
	assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[1];
	let user2 = accounts[2];
	let starId = 5;
	let starPrice = web3.utils.toWei('.01', 'ether');
	let balance = web3.utils.toWei('.05', 'ether');
	await instance.createStar('awesome star', starId, { from: user1 });
	await instance.putStarUpForSale(starId, starPrice, { from: user1 });
	let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
	const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
	//
	await instance.approve(user2, starId, { from: user1, gasPrice: 0 });
	//
	await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
	const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
	let value =
		Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
	assert.equal(value, starPrice);
});

it('can add the star name and star symbol properly', async () => {
	// 1. create a Star with different tokenId
	const instance = await StarNotary.deployed();

	//2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
	const name = await instance.name();
	const symbol = await instance.symbol();
	assert.equal(name, 'Star Token');
	assert.equal(symbol, 'STC');
});

it('lets 2 users exchange stars', async () => {
	const instance = await StarNotary.deployed();

	// 1. create 2 Stars with different tokenId
	const star1Id = 10;
	await instance.createStar('Star#10', star1Id, { from: accounts[1] });
	const star2Id = 11;
	await instance.createStar('Star#11', star2Id, { from: accounts[2] });

	// 2. Call the exchangeStars functions implemented in the Smart Contract
	await instance.exchangeStars(star2Id, star1Id, { from: accounts[1] });
	// 3. Verify that the owners changed
	const star1Owner = await instance.ownerOf(star1Id);
	const star2Owner = await instance.ownerOf(star2Id);
	assert.equal(star1Owner, accounts[2]);
	assert.equal(star2Owner, accounts[1]);
});

it('does not let a user exchange a star if he does not own it', async () => {
	const instance = await StarNotary.deployed();
	const star1Id = 70;
	await instance.createStar('Polaris', star1Id, { from: accounts[1] });
	const star2Id = 71;
	await instance.createStar('Riga', star2Id, { from: accounts[2] });
	try {
		await instance.exchangeStars(star2Id, star1Id, { from: accounts[3] });
		assert(false);
	} catch (e) {
		assert.equal(e.reason, "You can't exchange a Star you don't own");
	}
});

it('lets a user transfer a star', async () => {
	const instance = await StarNotary.deployed();
	// 1. create a Star with a different tokenId
	const starId = 55;
	await instance.createStar('Betelgeuse', starId, { from: accounts[1] });
	// 2. use the transferStar function implemented in the Smart Contract
	await instance.transferStar(accounts[2], starId, { from: accounts[1] });
	// 3. Verify the star owner changed
	const currentOwner = await instance.ownerOf(starId);
	assert.equal(currentOwner, accounts[2]);
});

it('does not let a user transfer a star if he does not own it', async () => {
	const instance = await StarNotary.deployed();
	// 1. create a Star with different tokenId
	const starId = 8;
	await instance.createStar('Sirius', starId, { from: accounts[1] });
	// 2. use the transferStar function implemented in the Smart Contract
	try {
		await instance.transferStar(accounts[1], starId, { from: accounts[2] });
		assert(false);
	} catch (e) {
		assert.equal(e.reason, "You can't transfer a star you don't own");
	}
});

it('lookUptokenIdToStarInfo test', async () => {
	const instance = await StarNotary.deployed();
	// 1. create a Star with different tokenId
	const starId = 6;
	await instance.createStar('Sol', starId, { from: accounts[1] });
	// 2. Call your method lookUptokenIdToStarInfo
	const star = await instance.lookUptokenIdToStarInfo(starId);
	// 3. Verify if you Star name is the same
	assert.equal(star, 'Sol');
});
