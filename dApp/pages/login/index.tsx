/* eslint-disable camelcase */
import Loader from '@components/common/base/loader';
import { login, loginSocial, loginSuccess } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { authService, userService } from '@services/index';
import {
  Button, Col, Divider, Form, Image, Input, Layout, Row, message
} from 'antd';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ISettings, IUIConfig } from 'src/interfaces';
import { Auth } from 'src/crypto/nfid/Auth';
import styles from '../auth/index.module.scss';
import { SparklesIcon } from '@heroicons/react/solid';

interface IProps {
  loginAuth: any;
  store: any;
  login: Function;
  updateCurrentUser: Function;
  loginSuccess: Function;
  loginSocial: Function;
  ui: IUIConfig;
  settings: ISettings;
  oauth_verifier: string;
}

class Login extends PureComponent<IProps> {
  static authenticate = false;

  static layout = 'blank';

  state = {
    recaptchaSuccess: false,
    loginAs: 'user',
    isLoading: true,
    welcomeMsg: 'Create an account'
  };

  async componentDidMount() {
    const firstTime = typeof window !== 'undefined' ? localStorage.getItem('first_time') : null;
    if (!firstTime) {
      this.setState({ welcomeMsg: 'Sign in' });
      // first time loaded!
      localStorage.setItem('first_time', '1');
    } else {
      this.setState({ welcomeMsg: 'Welcome back' });
    }
    this.redirectLogin();
    this.callbackTwitter();
  }

  async handleLogin(values: any) {
    const { login: handleLogin } = this.props;
    return handleLogin(values);
  }

  async redirectLogin() {
    const { loginSuccess: handleLogin, updateCurrentUser: handleUpdateUser } = this.props;
    const token = authService.getToken() || '';
    if (!token || token === 'null') {
      this.setState({ isLoading: false });
      return;
    }
    authService.setToken(token);
    try {
      await this.setState({ isLoading: true });
      const user = await userService.me({
        Authorization: token
      });
      if (!user || !user.data || !user.data._id) return;
      handleLogin();
      handleUpdateUser(user.data);
      user.data.isPerformer
        ? Router.push(
          { pathname: `/artist/profile?id=${user.data.username || user.data._id}` },
          `/artist/profile?id=${user.data.username || user.data._id}`
        )
        : Router.push('/home');
    } catch {
      this.setState({ isLoading: false });
    }
  }

  async callbackTwitter() {
    const { oauth_verifier, loginSocial: handleLogin } = this.props;
    const twitterInfo = authService.getTwitterToken();
    if (!oauth_verifier || !twitterInfo.oauthToken || !twitterInfo.oauthTokenSecret) {
      return;
    }
    try {
      const auth = await authService.callbackLoginTwitter({
        oauth_verifier,
        oauthToken: twitterInfo.oauthToken,
        oauthTokenSecret: twitterInfo.oauthTokenSecret,
        role: twitterInfo.role || 'user'
      });
      auth.data && auth.data.token && handleLogin({ token: auth.data.token });
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Twitter authentication login fail');
    }
  }

  render() {
    const { ui, settings, loginAuth, store } = this.props;
    const { isLoading, welcomeMsg } = this.state;
    return (
      <Layout className={styles.pagesContactModule}>
        <Head>
          <title>{ui && ui.siteName}</title>
          <meta name="keywords" content={settings && settings.metaKeywords} />
          <meta name="description" content={settings && settings.metaDescription} />
          {/* OG tags */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content={ui && ui.siteName} />
          <meta property="og:image" content={ui && ui.logo} />
          <meta property="og:description" content={settings && settings.metaDescription} />
          {/* Twitter tags */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={ui && ui.siteName} />
          <meta name="twitter:image" content={ui && ui.logo} />
          <meta name="twitter:description" content={settings && settings.metaDescription} />
        </Head>
        <div
          className=""
          style={{
            margin: 0,
            padding: 0,
            width: '100vw',
            maxHeight: 'screen',
            background: 'radial-gradient(circle at right, #bbe90020, #000000)'
          }}
        >
          <div className="login-box" style={{ width: '100vw' }}>
            <Row style={{ height: '100vh' }}>
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={12}
                style={{ background: 'radial-gradient(circle at right, #0F0F0F, #000000)' }}
              >
                <span>
                  <div className="login-trax-name">
                    <Image alt="logo" preview={false} width="110px" src="/static/LogoAlternate.png" />
                  </div>
                </span>

                <div style={{ marginTop: '5rem' }} className="login-content right">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { delay: 0.1 } }}
                  >
                    <h1 className="login-welcome-h1">{welcomeMsg}</h1>
                    <p className='login-welcome-p'>Welcome back, new music awaits!</p>
                  </motion.div>

                  <div className="login-form">
                    <Form
                      name="normal_login"
                      className="login-form"
                      initialValues={{ remember: true }}
                      onFinish={this.handleLogin.bind(this)}
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { delay: 0.2 } }}
                      >
                        <p className="sign-in-subtitle">Username</p>
                        <Form.Item
                          name="username"
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[{ required: true, message: 'Email or Username is missing' }]}
                        >
                          <Input disabled={loginAuth.requesting || isLoading} placeholder="Username or email address" />
                        </Form.Item>
                        <p className="sign-in-subtitle">Password</p>
                        <Form.Item
                          name="password"
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[{ required: true, message: 'Please enter your password!' }]}
                        >
                          <Input.Password disabled={loginAuth.requesting || isLoading} placeholder="Password" />
                        </Form.Item>
                        <p>
                            <Link
                              href={{
                                pathname: '/auth/forgot-password'
                              }}
                              className="sub-text"
                            >
                              Forgot password
                            </Link>
                          </p>
                      </motion.div>

                      <Form.Item style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1, transition: { delay: 0.3 } }}
                        >
                          <Button
                            style={{ width: '100%' }}
                            disabled={loginAuth.requesting || isLoading}
                            loading={loginAuth.requesting || isLoading}
                            // type="primary"
                            htmlType="submit"
                            className="login-form-button"
                          >
                            Sign in
                          </Button>
                        </motion.div>
                      </Form.Item>
                     
                      <div className="social-login">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1, transition: { delay: 0.6 } }}
                        >
                          <Auth from="log-in" />
                        </motion.div>
                      </div>
                      <motion.div
                          className="sign-in-links-wrapper"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1, transition: { delay: 0.4 } }}
                        >
                          <p>
                            <Link href="/auth/register" style={{ color: '#FFFFFF50' }}>
                              I'm new to TRAX
                            </Link>
                          </p>
                        </motion.div>
                    </Form>
                  </div>
                </div>
              </Col>
              <Col xs={0} sm={24} md={12} lg={12} className="" style={{padding: 0}}>
              <div className='temp-div'>
                  <div className="temp-bg" style={{ backgroundImage: "/static/artistsnormal.png" }} />
                </div>
              </Col>
            </Row>
          </div>
        </div>
        {isLoading && <Loader />}
      </Layout>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui },
  settings: { ...state.settings },
  loginAuth: { ...state.auth.loginAuth },
  store: { ...state }
});

const mapDispatchToProps = {
  login,
  loginSocial,
  loginSuccess,
  updateCurrentUser
};
export default connect(mapStatesToProps, mapDispatchToProps)(Login);
