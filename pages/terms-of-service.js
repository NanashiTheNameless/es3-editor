import { Box, Flex, Text, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import Head from 'next/head';

const Dbr = () => (<><br /><br /></>);

export default function TermsOfService () {
  return (
    <>
      <Head>
        <title>Terms of Service | EasySave3 Editor</title>
        <meta property='og:title' content='Terms of Service | EasySave3 Editor (NamelessNanashi Fork)' />
        <meta property='og:url' content='https://es3.namelessnanashi.dev/terms-of-service' />
        <meta
          property='og:description'
          content='The Terms of Service which govern your access to and use of EasySave3 Editor (NamelessNanashi Fork).'
        />
        <meta
          name='description'
          content='The Terms of Service which govern your access to and use of EasySave3 Editor (NamelessNanashi Fork).'
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
            Terms of Service for <Link as={NextLink} href='/' color='blue.500'>This fork of the EasySave3 Editor</Link><Dbr />

            Effective date: 8 October 2025<Dbr />

            Please read these Terms of Service (&quot;Terms&quot;) carefully before using this fork of the EasySave3 Editor web application (&quot;Application&quot;) provided by NamelessNanashi (&quot;Developer&quot;) and Alex Tușinean (&quot;Upstream Developer&quot;). These Terms govern your access to and use of the Application.<Dbr />

            1.	Acceptance of Terms<br />
            By accessing or using this fork of the EasySave3 Editor Application, you agree to be bound by these Terms and all applicable laws and regulations. If you do not agree with any of these Terms, you must not use the Application.<Dbr />

            2. License<Dbr />

            2.1. Grant of License:<br />
            Please refer to the source code <Link as={NextLink} href='https://github.com/NanashiTheNameless/es3-editor/blob/main/LICENSE.txt' color='blue.500'>license file</Link>.<Dbr />

            3. User Responsibilities<Dbr />

            3.1. User Content:<br />
            You are solely responsible for the content you upload to and modify within the EasySave3 Editor Web Application. The Application allows you to upload and modify content locally on your device. No data or user content is transmitted to any servers or stored externally. You retain all ownership rights to your content.<Dbr />

            3.2. Prohibited Use:<br />
            You agree not to use this fork of the EasySave3 Editor Web Application for any illegal, unauthorized, or malicious purposes. The Application is intended for lawful and legitimate use.<Dbr />

            4. Disclaimer of Warranty<br />
            This fork of The EasySave3 Editor Web Application is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, whether express or implied. NamelessNanashi (&quot;Developer&quot;) and/or Alex Tușinean (&quot;Upstream Developer&quot;) do not warrant that the Application will be error-free or uninterrupted.<Dbr />

            5. Limitation of Liability<br />
            To the maximum extent permitted by law, NamelessNanashi (&quot;Developer&quot;) and/or Alex Tușinean (&quot;Upstream Developer&quot;) shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of or in connection with the use or inability to use the EasySave3 Editor Web Application.<Dbr />

            6. No Affiliation with EasySave3 or Moodkie Interactive<br />
            Please note that the EasySave3 Editor Web Application is developed by NamelessNanashi (&quot;Fork Developer&quot;) and Alex Tușinean (&quot;Upstream Developer&quot;) and is not affiliated with EasySave3 or its developers, Moodkie Interactive, in any way. Any references to EasySave3 within the Application are for descriptive purposes only.<Dbr />

            7. No Affiliation with Alex Tușinean (&quot;Upstream Developer&quot;)<br />
            Please note that this fork of the EasySave3 Editor Web Application is a heavily modified fork and is not affiliated with Alex Tușinean (&quot;Upstream Developer&quot;) in any way shape or form other than being a fork based on their source code in accordance with <Link as={NextLink} href='https://github.com/alextusinean/es3-editor/blob/12bec284b80681cc3648725954d6acb7514a1272/LICENSE.txt' color='blue.500'>its license</Link>.<Dbr />

            8. Contact Information<br />
            If you have any questions or concerns regarding these Terms or the EasySave3 Editor Web Application, please open an issue on its GitHub <Link as={NextLink} href='https://github.com/NanashiTheNameless/es3-editor' color='blue.500'>NanashiTheNameless/es3-editor</Link>.
          </Text>
        </Box>
      </Flex>
    </>
  );
}
