import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Textarea
} from '@chakra-ui/react';
import JSONEditor from 'jsoneditor';
import { useEffect, useCallback, useRef, useState } from 'react';

import Footer from './footer';
import { jsonParse } from './jsonParse.mjs';

export default function Editor({ isLoading, setIsLoading, isOpen, onClose, data, setData, saveData }) {
  const [editorContainer, setEditorContainer] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !editorContainer || !data || data.editorMode === 'text')
      return;

    const editor = new JSONEditor(editorContainer, {
      mode: 'tree',
      modes: ['tree', 'view'],
      onChangeText: newData => {
        setData({ ...data, data: Buffer.from(newData) });
      }
    });

    editorRef.current = editor;
    editor.set(jsonParse(data.data.toString()));

    return () => {
      editorRef.current = null;
      editor.destroy();
    };
  }, [editorContainer, isOpen, data?.editorMode]);

  useEffect(() => {
    if (!editorRef.current)
      return;

    if (data?.editorMode === 'text')
      return;

    editorRef.current.setMode(isLoading ? 'view' : 'tree');
  }, [data?.editorMode, isLoading]);

  const editorContainerRef = useCallback(node => {
    if (node)
      setEditorContainer(node);
  }, []);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open)
          onClose();
      }}
      size='full'
    >
      <Portal>
        <Dialog.Backdrop bg='rgba(0, 0, 0, 0.48)' />
        <Dialog.Positioner pt='20'>
          <Dialog.Content bg='#2D3748' color='white'>
            <Dialog.Header>
              <Dialog.Title>{data?.editorMode === 'text' ? 'Text editor' : 'JSON editor'}</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <CloseButton position='absolute' top='2' insetEnd='2' />
            </Dialog.CloseTrigger>
            <Dialog.Body mt='5'>
              {data?.editorMode === 'text' ? (
                <Textarea
                  aria-label='Raw save file text'
                  value={data.data.toString()}
                  onChange={event => setData({ ...data, data: Buffer.from(event.target.value) })}
                  readOnly={isLoading}
                  spellCheck={false}
                  minHeight='calc(100vh - 14rem)'
                  resize='none'
                  bg='#1A202C'
                  color='white'
                  caretColor='white'
                  borderColor='#4A5568'
                  fontFamily='var(--app-font-family)'
                  fontSize='sm'
                  lineHeight='1.5'
                  _focus={{ borderColor: '#81E6D9', boxShadow: '0 0 0 1px #81E6D9' }}
                />
              ) : (
                <div ref={editorContainerRef}></div>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Footer left />
              <Button
                bg='#FBD38D'
                color='#1A202C'
                _hover={{ bg: '#F6AD55' }}
                fontWeight='semibold'
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);

                  const isSaveSuccess = await saveData();
                  setIsLoading(false);

                  if (isSaveSuccess)
                    onClose();
                }}
              >
                Save
              </Button>
              <Button
                ml='3'
                onClick={() => {
                  setData(null);
                  onClose();
                }}
                disabled={isLoading}
              >
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
