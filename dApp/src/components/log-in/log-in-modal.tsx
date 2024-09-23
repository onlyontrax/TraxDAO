/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/require-default-props */
/* eslint-disable react/sort-comp */
import { PureComponent } from 'react';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { login, loginSocial, loginSuccess, loginNfid } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import {
  Button, Select, Input, Form, message, Modal
} from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link'
import { Auth } from 'src/crypto/nfid/Auth';
import { ISettings, IUIConfig } from 'src/interfaces';
import { authService, userService, cryptoService } from '@services/index';
import Router from 'next/router';
import AuthFrame from '../common/base/auth-frame';
import TwoFactorModal from './two-factor-modal';
import SmsModal from './sms-modal';
import { Sheet } from 'react-modal-sheet';
import Forgot from 'pages/auth/forgot-password';
import Image from 'next/image';
import logo from '../../../public/static/trax_primary_logotype.svg'

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
  onForgotPassword?: () => void;
  authStatus?: string;
  twoFactorError?: string;
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
    firstVisit: false,
    openForgotSheet: false,
    enabled2fa: false,
    twoFactorError: '',
    show2FAModal: false,
    twoFactorKey: '',
    showSmsModal: false,
    smsKey: '',
    enabledSms: false,
    smsError: '',
  };

  async componentDidMount() {
    this.redirectLogin();
    this.callbackTwitter();
  }

  componentDidUpdate(prevProps) {
    if (this.props.authStatus === '2FA_REQUIRED' && prevProps.authStatus !== '2FA_REQUIRED') {
      this.props.store.auth.is2FAEnabled ? this.setState({ show2FAModal: true }) : this.setState({ showSmsModal: true });
    }

    // Handle the successful login after 2FA submission
    if (this.props.store.user.current._id !== null) {
      this.setState({ show2FAModal: false });
      this.hasLoggedIn(true);
    }

    if (this.props.twoFactorError && this.props.twoFactorError !== prevProps.twoFactorError) {
      this.setState({ twoFactorError: this.props.twoFactorError });
    }

    this.setState({ enabled2fa: this.props.store.auth.is2FAEnabled });
    this.setState({ enabledSms: this.props.store.auth.isSmsEnabled });
  }

  async handleLogin(values: any) {
    const { login: _login } = this.props;
    try {
      const response = await _login(values);
    } catch (error) {
      this.handleLoginError(error);
    }
  }

  handleLoginError(error) {
    console.log(error, error.message);
    if (error.response && error.response.status === 404) {
      message.error('This account is not found, please sign up');
    } else if (error.response && error.response.data && error.response.data.message) {
      message.error(error.response.data.message);
    } else if (error.response && error.response.data && error.response.data.message === 'SMS or 2FA key is empty') {
      // Do nothing we are already handling this
    } else {
      message.error('Login failed. Please try again.');
    }
  }

  handle2FAInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ twoFactorKey: e.target.value });
  };

  handleSwitchSms2FAChange = async () => {
    const { show2FAModal } = this.state;

    if (show2FAModal) {
      this.setState({ smsKey: '', twoFactorKey: '', show2FAModal: false, showSmsModal: true });
    } else {
      this.setState({ smsKey: '', twoFactorKey: '', show2FAModal: true, showSmsModal: false });
    }
  }

  handle2FASubmit = async (pin: string) => {
    const { usernameValue, passwordValue, twoFactorKey, show2FAModal } = this.state;
    const { login } = this.props;

    try {
      this.setState({ twoFactorError: '' });
      const res = await login({
        username: usernameValue,
        password: passwordValue,
        twoFactorKey: show2FAModal ? pin : '', // Use the pin passed from TwoFactorModal
        smsKey: !show2FAModal ? pin : '' // Use the same pin for SMS if needed
      });
    } catch (error) {
      this.setState({
        twoFactorError: 'Invalid 2FA code. Please try again.',
        smsError: 'Invalid SMS code. Please try again.'
      });
    }
  }

  handle2FASubmitWrapper = () => {
    const { twoFactorKey } = this.state;
    this.handle2FASubmit(twoFactorKey);
  }

  onGetSmsCode = async () => {
    const { usernameValue, passwordValue, twoFactorKey, smsKey } = this.state;
    const { login } = this.props;

    // Dispatch login again with 2FA token
    try {
      this.setState({ twoFactorError: '' });
      const res = await authService.getSmsCode({ username: usernameValue, password: passwordValue, twoFactorKey, smsKey });
    } catch (error) {
      this.setState({ twoFactorError: 'Invalid 2FA code. Please try again.' });
      this.setState({ smsError: 'Invalid SMS code. Please try again.' });
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
          { pathname: `/${user.data.username || user.data._id}` },
          `/${user.data.username || user.data._id}`
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

  checkFirstVisit() {
    if (localStorage.getItem('was_visited')) {
      return;
    }
    this.setState({ firstVisit: true });
    localStorage.setItem('was_visited', 'first_user');
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

  handleForgotPassword = () => {
    const { onForgotPassword } = this.props;
    if (onForgotPassword) {
      onForgotPassword(); // Close login modal
      this.setState({ openForgotSheet: true }); // Open forgot password modal
    }
  };

  handleForgotPasswordClose = () => {
    this.setState({ openForgotSheet: false });
  };

  render() {
    const { ui, settings, loginAuth, store } = this.props;
    const { isLoading, welcomeMsg, passwordVisible, usernameValue, passwordValue, firstVisit, openForgotSheet, show2FAModal, twoFactorError, twoFactorKey, showSmsModal, smsError, smsKey, enabled2fa, enabledSms } = this.state;
    const isMobile = window.innerWidth <= 768;

    return (
      <AuthFrame>
        <div className="log-in-header mx-auto flex font-heading flex-col justify-center items-left mt-6 sm:mt-auto">
          <Image alt="logo" width={120} height={100} className='mt-3 mb-3' src={logo}/>
          <span className='main-title'>{firstVisit ? "Welcome to TRAX" : "Welcome back"}</span>
          {/* <span className='main-subtitle'>Log in to TRAX below</span> */}
        </div>
        <Form
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={this.handleLogin.bind(this)}
          className='log-in-form'
        >
          <div className='email-wrapper pb-2'>
            <Form.Item
              name="username"
              validateTrigger={['onChange', 'onBlur']}
              rules={[{ required: true, message: 'Please enter your email or username!' }]}
            // validateStatus={usernameValue.trim() ? 'success' : 'error'}
            >
              <div className="relative pulse-border">
                <Input
                  onChange={this.handleInputChange}
                  name="usernameValue"
                  type="text"
                  id="usernameInput"
                  disabled={loginAuth.requesting || isLoading}
                />
                <label
                  htmlFor="usernameInput"
                  className={`floating-label ${this.state.usernameValue ? 'label-transition-active' : 'label-transition-initial'
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
              <div className="relative pulse-border">
                <Input.Password
                  onChange={this.handleInputChange}
                  name="passwordValue"
                  type={passwordVisible ? 'text' : 'password'}
                  id="passwordInput"
                />
                <label
                  htmlFor="passwordInput"
                  className={`floating-label ${this.state.passwordValue ? 'label-transition-active' : 'label-transition-initial'
                    }`}
                >
                  Password
                </label>
              </div>
            </Form.Item>
            <div className='forgot-links'>
            {isMobile ? (
              <span
                onClick={this.handleForgotPassword}
                className="forgot-password"
              >
                Forgot password?
              </span>
            ) : (
              <Link
                href={{
                  pathname: '/auth/forgot-password',
                }}
                className="forgot-password"
              >
                Forgot password?
              </Link>
            )}

            {/* Forgot Password Sheet for Mobile */}
            {isMobile && (
              <Sheet
                isOpen={openForgotSheet}
                onClose={this.handleForgotPasswordClose}
                detent="content-height"
                className="auth-modal"
              >
                <Sheet.Container>
                  <Sheet.Header />
                  <Sheet.Content>
                    <Forgot onClose={this.handleForgotPasswordClose} />
                  </Sheet.Content>
                </Sheet.Container>
                <Sheet.Backdrop onTap={this.handleForgotPasswordClose} />
              </Sheet>
            )}
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
                CONTINUE
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
        <div className='sign-in-link py-3 lg:pt-16'>
          <span className='new-to'>Don’t have an account?</span>
          <span onClick={() => this.props.onFinish(false, false)} className='get-started'>Sign up</span>
        </div>

        {/* Two Factor Authentication Modal or Sheet */}
        {show2FAModal && (
          <TwoFactorModal
            visible={show2FAModal}
            onOk={this.handle2FASubmitWrapper}
            onCancel={() => this.setState({ show2FAModal: false, isLoading: false })}
            onInputChange={this.handle2FAInputChange}
            twoFactorError={twoFactorError}
            twoFactorKey={twoFactorKey}
            showSms2faButton={enabledSms}
            onShowSms2faButtonPress={this.handleSwitchSms2FAChange}
            isMobile={isMobile}
          />
        )}
        {showSmsModal && (
          <SmsModal
            visible={showSmsModal}
            onOk={this.handle2FASubmit}
            onCancel={() => this.setState({ showSmsModal: false, isLoading: false })}
            smsError={smsError}
            showSms2faButton={enabled2fa}
            onShowSms2faButtonPress={this.handleSwitchSms2FAChange}
            onGetSmsCode={this.onGetSmsCode}
            isMobile={isMobile}
          />
        )}
      </AuthFrame>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui },
  settings: { ...state.settings },
  loginAuth: { ...state.auth.loginAuth },
  store: { ...state },
  authStatus: state.auth.authStatus,
  twoFactorError: state.auth.twoFactorError,
});

const mapDispatchToProps = {
  login,
  loginSocial,
  loginSuccess,
  updateCurrentUser,
  loginNfid
};

export default connect(mapStatesToProps, mapDispatchToProps)(LogInModal);