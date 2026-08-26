import {
  Box,
  Button,
  Checkbox,
  CloseButton,
  Dialog,
  Portal,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { FaDownload, FaEdit } from 'react-icons/fa';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import crypto from 'crypto';

import { jsonParse } from './jsonParse';
import { toaster } from './toaster';

const Editor = dynamic(() => import('./editor'), { ssr: false });

function isGzip(data) {
  return data[0] == 0x1F && data[1] == 0x8B;
}

function inputErrorToast(isEncryption, data) {
  return {
    title: `Failed ${isEncryption ? 'encrypting' : 'decrypting'} the save file`,
    description: !data ? 'No file chosen' : 'No password provided',
    type: 'error',
    duration: 2000,
    closable: true
  };
}

function isJSON(data) {
  try {
    jsonParse(data.toString());
  } catch (e) {
    return false;
  }
  return true;
}

async function pipeThrough(data, stream) {
  let piped = Buffer.from('');
  const reader = new Blob([data]).stream()
    .pipeThrough(stream)
    .getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done)
      break;

    piped = Buffer.concat([piped, value]);
  }

  return piped;
}

async function cryptData(data, password, isEncryption, shouldGzip) {
  let wasGunzipped = false;
  if (isEncryption) {
    if (shouldGzip)
      data = await pipeThrough(data, new CompressionStream('gzip'));

    if (password) {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-128-cbc', crypto.pbkdf2Sync(password, iv, 100, 16, 'sha1'), iv);
      data = Buffer.concat([iv, cipher.update(data), cipher.final()]);
    }
  } else {
    if (password) {
      const iv = data.subarray(0, 16);
      const decipher = crypto.createDecipheriv('aes-128-cbc', crypto.pbkdf2Sync(password, iv, 100, 16, 'sha1'), iv);
      data = Buffer.concat([decipher.update(data.subarray(16)), decipher.final()]);
    }

    if (isGzip(data)) {
      wasGunzipped = true;
      data = await pipeThrough(data, new DecompressionStream('gzip'));
    }
  }

  return { wasGunzipped, cryptedData: data };
}

export default function CryptForm({ isEncryption, isLoading, setIsLoading, password }) {
  const saveFileRef = useRef();
  const [data, setData] = useState(null);
  const [editorData, setEditorData] = useState(null);
  const [shouldGzip, setShouldGzip] = useState(false);
  const [lastFileName, setLastFileName] = useState(null);
  const [isEncryptionWarning, setIsEncryptionWarning] = useState(false);
  const { open: isOpen, onOpen: _onOpen, onClose: _onClose } = useDisclosure();
  const { open: isEditorOpen, onOpen: onEditorOpen, onClose: onEditorClose } = useDisclosure();

  const onOpen = (encryption) => {
    if (encryption)
      setIsEncryptionWarning(true);

    _onOpen();
  };

  const onClose = () => {
    _onClose();
    setIsEncryptionWarning(false);
  };

  const setDownloadData = (data, fileName) => {
    const blobUrl = window.URL.createObjectURL(new Blob([data], { type: 'binary/octet-stream' }));
    const downloader = document.getElementById('downloader');
    downloader.href = blobUrl;
    downloader.download = fileName;
  };

  const download = () => {
    setData(null);
    saveFileRef.current.value = '';

    const downloader = document.getElementById('downloader');
    downloader.click();
    window.URL.revokeObjectURL(downloader.href);
  };

  return (
    <>
      <Box display='flex' flexDirection='row' justifyContent='space-between'>
        <input
          type='file'
          ref={saveFileRef}
          disabled={isLoading}
          onChange={changeEvent => {
            const files = changeEvent.target.files;
            if (!files.length) {
              setData(null);
              return;
            }

            const fileReader = new FileReader();
            fileReader.onload = loadEvent => setData(Buffer.from(loadEvent.target.result));
            fileReader.onerror = e => {
              console.error(e);
              toaster.create({
                title: 'Failed processing the save file',
                description: 'Please try choosing the save file again',
                type: 'error',
                duration: 2500,
                closable: true
              });
            };

            const file = files[0];
            setLastFileName(file.name);
            fileReader.readAsArrayBuffer(file);
          }}
        />
        {isEncryption && (
          <Checkbox.Root
            disabled={isLoading}
            checked={shouldGzip}
            colorPalette='teal'
            onCheckedChange={({ checked }) => {
              if (!checked)
                setShouldGzip(false);
              else
                onOpen(true);
            }}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control borderColor='#4A5568' _checked={{ bg: '#319795', borderColor: '#319795' }}>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>GZip</Checkbox.Label>
          </Checkbox.Root>
        )}
      </Box>
      <div width='100%'></div>

      {!isEncryption && (
        <Button
          bg='#FBD38D'
          color='#1A202C'
          _hover={{ bg: '#F6AD55' }}
          fontWeight='semibold'
          width='100%' mt='2'
          gap='2'
          onClick={async () => {
            if (!data || (!password && !isGzip(data) && !isJSON(data))) {
              toaster.create(inputErrorToast(isEncryption, data));
              return;
            }

            setIsLoading(true);

            let decryptedData;
            try {
              decryptedData = await cryptData(data, password, false);
            } catch (e) {
              console.error(e);
              toaster.create({
                title: 'Failed decrypting the save file',
                description: 'Wrong decryption password? Try leaving the password field empty.',
                type: 'error',
                duration: 3500,
                closable: true
              });
              
              setIsLoading(false);
              return;
            }

            if (!isJSON(decryptedData.cryptedData)) {
              toaster.create({
                title: 'Can\'t open editor',
                description: (
                  <>
                    <Text>The save file isn&apos;t JSON formatted.</Text>
                    <Text>Download the file and edit it manually.</Text>
                  </>
                ),
                type: 'error',
                duration: 5000,
                closable: true
              });
              
              setIsLoading(false);
              return;
            }

            setEditorData({ wasGunzipped: decryptedData.wasGunzipped, data: decryptedData.cryptedData });
            onEditorOpen();
            setIsLoading(false);
          }}
        >
          <FaEdit />
          EXPERIMENTAL! Open editor
        </Button>
      )}

      <Button
        bg='#81E6D9'
        color='#1A202C'
        _hover={{ bg: '#4FD1C5' }}
        fontWeight='semibold'
        width='100%'
        mt='2'
        loading={isLoading}
        loadingText={`${isEncryption ? 'Encrypting' : 'Decrypting'} the save file...`}
        gap='2'
        onClick={async () => {
          if (!data || (isEncryption ? (!password && !shouldGzip) : (!password && !isGzip(data) && !isJSON(data)))) {
            toaster.create(inputErrorToast(isEncryption, data));
            return;
          }

          if (!isEncryption && !password && isJSON(data)) {
            toaster.create({
              title: 'This save file isn\'t encrypted',
              description: 'It\'s already plaintext JSON. Use "Open editor" to edit it directly.',
              type: 'info',
              duration: 5000,
              closable: true
            });

            return;
          }

          setIsLoading(true);

          let fileName = isEncryption ? 'SaveFile.encrypted.txt' : 'SaveFile.decrypted.txt';
          let wasGunzipped = false;
          let cryptedData;
          try {
            let result = await cryptData(data, password, isEncryption, shouldGzip);
            wasGunzipped = result.wasGunzipped;
            cryptedData = result.cryptedData;
          } catch (e) {
            console.error(e);
            toaster.create({
              title: `Failed ${isEncryption ? 'encrypting' : 'decrypting'} the save file`,
              description: isEncryption ? 'Internal error' : 'Wrong decryption password? Try leaving the password field empty.',
              type: 'error',
              duration: 3500,
              closable: true
            });
            
            setIsLoading(false);
            return;
          }

          setDownloadData(cryptedData, fileName);
          if (wasGunzipped)
            onOpen();
          else
            download();

          setIsLoading(false);
        }}
      >
        <FaDownload />
        Download {isEncryption ? 'encrypted' : 'decrypted'} save file
      </Button>

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
            <Dialog.Content bg='#2D3748' color='white'>
              <Dialog.Header>
                <Dialog.Title color='orange'>Warning!</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton position='absolute' top='2' insetEnd='2' />
              </Dialog.CloseTrigger>
              <Dialog.Body>
                {isEncryptionWarning ? (
                  <Text>
                    You should only check this box if you were warned that the save file was GUnZipped too when you decrypted it.
                    If you GZip a save file that isn&apos;t supposed to be GZipped, the game might not recognize it and might delete it.
                  </Text>
                ) : (
                  <Text>
                    Your save file was also GUnZipped (decompressed). This means that when you are done editing your save file
                    and want to re-encrypt it, you will have to check the GZip checkbox before so the file can also be re-compressed.
                    Unless you check the box, the save file might not be recognized by the game and might be deleted.
                  </Text>
                )}
              </Dialog.Body>

              <Dialog.Footer>
                <Button
                  bg='#81E6D9'
                  color='#1A202C'
                  _hover={{ bg: '#4FD1C5' }}
                  fontWeight='semibold'
                  onClick={() => {
                    if (isEncryptionWarning)
                      setShouldGzip(true);
                    else
                      download();

                    onClose();
                  }}
                >
                  Ok, proceed{!isEncryptionWarning ? ' with download' : ''}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {!isEncryption && (
        <Editor
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isOpen={isEditorOpen}
          onClose={onEditorClose}
          data={editorData}
          setData={setEditorData}
          saveData={async () => {
            let cryptedData;
            try {
              let result = await cryptData(editorData.data, password, true, editorData.wasGunzipped);
              cryptedData = result.cryptedData;
            } catch (e) {
              console.error(e);
              toaster.create({
                title: `Failed encrypting the edited save file`,
                description: 'Internal error',
                type: 'error',
                duration: 3500,
                closable: true
              });

              return false;
            }

            setDownloadData(cryptedData, lastFileName);
            download();
            return true;
          }}
        />
      )}
    </>
  );
}
