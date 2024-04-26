/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/require-default-props */
/* eslint-disable react/sort-comp */
import { PureComponent } from 'react';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { login, loginSocial, loginSuccess, loginNfid } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import {
  Button, Select, Input, Form, message
} from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link'
import { Auth } from 'src/crypto/nfid/Auth';
import { ISettings, IUIConfig } from 'src/interfaces';
import { authService, userService, cryptoService } from '@services/index';
import Router from 'next/router';
import AuthFrame from '../common/base/auth-frame'

interface IProps {
    loginAuth: any;
    store: any;
    login: Function;
    loginNfid: Function;
    updateCurrentUser: Function;
    loginSuccess: Function;
    loginSocial: Function;
    ui: IUIConfig;
    settings: ISettings;
    oauth_verifier?: string;
    onFinish(isOpen: boolean, loggedIn: boolean): Function;
}

class LogInModal extends PureComponent<IProps> {
  static authenticate = false;

  static layout = 'blank';

  state = {
    recaptchaSuccess: false,
    loginAs: 'user',
    isLoading: true,
    welcomeMsg: 'Create an account',
    passwordVisible: false,
    usernameValue: '',
    passwordValue: '',
  };

  async componentDidMount() {
    this.redirectLogin();
    this.callbackTwitter();
  }

  async handleLogin(values: any) {
    const { login: handleLogin, onFinish: loggedIn } = this.props;
    loggedIn(false, true);
    try {
      await handleLogin(values);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Account not found
        message.error('This account is not found, please sign up');
      } else if (error.response && error.response.data && error.response.data.message) {
        // Other specific error messages from the server
        message.error(error.response.data.message);
      } else {
        // Generic error message
        message.error('Login failed. Please try again.');
      }
    }
  }

  hasLoggedIn(logIn: boolean) {
    const { onFinish: loggedIn } = this.props;
    logIn && loggedIn(false, true);
  }

  async redirectLogin() {
    const { loginSuccess: handleLogin, updateCurrentUser: handleUpdateUser, onFinish: loggedIn } = this.props;
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
        : Router.push('/');
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

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  }

  onNFIDLogin(resp: any) {
    const { loginNfid: loginNfidHandle } = this.props;
    return cryptoService.onNFIDLogin(resp, 'log-in', loginNfidHandle, this.hasLoggedIn.bind(this));
  }

  render() {
    const { ui, settings, loginAuth, store } = this.props;
    const { isLoading, welcomeMsg, passwordVisible, usernameValue, passwordValue} = this.state;

    return (
      <AuthFrame>
        <div className='log-in-header'>
            <h1 className='main-title'>Welcome back</h1>
            <p className='main-subtitle'>Log in to TRAX</p>
        </div>
        <Form
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={this.handleLogin.bind(this)}
          className='log-in-form'
        >
        <div className='email-wrapper'>
            <Form.Item
              name="username"
              validateTrigger={['onChange', 'onBlur']}
              rules={[{ required: true, message: 'Please enter your email or username!'}]}
              // validateStatus={usernameValue.trim() ? 'success' : 'error'}
            >
              <div className="relative">
                <Input
                  onChange = {this.handleInputChange}
                  name="usernameValue"
                  type="text"
                  id="usernameInput"
                  disabled={loginAuth.requesting || isLoading}
                />
                <label
                  htmlFor="usernameInput"
                  className={`floating-label ${
                    this.state.usernameValue ? 'label-transition-active' : 'label-transition-initial'
                }`}
                >
                  Email or username
                </label>
              </div>
            </Form.Item>
        </div>

        <div className='email-wrapper'>
            <Form.Item
              name="password"
              validateTrigger={['onChange', 'onBlur']}
              rules={[{ required: true, message: 'Please enter your password!' }]}
              // validateStatus={usernameValue.trim() ? 'success' : 'error'}
            >
              <div className="relative">
                <Input.Password
                  onChange = {this.handleInputChange}
                  name="passwordValue"
                  type={passwordVisible ? 'text' : 'password'}
                  id="passwordInput"
                />
                <label
                  htmlFor="passwordInput"
                  className={`floating-label ${
                    this.state.passwordValue ? 'label-transition-active' : 'label-transition-initial'
                }`}
                >
                  Password
                </label>
              </div>
            </Form.Item>
            <div className='forgot-links'>
              <p>
                <Link
                  href={{
                    pathname: '/auth/forgot-password'
                  }}
                  className="forgot-password"
                >
                  Forgot password?
                </Link>
              </p>
              {/* <h3 className="forgot-password-dot">&#x2022;</h3>
              <p>
                <Link
                  href={{
                    pathname: '/auth/forgot-password'
                  }}
                  className="forgot-password"
                >
                  Forgot username?
                </Link>
              </p> */}
            </div>
        </div>

        <div className='log-in-btn-wrapper'>
            <Form.Item style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <Button
                    disabled={!usernameValue.trim() || !passwordValue.trim() || loginAuth.requesting || isLoading}
                    loading={loginAuth.requesting || isLoading}
                    htmlType="submit"
                    className='log-in-btn'
                >
                    Log in
                </Button>
            </Form.Item>
        </div>

        <div className='divider'>
          OR
        </div>
          <InternetIdentityProvider
            {...cryptoService.getNfidInternetIdentityProviderProps(this.onNFIDLogin.bind(this))}
          >
            <Auth from="log-in" onLoggedIn={this.hasLoggedIn.bind(this)} />
            {/* onLoggedIn={()=> this.props.onFinish(false, true)} */}
          </InternetIdentityProvider>

        </Form>
        <div className='sign-in-link pt-10 lg:pt-16'>
            <span className='new-to'>Don’t have an account?</span> <span onClick={()=> this.props.onFinish(false, false)} className='get-started'>Sign up</span>
        </div>
      </AuthFrame>
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
    updateCurrentUser,
    loginNfid
  };

  export default connect(mapStatesToProps, mapDispatchToProps)(LogInModal);