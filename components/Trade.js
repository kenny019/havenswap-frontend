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

import { useState, useEffect, useRef } from 'react';

import { MdVerified } from 'react-icons/md'

import * as nearAPI from 'near-api-js';
import Big from 'big-js';

import { utils } from 'near-api-js';

import { getWallet } from '../lib/near';

import { TransactionManager } from 'near-transaction-manager';
import { functionCall } from 'near-api-js/lib/transaction';

const SWAP_CONTRACT = 'betaswap.testnet'

const { Contract, KeyPair, connect, keyStores } = nearAPI;

let CURRENT_PRICE = 0;

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

const getFetcher = (url) => fetch(url).then((res) => res.json());

const SkeletonImages = () => {
	return (
		<Skeleton
		top={'10%'}
		w={['66px', '140px']} 
		/>
	)
}

const ImageCard = ({imageLink, title, tokenId, contract, collection}) => {
	const [verifiedArray, setVerifiedArray] = useState([]);

	const setVerified = async () => {
		setVerifiedArray(await getFetcher('/api/verified'));
	}

	useEffect(() => {
		setVerified();
	}, [])
	
	return (
		<Flex
		margin={'5px'}
		userSelect={'none'}
		alignItems={'center'}
		flexDir={'column'}
		>
			<Image
			objectFit={'cover'}
			w={['66px', '140px']} 
			alt={tokenId} 
			src={imageLink}
			top={'10%'}
			fallback={<SkeletonImages/>}
			/>
			{verifiedArray.includes(contract) ? <Icon
			pos={'absolute'}
			h={'0.9rem'} w={'1rem'} color={'blue.300'} marginTop={['3.35rem','8.1rem']} as={MdVerified}
			/> : <></>}
			<Text fontFamily={'montserrat'} maxW={['66px', '140px']} isTruncated textColor={'gray.200'} fontSize={['0.5rem', '0.6rem']} mt={'0.2rem'}>{collection}</Text>
			<Text fontFamily={'montserrat'} maxW={['66px', '140px']} isTruncated>{title}</Text>
			<Text fontFamily={'montserrat'} maxW={['66px', '140px']} isTruncated textColor={'gray.300'} fontSize={['0.6rem', '0.8rem']} mb={'0.5rem'}>{contract}</Text>
		</Flex>
	)
}

const OfferCard = ({ offerData, nearId }) => {

	const nanos = offerData.timestamp.toString()
	const timestamp = nanos.substring(
		0,
		nanos.length - 6
	);

	const offerTime = new Intl.DateTimeFormat('default', {
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	}).format(parseInt(timestamp));

	const [nearPrice, setNearPrice] = useState(0);

	const getPrice = async () => {
		try {
			const res = await getFetcher('https://helper.testnet.near.org/fiat');
			setNearPrice(res.near.usd);
			return
		}
		catch(err) {
			setNearPrice(0);
			return;
		}
	}

	useEffect(() => {
		getPrice()
	}, [])

	const acceptOffer = async (event) => {
		event.preventDefault();

		try { // nft_transfer_call
			const { near, wallet } = await getWallet();
			const transactionManager = TransactionManager.fromWallet(wallet);
			
			const transactionArr = [];

			let tempSent = [];

			offerData._received_nfts.forEach((sent) => {
				tempSent.push(JSON.stringify(sent))
			})

			const nftsToSend = offerData.receiver_nfts.filter((obj) => {
				
				let compareobj = {
					contract_id: obj.contract_id,
					token_id: obj.token_id,
				}
				
				if (!tempSent.includes(JSON.stringify(compareobj))) return obj;
			});

			
			const hash = offerData.hash;


			for (const nft of nftsToSend) {
				const transaction = await transactionManager.createTransaction({
					receiverId: nft.contract_id,
					actions: [functionCall('nft_transfer_call', {
						receiver_id: SWAP_CONTRACT,
						token_id: nft.token_id,
						approval_id: 0,
						msg: hash,
					}, 300000000000000, 1)]
				});
				transactionArr.push(transaction)
			}
			// const outcomes = await transactionManager.bundleCreateSignAndSendTransactions(transactionArr);

			await wallet.requestSignTransactions({
				transactions: transactionArr,
				callbackUrl: 'https://havenswap-frontend-j1mt.vercel.app/trade/' 
			})
			
		}
		catch (err) {
			
		}
		
	}

	const cancelOffer = async (event) => {
		event.preventDefault();

		try {
			const { near, wallet } = await getWallet();
			const transactionManager = TransactionManager.fromWallet(wallet);

			const transactionArr = [];

			const hash = offerData.hash;

			const transaction = await transactionManager.createTransaction({
				receiverId: SWAP_CONTRACT,
				actions: [functionCall('cancel_offer', {
					hash: hash,
				}, 300000000000000, 1)]
			}
			)
			await transactionArr.push(transaction)

			// const outcomes = await transactionManager.bundleCreateSignAndSendTransactions(transactionArr);

			await wallet.requestSignTransactions({
				transactions: transactionArr,
				callbackUrl: 'https://havenswap-frontend-j1mt.vercel.app/trade/'
			})
		}
		catch(err) {

		}
		
	}

	return (
		<Box
		px={'1rem'}
		py={'2rem'}
		backgroundColor={'#161617'}
		my={'1rem'}
		rounded={'lg'}
		boxShadow={'0 0.5em 1em -0.125em rgb(10 10 10 / 10%), 0 0 0 1px rgb(10 10 10 / 2%)'}
		border={'1px'}
		borderColor={'gray.800'}
		>
			<Flex
			flexDir={'column'}
			mx={'1rem'}
			>
				<Box 
				borderBottom={'1px'}
				borderBottomColor={'gray.700'}
				mb={'1rem'}
				>
					<Text fontFamily={'montserrat'} fontSize={'xs'} color={'gray.300'}>{offerTime}</Text>
					<Text fontFamily={'montserrat'} fontSize={['md', 'xl']}>Sender: {offerData.sender_id}</Text>
					{<Text fontFamily={'montserrat'} fontSize={['sm', 'md']} color={'gray.200'}>NEAR: {utils.format.formatNearAmount(offerData.sender_near)} Ⓝ (${
						(parseFloat(utils.format.formatNearAmount(offerData.sender_near)) * nearPrice).toFixed(2)
					})</Text>}
					<Flex my={'1rem'}
					alignItems={'flex-start'}
					flexWrap={'wrap'}
					alignContent={'flex-start'}
					overflowX={'hidden'}
					> 
					{offerData.sender_nfts.length > 0 ? offerData.sender_nfts.map((nft, i) => {
						return (
							<ImageCard 
							key={i} 
							imageLink={nft.image} 
							title={nft.title} 
							tokenId={nft.token_id} 
							contract={nft.contract_id}
							collection={nft.collection}
							/>
						)
					}) : <></>}
						
					</Flex>
				</Box>
				<Box 
				mb={'1rem'}
				>
					<Text fontFamily={'montserrat'} fontSize={['md', 'xl']}>Receiver: {offerData.receiver_id}</Text>
					<Flex my={'1rem'} 
					alignItems={'flex-start'}
					flexWrap={'wrap'}
					alignContent={'flex-start'}
					overflowX={'hidden'}>
						{offerData.receiver_nfts.length > 0 ? offerData.receiver_nfts.map((nft, i) => {
						return (
							<ImageCard 
							key={i} 
							imageLink={nft.image} 
							title={nft.title} 
							tokenId={nft.token_id} 
							contract={nft.contract_id}
							collection={nft.collection}
							/>
						)
					}) : <></>}
					</Flex>
				</Box>
				<Box>
					{
					offerData.sender_id !== nearId ?
					<Button 
					backgroundColor={'green.600'} 
					onClick={acceptOffer}
					mr={'1rem'}
					mb={['1rem', '0']}
					_hover={{
						backgroundColor: 'green.500',
					}}>Accept
					</Button>
					:
					<></>
					}
					<Button 
					onClick={cancelOffer}
					backgroundColor={'red.600'}
					_hover={{
						backgroundColor: 'red.500',
					}}
					>Cancel</Button>
				</Box>
			</Flex>
		</Box>
		
	)
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