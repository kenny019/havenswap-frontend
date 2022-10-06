import {
    Flex,
    Image,
    Icon,
    Text,
    Skeleton
} from '@chakra-ui/react';

import { 
	useState, 
	useEffect
} from 'react';

import { MdVerified } from 'react-icons/md'

const getFetcher = (url) => fetch(url).then((res) => res.json()); // to do put this as an import so i dont have to c+p so much

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

export default ImageCard;