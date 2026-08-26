import {
  Box,
  Button,
  Code,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Input,
  Link,
  Portal,
  Separator,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { LuChevronDown, LuChevronRight, LuX } from 'react-icons/lu';
import { useState } from 'react';
import Head from 'next/head';

import CryptForm from '@/components/cryptForm';
import Footer from '@/components/footer';
import { toaster } from '@/components/toaster';
import passwords from '@/passwords.json';

const PASSWORD_LENGTH_THRESHOLD = 50;

function PasswordView({ gameName, password, myIndex, selectedIndex, setSelectedIndex }) {
  const selected = myIndex == selectedIndex;
  const passesThreshold = password.length > PASSWORD_LENGTH_THRESHOLD;

  return (
    <>
      <IconButton
        aria-label={selected ? 'Collapse password' : 'Expand password'}
        visibility={passesThreshold ? 'visible' : 'hidden'}
        size='sm' mr='2' variant='ghost' rounded='full'
        onClick={() => setSelectedIndex(selected ? -1 : myIndex)}
      >
        {selected ? <LuChevronRight /> : <LuChevronDown />}
      </IconButton>
      <Code
        display={!selected ? 'none' : undefined}
        maxW='50%'
        whiteSpace='normal'
        overflowWrap='break-word'
        wordBreak='break-word'
      >
        {password}
      </Code>
      <Code display={selected ? 'none' : undefined}>
        {password.slice(0, 25)}
      </Code>
      {!selected && passesThreshold ? (
        <>
          <Text>...</Text>
          <Box ml='2'>
            <Link
              display='flex'
              flexDirection='column'
              alignItems='flex-start'
              lineHeight='shorter'
              onClick={() => {
                navigator.clipboard.writeText(password);
                toaster.create({
                  title: 'Successfully copied',
                  description: `The password for ${gameName} was copied to clipboard!`,
                  type: 'success',
                  duration: 1500,
                  closable: true
                });
              }} color='skyblue'
            >
              <Text as='span' display='block' whiteSpace='nowrap' fontSize='x-small'>unusually long password</Text>
              <Text as='span' display='block' whiteSpace='nowrap' fontSize='small'>click to copy</Text>
            </Link>
          </Box>
        </>
      ) : false}
    </>
  );
}

export default function Home() {
  const [passwordIndex, setPasswordIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const { open: isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Head>
        <meta property='og:title' content={'EasySave3 Editor (NamelessNanashi Fork) | Modify your favorite games\' save files!'} />
        <meta property='og:url' content='https://es3.namelessnanashi.dev/' />
        <meta
          name='og:description'
          content='EasySave3 Editor (NamelessNanashi Fork) helps you empower your gaming journey with effortless save file editing. Seamlessly modify, and manage EasySave3 game saves with a user-friendly web application designed to enhance your gaming experience.'
        />
        <meta
          name='description'
          content='EasySave3 Editor (NamelessNanashi Fork) helps you empower your gaming journey with effortless save file editing. Seamlessly modify, and manage EasySave3 game saves with a user-friendly web application designed to enhance your gaming experience.'
        />
      </Head>

      <a id='downloader' style={{ display: 'none' }} />
      <Flex alignItems='center' justifyContent='center' mt='24' mb='14'>
        <Box
          direction='column'
          background='#2D3748'
          borderRadius='6px'
          p='12'
          position='relative'
        >
          <Heading size='4xl' fontWeight='bold' letterSpacing='0.02em' mb='6'>EasySave3 Editor (NamelessNanashi Fork)</Heading>

          <Text>Password</Text>
          <Box display='flex' flexDirection='row'>
            <Input
              value={password}
              placeholder='a1bc2d3fghi4...'
              borderColor='#4A5568'
              _hover={{ borderColor: '#718096' }}
              _focusVisible={{ borderColor: '#63B3ED' }}
              _placeholder={{ color: '#718096' }}
              onChange={e => {
                setPassword(e.target.value);
              }}
              disabled={isLoading}
            />
            <IconButton
              aria-label='Clear password'
              ml='3'
              variant='outline'
              color='#FC8181'
              borderColor='#FC8181'
              _hover={{ bg: 'rgba(252, 129, 129, 0.12)' }}
              onClick={() => {
                setPassword('');
              }}
            >
              <LuX />
            </IconButton>
          </Box>
          <Text mt='2'>Don&apos;t know the password for your game?</Text>
          <Text>Check if it is already known below.</Text>
          <Button
            mt='2'
            bg='#81E6D9'
            color='#1A202C'
            _hover={{ bg: '#4FD1C5' }}
            fontWeight='semibold'
            onClick={() => { onOpen();
            }}
          >
            Known game passwords
          </Button>

          <Separator mt='8' mb='2' borderColor='#4A5568' />
          <Heading size='xl' fontWeight='bold' mb='2'>Decryption</Heading>
          <CryptForm isLoading={isLoading} setIsLoading={setIsLoading} password={password} />
          <Text mt='5'>Some games might not encrypt their save files and</Text>
          <Text>only compress them using GZip. In this case, you</Text>
          <Text>don&apos;t have to provide a password.</Text>

          <Separator mt='5' mb='2' borderColor='#4A5568' />
          <Heading size='xl' fontWeight='bold' mb='2'>Encryption</Heading>
          <CryptForm isLoading={isLoading} setIsLoading={setIsLoading} password={password} isEncryption />
        </Box>
      </Flex>

      <Footer />

      <Dialog.Root
        preventScroll={false}
        open={isOpen}
        onOpenChange={({ open }) => {
          if (!open)
            onClose();
        }}
        scrollBehavior='inside'
        placement='center'
      >
        <Portal>
          <Dialog.Backdrop bg='rgba(0, 0, 0, 0.48)' />
          <Dialog.Positioner>
            <Dialog.Content width='calc(100% - 2rem)' maxWidth='72rem' bg='#2D3748' color='white'>
              <Dialog.Header>
                <Dialog.Title>Known game passwords</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton position='absolute' top='2' insetEnd='2' />
              </Dialog.CloseTrigger>
              <Dialog.Body>
                {passwords.map(({ gameName, password }, index) => (
                  <Box key={index}>
                    {index !== 0 && <Separator my='2' borderColor='#4A5568' />}
                    <Box
                      display='flex'
                      flexDirection='row'
                      alignItems='center'
                    >
                      <PasswordView
                        gameName={gameName}
                        password={password} myIndex={index}
                        selectedIndex={passwordIndex}
                        setSelectedIndex={setPasswordIndex}
                      />
                      <Text ml='auto'>{gameName}</Text>
                      <Button
                        ml='3'
                        bg='#81E6D9'
                        color='#1A202C'
                        _hover={{ bg: '#4FD1C5' }}
                        fontWeight='semibold'
                        onClick={() => {
                          setPassword(password);
                          onClose();
                        }}
                      >
                        Use
                      </Button>
                    </Box>
                  </Box>
                ))}
                <Text mt='5'>Can&apos;t find your game here?</Text>
                <Text>Try decrypting it without a password.</Text>
              </Dialog.Body>

              <Dialog.Footer>
                <Button onClick={onClose}>
                  Ok
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
