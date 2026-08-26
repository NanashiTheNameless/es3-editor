import {
  Alert,
  Box,
  ChakraProvider,
  Link,
  createSystem,
  defaultConfig,
  defineConfig
} from '@chakra-ui/react';
import Head from 'next/head';

import Toaster from '@/components/toaster';
import 'jsoneditor/dist/jsoneditor.min.css';
import './editor.css';

const appSystem = createSystem(defaultConfig, defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: { value: "'0xProto', monospace" },
        heading: { value: "'0xProto', monospace" },
        mono: { value: "'0xProto', monospace" }
      }
    }
  }
}));

export default function App ({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>EasySave3 Editor (NamelessNanashi Fork)</title>
        <meta property='og:site_name' content='EasySave3 Editor (NamelessNanashi Fork)' />
        <meta property='og:image' content='https://es3.namelessnanashi.dev/favicon.png' />
        <meta
          name='keywords'
          content='EasySave3 (NamelessNanashi Fork), Save file editing, Save file manipulation, Save file management, Game save editor, Save file converter, EasySave3 compatibility, Save data modification, Online save file editor, Save file backup, Save file restore, Save file extraction, Save file compression, Save file encryption, Save file decryption, Cross-platform support, EasySave3 integration, Save file analysis, Save file troubleshooting, User-friendly EasySave3 interface, Auto-save detection, Save file validation, Save file synchronization, Save file sharing, Save file recovery, Save file manipulation tools, Save file versioning'
        />
        <link rel="icon" type="image/x-icon" href="/favicon.ico"></link>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      <ChakraProvider value={appSystem}>
        <Box minH='100vh' bg='#1A202C' color='white'>
          <Box position='fixed' zIndex='9999' width='100%' top='0'>
            <Alert.Root
              status='info'
              alignItems='center'
              justifyContent='center'
              textAlign='center'
              variant='solid'
              bg='#90CDF4'
              color='#1A202C'
              borderRadius='0'
              py='3'
            >
              <Alert.Indicator color='#1A202C' />
              <Alert.Content
                display='flex'
                flex='initial'
                flexDirection='row'
                alignItems='center'
                gap='2'
              >
                <Alert.Title fontWeight='bold'>This tool is free and open source!</Alert.Title>
                <Alert.Description>Consider checking out this fork’s source code on <Link href='https://github.com/NanashiTheNameless/es3-editor' color='blue' target='_blank' rel='noreferrer'>GitHub</Link>.</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          </Box>
          <Component {...pageProps} />
        </Box>
        <Toaster />
      </ChakraProvider>
    </>
  );
}
