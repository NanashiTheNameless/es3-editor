import {
  Portal,
  Stack,
  Toast,
  Toaster as ChakraToaster,
  createToaster
} from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'bottom-start',
  pauseOnPageIdle: true
});

export default function Toaster() {
  return (
    <Portal>
      <ChakraToaster toaster={toaster}>
        {toast => (
          <Toast.Root width={{ md: 'sm' }}>
            <Toast.Indicator />
            <Stack gap='1' flex='1' maxWidth='100%'>
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
}
