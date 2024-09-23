/* eslint-disable @typescript-eslint/no-unused-vars */
import { PureComponent } from 'react';

import {
  Layout, Drawer, Divider, Modal, Avatar,
} from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link';
import {
  IUser, StreamSettings, IUIConfig, ISettings
} from 'src/interfaces';
import { logout } from '@redux/auth/actions';
import {
  LogoutOutlined, SettingOutlined,
} from '@ant-design/icons';
import Router, { withRouter, Router as RouterEvent } from 'next/router';
import {
  authService
} from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { addPrivateRequest, accessPrivateRequest } from '@redux/streaming/actions';
import { updateUIValue } from 'src/redux/ui/actions';
import { updateBalance } from '@redux/user/actions';
import { SubscribePerformerModal } from 'src/components/subscription/subscribe-performer-modal';
import CopyReferralCode from 'src/components/common/referralCode';
import styles from './header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import {
  CheckBadgeIcon,
  HomeIcon as HomeIconActive, VideoCameraIcon as VideoCameraIconActive, UserIcon as UserIconActive,
  WalletIcon as WalletIconActive, BookmarkIcon as BookmarkIconActive,
} from '@heroicons/react/24/solid';
import { HomeIcon, VideoCameraIcon, UserIcon, WalletIcon, BookmarkIcon, UserCircleIcon, } from '@heroicons/react/24/outline';
import LogInModal from 'src/components/log-in/log-in-modal';
import SignUpModal from '@components/sign-up/sign-up-modal';
import Forgot from 'pages/auth/forgot-password';
import { Sheet } from 'react-modal-sheet';
import AnimatedSplashScreenWithSignIn from './animated-splash-screen-with-login';
import AnimatedSplashScreen from './animated-splash-screen-with-login';
import logo from '../../../../public/static/trax_primary_logotype.svg'
import Image from "next/image"

interface IProps {
  updateBalance: Function;
  updateUIValue: Function;
  user: IUser;
  logout: Function;
  router: any;
  ui: IUIConfig;
  privateRequests: any;
  addPrivateRequest: Function;
  accessPrivateRequest: Function;
  settings: StreamSettings;
  config: ISettings;
}

class Header extends PureComponent<IProps> {
  state = {
    totalNotReadMessage: 0,
    openProfile: false,
    balanceICP: 0,
    isMobile: false,
    openLogInSheet: false,
    openSignUpSheet: false,
    openForgotSheet: false,
  };

  componentDidMount() {
    RouterEvent.events.on('routeChangeStart', this.handleChangeRoute);

    this.setState({ isMobile: window.innerWidth < 640 });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  updateMedia = () => {
    // @ts-ignore
    this.setState({ isMobile: window.innerWidth < 640 });
  };

  componentWillUnmount() {
    RouterEvent.events.off('routeChangeStart', this.handleChangeRoute);
    const token = authService.getToken() || '';
    const socket = this.context;
    // @ts-ignore
    //token && socket && socket.emit('auth/logout', { token });
  }

  handleChangeRoute = () => {
    this.setState({
      openProfile: false
    });
  }

  handleSubscribe = (username) => {
    Router.push(
      { pathname: `/streaming/details?id=${username}` },
      `/streaming/details?id=${username}`
    );
  };

  async handleUpdateBalance(event) {
    const { user, updateBalance: handleUpdateBalance } = this.props;
    if (user.isPerformer) {
      handleUpdateBalance({ token: event.token });
    }
  }

  async handlePaymentStatusCallback({ redirectUrl }) {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }

  async beforeLogout() {
    const { logout: handleLogout } = this.props;
    const token = authService.getToken() || '';
    const socket = this.context;
    // @ts-ignore
    token && socket && (await socket.emit('auth/logout', {
      token
    }));
    handleLogout();
  }

  handleOpenSignUp = (isOpen: boolean, loggedIn: boolean) => {
    //console.log('result from handleOpenSignUp in header', isOpen, loggedIn );
    loggedIn ? this.setState({ openLogInSheet: isOpen, openSignUpSheet: false }) : this.setState({ openLogInSheet: isOpen, openSignUpSheet: true })
  }

  handleOpenModal = (isOpen: boolean, modal: string) => {
    if (modal === 'email') {
      this.setState({ openSignUpSheet: isOpen, openLogInSheet: isOpen, })
    } else {
      this.setState({ openSignUpSheet: isOpen, openLogInSheet: true })
    }
  }

  handleOpenForgotSheet = () => {
    this.setState({ openForgotSheet: true, openLogInSheet: false });
  };

  handleCloseForgotSheet = () => {
    this.setState({ openForgotSheet: false });
  };

  handleForgotLinkClick = () => {
    const { isMobile } = this.state;
    if (isMobile) {
      this.handleOpenForgotSheet();
    }
  };

  render() {
    const {
      user, router, ui,
    } = this.props;
    const {
      openProfile, isMobile, openLogInSheet, openSignUpSheet, openForgotSheet
    } = this.state;
    const referralCode = user?.userReferral;

    //console.log("user object in header:", user);


    return (

      (
        <div className={styles.headerModule}>
          <div className={isMobile ? 'main-header mobile-navbar' : 'main-header'} style={{ backdropFilter: 'blur(10px)' }}>
            <Event
              event="update_balance"
              handler={this.handleUpdateBalance.bind(this)}
            />
            <Event
              event="payment_status_callback"
              handler={this.handlePaymentStatusCallback.bind(this)}
            />
            {!user._id && isMobile && (
              <div className='sign-in-prompt-container'>

                <div className='sign-in-logo'>
                <Image alt="" src={logo} className="h-12 mb-12 mx-auto w-auto" />
                <AnimatedSplashScreen/>
                </div>
                <div className='sign-in-prompt-header'>
                  <span>New Music Starts Here</span>
                </div>
                <div className='sign-in-btn-wrapper'>
                  <div className='sign-up-btn' onClick={() => this.setState({ openSignUpSheet: true })}>
                    <span>Create an account</span>
                  </div>
                </div>
                <div className='sign-in-btn-wrapper'>
                  <div className='sign-in-btn' onClick={() => this.setState({ openLogInSheet: true })}>
                    <span>Sign in</span>
                  </div>
                  </div>

              </div>
            )}
            <div className="feed-container main-container">
              {user._id && (
                <Layout.Header className="header" id="layoutHeader">
                  <div className="nav-bar">
                    <ul className='nav-icons' style={{ justifyContent: user._id ? 'space-between' : 'space-around' }}>
                      <li className={router.pathname === '/' ? 'active' : ''}>
                        <Link href="/" className='nav-link'>
                          <HomeIconActive className={router.pathname === '/' ? 'active-icon size-6' : 'display-none'} />
                          <HomeIcon className={router.pathname === '/' ? 'display-none' : 'size-6'} />
                          <span className={router.pathname === '/' ? 'page-name-active' : 'page-name'}>Home</span>
                        </Link>
                      </li>

                      {user._id && (user?.isPerformer && (
                        <>
                          <li className={router.pathname === '/artist/studio' ? 'active' : ''}>
                            <Link href="/artist/studio" as="/artist/studio" className='nav-link'>
                              <VideoCameraIconActive className={router.pathname === '/artist/studio' ? 'active-icon size-6' : 'display-none'} />
                              <VideoCameraIcon className={router.pathname === '/artist/studio' ? 'display-none' : 'size-6'} />
                              <span className={router.pathname === '/artist/studio' ? 'page-name-active' : 'page-name'} >Studio</span>
                            </Link>
                          </li>
                          <li key="earnings" className={router.pathname === '/artist/earnings' ? 'active' : ''}>
                            <Link href="/artist/earnings" as="/artist/earnings" className='nav-link'>
                              <WalletIconActive className={router.pathname === '/artist/earnings' ? 'active-icon size-6' : 'display-none'} />
                              <WalletIcon className={router.pathname === '/artist/earnings' ? 'display-none' : 'size-6'} />
                              <span className={router.pathname === '/artist/earnings' ? 'page-name-active' : 'page-name'}>Earnings</span>
                            </Link>
                          </li>
                          <li key="profile" className={router.pathname === '/artist/profile' ? 'active' : ''}>
                            <Link
                              href={`/${user?.username || user?._id}`}
                              as={`/${user?.username || user?._id}`}
                              className='nav-link'
                            >
                              <UserIconActive className={router.pathname === '/artist/profile' ? 'active-icon size-6' : 'display-none'} />
                              <UserIcon className={router.pathname === '/artist/profile' ? 'display-none' : 'size-6'} />
                              <span className={router.pathname === '/artist/profile' ? 'page-name-active' : 'page-name'}>You</span>
                            </Link>
                          </li>
                        </>
                      ))}

                      {user._id && !user.isPerformer && (
                        <>
                          <li key="wallet_user" className={router.pathname === '/user/wallet' ? 'active' : ''}>
                            <Link href="/user/wallet" className='nav-link'>
                              <WalletIconActive className={router.pathname === '/user/wallet' ? 'active-icon size-6' : 'display-none'} />
                              <WalletIcon className={router.pathname === '/user/wallet' ? 'display-none' : 'size-6'} />
                              <span className={router.pathname === '/user/wallet' ? 'page-name-active' : 'page-name'} >Wallet</span>
                            </Link>
                          </li>
                          <li key="library" className={router.pathname === '/user/library' ? 'active' : ''}>
                            <Link href="/user/library" as="/user/library" className='nav-link'>
                              <>
                                <BookmarkIconActive className={router.pathname === '/user/library' ? 'active-icon size-6' : 'display-none'} />
                                <BookmarkIcon className={router.pathname === '/user/library' ? 'display-none' : 'size-6'} />
                                <span className={router.pathname === '/user/library' ? 'page-name-active' : 'page-name'}>Library</span>
                              </>
                            </Link>
                          </li>
                        </>
                      )}

                      {user._id && (
                        <li key="avatar" aria-hidden onClick={() => this.setState({ openProfile: true })} className='nav-link'>
                          {user?.avatar ? <Avatar className='size-9' src={user?.avatar || '/static/no-avatar.png'} /> : <UserCircleIcon className='size-6' />}
                        </li>
                      )}
                    </ul>
                  </div>
                </Layout.Header>
              )}
              <Drawer
                style={{ backdropFilter: 'blur(12px)' }}
                title={(
                  <Link
                    href={user.isPerformer ? `/${user?.username || user?._id}` : "/user/account"}
                    as={user.isPerformer ? `/${user?.username || user?._id}` : "/user/account"}
                    legacyBehavior
                  >
                    <div className="profile-user">
                      {user.isPerformer && (

                        <Link
                          href={user.isPerformer ? `/${user?.username || user?._id}` : "/user/account"}
                          as={user.isPerformer ? `/${user?.username || user?._id}` : "/user/account"}
                          className='performer-profile-btn-wrapper'
                        >
                          <FontAwesomeIcon className='performer-profile-btn-icon' icon={faUser} />
                        </Link>
                      )}
                      <img className="avatar" src={user?.avatar || '/static/no-avatar.png'} alt="avatar" />
                      <span className="profile-name">
                        <span>
                          {user?.name || 'N/A'}
                          {' '}
                          {user?.verifiedAccount ? <CheckBadgeIcon className="sidebar-v-badge" /> : ''}
                          &nbsp;

                          {user?.earlyBird ? <Image alt="Early Bird Icon" className="early-bird-icon" src="/static/traxXLogoGreen.svg" /> : ''}
                          {' '}
                        </span>
                      </span>
                    </div>
                  </Link>
                )}
                closable
                onClose={() => this.setState({ openProfile: false })}
                open={openProfile}
                key="profile-drawer"
                className={ui.theme === 'light' ? 'profile-drawer mobile-navbar' : 'profile-drawer dark mobile-navbar'}
                width={300}
              >
                {user.isPerformer && (
                  <div className="profile-menu-item">
                    <Link href="/artist/account" as="/artist/account" legacyBehavior>
                      <div className={router.pathname === '/artist/account' ? 'menu-item active flex items-center' : 'menu-item flex items-center'}>
                        <SettingOutlined className={router.pathname === '/artist/account' ? 'active-icon ' : ''} />
                        {' '}
                        Settings
                      </div>
                    </Link>

                    {/* <Divider /> */}

                    <div aria-hidden className="menu-item flex items-center" onClick={() => this.beforeLogout()}>
                      <LogoutOutlined className='pl-1' />
                      {' '}
                      Sign Out
                    </div>

                    <Divider />

                    <CopyReferralCode referralCode={referralCode} />

                    <Divider />

                  </div>
                )}
                {!user.isPerformer && (
                  <div className="profile-menu-item">
                    <Link href="/user/account" as="/user/account" legacyBehavior>
                      <div className={router.pathname === '/user/account' ? 'menu-item active flex items-center' : 'menu-item flex items-center'}>
                        <SettingOutlined className={router.pathname === '/user/account' ? 'active-icon' : ''} />
                        {' '}
                        Settings
                      </div>
                    </Link>
                    {/* <Divider /> */}

                    <div className="menu-item flex items-center" aria-hidden onClick={() => this.beforeLogout()}>
                      <LogoutOutlined className='pl-2' />
                      {' '}
                      Sign Out
                    </div>

                    <Divider />

                    <CopyReferralCode referralCode={referralCode} />

                    <Divider />
                  </div>

                )}
              </Drawer>

              <SubscribePerformerModal onSubscribed={this.handleSubscribe} />

              <div className='log-in-modal-wrapper'>
                <Sheet
                  isOpen={openLogInSheet}
                  onClose={() => this.setState(prevState => ({ ...prevState, openLogInSheet: false }))}
                  detent='content-height'
                  className="auth-modal"
                >
                  <Sheet.Container>
                    <Sheet.Header />
                    <Sheet.Content>
                      <LogInModal
                        onFinish={this.handleOpenSignUp.bind(this)}
                        onForgotPassword={this.handleOpenForgotSheet}
                      />
                    </Sheet.Content>
                  </Sheet.Container>
                  <Sheet.Backdrop onTap={() => this.setState({ openLogInSheet: false })} />
                </Sheet>
              </div>

              <div className='sign-in-modal-wrapper'>
                <Sheet
                  isOpen={openSignUpSheet}
                  onClose={() => this.setState(prevState => ({ ...prevState, openSignUpSheet: false }))}
                  detent='content-height'
                  snapPoints={[0.9, 0.5, 100]}
                  initialSnap={0}
                  prefersReducedMotion={true}
                  className="auth-modal"
                >
                  <Sheet.Container>
                    <Sheet.Header />
                    <Sheet.Content>
                      <SignUpModal onFinish={this.handleOpenModal.bind(this)} />
                    </Sheet.Content>
                  </Sheet.Container>
                  <Sheet.Backdrop onTap={() => this.setState(prevState => ({ ...prevState, openSignUpSheet: false }))} />
                </Sheet>
              </div>

              {/* Forgot Password Sheet for Mobile */}
              {isMobile && openForgotSheet && (
                <Sheet
                  isOpen={openForgotSheet}
                  onClose={this.handleCloseForgotSheet}
                  detent="content-height"
                  className="auth-modal"
                >
                  <Sheet.Container>
                    <Sheet.Header />
                    <Sheet.Content>
                      <Forgot onClose={this.handleCloseForgotSheet} />
                    </Sheet.Content>
                  </Sheet.Container>
                  <Sheet.Backdrop onTap={this.handleCloseForgotSheet} />
                </Sheet>
              )}
            </div>
          </div>
        </div>
      )
    );
  }
}

Header.contextType = SocketContext;

const mapState = (state: any) => ({
  user: { ...state.user.current },
  ui: { ...state.ui },
  config: { ...state.settings },
  ...state.streaming
});
const mapDispatch = {
  logout, addPrivateRequest, accessPrivateRequest, updateUIValue, updateBalance
};
export default withRouter(connect(mapState, mapDispatch)(Header)) as any;
