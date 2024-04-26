import { message, Spin } from 'antd';
import { pick } from 'lodash';
import { NextPageContext } from 'next';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import { loginNfid, loginSuccess } from '@redux/auth/actions';
import { updateSettings } from '@redux/settings/actions';
import { updateLiveStreamSettings } from '@redux/streaming/actions';
import { updateUIValue } from '@redux/ui/actions';
import { updateCurrentUser } from '@redux/user/actions';
import withReduxSaga from '@redux/withReduxSaga';
import { authService, settingService, userService, cryptoService } from '@services/index';
import nextCookie from 'next-cookies';
import App from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { SETTING_KEYS } from 'src/constants';
import { Socket } from 'src/socket';
import { setGlobalConfig } from '@services/config';
import 'antd/dist/reset.css';
import Script from 'next/script';
import { ParallaxProvider } from 'react-scroll-parallax';
import BaseLayout from '@layouts/base-layout';
import { plugWalletMobileConnection } from 'src/crypto/mobilePlugWallet';
import 'video.js/dist/video-js.css';
import '../styles/antd.css';
import '../styles/index.scss';
// import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

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
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  if (currentPath !== '/login' && currentPath !== '/' && currentPath !== '') {
    ctx.res.writeHead && ctx.res.writeHead(302, { Location: '/' });
    ctx.res.end && ctx.res.end();
  }
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
        SETTING_KEYS.META_DESCRIPTION,

        SETTING_KEYS.IDENTITY_ONFIDO_API_TOKEN,
        SETTING_KEYS.IDENTITY_ONFIDO_SANDBOX,
        SETTING_KEYS.IDENTITY_ONFIDO_WORKFLOW_ID,
        SETTING_KEYS.IC_NETWORK,
        SETTING_KEYS.IC_ENABLE_IC_STORAGE,
        SETTING_KEYS.IC_HOST,
        SETTING_KEYS.IC_HOST_CONTENT_MANAGER,
        SETTING_KEYS.IC_CANISTERS_XRC,
        SETTING_KEYS.IC_CANISTERS_LEDGER,
        SETTING_KEYS.IC_CANISTERS_CKBTC_MINTER,
        SETTING_KEYS.IC_CANISTERS_PPV,
        SETTING_KEYS.IC_CANISTERS_TIPPING,
        SETTING_KEYS.IC_CANISTERS_SUBSCRIPTIONS,
        SETTING_KEYS.IC_CANISTERS_CONTENT_MANAGER,
        SETTING_KEYS.IC_CANISTERS_CONTENT_ARTIST_ACCOUNT,
        SETTING_KEYS.IC_CANISTERS_CONTENT_ARTIST_CONTENT,
        SETTING_KEYS.IC_CANISTERS_NFT,
        SETTING_KEYS.IC_CANISTERS_IC_IDENTITY_PROVIDER,
        SETTING_KEYS.IC_CANISTERS_TRAX_IDENTITY,
        SETTING_KEYS.IC_CANISTERS_AIRDROP,
        SETTING_KEYS.IC_CANISTERS_TRAX_TOKEN,
        SETTING_KEYS.IC_CANISTERS_TRAX_ACCOUNT_PERCENTAGE,
        SETTING_KEYS.IC_CANISTERS_NFT_TICKET,
        SETTING_KEYS.IC_CANISTERS_NFT_SONG
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

    // const { isLoaded } = useLoadScript({
    //   googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
    // })

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
    plugWalletMobileConnection();
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
    await cryptoService.onNFIDLogin(resp, from, store.dispatch, (val: any) => {});
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
