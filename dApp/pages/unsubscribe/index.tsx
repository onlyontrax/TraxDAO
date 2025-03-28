/* eslint-disable camelcase */
import Loader from '@components/common/base/loader';
import { login, loginSocial, loginSuccess } from '@redux/auth/actions';
import { setAccount } from '@redux/user/actions';
import { authService, userService, accountService } from '@services/index';
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

interface IProps {
  store: any;
  setAccount: Function;
  ui: IUIConfig;
  settings: ISettings;
}

class Unsubscribe extends PureComponent<IProps> {
  static authenticate = false;

  static layout = 'blank';

  state = {
    isLoading: false,
    unsubscribed: false,
    welcomeMsg: 'Unsubscribe'
  };

  async handleUnsubscribe(values: any) {
    this.setState({ isLoading: true });
    try {
      //const token = authService.getToken() || '';
      const urlParams = new URLSearchParams(window.location.search);
      const fromUser = urlParams.get('fromUser');

      const unsubscribe = await accountService.unsubscribe({ fromUser });

      if (unsubscribe?.data?.unsubscribed) {
        this.setState({ isLoading: false, unsubscribed: true });
        message.success('Unsubscribed successfully');
      } else {
        this.setState({ isLoading: false });
        message.error('An error occurred, please try again!');
      }
    }
    catch (e) {
      this.setState({ isLoading: false });
      message.error(e.message || 'An error occurred, please try again!');
    }
  }

  render() {
    const { ui, settings } = this.props;
    const { isLoading, unsubscribed } = this.state;
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
                {unsubscribed && (
                  <div style={{ marginTop: '5rem' }} className="login-content right">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { delay: 0.1 } }}
                    >
                        <h1 className="login-welcome-h1">Unsubscribed successfully</h1>
                        <p className='login-welcome-p'>You'll stop receiving messages from us.</p>
                    </motion.div>
                  </div>
                )}

                {!unsubscribed && (
                  <div style={{ marginTop: '5rem' }} className="login-content right">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { delay: 0.1 } }}
                    >
                        <h1 className="login-welcome-h1">Do you want to unsubscribe from our messages?</h1>
                        <p className='login-welcome-p'>You'll stop receiving messages from us.</p>
                    </motion.div>

                    <div className="login-form">
                      <Form
                        name="normal_login"
                        className="login-form"
                        initialValues={{ remember: true }}
                        onFinish={this.handleUnsubscribe.bind(this)}
                      >
                        <Form.Item style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, transition: { delay: 0.3 } }}
                          >
                            <Button
                              style={{ width: '100%' }}
                              disabled={isLoading}
                              loading={isLoading}
                              // type="primary"
                              htmlType="submit"
                              className="login-form-button"
                            >
                              Unsubscribe
                            </Button>
                          </motion.div>
                        </Form.Item>
                      </Form>
                    </div>
                  </div>
                )}
              </Col>
              <Col xs={0} sm={24} md={12} lg={12} className="" style={{padding: 0}}>
              <div className='temp-div'>
                  <div className="temp-bg" style={{ backgroundImage: "/static/artistsnormal.jpg" }} />
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
  store: { ...state }
});

const mapDispatchToProps = {
  setAccount
};
export default connect(mapStatesToProps, mapDispatchToProps)(Unsubscribe);
