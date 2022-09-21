import React from 'react'

import GetLikelyNFTs from './GetLikelyNFTs';

import * as nearAPI from 'near-api-js';


const { Contract, KeyPair, connect, keyStores } = nearAPI;

const getFetcher = (url) => fetch(url).then((res) => res.json());

// 

const RenderNFTs = async (data, setNFTs, accountId) => {

	const config = {
		networkId: 'testnet',
		keyStore: new keyStores.InMemoryKeyStore(),
		nodeUrl: 'https://rpc.testnet.near.org',
		archivalUrl: 'https://archival-rpc.testnet.near.org',
		walletUrl: 'https://wallet.testnet.near.org',
		helperUrl: 'https://helper.testnet.near.org',
	};

	if (data) {

		const near = await nearAPI.connect(config);
			const account = await near.account('havendao.near');
		for (const contract_id of data) {
			
			try {
				
				const contract = new Contract(
					account,
					contract_id,
					{
						viewMethods: ['nft_tokens_for_owner', 'nft_metadata'],
					}
				);

				const metadata = await contract.nft_metadata();

				const baseUri = metadata.base_uri;

				const res = await contract.nft_tokens_for_owner(
					{
						from_index: "0",
						limit: 100,
						account_id: accountId,
					}
				);
				
				for (const nft of res) {
					const media = nft.metadata.media;

					const image = media.startsWith('https') || media.startsWith('http') ? media : `${baseUri}/${nft.metadata.media}`
					
					let collection = '';

					if (contract_id === 'x.paras.near') {
						const response = await getFetcher(`https://api-v2-testnet.paras.id/token?token_id=${nft.token_id}`);
						collection = response.data.results[0].metadata.collection_id;
					}

					setNFTs(oldArray => [...oldArray, {
						name: nft.metadata.title,
						token_id: nft.token_id,
						contract: contract_id,
						collection: collection ? collection : metadata.name,
						image: image,
						owner: accountId,
					}])
				}

			}
			catch (err) {

			}
			
		}

		
	}
}	

export default RenderNFTs