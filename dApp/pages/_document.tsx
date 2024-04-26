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
