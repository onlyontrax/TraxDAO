/* eslint-disable react/no-danger */
import { LightningBoltIcon } from '@heroicons/react/outline';
import { MusicNoteIcon } from '@heroicons/react/solid';
import { loginSuccess } from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { authService, userService } from '@services/index';
import { Col, Image, Row } from 'antd';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces';
import styles from './index.module.scss';

interface IProps {
  ui: IUIConfig;
  loginSuccess: Function;
  updateCurrentUser: Function;
}
class Dashboard extends PureComponent<IProps> {
  static layout = 'blank';

  static authenticate = false;

  state = {
    loginAs: 'user'
  };

  async componentDidMount() {
    const { loginSuccess: loginSuccessHandler, updateCurrentUser: updateCurrentUserHandler } = this.props;

    // Check referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('referralCode');
    if (referralCode) {
      if (typeof window !== 'undefined') {
        // Store referral code in browser storage
        localStorage.setItem('referralCode', referralCode);
      }
    }

    const token = authService.getToken() || '';

    if (!token || token === 'null') {
      return;
    }
    authService.setToken(token);
    const user = await userService.me({
      Authorization: token
    });

    // TODO - check permission
    if (!user.data._id) {
      return;
    }
    loginSuccessHandler();
    updateCurrentUserHandler(user.data);
    Router.push('/home');
  }

  render() {
    const { ui } = this.props;

    return (
      <div className={styles.pagesContactModule}>
        <div className="">
          <Head>
            <title>{`${ui?.siteName} | Register`}</title>
          </Head>
          <div className="" style={{ minWidth: '100%', padding: '0px' }}>
            <div className="login-box">
              <Row style={{ height: '100vh' }}>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={12}
                  style={{ background: 'radial-gradient(circle at right, #0F0F0F, #000000)' }}
                >
                  <div className="login-trax-name">
                    <Image alt="logo" preview={false} width="120px" src="/static/LogoAlternate.png" />
                  </div>
                  <div className="login-content right ">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, transition: { delay: 0.1 } }}
                    >
                      <h1 className="login-welcome-h1">
                        Get started
                      </h1>
                       <p className='login-welcome-p'>
                        Select an account type to get started
                        </p>
                    </motion.div>
                    <div className="" style={{ textAlign: 'center', borderRadius: '8px' }}>
                      <div className="list-wrapper">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1, transition: { delay: 0.2 } }}
                        >
                          <div className="signup-btn-container">
                            <Link href="/auth/fan-register" className="benefits-signup-btn-fan">
                                <MusicNoteIcon style={{ height: '4rem', color: '#FFF', padding:'1rem' }} />
                                <div style={{ display: 'flex-col', textAlign:'left', padding:'0.5rem 1rem'}}>
                                <h1>Fan</h1>
                                {' '}
                                <p>I want to support music artists</p>
                                {' '}
                                </div>
                            </Link>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1, transition: { delay: 0.3 } }}
                        >
                          <div className="signup-btn-container">
                          <Link href="/auth/artist-register" className="benefits-signup-btn-artist">
                              <LightningBoltIcon style={{ height: '4rem', color: '#000', padding:'1rem' }} />
                              <div style={{ display: 'flex-col', textAlign:'left', padding:'0.5rem 1rem'}}>
                              <h1>Artist</h1>
                              {' '}
                              <p>I want to connect with my fans</p>
                              {' '}
                              </div>
                          </Link>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1, transition: { delay: 0.4 } }}
                        >
                          <p className="reg-text-bottom" style={{ paddingTop: '0rem' }}>
                            <Link href="/" style={{ color: '#BBE900' }}>
                              Already have an account? <span style={{color: '#BBE900'}}>Log in</span>
                            </Link>
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={0} sm={0} md={12} lg={12} className="" style={{padding: 0}}>
                <div className='temp-div'>
                  <div className="temp-bg" style={{ backgroundImage: "/static/artistsnormal.png" }} />
                </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui }
});

const mapDispatch = { loginSuccess, updateCurrentUser };

export default connect(mapStatesToProps, mapDispatch)(Dashboard);
