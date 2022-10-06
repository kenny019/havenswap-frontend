import {
    Skeleton,
    Flex,
    Box,
    Text,
    Input,
    Tooltip,
    Icon,
} from '@chakra-ui/react';

import NFTCard from './NFTCard';

import { MdVerified } from 'react-icons/md'

import { useState } from 'react';


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


const WalletColumn = ({ header, NFTs, init, setShowDialog, setDialogObject, verifiedArray, nearid, sentNFTs, receiveNFTs }) => {

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
								<NFTCard name={nft.name} image={nft.image} pos={i} key={i} NFTs={nft} setShowDialog={setShowDialog} setDialogObject={setDialogObject} nearid={nearid} clickedArray={clickedArray} setClickedArray={setClickedArray} receiveNFTs={receiveNFTs} sentNFTs={sentNFTs}/>
							)
						}) : [...Array(12)].map((x, i) => <SkeletonCard key={i}/>) : 
						<></>
				}
				</Flex>
			</Box>
		</Flex>
	)
}

export default WalletColumn;