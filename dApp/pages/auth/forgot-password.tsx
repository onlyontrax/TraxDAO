/* eslint-disable react/no-did-update-set-state */
import { authService } from '@services/index';
import { Col, Form, Input, Layout, Row, message } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IForgot } from 'src/interfaces';
import AuthFrame from 'src/components/common/base/auth-frame'

import TraxButton from '@components/common/TraxButton';
import { ArrowLeft } from 'lucide-react';
import TraxInputField from '@components/common/layout/TraxInputField';

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

  handleReset = async (data: any) => {
    const { emailValue } = this.state;
    await this.setState({ submiting: true });
    try {
      console.log("resetiram", emailValue);
      await authService.resetPassword({
        email: emailValue
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

  handleBack = () => {
    const { onClose } = this.props;
    const isMobile = window.innerWidth <= 768;

    if (isMobile && onClose) {
      onClose();
    } else {
      // For desktop, go back to previous page
      window.history.back();
    }
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
        <div className="absolute top-10 left-10">
                    <button
                      className="flex text-sm items-center gap-2 bg-slaps-gray p-3 rounded-md font-semibold text-custom-green"
                      onClick={this.handleBack}
                    >
                      <ArrowLeft/>

                    </button>
                  </div>
          <AuthFrame>
                <div className='log-in-form items-center'>

                  <div className='log-in-header '>
                    <h1 className='font-body text-[#FFF] text-3xl text-center pb-2'>Trouble signing in?</h1>
                    <p className='main-subtitle text-center pt-2 pb-2 md:pb-6 text-sm md:text-md tracking-loose font-regular'>Enter the email address connected to your account. We'll send you an email with a link to get back into your account.</p>


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
                          <TraxInputField
                            type="email"
                            name="emailValue"
                            label="Enter your email address"
                            value={emailValue}
                            onChange={this.handleInputChange}
                          />
                        </Form.Item>
                      </div>
                      <div className='log-in-btn-wrapper py-3'>
                        <Form.Item>
                          <TraxButton
                            htmlType="submit"
                            styleType="primary"
                            buttonSize='full'
                            buttonText={countTime < 60 ? `Resend in ${countTime}s`: 'Reset password'}
                            loading={submiting || countTime < 60}
                            disabled={!emailValue.trim() || submiting || countTime < 60}
                          />
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
