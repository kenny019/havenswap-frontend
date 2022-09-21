import * as nearAPI from 'near-api-js';

const config = {
	"networkId": "testnet",
	"nodeUrl": "https://rpc.testnet.near.org",
	"walletUrl": "https://wallet.testnet.near.org/",
	"helperUrl": "https://helper.testnet.near.org",
	"contractName": "betaswap.testnet"
}

export const getWallet = async () => {
	let near;
	try {
		near = await nearAPI.connect({
			networkId: config.networkId, 
			nodeUrl: config.nodeUrl, 
			walletUrl: config.walletUrl, 
			deps: { 
				keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() 
			},
		});
	}
	catch (e) {
		near = await nearAPI.connect({
			networkId: config.networkId, 
			nodeUrl: 'https://public-rpc.blockpi.io/http/near-testnet', 
			walletUrl: config.walletUrl, 
			deps: { 
				keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() 
			},
		});
	}
	

	const wallet = new nearAPI.WalletAccount(near);
	return { near, wallet };
};

export const createAccessToken = async (wallet, data) => {
	const accountId = wallet.getAccountId();
	const tokenMessage = btoa(data);
	const signature = await wallet.account()
		.connection.signer
		.signMessage(new TextEncoder().encode(tokenMessage), accountId, 'testnet');

	return tokenMessage + '.' + btoa(String.fromCharCode(...signature.signature)) + '.' + btoa(String.fromCharCode(...signature.publicKey.data));
}