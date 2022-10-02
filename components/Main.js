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

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  NumberInput,
  NumberInputField,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputStepper,
} from '@chakra-ui/react'

import { useState, useEffect, useRef } from 'react';
import { MdVerified } from 'react-icons/md'
import Dialog from './Dialog'
import Alert from './Alert';
import { getWallet } from '../lib/near';

import RenderNFTs from '../lib/RenderNFTs';

import { AiOutlineSwap } from 'react-icons/ai';

import '@fontsource/source-sans-pro';
import '@fontsource/montserrat';

import { KeyPair, keyStores, connect, utils, providers } from "near-api-js";

//network config (replace testnet with testnet or betanet)
const provider = new providers.JsonRpcProvider('https://rpc.testnet.near.org')

import crypto from 'crypto'

import { TransactionManager } from 'near-transaction-manager';
import { functionCall } from 'near-api-js/lib/transaction';
/* 
	Hardcoded for testing purposes!
	find a way to populate the likelynfts :)
*/

const getFetcher = (url) => fetch(url).then((res) => res.json());

// end of testing stuff

const SWAP_CONTRACT = 'betaswap.testnet'

const sentNFTs = [];
const receiveNFTs = [];

function removeItemOnce(arr, value) {
	var index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	return arr;
}

const SkeletonCard = () => {
	return (
		<Skeleton
		height={'115px'}
		position={'relative'}
		minW={'calc(33.33% - 12px)'}
		margin={'5px'}
		rounded={'md'}
		/>
	)
}

const SkeletonImages = () => {
	return (
		<Skeleton
		pos={'absolute'}
		top={'10%'}
		h={'66px'}
		w={'66px'}
		/>
	)
}


const NFTCard = ({ name, image, pos, NFTs, setShowDialog, setDialogObject, nearid, clickedArray, setClickedArray }) => {
	/* 
		fetch the image from the contract
		whilst image is being loaded, display a skeleton
	*/
	const [isClicked, setIsClicked] = useState(false);

	const handleClick = async (event) => {
		event.preventDefault();

		const owner = NFTs.owner;

		if (!isClicked) { // user wants to trade this nft
			// check which user does this nft belong to
			// if owner is not recipient we push to sentNFTs
			// else push to receiveNFTs

			if (owner === nearid && !sentNFTs.some(e => `${e.name}${e.collection}` == `${NFTs.name}${NFTs.collection}`)) {
				sentNFTs.push(NFTs);

				setClickedArray(prev => [...prev, pos])
				
			}
			else if (owner !== nearid && !receiveNFTs.some(e => `${e.name}${e.collection}` == `${NFTs.name}${NFTs.collection}`)) {
				receiveNFTs.push(NFTs);

				setClickedArray(prev => [...prev, pos])
				
			}

		}
		else {
			if (owner === nearid && sentNFTs.some(e => `${e.name}${e.collection}` == `${NFTs.name}${NFTs.collection}`)) {
				removeItemOnce(sentNFTs, NFTs)
				removeItemOnce(clickedArray, pos)
				

			}
			else if (owner !== nearid && receiveNFTs.some(e => `${e.name}${e.collection}` == `${NFTs.name}${NFTs.collection}`)) {
				removeItemOnce(receiveNFTs, NFTs)
				removeItemOnce(clickedArray, pos)
			}
		}

		await setIsClicked(!isClicked);

	}

	const handleMouseEnter = (event) => {
		event.preventDefault();
		setDialogObject({
			collection:  NFTs.collection,
			contract: NFTs.contract
		})
		setShowDialog(true)
	}

	const handleMouseLeave = (event) => {
		event.preventDefault();
		setShowDialog(false)
		setDialogObject({
			collection:  '',
			contract: ''
		})
	}

	return (
		<Flex
		minH={'115px'}
		minW={'calc(33.33% - 12px)'}
		margin={'5px'}
		position={'relative'}
		cursor={'pointer'}
		userSelect={'none'}
		backgroundColor={'gray.800'}
		rounded={'md'}
		justifyContent={'center'}
		transitionDuration={'0.5s'}
		border={'2px solid'}
		borderColor={NFTs.owner === nearid ? 
			sentNFTs.some(e => `${e.name}${e.collection}` == `${NFTs.name}${NFTs.collection}`) ? '#c9c9c9' : 'transparent'
			:
			receiveNFTs.some(e => `${e.name}${e.collection}` == `${NFTs.name}${NFTs.collection}`) ? '#c9c9c9' : 'transparent'
		}
		_hover={{
			border: '2px solid #c9c9c9'
		}}
		onClick={handleClick}
		onMouseEnter={handleMouseEnter}
		onMouseLeave={handleMouseLeave}
		>
			<Image
			objectFit={'cover'}
			pos={'absolute'}
			top={'10%'}
			maxW={'66px'}
			maxH={'66px'}
			fallback={<SkeletonImages/>}
			alt={name}
			src={image}
			/>

			<Text /* reminder to cut name if too long use ... */
			pos={'absolute'}
			bottom={'0.3rem'}
			maxW={'100px'}
			isTruncated
			>
			{/*name*/}
			{pos}
			</Text>
			
		</Flex>
	)
}

const WalletColumn = ({ header, NFTs, init, setShowDialog, setDialogObject, verifiedArray, nearid }) => {

	const [isVerifiedClick, setVerifiedClick] = useState(false);
	const [clickedArray, setClickedArray] = useState([]);

	const [searchFilter, setSearchFilter] = useState('');
	const handleFilter = (event) => setSearchFilter(event.target.value);

	const verifiedHandler = (e) => {
		e.preventDefault();
		setVerifiedClick(!isVerifiedClick)
	}

	return (
		<Flex /* column */
		flexDir={'column'}
		flexBasis={'100%'}
		flex={'1 1 0'}
		>
			<Box
			padding={'0.75rem'}
			minW={'350px'} /* placeholder */
			> {/* User Wallet */}
				<Flex
				userSelect={'none'}
				alignItems={'center'}
				backgroundColor={'gray.800'}
				py={'0.75rem'}
				px={'1rem'}
				roundedTop={'lg'}
				boxShadow={'0 0.5em 1em -0.125em rgb(10 10 10 / 10%), 0 0 0 1px rgb(10 10 10 / 2%)'}
				borderBottom={'1px solid #2D3748'}
				my={'0.2rem'}
				> {/* Panel Header */}
					<Text flexGrow={1} color={'gray.100'} fontWeight={'semibold'} fontFamily={'montserrat'} fontSize={'1rem'}>{header}</Text>
					<Input 
					mx={'1rem'}
					colorScheme={'gray.100'}
					placeholder={'Collection Name'}
					size={'md'}
					onChange={handleFilter}
					/>
					<Tooltip label={'Toggle Verified Collections'} shouldWrapChildren>
						<Icon 
						cursor={'pointer'}
						mr={'0.2rem'} 
						h={'1.5rem'} 
						w={'1.5rem'} 
						color={!isVerifiedClick ? 'gray.400' : 'blue.200'} 
						as={MdVerified}
						onClick={verifiedHandler}
						_hover={{
							color: 'blue.200'
						}}
						/>
					</Tooltip>
					
				</Flex>
				<Flex
				alignItems={'flex-start'}
				flexWrap={'wrap'}
				alignContent={'flex-start'}
				overflowY={'scroll'}
				overflowX={'hidden'}
				height={'350px'} /* placeholder */
				sx={{
					'&::-webkit-scrollbar': {
					width: '10px',
					backgroundColor: 'gray.700',
					},
					'&::-webkit-scrollbar-thumb': {
					backgroundColor: 'gray.300',
					},
				}}
				padding={0}
				backgroundColor={'#161617'}
				> {/* Panel Cards */}
				{
					init ? 
						NFTs.length > 0 ? NFTs.filter((nft) => {
							if (isVerifiedClick) {
								if (searchFilter == "" && (verifiedArray.includes(nft.collection) || verifiedArray.includes(nft.contract))) {
									return nft
								} 
								else if (nft.collection.toLowerCase().includes(searchFilter.toLowerCase()) || nft.name.toLowerCase().includes(searchFilter.toLowerCase())) {
									if (verifiedArray.includes(nft.collection) || verifiedArray.includes(nft.contract)) {
										return nft
									}
								}
							}
							else {
								if (searchFilter == "") {
									return nft
								} 
								else if (nft.collection.toLowerCase().includes(searchFilter.toLowerCase()) || nft.name.toLowerCase().includes(searchFilter.toLowerCase())) {
									return nft
								}
							}
						}).map((nft, i) => {
							return (
								<NFTCard name={nft.name} image={nft.image} pos={i} key={i} NFTs={nft} setShowDialog={setShowDialog} setDialogObject={setDialogObject} nearid={nearid} clickedArray={clickedArray} setClickedArray={setClickedArray}/>
							)
						}) : [...Array(12)].map((x, i) => <SkeletonCard key={i}/>) : 
						<></>
				}
				</Flex>
			</Box>
		</Flex>
	)
}

const Main = ({ nearId, query }) => {

	const [walletNFTs, setWalletNFTs] = useState([]);
	const [recipientNFTs, setRecipientNFTs] = useState([]);
	const [finishLoading, setFinishLoading] = useState(true);
	
	const [isLoaded, setIsLoaded] = useState(false);

	const [showVerifiedSender, setShowVerifiedSender] = useState(false);
	const [showVerifiedReceive, setShowVerifiedReceive] = useState(false);

	const [isLegalWallet, setisLegalWallet] = useState(true);
	const [isLoadRecipient, setLoadRecipient] = useState(false);

	const [showDialog, setShowDialog] = useState(false);
	const [dialogObject, setDialogObject] = useState({ contract: '', collection: ''});

	const [showAlert, setShowAlert] = useState(false);
	const [alertObj, setAlertObj] = useState({})

	const [walletInput, setWalletInput] = useState('');

	const [isMonarch, setIsMonarch] = useState(false);
	const [nearPrice, setNearPrice] = useState(0);

	const [verifiedArray, setVerifiedArray] = useState([])

	const { isOpen, onOpen, onClose } = useDisclosure()

	const recipientWallet = useRef();
	const nearAttached = useRef('0');

	const render = async () => {
		setVerifiedArray(await getFetcher('/api/verified'));
		const nftContracts = await getFetcher(`https://testnet-api.kitwallet.app/account/${nearId}/likelyNFTs`);
		console.log(nftContracts)
		if (nftContracts.length > 0) {
			if (nftContracts.includes('mint.havendao.near')) {
				setIsMonarch(true)
			}

			await RenderNFTs(nftContracts.sort((a,b) => {
				if (a > b) return 1
				if (b > a) return -1
				return 0
			}), setWalletNFTs, nearId)
		}
		else {
			setWalletNFTs([]);
		}
		
		setIsLoaded(true)
	}

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
					title: 'Cancelled Offer',
					status: 'warn',
					message: 'Offer was not sent'
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
		if (!isLoaded && nearId) render()
		if (query.transactionHashes || query.errorCode) {
			handleAlert()
			setShowAlert(true);
			setTimeout(() => {
				setShowAlert(false);
			}, 5000)
		}
		getPrice();
	}, [nearId]);


	const submitHandler = (event) => {
		event.preventDefault();

		if (!isLegalWallet || !recipientWallet.current.value) {
			// send error alert, please select nfts/enter a proper wallet
			return;
		}

		if (sentNFTs.length < 1 && receiveNFTs.length < 1) {
			return
		}

		onOpen()
	}

	const confirmHandler = async (event) => {
		event.preventDefault();

		const { near, wallet } = await getWallet();
		const transactionManager = TransactionManager.fromWallet(wallet);
		
		const nearString = nearAttached.current.value+0
		let nearFees = ''; 
		
		if (isMonarch) {
			nearFees = (parseFloat(nearString) + 0.105).toString()
		}
		else {
			nearFees = parseFloat(nearString) < 10 ? (parseFloat(nearString) + 0.105).toString() : (parseFloat(nearString) + (parseFloat(nearString) * 0.01)).toString()
		}

		const transactionArr = [];
		if (receiveNFTs.length < 1) {

			if (parseFloat(nearString) > 0) {
				await transactionArr.push({
					receiverId: SWAP_CONTRACT,
					actions: [functionCall('mass_transfer', {
						receiver_id: recipientWallet.current.value,
					}, 300000000000000, utils.format.parseNearAmount(nearString))]
				});
			}
			

			sentNFTs.forEach((nft) => {
				transactionArr.push({
					receiverId: nft.contract,
					actions: [functionCall('nft_transfer', {
						receiver_id: recipientWallet.current.value,
						token_id: nft.token_id,
					}, 300000000000000, 1)]
				})
			});
		}
		else {
			const hashTransaction = crypto.randomBytes(12).toString('hex');

			const sender_nfts = sentNFTs.reduce((acc, nft) => {
				acc.push({
					token_id: nft.token_id,
					contract_id: nft.contract,
				});
				return acc
			}, []);

			const receiver_nfts = receiveNFTs.reduce((acc, nft) => {
				acc.push({
					token_id: nft.token_id,
					contract_id: nft.contract,
				});
				return acc
			}, []);

			await transactionArr.push({
				receiverId: SWAP_CONTRACT,
				actions: [functionCall('send_offer', {
					hash: hashTransaction,
					sender_id: nearId,
					sender_near: utils.format.parseNearAmount(nearString),
					sender_nfts: sender_nfts,
					receiver_id: recipientWallet.current.value,
					receiver_nfts: receiver_nfts,
					is_holder: isMonarch,
				}, 300000000000000, utils.format.parseNearAmount(nearFees))]
			});

			sentNFTs.forEach((nft) => {
				transactionArr.push({
					receiverId: nft.contract,
					actions: [functionCall('nft_transfer_call', {
						receiver_id: SWAP_CONTRACT,
						token_id: nft.token_id,
						approval_id: 0,
						msg: hashTransaction,
					}, 300000000000000, 1)]
				})
			});
		}
		

		try {
			const outcomes = await transactionManager.bundleCreateSignAndSendTransactions(transactionArr);
		}
		catch(err) {
			
		}
	}

	const onWalletKeystroke = async (event) => {
		event.preventDefault();

		const walletName = recipientWallet.current.value.toLowerCase();

		setWalletInput(walletName)

		if (walletName.length < 1) {
			receiveNFTs.splice(0, receiveNFTs.length)
			setRecipientNFTs([])
			setLoadRecipient(false)
			if (finishLoading) return setisLegalWallet(true)
			return setisLegalWallet(false);
		}

		setRecipientNFTs([])

		if ((walletName.endsWith('.testnet') || walletName.length >= 64 ) && (walletName !== nearId) && finishLoading &&
		/^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/.test(walletName) ) {

			const response = await provider.query({
				request_type: 'view_account',
				finality: 'final',
				account_id: walletName,
			}).catch((err) => {})

			// now do a api call to check if the wallet exists
			const recipientContracts = await getFetcher(`https://testnet-api.kitwallet.app/account/${walletName}/likelyNFTs`).catch((err) => {}); //

			if (!response) {
				setAlertObj({
					title: 'Account not found',
					status: 'error',
					message: 'This account does not exist'
				})
				setShowAlert(true)
				setTimeout(() => {
					setShowAlert(false)
				}, 5000)

				setLoadRecipient(false)
				setRecipientNFTs([])
				receiveNFTs.splice(0, receiveNFTs.length)
				return setisLegalWallet(false);
			}

			if (recipientContracts.length < 1) {
				setRecipientNFTs([])
				setFinishLoading(true)
				setLoadRecipient(false)
				return setisLegalWallet(true);
			}

			setShowAlert(false)
			setAlertObj({})


			RenderNFTs(recipientContracts.sort((a,b) => {
				if (a > b) return 1
				if (b > a) return -1
				return 0
			}), setRecipientNFTs, walletName).then(() => setFinishLoading(true))
			setFinishLoading(false)
			setLoadRecipient(true)
			return setisLegalWallet(true);
		}

		setLoadRecipient(false)
		setRecipientNFTs([])
		receiveNFTs.splice(0, receiveNFTs.length)
		setisLegalWallet(false);

	}

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
		<>
			{showDialog && <Dialog contract={dialogObject.contract} collection={dialogObject.collection} verified={verifiedArray}/>}
			{showAlert && <Alert message={alertObj.message} status={alertObj.status} title={alertObj.title}/>}
			
			<Box px={'2rem'} paddingTop={'3rem'}>
				<Flex minW={'100%'} margin={'0 auto'} alignItems={'center'} justifyContent={'center'} py={'2rem'}>
					<Heading color={'white'} fontFamily={'Source Sans Pro'}>
						Peer-to-Peer NFT Trading on $NEAR
					</Heading>
				</Flex>
				
				<Flex /* row */
				flexDir={['column', 'row']}
				w={'100%'}
				>
					<WalletColumn
					header={'Your Wallet'}
					NFTs={walletNFTs}
					init={walletNFTs.length > 0}
					setShowDialog={setShowDialog}
					setDialogObject={setDialogObject}
					verifiedArray={verifiedArray}
					nearid={nearId}
					/>
					<Flex /* column */
					flexDir={'column'}
					minW={'350px'}
					>
						<Box
						padding={'0.75rem'}
						> {/* User Wallet */}
							<Flex
							alignItems={'center'}
							backgroundColor={'gray.800'}
							py={'0.75rem'}
							px={'1rem'}
							my={'0.2rem'}
							roundedTop={'lg'}
							boxShadow={'0 0.5em 1em -0.125em rgb(10 10 10 / 10%), 0 0 0 1px rgb(10 10 10 / 2%)'}
							borderBottom={'1px solid #2D3748'}
							> {/* Panel Header */}
								<Text>Trade</Text>
							</Flex>
							<Flex
							alignContent={'center'}
							height={'375px'} /* placeholder */
							backgroundColor={'#161617'}
							flexDir={'column'}
							alignItems={'center'}
							>
								<Box
								w={'90%'}
								alignContent={'center'}
								paddingTop={'1rem'}
								>
									<Text textAlign={'left'}>
										Instructions:
									</Text>
									<Box fontSize={'0.9rem'} paddingTop={'0.5rem'}>
										<Text my={'0.15rem'}>1. Select the NFTs you want to trade.</Text>
										<Text my={'0.15rem'}>2. Input the recipient{'\'s'} address.</Text>
										<Text my={'0.15rem'}>3. Select the NFTs you want to receive.</Text>
										<Text my={'0.15rem'}>4. Click on the {'"Offer"'} button.</Text>
									</Box>
									<Text >
									</Text>
								</Box>
								<Box
								marginTop={['1.5rem', '1rem']}
								w={'80%'}
								>
									<NumberInput defaultValue={0} inputMode={'decimal'} min={0.0} max={99999} precision={2} step={1}>
										<NumberInputField ref={nearAttached} placeholder={'amount in near Ⓝ'} />
										<NumberInputStepper>
											<NumberIncrementStepper />
											<NumberDecrementStepper />
										</NumberInputStepper>
									</NumberInput>
								</Box>
								<Box
								marginTop={['1rem', '0.5rem']}
								w={'80%'}
								>
									<Input 
									ref={recipientWallet}
									variant={'filled'} 
									fontFamily={'montserrat'} 
									placeholder={'recipient address'}
									_placeholder={{
										color: 'gray.500'
									}}
									errorBorderColor={'crimson'}
									isInvalid={!isLegalWallet}
									onChange={onWalletKeystroke}
									value={walletInput}
									isDisabled={!finishLoading}
									/>
								</Box>
								<Button
								leftIcon={<AiOutlineSwap/>}	
								marginTop={'1rem'}
								w={'80%'}
								backgroundColor={'green.500'}
								color={'gray.100'}
								_hover={{
									color: 'white',
									backgroundColor:'green.400',
								}}
								onClick={submitHandler}
								>
									Offer
								</Button>
								
							</Flex>
						</Box>
					</Flex>
					<WalletColumn
					header={'Recipient\'s Wallet'}
					NFTs={recipientNFTs}
					init={isLoadRecipient}
					setShowDialog={setShowDialog}
					verifiedArray={verifiedArray}
					setDialogObject={setDialogObject}
					nearid={nearId}
					/>
				</Flex>
			</Box>

			<Modal isOpen={isOpen} onClose={onClose} size={'lg'}>
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader>Confirm Offer</ModalHeader>
					<ModalCloseButton/>
					<ModalBody>
						<Text fontSize={'0.9rem'} color={'gray.200'}>offering: {nearId}</Text>
						<Text fontSize={'0.9rem'} color={'gray.200'}>near: {typeof nearAttached.current.value == 'string' ? `${nearAttached.current.value+0} Ⓝ $${(nearPrice * parseFloat(nearAttached.current.value+0)).toFixed(2)}` : '0 Ⓝ'}</Text>
						<Flex
						my={'0.2rem'}
						alignItems={'flex-start'}
						flexWrap={'wrap'}
						alignContent={'flex-start'}
						overflowY={'scroll'}
						overflowX={'hidden'}
						w={'100%'}
						height={'100px'} /* placeholder */
						sx={{
							'&::-webkit-scrollbar': {
							width: '10px',
							backgroundColor: 'gray.600',
							},
							'&::-webkit-scrollbar-thumb': {
							backgroundColor: 'gray.300',
							},
						}}
						padding={0}
						backgroundColor={'#202021'}
						> {/* Panel Cards */}
						{
							sentNFTs.length > 0 && sentNFTs.map((nft, i) => {
								return (
									<Flex
									key={i}
									minH={'80px'}
									minW={'calc(33.33% - 10px)'}
									margin={'5px'}
									position={'relative'}
									userSelect={'none'}
									backgroundColor={'gray.800'}
									rounded={'md'}
									justifyContent={'center'}
									>
										<Image
										objectFit={'cover'}
										pos={'absolute'}
										top={'10%'}
										maxW={'48px'}
										maxH={'48px'}
										alt={name}
										loading={'eager'}
										src={nft.image}
										/>

										<Text /* reminder to cut name if too long use ... */
										pos={'absolute'}
										bottom={'0'}
										maxW={'100px'}
										isTruncated
										>
										{nft.name}
										</Text>
										
									</Flex>
								)
							})
						}
						</Flex>
						<Text fontSize={'0.9rem'} color={'gray.200'}>receiving: {isOpen && recipientWallet.current.value}</Text>
						<Flex
						my={'0.2rem'}
						alignItems={'flex-start'}
						flexWrap={'wrap'}
						alignContent={'flex-start'}
						overflowY={'scroll'}
						overflowX={'hidden'}
						w={'100%'}
						height={'100px'} /* placeholder */
						sx={{
							'&::-webkit-scrollbar': {
							width: '10px',
							backgroundColor: 'gray.600',
							},
							'&::-webkit-scrollbar-thumb': {
							backgroundColor: 'gray.300',
							},
						}}
						padding={0}
						backgroundColor={'#202021'}
						> {/* Panel Cards */}
						{
							receiveNFTs.length > 0 && receiveNFTs.map((nft, i) => {
								return (
									<Flex
									key={i}
									minH={'80px'}
									minW={'calc(33.33% - 10px)'}
									margin={'5px'}
									position={'relative'}
									userSelect={'none'}
									backgroundColor={'gray.800'}
									rounded={'md'}
									justifyContent={'center'}
									>
										<Image
										objectFit={'cover'}
										pos={'absolute'}
										top={'10%'}
										maxW={'48px'}
										maxH={'48px'}
										alt={name}
										src={nft.image}
										/>

										<Text /* reminder to cut name if too long use ... */
										pos={'absolute'}
										bottom={'0'}
										maxW={'100px'}
										isTruncated
										>
										{nft.name}
										</Text>
										
									</Flex>
								)
							})
						}
						</Flex>
						<Button
						my={'1rem'}
						backgroundColor={'green.500'}
						color={'gray.100'}
						_hover={{
							color: 'white',
							backgroundColor:'green.400',
						}}
						onClick={confirmHandler}
						>Confirm</Button>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	)
}

export default Main