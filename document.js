import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script dangerouslySetInnerHTML={{
          __html: `
            if('serviceWorker' in navigator){
              window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')});
            }
          `
        }} />
      </body>
    </Html>
  );
}