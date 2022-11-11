import {
	Flex,
	Image,
	Text,
    Skeleton,
} from '@chakra-ui/react';

import { useState } from 'react';

function removeItemOnce(arr, value) {
	var index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	return arr;
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

const NFTCard = ({ name, image, pos, NFTs, setShowDialog, setDialogObject, nearid, clickedArray, setClickedArray, sentNFTs, receiveNFTs }) => {
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

export default NFTCard;