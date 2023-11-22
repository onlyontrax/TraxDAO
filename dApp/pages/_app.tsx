import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { message, Spin } from 'antd';
import { pick } from 'lodash';

import { loginNfid, loginSuccess } from '@redux/auth/actions';
import { updateSettings } from '@redux/settings/actions';
import { updateLiveStreamSettings } from '@redux/streaming/actions';
import { updateUIValue } from '@redux/ui/actions';
import { updateCurrentUser } from '@redux/user/actions';
import withReduxSaga from '@redux/withReduxSaga';
import { authService, settingService, userService, cryptoService } from '@services/index';
import { NextPageContext } from 'next';
import nextCookie from 'next-cookies';
import App from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { SETTING_KEYS } from 'src/constants';
import { Socket } from 'src/socket';
import { setGlobalConfig } from '@services/config';
import 'antd/dist/reset.css';
import Script from 'next/script';
import { ParallaxProvider } from 'react-scroll-parallax';
import BaseLayout from '@layouts/base-layout';
import 'video.js/dist/video-js.css';
import '../style/antd.css';
import '../style/index.scss';

interface CustomNextPageContext extends NextPageContext {
  store: Store;
}

declare global {
  interface Window {
    ReactSocketIO: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
    iframely: any;
  }
}

function redirectLogin(ctx: any) {
  if (process.browser) {
    authService.removeToken();
    Router.push('/login');
    return;
  }

  // fix for production build
  ctx.res.clearCookie && ctx.res.clearCookie('token');
  ctx.res.clearCookie && ctx.res.clearCookie('role');
  ctx.res.writeHead && ctx.res.writeHead(302, { Location: '/' });
  ctx.res.end && ctx.res.end();
}

async function auth(ctx: CustomNextPageContext, noredirect: boolean, onlyPerformer: boolean) {
  try {
    const { store } = ctx;
    const state = store.getState();
    const { token } = nextCookie(ctx);
    if (state.auth && state.auth.loggedIn) {
      return;
    }
    if (token) {
      authService.setToken(token);
      const user = await userService.me({
        Authorization: token
      });
      if (!user.data || !user.data._id) {
        !noredirect && redirectLogin(ctx);
        return;
      }
      if (!user.data.isPerformer && onlyPerformer) {
        !noredirect && redirectLogin(ctx);
        return;
      }
      store.dispatch(loginSuccess());
      store.dispatch(updateCurrentUser(user.data));
      return;
    }

    !noredirect && redirectLogin(ctx);
  } catch (e) {
    !noredirect && redirectLogin(ctx);
  }
}

async function updateSettingsStore(ctx: CustomNextPageContext, settings) {
  const { store } = ctx;
  
  store.dispatch(
    updateUIValue({
      logo: settings.logoUrl || '',
      siteName: settings.siteName || '',
      favicon: settings.favicon || '',
      loginPlaceholderImage: settings.loginPlaceholderImage || '',
      menus: settings.menus || [],
      footerContent: settings.footerContent || '',
      countries: settings.countries || [],
      userBenefit: settings.userBenefit || '',
      artistBenefit: settings.artistBenefit || ''
    })
  );
  store.dispatch(
    updateLiveStreamSettings(
      pick(settings, [
        SETTING_KEYS.VIEWER_URL,
        SETTING_KEYS.PUBLISHER_URL,
        SETTING_KEYS.SUBSCRIBER_URL,
        SETTING_KEYS.OPTION_FOR_BROADCAST,
        SETTING_KEYS.OPTION_FOR_PRIVATE,
        SETTING_KEYS.SECURE_OPTION,
        SETTING_KEYS.ANT_MEDIA_APPNAME,
        SETTING_KEYS.AGORA_APPID,
        SETTING_KEYS.AGORA_ENABLE
      ])
    )
  );

  store.dispatch(
    updateSettings(
      pick(settings, [
        SETTING_KEYS.REQUIRE_EMAIL_VERIFICATION,
        SETTING_KEYS.TOKEN_CONVERSION_RATE,
        SETTING_KEYS.STRIPE_PUBLISHABLE_KEY,
        SETTING_KEYS.GOOGLE_RECAPTCHA_SITE_KEY,
        SETTING_KEYS.ENABLE_GOOGLE_RECAPTCHA,
        SETTING_KEYS.GOOGLE_CLIENT_ID,
        SETTING_KEYS.TWITTER_CLIENT_ID,
        SETTING_KEYS.PAYMENT_GATEWAY,
        SETTING_KEYS.META_KEYWORDS,
        SETTING_KEYS.META_DESCRIPTION
      ])
    )
  );
}

interface AppComponent extends CustomNextPageContext {
  layout: string;
}

interface IApp {
  store: Store;
  layout: string;
  Component: AppComponent;
  settings: any;
  config: any;
  loginNfid: Function;
}

const publicConfig = {} as any;
class Application extends App<IApp> {
  // TODO - consider if we need to use get static props in children component instead?
  // or check in render?
  static async getInitialProps({ Component, ctx }) {
    // load configuration from ENV and put to config
    if (!process.browser) {
      // eslint-disable-next-line global-require
      const dotenv = require('dotenv');
      const myEnv = dotenv.config().parsed;

      // publish to server config with app
      setGlobalConfig(myEnv);

      // load public config and api-endpoint?
      Object.keys(myEnv).forEach((key) => {
        if (key.indexOf('NEXT_PUBLIC_') === 0) {
          publicConfig[key] = myEnv[key];
        }
      });
    }

    // won't check auth for un-authenticated page such as login, register
    // use static field in the component
    const { noredirect, onlyPerformer, authenticate } = Component;
    if (authenticate !== false) {
      await auth(ctx, noredirect, onlyPerformer);
    }
    const { token } = nextCookie(ctx);
    ctx.token = token || '';

    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps({ ctx });
    }

    return {
      pageProps,
      layout: Component.layout,
      config: publicConfig
    };
  }

  state = {
    settings: null,
    authFix: false
  }

  async getData() {
    try {
      // server side to load settings, one time only
      let settings = {};
      const {
        store
      } = this.props;
      const [setting] = await Promise.all([settingService.all('all', true)]);
      settings = { ...setting.data };

      await updateSettingsStore({ store } as CustomNextPageContext, settings);

      return {
        settings
      };
    } catch (e) {
      return {
        settings: null
      };
    }
  }

  async componentDidMount() {
    const { settings } = this.state;
    if (settings === null) {
      const data = await this.getData();

      this.setState({ settings: data.settings }, async () => this.updateDataDependencies());
    } else {
      await this.updateDataDependencies();
    }
  }

  async authAfterLoad() {
  try {
    const { store } = this.props;
    const state = store.getState();
    const token = authService.getToken();
    if (state.auth && state.auth.loggedIn) {

      return;
    }
    if (token) {
      const user = await userService.me({
        Authorization: token
      });
      if (!user.data || !user.data._id) {

        return;
      }
      store.dispatch(loginSuccess());
      store.dispatch(updateCurrentUser(user.data));
      this.setState({ authFix: true });

      return;
    }
  } catch (e) {
  }
}

  async updateDataDependencies() {
    await this.authAfterLoad();
  }

  constructor(props) {
    super(props);
    setGlobalConfig(this.props.config);
  }

  async onNFIDLogin(resp: any, from: string) {

    const { store } = this.props;
    await this.setState({ isLoading: true });
    await cryptoService.onNFIDLogin(resp, from, store.dispatch);
    this.setState({ isLoading: false });
  }

  render() {
    const {
      Component, pageProps, store
    } = this.props;
    const {
      settings
    } = this.state;

    if (settings === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }

    const { layout } = Component;
    const state = store.getState();

    return (
      <ParallaxProvider>
        <Provider store={store}>
          <Head>
            <title>{settings?.siteName}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          </Head>

          <Socket>
            <BaseLayout layout={layout} maintenance={settings.maintenanceMode}>
              <InternetIdentityProvider
                {...cryptoService.getNfidInternetIdentityProviderProps(
                  state.auth.loggedIn ? () => {} : this.onNFIDLogin.bind(this)
                )}
              >
                <Component {...pageProps} />
              </InternetIdentityProvider>
            </BaseLayout>
          </Socket>
          {settings && settings.afterBodyScript && (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: settings.afterBodyScript }} />
          )}
          <Script async src="https://www.googletagmanager.com/gtag/js?id=G-T4CK76XJ4R" />
          <Script id="layer">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-T4CK76XJ4R');
            `}
          </Script>
        </Provider>
      </ParallaxProvider>
    );
  }
}

export default withReduxSaga(Application);
