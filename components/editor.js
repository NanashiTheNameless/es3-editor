import { Box, Button, CloseButton, Dialog } from '@chakra-ui/react'
import { Portal } from "@chakra-ui/react"
import JSONEditor from 'jsoneditor'
import { useRef, useEffect, useCallback, useState } from 'react'
import 'jsoneditor/dist/jsoneditor.min.css'

import Footer from './footer'

export default function Editor ({ isLoading, setIsLoading, isOpen, onClose, data, setData, saveData }) {
  const [editorContainer, setEditorContainer] = useState(null)
  const [editor, setEditor] = useState(null)

  useEffect(() => {
    if (!editorContainer || !data) { return }

    const editor = new JSONEditor(editorContainer, {
      mode: isLoading ? 'view' : 'tree',
      onChangeText: newData => {
        setData({ ...data, data: Buffer.from(newData) })
      }
    })

    setEditor(editor)
    editor.set(JSON.parse(data.data.toString()))

    return () => {
      setEditor(null)
      editor.destroy()
    }
  }, [editorContainer])

  useEffect(() => {
    if (!editor) { return }

    editor.setMode(isLoading ? 'view' : 'tree')
  }, [isLoading])

  const editorContainerRef = useCallback(node => {
    if (node) { setEditorContainer(node) }
  }, [])

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => { if (!e.open) onClose() }}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger />
            <Dialog.Header>
              <Dialog.Title>Editor</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body mt='5'>
              <div ref={editorContainerRef} />
            </Dialog.Body>
            <Dialog.Footer>
              <Footer left />
              <Button
                colorScheme='orange'
                isDisabled={isLoading}
                onClick={async () => {
                  setIsLoading(true)

                  const isSaveSuccess = await saveData()
                  setIsLoading(false)

                  if (isSaveSuccess) { onClose() }
                }}
              >
                Save
              </Button>
              <Button
                ml='3'
                onClick={() => {
                  setData(null)
                  onClose()
                }}
                isDisabled={isLoading}
              >
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
