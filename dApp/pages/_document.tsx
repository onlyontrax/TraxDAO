import Document, {
  Head, Html, Main, NextScript
} from 'next/document';
import Script from 'next/script';
import { Spin } from 'antd';
import { settingService } from '@services/setting.service';

class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps
    };
  }

  async getData() {
    try {
      const [settings] = await Promise.all([settingService.all()]);
      return {
        settings: settings?.data || []
      };
    } catch (e) {
      return {
        settings: []
      };
    }
  }

  state = {
    settings: null
  };

  async componentDidMount() {
    const { settings } = this.state;
    if (settings === null) {
      const data = await this.getData();

      this.setState({ settings: data.settings }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
    }
  }

  updateDataDependencies() {}

  render() {
    const { settings } = this.state as any;

    return (
      <Html>
        <Head>
          <Script async src="https://www.googletagmanager.com/gtag/js?id=G-T4CK76XJ4R" />
          <Script id="data-layer">
            {`
             window.dataLayer = window.dataLayer || [];
             function gtag(){dataLayer.push(arguments);}
             gtag('js', new Date());

             gtag('config', 'G-T4CK76XJ4R');
            `}
          </Script>
          <link rel="icon" href={settings?.favicon || '/static/favicon.ico'} sizes="64x64" />
          <link rel="manifest" href="/manifest.json" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
          <meta charSet="utf-8" />


          {/* Open Graph / Social Media Meta Tags */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content={settings?.siteName || 'TRAX'} />
          <meta property="og:title" content={settings?.siteName || 'TRAX'} />
          <meta property="og:description" content={settings?.metaDescription || 'Made for artists. Built for fans.'} />
          <meta property="og:image" content={settings?.logoUrl || '/static/logo_512x512.png'} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />

          {/* Twitter Card Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={settings?.siteName || 'TRAX'} />
          <meta name="twitter:description" content={settings?.metaDescription || 'Made for artists. Built for fans.'} />
          <meta name="twitter:image" content={settings?.logoUrl || '/static/logo_512x512.png'} />


          {/* Preload critical fonts */}
          <link
            rel="preload"
            href="/fonts/NeueMontreal/NeueMontreal-Regular.otf"
            as="font"
            type="font/otf"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/NeueMontreal/NeueMontreal-Medium.otf"
            as="font"
            type="font/otf"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/HeadingPro/Heading-Pro-Regular.ttf"
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/HeadingPro/Heading-Pro-Bold.ttf"
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
// G-CMY6Y3N1TB
