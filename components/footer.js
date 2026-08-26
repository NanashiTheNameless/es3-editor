import { Box, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

export default function Footer({ left }) {
  const offset = left ? '10px' : '5px';

  return (
    <Box position='fixed' bottom={offset} left={left ? offset : undefined} right={left ? undefined : offset} textAlign={left ? 'left' : 'right'}>
      <Link as={NextLink} href='/terms-of-service' color='#3182CE' mr='6.5px'>Terms of Service</Link>
      <Text as='span'>| </Text>
      <Link as={NextLink} href='/privacy-policy' color='#3182CE'>Privacy Policy</Link>
      <Text>This fork is maintained by <Link as={NextLink} href='https://github.com/NanashiTheNameless/es3-editor' color='#3182CE'>NamelessNanashi</Link></Text>
    </Box>
  );
}
