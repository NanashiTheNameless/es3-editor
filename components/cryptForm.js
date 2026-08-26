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

import { decryptEs3, encryptEs3 } from './es3Crypto.mjs';
import { inspectJSON } from './jsonParse.mjs';
import { toaster } from './toaster';

const Editor = dynamic(() => import('./editor'), { ssr: false });

function isGzip(data) {
  return data[0] === 0x1F && data[1] === 0x8B;
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

function isEditableJSON(data) {
  const inspection = inspectJSON(data.toString());
  return inspection.isValid || inspection.isRepairable;
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

    if (password)
      data = Buffer.from(await encryptEs3(data, password));
  } else {
    if (password)
      data = Buffer.from(await decryptEs3(data, password));

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
  const [pendingEditorData, setPendingEditorData] = useState(null);
  const [shouldGzip, setShouldGzip] = useState(false);
  const [lastFileName, setLastFileName] = useState(null);
  const [isEncryptionWarning, setIsEncryptionWarning] = useState(false);
  const { open: isOpen, onOpen: _onOpen, onClose: _onClose } = useDisclosure();
  const { open: isEditorOpen, onOpen: onEditorOpen, onClose: onEditorClose } = useDisclosure();
  const {
    open: isInvalidJSONOpen,
    onOpen: onInvalidJSONOpen,
    onClose: onInvalidJSONClose
  } = useDisclosure();

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

  const closeInvalidJSONDialog = () => {
    setPendingEditorData(null);
    onInvalidJSONClose();
  };

  const openPendingEditor = (shouldRepair) => {
    if (!pendingEditorData)
      return;

    const { repairedData, ...originalData } = pendingEditorData;

    setEditorData({
      ...originalData,
      data: shouldRepair ? repairedData : originalData.data,
      editorMode: shouldRepair ? 'tree' : 'text'
    });
    closeInvalidJSONDialog();
    onEditorOpen();
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
            if (!data || (!password && !isGzip(data) && !isEditableJSON(data))) {
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

            const jsonInspection = inspectJSON(decryptedData.cryptedData.toString());
            if (!jsonInspection.isValid && !jsonInspection.isRepairable) {
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

            if (jsonInspection.isRepairable) {
              setPendingEditorData({
                wasGunzipped: decryptedData.wasGunzipped,
                data: decryptedData.cryptedData,
                repairedData: Buffer.from(jsonInspection.repaired)
              });
              onInvalidJSONOpen();
            } else {
              setEditorData({
                wasGunzipped: decryptedData.wasGunzipped,
                data: decryptedData.cryptedData,
                editorMode: 'tree'
              });
              onEditorOpen();
            }
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
          if (!data || (isEncryption ? (!password && !shouldGzip) : (!password && !isGzip(data) && !isEditableJSON(data)))) {
            toaster.create(inputErrorToast(isEncryption, data));
            return;
          }

          if (!isEncryption && !password && isEditableJSON(data)) {
            toaster.create({
              title: 'This save file isn\'t encrypted',
              description: 'It\'s already plaintext JSON or JSON-like data. Use "Open editor" to edit it directly.',
              type: 'info',
              duration: 5000,
              closable: true
            });

            return;
          }

          setIsLoading(true);

          const fileName = isEncryption ? 'SaveFile.encrypted.txt' : 'SaveFile.decrypted.txt';
          let wasGunzipped = false;
          let cryptedData;
          try {
            const result = await cryptData(data, password, isEncryption, shouldGzip);
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

      <Dialog.Root
        preventScroll={false}
        open={isInvalidJSONOpen}
        onOpenChange={({ open }) => {
          if (!open)
            closeInvalidJSONDialog();
        }}
        placement='center'
      >
        <Portal>
          <Dialog.Backdrop bg='rgba(0, 0, 0, 0.48)' />
          <Dialog.Positioner>
            <Dialog.Content width='calc(100% - 2rem)' maxWidth='42rem' bg='#2D3748' color='white'>
              <Dialog.Header>
                <Dialog.Title color='#FBD38D'>Invalid JSON detected</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton position='absolute' top='2' insetEnd='2' />
              </Dialog.CloseTrigger>
              <Dialog.Body>
                <Text>
                  This save uses JSON-like syntax that strict JSON parsers reject. That can be intentional in game save files.
                </Text>
                <Text mt='3'>
                  <strong>Open as-is</strong> uses raw text mode and preserves the original data unless you edit it.
                </Text>
                <Text mt='3'>
                  <strong>Repair and open</strong> converts the data to standard JSON before opening the tree editor.
                  This changes the file and could make it incompatible with the game.
                </Text>
              </Dialog.Body>
              <Dialog.Footer flexWrap='wrap'>
                <Button onClick={closeInvalidJSONDialog}>
                  Cancel
                </Button>
                <Button
                  bg='#FBD38D'
                  color='#1A202C'
                  _hover={{ bg: '#F6AD55' }}
                  fontWeight='semibold'
                  onClick={() => openPendingEditor(true)}
                >
                  Repair and open
                </Button>
                <Button
                  bg='#81E6D9'
                  color='#1A202C'
                  _hover={{ bg: '#4FD1C5' }}
                  fontWeight='semibold'
                  onClick={() => openPendingEditor(false)}
                >
                  Open as-is
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
              const result = await cryptData(editorData.data, password, true, editorData.wasGunzipped);
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
