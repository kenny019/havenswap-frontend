import {
    Flex,
    Box,
    Text,
    Button
} from '@chakra-ui/react';

import ImageCard from './ImageCard';

import { useState, useEffect } from 'react';

import { TransactionManager } from 'near-transaction-manager';

import { utils } from 'near-api-js';

import { getWallet } from '../lib/near';

import { functionCall } from 'near-api-js/lib/transaction';


const SWAP_CONTRACT = 'betaswap.testnet';

const getFetcher = (url) => fetch(url).then((res) => res.json());

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
			const outcomes = await transactionManager.bundleCreateSignAndSendTransactions(transactionArr);

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

			const outcomes = await transactionManager.bundleCreateSignAndSendTransactions(transactionArr);

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

export default OfferCard;