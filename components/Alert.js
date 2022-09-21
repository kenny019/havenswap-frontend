import { chakra, Box, Icon, Flex, Link } from '@chakra-ui/react';

const colorMap = {
	error: 'red.500',
	success: '#32a852',
	warn: 'yellow.500',
}

const Alert = ({ status, title, message }) => {
  return (
    <Flex
	pos={'fixed'}
	top={'12vh'}
	left={'85vw'}
      alignItems='center'
      justifyContent='center'
	  zIndex={9999}
	  transitionDuration={'3s'}
    >
      <Flex
        maxW={['sm', 'md']}
        w='full'
        bg={'#141414'}
        shadow='md'
        rounded='lg'
        overflow='hidden'
      >
        <Flex justifyContent='center' alignItems='center' w={4} bg={colorMap[status]}>
        </Flex>

        <Box mx={-3} py={2} px={4}>
          <Box mx={3}>
            <chakra.span
              color={'gray.100'}
              fontWeight='bold'
			  fontSize={'sm'}
            >
              {title}
            </chakra.span>
			{message.startsWith('http')
				?
				<chakra.p fontSize={'xs'}>
					{'View the transaction '} 
					<Link isExternal color='teal.400' href={message}>
					{'here'}
					</Link>
				</chakra.p>
				:
				<chakra.p
				color={'gray.300'}
				fontSize={'xs'}
				>
              	{message}
            	</chakra.p>
			}
           
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Alert;