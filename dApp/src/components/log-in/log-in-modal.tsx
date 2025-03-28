/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/require-default-props */
/* eslint-disable react/sort-comp */
import React, { PureComponent } from 'react';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { login, loginSocial, loginSuccess, loginNfid } from '@redux/auth/actions';
import { setAccount } from '@redux/user/actions';
import { Form, message, Modal, FormInstance, Button } from 'antd';
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
// import logo from '../../../public/static/trax_primary_logotype.svg'
import logo from '../../../public/static/TRAX_LOGOMARK_VERDE.png'

import TraxButton from '@components/common/TraxButton';
import TraxInputField from '@components/common/layout/TraxInputField';
import { AppleIcon, Facebook, PlaneLandingIcon } from 'lucide-react';
import { GrGooglePlay } from 'react-icons/gr';
import { FacebookFilled, GoogleCircleFilled } from '@ant-design/icons';
import SlideUpModal from '@components/common/layout/slide-up-modal';
import GoogleLoginButton from '@components/auth/google-login-button';
import AppleLoginButton from '@components/auth/apple-login-button';
import FacebookLoginButton from '@components/auth/facebook-login-button';
import { Capacitor, registerPlugin } from '@capacitor/core';

interface IProps {
  loginAuth: any;
  store: any;
  login: Function;
  loginNfid: Function;
  setAccount: Function;
  loginSuccess: Function;
  loginSocial: Function;
  ui: IUIConfig;
  settings: ISettings;
  oauth_verifier?: string;
  onFinish(isOpen: boolean, loggedIn: boolean, username?: string): Function;
  onForgotPassword?: () => void;
  authStatus?: string;
  twoFactorError?: string;
}

class LogInModal extends PureComponent<IProps> {
  formRef = React.createRef<FormInstance>();
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
    usernameError: '',
    passwordError: '',
    isMobile: false,
    stage: 1,
    myError: ''
  };

  // Get referral code from URL or localStorage
  getReferralCode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get('referralCode');

    if (refFromUrl) {
      return refFromUrl;
    } else {
      return '';
    }
  };

  async componentDidMount() {
    this.redirectLogin();
    this.callbackTwitter();
    this.checkIsMobile();
    window.addEventListener('resize', this.checkIsMobile);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkIsMobile);
  }

  checkIsMobile = () => {
    this.setState({ isMobile: window.innerWidth <= 768 });
  };

  componentDidUpdate(prevProps) {
    if (this.props.authStatus === '2FA_REQUIRED' && prevProps.authStatus !== '2FA_REQUIRED') {
      this.props.store.auth.is2FAEnabled ? this.setState({ show2FAModal: true }) : this.setState({ showSmsModal: true });
    }

    // Handle the successful login after 2FA submission
    if (this.props.store.user.current?._id !== null) {
      this.setState({ show2FAModal: false });
      this.hasLoggedIn(true);
    }

    if (this.props.twoFactorError && this.props.twoFactorError !== prevProps.twoFactorError) {
      this.setState({ twoFactorError: this.props.twoFactorError });
    }

    this.setState({ enabled2fa: this.props.store.auth.is2FAEnabled });
    this.setState({ enabledSms: this.props.store.auth.isSmsEnabled });
  }

  checkExistingEmail = async () => {
    const { usernameValue } = this.state;
    try {
      const resp = (
        await authService.registerCheckField({
          username: usernameValue
        })
      ).data;
      return resp;
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
      return { result: 1 };
    }
  };

  async handleLogin(values: any) {
    const { login: _login } = this.props;
    const { stage, usernameValue } = this.state;
    try {
      if (stage === 1) {
        const res = await this.checkExistingEmail();
        if (res && res.result === 0) {
          // New user, email does not exist
          this.props.onFinish(false, false, usernameValue);
          return;
        }
        this.setState({ stage: 2 });

        return;
      }

      if (stage === 2) {
        const response = await _login(values);
      }
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
    const { loginSuccess: handleLogin, setAccount: handleUpdateUser, onFinish: loggedIn } = this.props;
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
      console.log("user LOGIN", user)
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
      [`${name.replace('Value', '')}Error`]: ''
    });
  }

  handleFieldBlur = (fieldName: string) => {
    this.formRef.current?.validateFields([fieldName])
      .catch(() => {
        const error = this.formRef.current?.getFieldError(fieldName)?.[0];
        this.setState({ [`${fieldName}Error`]: error });
      });
  };

  onNFIDLogin(resp: any) {
    const { loginNfid: loginNfidHandle } = this.props;
    return cryptoService.onNFIDLogin(resp, 'log-in', loginNfidHandle, this.hasLoggedIn.bind(this));
  }

  handleForgotPassword = (e: React.MouseEvent) => {
    if (this.state.isMobile) {
      e.preventDefault();
      this.setState({ openForgotSheet: true });
    }
  };

  handleForgotClose = () => {
    this.setState({ openForgotSheet: false });
  };

  async onGoogleLogin(resp: any) {
    if (!resp?.credential) {
      return;
    }
    const { loginSocial: handleLogin } = this.props;
    const referralCode = this.getReferralCode();
    const payload = {
      tokenId: resp.credential,
      referralCode: referralCode
    };
    try {
      await this.setState({ isLoading: true });
      const response = await (await authService.loginGoogle(payload)).data;
      response.token && handleLogin({ token: response.token });
    } catch (e) {
      const error = await e;
      message.error(error && error.message ? error.message : 'Google login authenticated fail');
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async onAppleLogin(resp: any) {
    let tokenId = resp?.authorization?.id_token || resp?.response?.identityToken || resp?.authorization?.code;

    if (!tokenId) {
      message.error('Apple login failed: No valid token received.');
      return;
    }

    const { loginSocial: handleLogin } = this.props;
    const referralCode = this.getReferralCode();
    const payload = {
      tokenId,
      referralCode: referralCode
     };
    try {
      await this.setState({ isLoading: true });
      const response = await (await authService.loginApple(payload)).data;
      response.token && handleLogin({ token: response.token });
    } catch (e) {
      const error = await e;
      message.error(error && error.message ? error.message : 'Apple login authenticated fail');
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async onFacebookLogin(resp: any) {
    if (!resp?.accessToken) {
      return;
    }
    const { loginSocial: handleLogin } = this.props;
    const referralCode = this.getReferralCode();
    const payload = { tokenId: resp.accessToken, userId: resp?.userID, referralCode: referralCode };
    try {
      await this.setState({ isLoading: true });
      const response = await (await authService.loginFacebook(payload)).data;
      response.token && handleLogin({ token: response.token });
    } catch (e) {
      const error = await e;
      message.error(error && error.message ? error.message : 'Apple login authenticated fail');
    } finally {
      this.setState({ isLoading: false });
    }
  }

  render() {
    const { ui, settings, loginAuth, store } = this.props;
    const { isMobile, isLoading, welcomeMsg, passwordVisible, usernameValue, passwordValue, firstVisit, openForgotSheet, show2FAModal, twoFactorError, twoFactorKey, showSmsModal, smsError, smsKey, enabled2fa, enabledSms, stage, myError } = this.state;
    const platform = Capacitor.getPlatform();

    const appleIcon = (
      <img src="/static/apple.png" alt="Apple logo" />
    );

    const googleIcon = (
      <img src='/static/google.png' alt="Google logo"/>
    );

    const facebookIcon = (
      <img src='/static/facebook.png' alt="Facebook logo"/>
    )

    return (
      <AuthFrame>
        {/* <div className='h-fit '> */}
        <div className="log-in-header mx-auto flex font-heading flex-col justify-center items-left mt-6 sm:mt-auto">
          <div className='flex flex-col w-full justify-between gap-2'>
            <img alt="logo" width={80} height={80} className='flex mx-auto mt-0' src="/static/TRAX_LOGOMARK_VERDE.png" />
            <span className='text-[#FFF] font-body text-[26px] text-center mt-2 mb-3 sm:mb-0 sm:mt-2'>Log in or sign up</span>
          </div>
        </div>
        <Form
          ref={this.formRef}
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={this.handleLogin.bind(this)}
          className='log-in-form'
        >

           {/* Insert logic for sign in or sign up with Google, Facebook, Apple and X */}
           {!Capacitor.isNativePlatform() && (<><Form.Item>
                <FacebookLoginButton
                  appId={settings.facebooklientId}
                  onSuccess={this.onFacebookLogin.bind(this)}
                  onFailure={this.onFacebookLogin.bind(this)}
                />
              </Form.Item>
            <Form.Item>
                <GoogleLoginButton
                  clientId={settings.googleClientId}
                  onSuccess={this.onGoogleLogin.bind(this)}
                  onFailure={this.onGoogleLogin.bind(this)}
                />
              </Form.Item>
            </>)}
            <Form.Item>
              <AppleLoginButton
                clientId={settings.appleClientId}
                onSuccess={this.onAppleLogin.bind(this)}
                onFailure={this.onAppleLogin.bind(this)}
                redirectUri={window.location.origin}
              />
            </Form.Item>

            {!Capacitor.isNativePlatform() && (
              <Form.Item>
                <InternetIdentityProvider
                  {...cryptoService.getNfidInternetIdentityProviderProps(this.onNFIDLogin.bind(this))}
                >
                  <Auth from="log-in" onLoggedIn={this.hasLoggedIn.bind(this)} />
                  {/* onLoggedIn={()=> this.props.onFinish(false, true)} */}
                </InternetIdentityProvider>
              </Form.Item>
            )}
            <div className="text-center my-4">
                <div className="flex items-center justify-center gap-0">
                  <span className="text-trax-gray-500 w-20">or</span>
                </div>
              </div>
            <div className='email-wrapper pb-2'>
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please enter your email or username!' }]}
              >
                <TraxInputField
                  type="text"
                  name="usernameValue"
                  label="Continue with email or username"
                  value={usernameValue}
                  onChange={this.handleInputChange}
                  onBlur={() => this.handleFieldBlur('username')}
                  disabled={loginAuth.requesting || isLoading}
                  error={this.state.usernameError}
                />
              </Form.Item>
            </div>

            <div className={`email-wrapper ${stage === 2 ? 'display-contents gap-2' : 'no-display'}`}>
              <Form.Item
                name="password"
                rules={stage === 2 ? [
                  { required: false, message: 'Please input your password.' }
                ] : []}
              >
                <TraxInputField
                  type="password"
                  name="passwordValue"
                  label="Password"
                  value={passwordValue}
                  onChange={this.handleInputChange}
                  onBlur={() => this.handleFieldBlur('password')}
                  error={this.state.passwordError}
                  disabled={loginAuth.requesting || isLoading}
                />
              </Form.Item>
              <div className='forgot-links'>
                <Link
                  href="/auth/forgot-password"
                  className="forgot-password"
                  onClick={this.handleForgotPassword}
                >
                  Need help signing in?
                </Link>
                {/* Forgot Password Sheet for Mobile */}
                {isMobile && openForgotSheet && (
                  <SlideUpModal
                    isOpen={openForgotSheet}
                    onClose={this.handleForgotClose}
                    className="auth-modal"
                  >
                    <Forgot onClose={this.handleForgotClose} />
                  </SlideUpModal>
                )}
              </div>
            </div>
          <div>
            <Form.Item>
              <TraxButton
                htmlType="submit"
                styleType="primary"
                buttonSize='full'
                buttonText="Continue"
                loading={loginAuth.requesting || isLoading}
                disabled={!usernameValue.trim() || loginAuth.requesting || isLoading}
              />
            </Form.Item>
            <div className='mx-auto px-4 flex text-center mt-6'>
              <span className='text-[#ffffff99] text-[11px] font-light tracking-[0.025rem]'>
                By signing up, you are creating a TRAX account and agree to TRAX’s
                <Link className='text-[#ffffff99] font-bold hover:text-custom-green' href="/page/?id=terms-of-service"> Terms </Link>
                and
                <Link className='text-[#ffffff99] font-bold hover:text-custom-green' href="/page/?id=privacy-policy"> Privacy Policy </Link>
              </span>
            </div>
          </div>

        </Form>



{/*
        <div className='sign-in-link py-3 lg:pt-16'>
          <span className='new-to'>Don’t have an account?</span>
          <span onClick={() => this.props.onFinish(false, false, '')} className='get-started'>Sign up</span>
        </div> */}
        {/* </div> */}

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
  setAccount,
  loginNfid
};

export default connect(mapStatesToProps, mapDispatchToProps)(LogInModal);