import '@fontsource/source-sans-pro';

import {
	Text,
	IconButton,
	Box,
	Button,
	Flex,
	Icon,
	Heading,
	useColorModeValue,
	Drawer, 
	DrawerBody, 
	DrawerFooter, 
	DrawerHeader, 
	DrawerOverlay, 
	DrawerContent,
	DrawerCloseButton,
	useDisclosure,
	VStack
} from '@chakra-ui/react';

import { useState, useEffect } from 'react';

import { FaDiscord, FaTwitter } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi'

import { getWallet } from '../lib/near';

import Alert from './Alert';

import Link from 'next/link';


const NavItem = ({name, link}) => {
	return (
		<Link href={link} passHref>
			<Text fontFamily={'Source Sans Pro'}
			fontSize={'1.2rem'}
			fontWeight={'light'}
			color={'white'}
			cursor={'pointer'}
			marginX={'0.8rem'}
			_hover={{
				color: 'gray.100',
				textDecor: 'underline',
			}}
			>
				{name}
			</Text>
		</Link>
	)
}

const updateCookie = async (wallet, update) => {
	const res = await fetch('/api/storeid', {
		method: 'POST',
		mode: 'cors',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({wallet: wallet, update: update})
	});

	if (res.status === 200) return true;

	return false;
}

const Navbar = ({ setNear, nearId }) => {
	const [connectText, setConnectText] = useState('Connect')
	const [showAlert, setShowAlert] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [alertObj, setAlertObj] = useState({});

	const getWalledId = async () => {
		const { near, wallet } = await getWallet();

		const accountId = wallet.getAccountId();

		if (accountId) {
			setConnectText(accountId);
			return setNear(accountId);
		}
	}
	
	const connectHandler = async (event) => {
		event.preventDefault();

		const { near, wallet } = await getWallet();

		const accountId = wallet.getAccountId();

		if (connectText === 'Connect') {
			wallet.requestSignIn({
				contractId: 'v1.havenswap.near',
				methodNames: ['send_offer', 'cancel_offer']
			}, 'HavenSwap');
		}
		
		await updateCookie(accountId, false)
		await wallet.signOut();
		setNear('');
		setConnectText('Connect');
		
	}

	useEffect(() => {
		getWalledId();
	}, [])

  return (
	  <>
	  {showAlert && <Alert message={alertObj.message} status={alertObj.status} title={alertObj.title}/>}
	  <Drawer isOpen={isOpen} onClose={onClose}>
		  <DrawerOverlay/>
		  <DrawerContent backgroundColor={'#101010'} alignItems="center">
			  <DrawerCloseButton alignSelf="end" mx={15} my={15} />
			  <DrawerHeader>
				  <Text>HavenSwap</Text>
			  </DrawerHeader>
			  <DrawerBody>
				  <VStack alignItems={'left'}>
					<Link href={'/'} passHref>
						<Button variant={'ghost'}>Home</Button>
					</Link>
					{nearId ? <Link href={'/trade'} passHref>
						<Button variant={'ghost'}>Trades</Button>
					</Link> : <></>}
					<Link href={'/faq'} passHref>
						<Button variant={'ghost'}>FAQ</Button>
					</Link>
				  </VStack>
			  </DrawerBody>
			  <DrawerFooter>
					<Button
					fontFamily={'Source Sans Pro'}
					maxW={'150px'}
					color={'gray.800'}
					backgroundColor={'white'}
					rounded={'3xl'}
					transitionDuration={'0.44s'}
					onClick={connectHandler}
					_hover={{
						color: 'gray.800',
						backgroundColor: 'gray.100'
					}}
					>
						<Text isTruncated>{connectText}</Text>
					</Button>
			  </DrawerFooter>
		  </DrawerContent>
	  </Drawer>
	  <Box top={0} w={'100%'} py={'1.2rem'} px={'2rem'}>
		<Flex justifyContent={'center'} alignItems={'center'} mx={'auto'}>
			<Flex flexGrow={1}> {/** logo */}
				<Link href={'/'} passHref>
					<Text fontFamily={'Alagard'}
					fontSize={'1.5rem'}
					fontWeight={'bold'}
					cursor={'pointer'}
					_hover={{
						color: 'gray.100',
					}}
					>
						HavenSwap
					</Text>
				</Link>
			</Flex>

			<Flex display={['none', 'flex']} alignItems={'center'}> {/** desktop nav */}
				<Flex marginRight={'1rem'}>
					<NavItem name={'Home'} link={'/'}/>
					<NavItem name={'FAQ'} link={'/faq'}/>
					{nearId ? <NavItem name={'Trades'} link={'/trade'}/> : <></> }
				</Flex>
				
				<Button
				marginRight={'1rem'}
				fontFamily={'Source Sans Pro'}
				maxW={'150px'}
				color={'gray.800'}
				backgroundColor={'white'}
				rounded={'3xl'}
				transitionDuration={'0.44s'}
				onClick={connectHandler}
				_hover={{
					color: 'gray.800',
					backgroundColor: 'gray.100'
				}}
				>
					<Text isTruncated>{connectText}</Text>
				</Button>
			</Flex>

			<IconButton 
			size={'lg'}
			icon={<GiHamburgerMenu/>}
			color={'white'}
			_hover={{
				color: 'gray.100',
			}}
			backgroundColor={'transparent'}
			display={['flex', 'none']}
			onClick={onOpen}
			/> {/* mobile nav */}

			<Link
			href={'https://discord.gg/havendao'}
			passHref
			>
				<IconButton
				cursor={'pointer'}
				icon={<FaDiscord/>}
				color={'white'}
				_hover={{
					color: 'gray.100',
				}}
				backgroundColor={'transparent'}
				display={['none', 'flex']}
				/>
			</Link>
			<Link
			href={'https://twitter.com/TheHavenDAO'}
			passHref
			>
				<IconButton
				cursor={'pointer'}
				icon={<FaTwitter/>}
				color={'white'}
				_hover={{
					color: 'gray.100',
				}}
				backgroundColor={'transparent'}
				display={['none', 'flex']}
				/>
			</Link>
		</Flex>
	</Box>
	  </>
  )
}

export default Navbar