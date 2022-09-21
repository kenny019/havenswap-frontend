import React from 'react'

import { 
	Flex,
	Text,
	Box,
	Span,
	Icon
} from '@chakra-ui/react';

import { MdVerified } from 'react-icons/md'

const Dialog = ({ contract, collection, verified }) => {
  return (
		<Flex
		w='full'
		pb={'1.5rem'}
		alignItems='center'
		justifyContent='center'
		zIndex={9999}
		position={'fixed'}
		bottom={0}
		left={0}
		>

			<Box rounded={'md'} bgColor={'#0a0a0a'} mx={-3} py={2} px={4}>
				<Box mx={3} textAlign={'center'}>
					<Text
					color={'gray.100'}
					fontWeight='bold'
					fontSize={'sm'}
					>
					{collection}{(verified.includes(contract) || verified.includes(collection)) ? <Icon mx={'0.2rem'} h={'0.9rem'} w={'1rem'} color={'blue.300'} as={MdVerified}/> : ''}

					</Text>
					<Text
					color={'gray.300'}
					fontSize={'xs'}
					>
					{contract}

					</Text>
				</Box>
		 	 </Box>
		</Flex>
	)
}

export default Dialog