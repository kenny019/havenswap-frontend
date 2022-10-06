import {
	Text,
	IconButton,
	Box,
	Button,
	Flex,
	Grid,
	Icon,
	Span,
	Heading,
	Skeleton,
	Image,
	Input,
	useDisclosure,
	Header,
	Tooltip
} from '@chakra-ui/react';

import '@fontsource/montserrat'
import '@fontsource/source-sans-pro'

import Alert from './Alert';
import OfferCard from './OfferCard';

import { useState, useEffect } from 'react';

import * as nearAPI from 'near-api-js';
import Big from 'big-js';

const SWAP_CONTRACT = 'betaswap.testnet'

const { Contract, KeyPair, connect, keyStores } = nearAPI;

const getFetcher = (url) => fetch(url).then((res) => res.json());

const GetOffers = async (accountId, setOfferData) => {

	const config = {
		networkId: 'testnet',
		keyStore: new keyStores.InMemoryKeyStore(),
		nodeUrl: 'https://rpc.testnet.near.org',
		archivalUrl: 'https://archival-rpc.testnet.near.org',
		walletUrl: 'https://wallet.testnet.near.org',
		helperUrl: 'https://helper.testnet.near.org',
	};

	try {
		const near = await nearAPI.connect(config);
		const account = await near.account(SWAP_CONTRACT);

		const contract = new Contract(
			account,
			SWAP_CONTRACT,
			{
				viewMethods: ['get_hashes_for_owner', 'get_transaction_data'],
			}
		);

		const hashes = await contract.get_hashes_for_owner({
			owner_id: accountId,
		});


		if (hashes.length < 1) {
			return [];
		}
		
		
		for (let i=0; i<hashes.length; i++) {
			const hash = hashes[i];

			try {
				const transactionData = await contract.get_transaction_data({
					hash: hash,
				});


				const senderNFTs = [];
				const receiverNFTs = [];
				
				for (const nft of transactionData.sender_nfts) {
					const nftContract = nft.contract_id;
					const tokenId = nft.token_id;

					try {

						const contract2 = new Contract(
							account,
							nftContract,
							{
								viewMethods: ['nft_metadata', 'nft_token'],
							}
						);

						const metadata = await contract2.nft_metadata();
						const baseUri = metadata.base_uri;

						const nftMetadata = await contract2.nft_token(
							{
								token_id: tokenId,
							}
						);

						const media = nftMetadata.metadata.media;

						const image = media.startsWith('https') || media.startsWith('http') ? media : `${baseUri}/${media}`;

						let collection = '';

						if (nftContract === 'x.paras.near') {
							const response = await getFetcher(`https://api-v2-testnet.paras.id/token?token_id=${tokenId}`);
							collection = response.data.results[0].metadata.collection_id;
						}
						senderNFTs.push({
							title: nftMetadata.metadata.title,
							image: image,
							token_id: tokenId,
							contract_id: nftContract,
							collection: collection ? collection : metadata.name,
						})
					}
					catch(err) {
						console.log(err)
					}
					
				}

				for (const nft of transactionData.receiver_nfts) {
					const nftContract = nft.contract_id;
					const tokenId = nft.token_id;

					try {
						const contract3 = new Contract(
						account,
						nftContract,
							{
								viewMethods: ['nft_metadata', 'nft_token'],
							}
						);

						const metadata = await contract3.nft_metadata();

						const baseUri = metadata.base_uri ? metadata.base_uri : '';

						const nftMetadata = await contract3.nft_token(
							{
								token_id: tokenId,
							}
						);

						const media = nftMetadata.metadata.media;

						const image = media.startsWith('https') || media.startsWith('http') ? media : `${baseUri}/${media}`;

						let collection = '';
						
						if (nftContract === 'x.paras.near') {
							const response = await getFetcher(`https://api-v2-testnet.paras.id/token?token_id=${tokenId}`);
							collection = response.data.results[0].metadata.collection_id;
						}

						receiverNFTs.push({
							title: nftMetadata.metadata.title,
							image: image,
							token_id: tokenId,
							contract_id: nftContract,
							collection: collection ? collection : metadata.name,
						})
					}
					catch(err) {
						console.log(err)
					}
					
				}

				setOfferData(oldArray => [...oldArray, {
					sender_id: transactionData.sender_id,
					sender_nfts: senderNFTs,
					_sent_nfts: transactionData.sent_nfts,
					sender_near: Big(transactionData.sender_near).toFixed(),
					receiver_nfts: receiverNFTs,
					receiver_id: transactionData.receiver_id,
					_received_nfts: transactionData.received_nfts,
					timestamp: transactionData.timestamp,
					hash: hash,
				}])
			}
			catch(err) {

			}
			
		}

	}
	catch (err) {

	}

		
}	

const Trade = ({ nearId, query }) => {

	const [offerData, setOfferData] = useState([]);
	const [showAlert, setShowAlert] = useState(false);
	const [alertObj, setAlertObj] = useState({})

	const handleAlert = () => {
		if (query.transactionHashes || query.errorCode ) {
			if (!query.errorCode) {
				setAlertObj({
					title: 'Successfully Sent Transaction',
					status: 'success',
					message: `https://explorer.testnet.near.org/transactions/${decodeURIComponent(query.transactionHashes).split(',')[0]}` // change here
				})
				return
			}
			if (query.errorCode === 'userRejected') {
				setAlertObj({
					title: 'Cancelled Transaction',
					status: 'warn',
					message: 'Transaction was not sent'
				})
				return
			}
			setAlertObj({
				title: 'An error has occured',
				status: 'error',
				message: decodeURIComponent(query.errorMessage) 
			})
		}
	}

	useEffect(() => {
		GetOffers(nearId, setOfferData);
		if (query.transactionHashes || query.errorCode) {
			handleAlert()
			setShowAlert(true);
			setTimeout(() => {
				setShowAlert(false);
			}, 5000)
		}
	}, [nearId])

	if (!nearId) {
		return (
			<>
			<Box px={'2rem'} py={'2rem'}>
				<Flex minW={'100%'} margin={'0 auto'} alignItems={'center'} justifyContent={'center'} py={'2rem'}>
					<Heading>
						Connect your wallet
					</Heading>
				</Flex>
			</Box>
			</>
		)
	}

	return (
		// 
		<>
		{showAlert && <Alert message={alertObj.message} status={alertObj.status} title={alertObj.title}/>}
			<Box 
			paddingTop={['5rem', '10rem']}
			>
				<Flex maxW={['100vw', '75vw']} minW={'400px'} h={'100%'} flexDir={'row'} mx={'auto'} paddingBottom={['20%', '8%']}>
					<Box display={['none', 'inline-block']} paddingTop={'1rem'} userSelect={'none'}>
						<Text pr={'1rem'} textColor={'gray.200'} fontSize={'1rem'} fontFamily={'Montserrat'}>Offers</Text>
					</Box>
					<Flex marginLeft={'18%'} marginRight={'auto'} flexDir={'column'} w={'60%'}>
						<Text as='i' fontSize={'0.8rem'} color={'gray.300'}>Disclaimer:</Text> <br/>
						<Text as='i' fontSize={'0.8rem'} color={'gray.300'}>
Please check if the NFTs sent/received are from the correct corresponding contract wallets, and that the USD value for the NEAR tokens received are accurate. Haven will not be responsible for any carelessness.</Text>
						<br/>
						{
							offerData.length > 0 ? offerData.sort((a,b) => {
								if (a.timestamp < b.timestamp) return 1
								if (b.timestamp < a.timestamp) return -1
								return 0
							}).map((offer, i) => {
								return (
									<OfferCard key={i} nearId={nearId} offerData={offer}/>
								)
							}) : <></>
						}
					</Flex>
				</Flex>
			</Box>
		</>
	);
}

export default Trade