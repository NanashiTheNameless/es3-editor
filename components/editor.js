import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Portal
} from '@chakra-ui/react';
import JSONEditor from 'jsoneditor';
import { useEffect, useCallback, useRef, useState } from 'react';

import Footer from './footer';
import { jsonParse } from './jsonParse';

export default function Editor({ isLoading, setIsLoading, isOpen, onClose, data, setData, saveData }) {
  const [editorContainer, setEditorContainer] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorContainer || !data)
      return;

    const editor = new JSONEditor(editorContainer, {
      mode: isLoading ? 'view' : 'tree',
      onChangeText: newData => {
        setData({ ...data, data: Buffer.from(newData) });
      }
    });

    const parsedData = jsonParse(data.data.toString());

    editorRef.current = editor;
    editor.set(parsedData);
    setData({
      ...data,
      data: Buffer.from(JSON.stringify(parsedData, null, 2))
    });

    return () => {
      editorRef.current = null;
      editor.destroy();
    };
  }, [editorContainer]);

  useEffect(() => {
    if (!editorRef.current)
      return;

    editorRef.current.setMode(isLoading ? 'view' : 'tree');
  }, [isLoading]);

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
              <Dialog.Title>Editor</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <CloseButton position='absolute' top='2' insetEnd='2' />
            </Dialog.CloseTrigger>
            <Dialog.Body mt='5'>
              <div ref={editorContainerRef}></div>
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
