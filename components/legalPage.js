import { Box, Flex, Text } from '@chakra-ui/react';

export default function LegalPage({ children }) {
  return (
    <Flex alignItems='center' justifyContent='center' mt='24' mb='14'>
      <Box
        direction='column'
        background='#2D3748'
        borderRadius='6px'
        p='12'
        position='relative'
      >
        <Text maxWidth='500px'>
          {children}
        </Text>
      </Box>
    </Flex>
  );
}
