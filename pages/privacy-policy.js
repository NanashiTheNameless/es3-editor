import { Box, Flex, Text, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import Head from 'next/head'

export default function PrivacyPolicy () {
  return (
    <>
      <Head>
        <title>Privacy Policy | EasySave3 Editor</title>
        <meta property='og:title' content='Privacy Policy | EasySave3 Editor' />
        <meta property='og:url' content='https://es3.namelessnanashi.dev/privacy-policy' />
        <meta
          property='og:description'
          content='Information of our policies regarding the collection, use, and disclosure of personal information we receive from users.'
        />
        <meta
          name='description'
          content='Information of our policies regarding the collection, use, and disclosure of personal information we receive from users.'
        />
      </Head>
      <Flex alignItems='center' justifyContent='center' mt='24' mb='14'>
        <Box
          direction='column'
          background='gray.700'
          rounded='6'
          p='12'
          position='relative'
        >
          <Text maxWidth='500px'>
            Privacy Policy for <Link as={NextLink} href='/' color='blue.500'>EasySave3 Editor</Link><br /><br />

            Effective date: 30 August 2025<br /><br />

            NamelessNanashi (&quot;Developer&quot;) operates this fork of the EasySave3 Editor web application (&quot;Application&quot;). This page informs you of our policies regarding the collection, use, and disclosure of personal information we receive from users of the Application.<br /><br />

            1. Information Collection and Use<br />
            This fork of The EasySave3 Editor Web Application does not collect or store any personal information from users. The Application operates locally on the user&apos;s device, and all uploaded data and modifications remain strictly on the user&apos;s device. No data is transmitted or stored externally.<br /><br />
            This fork uses Cloudflare Analytics on the domain level for anonymous usage statistics however does not require them to function, blocking &quot;cloudflareinsights.com&quot; will effectively disable analytics.<br /><br />

            2. Cookies<br />
            The EasySave3 Editor Web Application uses cookies for the purpose of enhancing user experience and analyzing application usage. The cookies used are limited to Google services such as Google Analytics and Google AdSense. These cookies collect non-personally identifiable information about user interactions with the Application. You may choose to disable or block cookies through your browser settings, but please note that doing so may affect certain functionality of the Application.<br /><br />

            3. Data Security<br />
            The EasySave3 Editor Web Application prioritizes data security and takes reasonable precautions to protect the user&apos;s uploaded data. However, please be aware that no method of transmission or electronic storage is 100% secure.<br /><br />

            4. Changes to this Privacy Policy<br />
            This Privacy Policy is effective as of the date stated above and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page. We reserve the right to update or change our Privacy Policy at any time, and you should check this Privacy Policy periodically. Your continued use of the EasySave3 Editor Web Application after we post any modifications to the Privacy Policy on this page will constitute your acknowledgment of the modifications and your consent to abide and be bound by the modified Privacy Policy.<br /><br />

            5. Contact Us<br />
            If you have any questions or concerns about this Privacy Policy or the EasySave3 Editor Web Application, please open an issue on its GitHub <Link as={NextLink} href='https://github.com/NanashiTheNameless/es3-editor' color='blue.500'>NanashiTheNameless/es3-editor</Link>.
          </Text>
        </Box>
      </Flex>
    </>
  )
}