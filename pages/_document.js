import NextDocument, { Html, Main, Head, NextScript } from 'next/document'
import { ThemeProvider } from 'next-themes'
import Script from 'next/script'

export default class Document extends NextDocument {
  render () {
    return (
      <Html lang='en'>
        <Head>
        </Head>
        <body>
          <ThemeProvider attribute='class' defaultTheme='dark'>
            <Main />
            <NextScript />
          </ThemeProvider>
        </body>
      </Html>
    )
  }
}
