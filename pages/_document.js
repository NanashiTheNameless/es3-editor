import NextDocument, { Html, Main, Head, NextScript } from 'next/document';

export default class Document extends NextDocument {
  render () {
    return (
      <Html lang='en' className='dark' style={{ colorScheme: 'dark' }}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
