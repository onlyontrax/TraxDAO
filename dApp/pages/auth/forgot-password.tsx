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
import styles from './index.module.scss';

interface IProps {
  auth: any;
  ui: any;
  forgot: Function;
  forgotData: any;
  query: any;
}

interface IState {
  submiting: boolean;
  countTime: number;
}

class Forgot extends PureComponent<IProps, IState> {
  static authenticate = false;

  static layout = 'blank';

  _intervalCountdown: any;

  state = {
    recaptchaSuccess: false,
    submiting: false,
    countTime: 60
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.countTime === 0) {
      this._intervalCountdown && clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
    }
  }

  componentWillUnmount() {
    this._intervalCountdown && clearInterval(this._intervalCountdown);
  }

  handleReset = async (data: IForgot) => {
    await this.setState({ submiting: true });
    try {
      await authService.resetPassword({
        ...data
      });
      message.success('An email has been sent to you to reset your password');
      this.handleCountdown();
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Error occured, please try again later');
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

  render() {
    const { ui } = this.props;
    const { submiting, countTime } = this.state;
    return (
      <>
        <Head>
          <title>{`${ui?.siteName} | Forgot Password`}</title>
        </Head>
        <Layout className={styles.pagesContactModule}>
            <div className="login-box" style={{ background: '#000' }}>
              <Row>
                <Col
                  xs={24}
                  sm={24}
                  md={24}
                  lg={24}
                  className="login-content right"
                  style={{ paddingTop: '12rem' }}
                >
                  <div style={{ textAlign: 'center' }} className="trax-logo-wrapper-fp">
                    <img src="/static/traxLogoAnimate.gif" alt="Loading..." />
                  </div>
                  <h3
                    style={{
                      fontSize: '2rem',
                      textAlign: 'center',
                      color: '#FFF',
                      marginBottom: '2rem',
                      marginTop: '2rem'
                    }}
                  >
                    Reset password
                  </h3>
                  <div>
                    <Form name="login-form" onFinish={this.handleReset.bind(this)}>
                      <Form.Item
                        className="forgot-password-email"
                        hasFeedback
                        name="email"
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            type: 'email',
                            message: 'Invalid email format'
                          },
                          {
                            required: true,
                            message: 'Please enter your E-mail!'
                          }
                        ]}
                      >
                        <Input placeholder="Enter your email address" />
                      </Form.Item>
                      <Form.Item style={{ textAlign: 'center' }}>
                        <Button
                          htmlType="submit"
                          className="tip-button"
                          disabled={submiting || countTime < 60}
                          loading={submiting || countTime < 60}
                        >
                          {countTime < 60 ? 'Resend in' : 'Send'}
                          {' '}
                          {countTime < 60 && `${countTime}s`}
                        </Button>
                      </Form.Item>
                      <Form.Item>
                        <p className="forgot-text">
                          Have an account already?
                          <Link style={{ color: '#BBE900', marginLeft: '0.5rem'}} href="/">
                            Log in here.
                          </Link>
                        </p>
                        <p className="forgot-text">
                          Don&apos;t have an account yet?
                          <Link href="/auth/artist-register" style={{ color: '#BBE900', marginLeft: '0.5rem'}}>
                            Sign up here.
                          </Link>
                        </p>
                      </Form.Item>
                    </Form>
                  </div>
                </Col>
              </Row>
            </div>
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
