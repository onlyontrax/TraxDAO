/* eslint-disable react/no-did-update-set-state */
import { authService } from '@services/index';
import {
  Button, Col, Form, Input, Layout, Row, message
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IForgot } from 'src/interfaces';
import AuthFrame from 'src/components/common/base/auth-frame'

interface IProps {
  ui?: any;
  forgotData?: any;
  query?: any;
  onClose: () => void;
}

interface IState {
  submiting: boolean;
  countTime: number;
  emailValue: string;
}

class Forgot extends PureComponent<IProps, IState> {
  static authenticate = false;

  static layout = 'blank';

  _intervalCountdown: any;

  state = {
    recaptchaSuccess: false,
    submiting: false,
    countTime: 60,
    emailValue: '',
  };

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (prevState.countTime === 0) {
      clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
    }
  }

  componentWillUnmount() {
    clearInterval(this._intervalCountdown);
  }

  handleReset = async (data: IForgot) => {
    await this.setState({ submiting: true });
    try {
      await authService.resetPassword({
        ...data
      });
      message.success('An email has been sent to you to reset your password.');
      this.handleCountdown();
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Error occured, please try again later.');
    } finally {
      this.setState({ submiting: false });
    }
  };

  handleCountdown = async () => {
    const { countTime } = this.state;
    if (countTime === 0) {
      clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
      return;
    }
    this.setState({ countTime: countTime - 1 });
    this._intervalCountdown = setInterval(this.coundown.bind(this), 1000);
  };

  coundown() {
    const { countTime } = this.state;
    this.setState({ countTime: countTime - 1 });
  }

  handleInputChange = (event) => {
    const { value } = event.target;
    this.setState({
      emailValue: value,
    });
  };

  render() {
    const { ui, onClose } = this.props;
    const { submiting, countTime, emailValue } = this.state;
    const isMobile = window.innerWidth <= 768;

    return (
      <>
        <Head>
          <title>{`${ui?.siteName} | Forgot Password`}</title>
        </Head>
        <Layout className="min-w-full min-h-full pt-0">
          <AuthFrame>
                <div className='log-in-form items-center'>
                  <div className="w-full text-left">
                  {!isMobile ? (
                    <a className="flex text-sm items-center gap-2 font-semibold" href='/'>
                      <img className='w-5 h-5'src="/static/frameIcon.svg" alt="Right arrow" />
                      Back
                    </a>
                  ) : (
                    <button
                      className="flex text-sm items-center gap-2 font-semibold text-custom-lime-green pb-4"
                      onClick={onClose}
                    >
                      <img className="w-5 h-5" src="/static/frameIcon.svg" alt="Right arrow" />
                      Back
                    </button>
                  )}
                  </div>
                  <div className='log-in-header text-center md:text-left'>
                    <h1 className='main-title pb-4'>Reset your password</h1>
                    <p className='main-subtitle text-center md:text-left pt-2 pb-2 md:pb-6 text-sm md:text-sm font-medium'>If you signed up with an email and password, reset your password below.</p>
                    <p className='main-subtitle text-center md:text-left pt-2 pb-2 md:pb-12 text-sm md:text-sm font-medium'>
                      If you signed up using a wallet, Plug or Internet Identity, get help accessing your account
                      <Link
                        href={{
                          pathname: 'https://x.com/trax_so'
                        }}
                        target="_blank"
                        className="forgot-password ml-2 underline"
                      >
                        here.
                      </Link>
                    </p>

                  </div>
                  <div className='w-full m-auto md:py-0 py-2'>
                    <Form
                      name="forgot-password-form"
                      onFinish={this.handleReset.bind(this)}
                      initialValues={{ remember: true }}
                      className='flex flex-col m-auto py-0'
                    >
                      <div className='email-wrapper'>
                        <Form.Item
                          name="email"
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              type: 'email',
                              message: 'Invalid email format.'
                            },
                            {
                              required: true,
                              message: 'Please enter your E-mail.'
                            }
                          ]}
                        >
                          <Input
                            onChange = {this.handleInputChange}
                            name="emailValue"
                            type="text"
                          />
                          <label
                            htmlFor="usernameInput"
                            className={`floating-label ${this.state.emailValue ? 'label-transition-active' : 'label-transition-initial'
                              }`}
                          >
                            Enter your email address
                          </label>
                        </Form.Item>
                      </div>
                      <div className='log-in-btn-wrapper py-3'>
                        <Form.Item style={{ textAlign: 'center' }}>
                          <Button
                            htmlType="submit"
                            className="log-in-btn"
                            disabled={!emailValue.trim() ||submiting || countTime < 60}
                            loading={submiting || countTime < 60}
                          >
                            {countTime < 60 ? 'Resend in' : 'Reset password'}
                            {' '}
                            {countTime < 60 && `${countTime}s`}
                          </Button>
                        </Form.Item>
                      </div>
                      <div className='sign-in-link pt-28'>
                        <span className='new-to'>
                          This site is protected by reCAPTCHA and the <Link href="/page?id=privacy-policy" target="_blank" className='get-started text-trax-gray-500'>TRAX Privacy Policy</Link> and <Link href="/page?id=terms-of-service" target="_blank" className='get-started text-trax-gray-500'>Terms of Service</Link> apply. </span>
                      </div>
                    </Form>
                  </div>
                </div>
              </AuthFrame>
          {/* </div> */}
        </Layout>
      </>
    );
  }
}

const mapStatetoProps = (state: any) => ({
  ui: { ...state.ui }
});

export default connect(mapStatetoProps)(Forgot);
