import Web3 from 'web3';
import starNotaryArtifact from '../../build/contracts/StarNotary.json';

const App = {
	web3: null,
	account: null,
	meta: null,

	start: async function () {
		const { web3 } = this;

		try {
			// get contract instance
			const networkId = await web3.eth.net.getId();
			const deployedNetwork = starNotaryArtifact.networks[networkId];
			this.meta = new web3.eth.Contract(
				starNotaryArtifact.abi,
				deployedNetwork.address
			);

			// get accounts
			const accounts = await web3.eth.getAccounts();
			this.account = accounts[0];
		} catch (error) {
			console.error('Could not connect to contract or blockchain.');
		}
	},

	setStatus: function (message) {
		const status = document.getElementById('status');
		status.innerHTML = message;
	},

	createStar: async function () {
		const { createStar } = this.meta.methods;
		const name = document.getElementById('starName').value;
		const id = document.getElementById('starId').value;
		await createStar(name, id).send({ from: this.account });
		App.setStatus(
			'New owner of star ' +
				name +
				' with ID ' +
				id +
				' is ' +
				this.account +
				'.'
		);
	},

	//TODO: Task 4 Modify the front end of the DAPP
	lookUp: async function () {
		const { lookUptokenIdToStarInfo } = this.meta.methods;
		const id = document.getElementById('lookId').value;
		const name = await lookUptokenIdToStarInfo(id).call();
		App.setStatus('Star with ID ' + id + ' is named ' + name + '.');
	},

	transferStar: async function () {
		const { transferStar } = this.meta.methods;
		const addressTo = document.getElementById('addressTo').value;
		const token = document.getElementById('transferId').value;
		console.log('Star to transfer ownership of: ' + token);
		let owner = await transferStar(addressTo, token).send({
			from: this.account,
		});
		App.setStatus(
			'Ownership of Star has been transferred to ' + addressTo + '.'
		);
	},

	getOwner: async function () {
		const { getOwner } = this.meta.methods;
		const ownerStarId = document.getElementById('ownerStarId').value;
		let owner = await getOwner(ownerStarId).call();
		App.setStatus('Star Owner of ID ' + ownerStarId + ' is ' + owner + '.');
	},

	exchangeStars: async function () {
		const { exchangeStars } = this.meta.methods;
		const token1 = document.getElementById('token1').value;
		const token2 = document.getElementById('token2').value;
		await exchangeStars(token1, token2).send({ from: this.account });
		App.setStatus('Star ownership has been exchanged.');
	},
};

window.App = App;

window.addEventListener('load', async function () {
	if (window.ethereum) {
		// use MetaMask's provider
		App.web3 = new Web3(window.ethereum);
		await window.ethereum.enable(); // get permission to access accounts
	} else {
		console.warn(
			'No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live'
		);
		// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
		App.web3 = new Web3(
			new Web3.providers.HttpProvider('http://127.0.0.1:9545')
		);
	}

	App.start();
});
