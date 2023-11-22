/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/require-default-props */
/* eslint-disable react/sort-comp */
import { PureComponent } from 'react';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import { IPerformer } from '@interfaces/index';
import { tokenTransctionService } from '@services/index';
import { login, loginSocial, loginSuccess, loginNfid } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import {
  InputNumber, Button, Avatar, Select, Image, Input, Form, message
} from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link'
import styles from './performer.module.scss';
import { NFIDIcon } from '../../icons/index';
import { Auth } from 'src/crypto/nfid/Auth';
import { ISettings, IUIConfig } from 'src/interfaces';
import { authService, userService, cryptoService } from '@services/index';
import Router from 'next/router';

const { Option } = Select;

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
    welcomeMsg: 'Create an account'
  };

  async componentDidMount() {
    this.redirectLogin();
    this.callbackTwitter();
  }

  async handleLogin(values: any) {
    const { login: handleLogin, onFinish: loggedIn } = this.props;
    loggedIn(false, true)
    return handleLogin(values);
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

  onNFIDLogin(resp: any) {
    const { loginNfid: loginNfidHandle } = this.props;
    return cryptoService.onNFIDLogin(resp, 'log-in', loginNfidHandle);
  }

  render() {
    const { ui, settings, loginAuth, store } = this.props;
    const { isLoading, welcomeMsg } = this.state;

    return (
      <div className="log-in-container">
        <div className='log-in-logo'>
            <img src="/static/LogoAlternate.png" width="100px" alt="Loading..."/>
        </div>
        <div className='log-in-header'>
            <span>Log in</span>
            <p>Continue to trax.so</p>
        </div>
        <Form
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={this.handleLogin.bind(this)}
        >
        <div className='email-wrapper'>
            <span className='field-subheading'>Email or username</span>
            <Form.Item
              name="username"
              validateTrigger={['onChange', 'onBlur']}
              rules={[{ required: true, message: 'Please enter your email or username!' }]}
            >
                <Input disabled={loginAuth.requesting || isLoading} type="text"/>
            </Form.Item>
        </div>

        <div className='email-wrapper'>
            <span className='field-subheading'>Password</span>
            <Form.Item
              name="password"
              validateTrigger={['onChange', 'onBlur']}
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
                <Input.Password type="text"/>
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
        </div>

        <div className='log-in-btn-wrapper'>
            <Form.Item style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <Button 
                    disabled={loginAuth.requesting || isLoading}
                    loading={loginAuth.requesting || isLoading}
                    htmlType="submit" 
                    className='log-in-btn'
                >
                    Continue
                </Button>
            </Form.Item>
        </div>
        
        <div className='divider'>
           <div className='hr-line'/> <span>Or</span> <div className='hr-line'/>
        </div>
          <InternetIdentityProvider
            {...cryptoService.getNfidInternetIdentityProviderProps(this.onNFIDLogin.bind(this))}
          >
            <Auth from="log-in" />
          </InternetIdentityProvider>

        </Form>
        <div className='sign-in-link'>
            <span className='new-to'>New to TRAX?</span> <span onClick={()=> this.props.onFinish(false, false)} className='get-started'>Get started →</span>
        </div>
      </div>
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