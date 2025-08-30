import NextDocument, { Html, Main, Head, NextScript } from 'next/document'
import { ThemeProvider } from 'next-themes'
import Script from 'next/script'

export default class Document extends NextDocument {
  render () {
    return (
      <Html lang='en'>
        <Head>
          {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && [
            <Script
              key='google-analytics-script' strategy='beforeInteractive'
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
            />,
            <Script key='google-analytics-initialize' id='google-analytics-initializer' strategy='beforeInteractive'>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
              `}
            </Script>
          ]}
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
