/* eslint-disable prefer-promise-reject-errors */
import { loginNfid, loginSocial, registerFan } from '@redux/auth/actions';
import {
  Button, Col, Divider, Form, Image, Input, Layout, Row
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { authService } from '@services/index';
import { connect } from 'react-redux';
import { ISettings, IUIConfig } from 'src/interfaces';
import { motion } from 'framer-motion';
import { Auth } from '../../src/crypto/nfid/Auth';
import styles from './index.module.scss';

interface IProps {
  ui: IUIConfig;
  settings: ISettings;
  registerFan: Function;
  registerFanData: any;
  loginSocial: Function;
  store: any;
}

class FanRegister extends PureComponent<IProps> {
  static authenticate = false;

  static layout = 'blank';

  state = {
    recaptchaSuccess: false,
    isLoading: false
  };

  handleRegister = (data: any) => {
    const { registerFan: handleRegister } = this.props;
    handleRegister(data);
  };

  validateReferralCode = async (rule, value, callback) => {
    if (!value) return true;
    const res = await authService.verifyReferralCode({ referralCode: value });

    if (!(res.data.isValid)) {
      throw new Error('Invalid referral code!');
    }
  };

  render() {
    const { ui, registerFanData } = this.props;
    const { requesting: submiting } = registerFanData;
    const { isLoading } = this.state;
    const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';

    return (
      <Layout className={styles.pagesContactModule}>
        <Head>
          <title>{`${ui?.siteName} | Sign up`}</title>
        </Head>
        <div
          className="main-container "
          style={{
            margin: 0,
            padding: 0,
            width: '100vw',
            background: 'radial-gradient(circle at right, #bbe90020, #000000)'
          }}
        >
          <div className="login-box" style={{ width: '100vw' }}>
            <Row style={{ height: '100vh' }}>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={12}
                style={{ background: 'radial-gradient(circle at right, #0F0F0F, #000000)' }}
              >
                <div className="login-trax-name">
                  <Image alt="logo" preview={false} width="120px" src="/static/LogoAlternate.png" />
                </div>
                <div className="login-content right">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { delay: 0.0 } }}
                  >
                    <p className="login-welcome-h1">
                      Sign up
                    </p>
                    <p className="login-welcome-p">
                      By creating an account, you agree to abide by our  <a href="/page?id=terms-of-service" target="_blank" style={{ color: '#FFFFFF' }}>Terms of Service</a> and Prviacy Policy.
                    </p>
                  </motion.div>
                  <div className="login-form">
                    <Form
                      labelCol={{ span: 24 }}
                      name="member_register"
                      initialValues={{ remember: true, gender: 'male', referralCode }}
                      onFinish={this.handleRegister.bind(this)}
                      scrollToFirstError
                    >
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, transition: { delay: 0.2 } }}
                          >
                             <div className="sign-in-subtitle">
                          <p>Name <span style={{color:'#BBE900'}}>*</span></p>
                        </div>
                            <Form.Item
                              name="firstName"
                              validateTrigger={['onChange', 'onBlur']}
                              rules={[
                                { required: true, message: 'Please input your name!' },
                                {
                                  pattern:
                                    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                                  message: 'First name can not contain number and special character'
                                }
                              ]}
                            >
                              <Input placeholder="Enter your name" />
                            </Form.Item>
                          </motion.div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { delay: 0.4 } }}
                      >
                        <div className="sign-in-subtitle">
                          <p>Email <span style={{color:'#BBE900'}}>*</span> </p>
                        </div>

                        <Form.Item
                          name="email"
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              type: 'email',
                              message: 'Invalid email address!'
                            },
                            {
                              required: true,
                              message: 'Please input your email address!'
                            }
                          ]}
                        >
                          <Input placeholder="Enter your email" />
                        </Form.Item>
                        <div className="sign-in-subtitle">
                          <p>Password <span style={{color:'#BBE900'}}>*</span></p>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { delay: 0.5 } }}
                      >
                        <Form.Item
                          name="password"
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            {
                              pattern: /^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[^\w\d]).*$/g,
                              message:
                                'Password must have minimum 8 characters, at least 1 number, 1 uppercase letter, 1 lowercase letter & 1 special character'
                            },
                            { required: true, message: 'Please enter your password!' }
                          ]}
                        >
                          <Input.Password placeholder="Create a password" />
                        </Form.Item>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { delay: 0.4 } }}
                      >
                        <div className="sign-in-subtitle">
                          <p>Referral code
                            <span className="optional-badge">Optional</span></p>
                        </div>

                        <Form.Item
                          name="referralCode"
                          rules={[
                            { required: false }
                          ]}
                        >
                          <Input placeholder="Enter referral code" />
                        </Form.Item>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { delay: 0.6 } }}
                      >
                        <Form.Item style={{ textAlign: 'center', marginTop:'1rem' }}>
                          <Button
                            style={{ width: '100%', marginTop:'0.5rem' }}
                            // type="primary"
                            htmlType="submit"
                            className="login-form-button"
                            disabled={submiting || isLoading}
                            loading={submiting || isLoading}
                          >
                            <span style={{ margin: 'auto', textAlign: 'center' }}>Get started</span>
                          </Button>
                        </Form.Item>
                      </motion.div>
                      <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { delay: 0.1 } }}
                  >
                    <div className="social-login">
                      <Auth from={"log-in"}/>
                    </div>
                    <p className="reg-text-bottom" style={{ paddingTop: '0rem' }}>
                                <Link href="/login" style={{ color: '#BBE900' }}>
                                  Already have an account? <span style={{color: '#BBE900'}}>Log in</span>
                                </Link>
                              </p>
                  </motion.div>
                    </Form>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={12} md={12} lg={12} className="" style={{padding: 0}}>
                <div className='temp-div'>
                  <div className="temp-bg" style={{ backgroundImage: "/static/artistsnormal.png" }} />
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui },
  settings: { ...state.settings },
  registerFanData: { ...state.auth.registerFanData },
  store: { ...state }
});

const mapDispatchToProps = { registerFan, loginSocial, loginNfid };

export default connect(mapStatesToProps, mapDispatchToProps)(FanRegister);
