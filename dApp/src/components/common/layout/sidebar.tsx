/* eslint-disable @typescript-eslint/no-unused-vars */
import { PureComponent } from 'react';
import {
  Layout, Badge, Drawer, Divider, Avatar, Image, Modal
} from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link';
import {
  IUser, StreamSettings, IUIConfig, ISettings
} from 'src/interfaces';
import { logout } from '@redux/auth/actions';
import {
  UserOutlined,
  VideoCameraOutlined, FireOutlined, FireFilled, PlusCircleOutlined,
  DollarOutlined, HomeFilled,LogoutOutlined, TeamOutlined, WalletFilled,
  SettingOutlined, InfoCircleOutlined, TagsOutlined
} from '@ant-design/icons';
import { BiWalletAlt } from 'react-icons/bi';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { LiaMoneyBillWaveSolid } from 'react-icons/lia';
import {AiOutlineHome} from 'react-icons/ai'
import  LogInModal  from 'src/components/log-in/log-in-modal';
import SignUpModal from '@components/sign-up/sign-up-modal';
import EmailSignUpModal from '@components/sign-up/email-sign-up-modal';
import {
  HomeIcon, PlusIcon, MessageIcon, UserIcon, LiveIcon
} from 'src/icons';
import Router, { withRouter, Router as RouterEvent } from 'next/router';
import {
  messageService, authService
} from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { addPrivateRequest, accessPrivateRequest } from '@redux/streaming/actions';
import { updateUIValue } from 'src/redux/ui/actions';
import { updateBalance } from '@redux/user/actions';
import { SubscribePerformerModal } from 'src/components/subscription/subscribe-performer-modal';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import CopyReferralCode from 'src/components/common/referralCode';
import HouseFill from '/static/house_fill.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquarePlus, faCompass, faComment, faCirclePlay, faBookmark, faNewspaper } from '@fortawesome/free-regular-svg-icons'
import { faMagnifyingGlass, faBagShopping } from '@fortawesome/free-solid-svg-icons'

import styles from './sidebar.module.scss';

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

class Sidebar extends PureComponent<IProps> {
  state = {
    totalNotReadMessage: 0,
    openProfile: false,
    balanceICP: 0,
    isNotMobile: false,
    isTablet: false,
    openLogInModal: false,
    openSignUpModal: false,
    openEmailSignUpModal: false
  };

  componentDidMount() {

    RouterEvent.events.on('routeChangeStart', this.handleChangeRoute);
    const { user, router } = this.props;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentPathCleaned = currentPath.replace(/^\/+|\/+$/g, '');
    if (currentPathCleaned === 'login') {
      this.setState({ openLogInModal: true });
    }
    if (currentPathCleaned === 'register') {
      this.setState({ openSignUpModal: true });
    }

    if (user._id) {
      this.handleCountNotificationMessage();
    }

    this.setState({ isNotMobile: window.innerWidth > 450 });
    this.setState({ isTablet: window.innerWidth < 1001 });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  updateMedia = () => {
    // @ts-ignore
    this.setState({ isNotMobile: window.innerWidth > 450 });
    this.setState({ isTablet: window.innerWidth < 1001 });
  };

  componentDidUpdate(prevProps: any) {
    const { user } = this.props;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentPathCleaned = currentPath.replace(/^\/+|\/+$/g, '');

    if (user._id && prevProps.user._id !== user._id) {
      this.handleCountNotificationMessage();
    }

    // This method will activate login popup once per day if the user is not logged in
    if (currentPathCleaned !== 'login' && currentPathCleaned !== 'register' && typeof window !== 'undefined') {
      const loginPopupToday = localStorage.getItem('loginPopupToday');
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (user && !user._id && (loginPopupToday === '' || new Date(loginPopupToday) < currentDate)) {
        localStorage.setItem('loginPopupToday', currentDate.toISOString());
        setTimeout(() => {
          this.setState({ openLogInModal: true });
        }, 5000);
      }
    }
  }

  componentWillUnmount() {
    RouterEvent.events.off('routeChangeStart', this.handleChangeRoute);
    const token = authService.getToken() || '';
    const socket = this.context;
    // @ts-ignore
    token && socket && socket.emit('auth/logout', { token });
  }

  handleChangeRoute = () => {
    this.setState({
      openProfile: false
    });
  }

  handleMessage = async (event) => {
    event && this.setState({ totalNotReadMessage: event.total });
  };

  handleSubscribe = (username) => {
    Router.push(
      { pathname: `/streaming/details?id=${username}` },
      `/streaming/details?id=${username}`
    );
  };

  async handleCountNotificationMessage() {
    const data = await (await messageService.countTotalNotRead()).data;
    if (data) {
      this.setState({ totalNotReadMessage: data.total });
    }
  }

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

  handleOpenSignUp = (isOpen: boolean, loggedIn: boolean) =>{
    loggedIn ? this.setState({openLogInModal: isOpen, openSignUpModal: false}) : this.setState({openLogInModal: isOpen, openSignUpModal: true})
  }

  handleOpenModal = (isOpen: boolean, modal: string) =>{
    if(modal === 'email'){
      this.setState({openSignUpModal: isOpen, openLogInModal: isOpen, openEmailSignUpModal: true})
    }else if(modal === 'exit'){
      this.setState({openSignUpModal: isOpen, openLogInModal: isOpen, openEmailSignUpModal: isOpen})
    }else{
      this.setState({openSignUpModal: isOpen, openEmailSignUpModal: isOpen, openLogInModal: true})
    }
  }

  render() {
    const {
      user, router, ui, settings
    } = this.props;
    const {
      totalNotReadMessage, openProfile, isNotMobile, isTablet, openLogInModal, openSignUpModal, openEmailSignUpModal
    } = this.state;
    const referralCode = user?.userReferral;

    return (
      (
        <div className={styles.sidebarModule}>
          <div className={!isNotMobile ? 'main-header mobile-navbar' : 'main-header'}>
            <Event
              event="nofify_read_messages_in_conversation"
              handler={this.handleMessage.bind(this)}
            />
            <Event
              event="update_balance"
              handler={this.handleUpdateBalance.bind(this)}
            />
            <Event
              event="payment_status_callback"
              handler={this.handlePaymentStatusCallback.bind(this)}
            />
            <div className="sidebar-container main-container">

              <Layout.Header className="header" id="layoutHeader">
                <a href="https://trax.so/">
                  <div className="trax-logo-wrapper-alternate">
                    <img src={isTablet ? "/static/LogoAlternateCropped.png" : "/static/LogoAlternate.png"} width={isTablet ? "30px" : "100px"} alt="Loading..." />
                  </div>
                </a>
                {!isTablet && (
                  <div className='beta-tag-wrapper'>
                    <span>v2.7</span>
                  </div>
                )}

                <div className="nav-bar">
                  <ul className={user._id ? 'nav-icons' : 'nav-icons custom'}>
                    <li className={router.pathname === '/home' ? 'active' : ''}>
                      <Link href="/home">
                      <FontAwesomeIcon icon={faNewspaper} className={router.pathname === '/home' ? 'active-icon' : ''}/>
                            {/* <AiOutlineHome style={{fontSize: '24px', position: 'relative', top: '4px', marginTop: '-4px', left: '-2px'}} /> */}
                           {!isTablet && (
                            <span className={router.pathname === '/home' ? 'page-name-active' : 'page-name'}>Feed</span>
                           )}
                      </Link>
                    </li>
                    <li className={router.pathname === '/' ? 'active' : ''}>
                      <Link href="/">
                        <FontAwesomeIcon icon={faCompass} className={router.pathname === '/' ? 'active-icon' : ''}/>
                        {!isTablet && (
                        <span className={router.pathname === '/' ? 'page-name-active' : 'page-name'} style={{marginLeft: 14}}>Explore</span>
                        )}
                      </Link>
                    </li>
                    <li key="artist" className={router.pathname === '/artist' ? 'active' : ''}>
                      <Link href="/artist">
                        <>
                        <FontAwesomeIcon className={router.pathname === '/artist' ? 'active-icon' : ''} style={{marginLeft: 2}} icon={faMagnifyingGlass} />
                        {!isTablet && (
                        <span className={router.pathname === '/artist' ? 'page-name-active' : 'page-name'} style={{marginLeft: 13}}>Search</span>
                        )}
                        </>
                      </Link>
                    </li>
                    {user._id && (
                      <li key="messenger" className={router.pathname === '/messages' ? 'active' : ''}>
                        <Link href="/messages">
                          <FontAwesomeIcon icon={faComment} className={router.pathname === '/messages' ? 'active-icon' : ''} style={{marginLeft: 3}}/>
                          <Badge
                            className="cart-total"
                            count={totalNotReadMessage}
                            showZero
                          />
                          {!isTablet && (
                          <span className={router.pathname === '/messages' ? 'page-name-active' : 'page-name'} style={{marginLeft: 13}}>Messages</span>
                          )}
                        </Link>
                      </li>
                      )}

                      {user._id && !user.isPerformer && (
                        <li key="wallet_user" className={router.pathname === '/user/my-payments' ? 'active' : ''}>
                          <Link href="/user/my-payments" style={{display: 'flex'}}>
                            <>
                            <BiWalletAlt style={{fontSize: '18.5px', position: 'relative', top: '3px', marginTop: '-4px', left: '1.5px'}} className={router.pathname === '/user/my-payments' ? 'active-icon' : ''} />
                            {!isTablet && (
                            <span style={{marginLeft: '14px'}} className={router.pathname === '/user/my-payments' ? 'page-name-active' : 'page-name'} >Wallet</span>
                            )}
                            </>
                          </Link>
                        </li>
                      )}
                    {!user._id && (
                      <>
                        <li key="login" className='logged-out-link-wrapper' onClick={()=> this.setState({openLogInModal: true})}>
                          <div className='logged-out-link'>
                            Sign in to <span className='logged-out-trax'>TRAX</span>
                          </div>
                        </li>
                      </>
                    )}

                    {user._id && !user.isPerformer && (
                      <li className={router.pathname === '/user/artist-sign-up' ? 'active' : ''}>
                        <Link href="/user/artist-sign-up">
                        <>
                          <FontAwesomeIcon icon={faSquarePlus} className={router.pathname === '/user/artist-sign-up' ? 'active-icon' : ''} style={{marginLeft: 4}} />
                          {!isTablet && (
                          <span className={router.pathname === '/user/artist-sign-up' ? 'page-name-active' : 'page-name'} style={{marginLeft: 16}}>Create</span>
                          )}
                        </>
                        </Link>
                      </li>
                    )}
                    {user._id && !user.isPerformer && (
                    <>
                      <li key="library" className={router.pathname === '/user/bookmarks' ? 'active' : ''}>
                        <Link href="/user/bookmarks" as="/user/bookmarks">
                            <>
                            <FontAwesomeIcon icon={faBookmark} className={router.pathname === '/user/bookmarks' ? 'active-icon' : ''} style={{marginLeft: 5}}/>
                            {' '}
                            {!isTablet && (
                            <span className={router.pathname === '/user/bookmarks' ? 'page-name-active' : 'page-name'} style={{marginLeft: 15}}>Saved</span>
                            )}
                          </>
                        </Link>
                      </li>

                      <li key="purchased" className={router.pathname === '/user/purchased' ? 'active' : ''}>
                        <Link href="/user/purchased" as="/user/purchased">
                            <>

                            <FontAwesomeIcon icon={faBagShopping} className={router.pathname === '/user/purchased' ? 'active-icon' : ''} style={{marginLeft: 5}}/>
                            {' '}
                            {!isTablet && (
                            <span className={router.pathname === '/user/purchased' ? 'page-name-active' : 'page-name'} style={{marginLeft: 12}}>Purchased</span>
                            )}
                          </>
                        </Link>
                      </li>

                    {user._id && !user.isPerformer &&(
                    <li key="avatar" aria-hidden className={router.pathname === '/user/account' ? 'active' : ''}>
                      <Link href="/user/account" as="/user/account">
                      {user?.avatar ? <Avatar style={{marginLeft: '2px', minWidth: '21px', minHeight: '21px', height: '21px', width: '21px'}} src={user?.avatar || '/static/no-avatar.png'} /> : <UserIcon />}
                      {!isTablet && (
                          <span style={{marginLeft: '14px'}} className={router.pathname === '/user/account' ? 'page-name-active' : 'page-name'}>{user.name.length > 12 ? `${user.name.substring(0, 12)}...` : user.name }</span>
                      )}
                          </Link>
                    </li>
                    )}
                      <div className='sidebar-subtitle'>
                      </div>

                      {/* <li key="airdrop">
                        <Link href="https://zealy.io/c/traxbeta/questboard" target="_blank" >
                          <>
                            <TbParachute style={{fontSize: '16px', position: 'relative', top: '4px', marginTop: '-4px'}}/>
                            <span className="page-name" style={{position: 'relative', top: '2px', marginLeft: '12px'}}>Airdrop</span>
                            <span className="required-badge" style={{position: 'relative', top: '1px', marginLeft: '0.3rem', fontSize: '9px'}}>NEW</span>
                          </>
                        </Link>
                      </li> */}


                      {/* <li key="learn-more">
                      <Link href="https://wiki.trax.so" target="_blank">
                        <>
                          <InfoCircleOutlined />
                          <span className="page-name" style={{marginLeft: '14px'}}>Learn more</span>
                        </>
                      </Link>
                      </li> */}
                      {/* <li key="settings" className={router.pathname === '/user/account' ? 'active' : ''}>
                      <Link href="/user/account" as="/user/account">
                        <>
                          <SettingOutlined className={router.pathname === '/user/account' ? 'active-icon' : ''} />
                          {' '}
                          <span className={router.pathname === '/user/account' ? 'page-name-active' : 'page-name'}>Settings</span>
                        </>
                      </Link>
                      </li> */}
                      {/* <Divider />
                      <CopyReferralCode referralCode={referralCode} />
                      <Divider /> */}
                      <li key="signOut" className='sign-out-btn-wrapper'>
                        <div className="menu-item sign-out-btn" aria-hidden onClick={() => this.beforeLogout()}>
                          <LogoutOutlined style={{fontSize: '17px'}}/>
                          {!isTablet && (
                          <span className="page-name">Sign out</span>
                          )}
                        </div>
                      </li>
                      <Divider />
                    </>
                    )}
                    { user._id &&  user.isPerformer && (
                    <>
                      <li className={router.pathname === '/artist/my-post/create' ? 'active' : ''}>
                        <Link href="/artist/my-post/create">
                        <>

                          <FontAwesomeIcon icon={faSquarePlus} className={router.pathname === '/artist/my-post/create' ? 'active-icon' : ''} style={{marginLeft: 4}}/>
                          {!isTablet && (
                          <span className={router.pathname === '/artist/my-post/create' ? 'page-name-active' : 'page-name'} style={{marginLeft: 16}}>Create</span>
                          )}
                        </>
                        </Link>
                      </li>
                      <li key="content" className={router.pathname === '/artist/my-content' ? 'active' : ''}>
                      <Link href="/artist/my-content" as="/artist/my-content">
                        <>

                          <FontAwesomeIcon icon={faCirclePlay} className={router.pathname === '/artist/my-content' ? 'active-icon' : ''} style={{marginLeft: 3}}/>
                          {!isTablet && (
                          <span className={router.pathname === '/artist/my-content' ? 'page-name-active' : 'page-name'} style={{marginLeft: 15.5}}>Content</span>
                          )}
                        </>
                      </Link>
                      </li>
                      <li key="earnings" className={router.pathname === '/artist/earnings-page' ? 'active' : ''}>
                      <Link href="/artist/earnings-page" as="/artist/earnings-page" style={{display: 'flex'}}>
                        <>
                          {/* <DollarOutlined  /> */}
                          {/* <FontAwesomeIcon icon={faMoneyBillWave} /> */}
                          <RiMoneyDollarCircleLine className={router.pathname === '/artist/earnings-page' ? 'active-icon' : ''} style={{fontSize: '20px', position: 'relative', top: '3px', marginTop: '-4px', left: '2px'}}/>
                          {!isTablet && (
                          <span style={{marginLeft: '15px'}} className={router.pathname === '/artist/earnings-page' ? 'page-name-active' : 'page-name'}>Earnings</span>
                          )}
                        </>
                      </Link>
                      </li>
                      <li key="profile" className={router.pathname === '/artist/profile' ? 'active' : ''}>
                      <Link
                        href={`/artist/profile?id=${user?.username || user?._id}`}
                        as={`/artist/profile?id=${user?.username || user?._id}`}
                      >
                        <>
                        {user?.avatar ? <Avatar style={{marginLeft: '2px', minWidth: '21px', minHeight: '21px', height: '21px', width: '21px'}} src={user?.avatar || '/static/no-avatar.png'} /> : <UserIcon />}
                        {!isTablet && (
                          <span style={{marginLeft: '14px'}} className={router.pathname === '/artist/profile' ? 'page-name-active' : 'page-name'}>{user.name.length > 12 ? `${user.name.substring(0, 12)}...` : user.name }</span>
                        )}
                        </>
                      </Link>
                      </li>
                      <div className='sidebar-subtitle'>
                      </div>
                      {/* <li key="setting" className={router.pathname === '/artist/account' ? 'active' : ''}>
                      <Link href="/artist/account" as="/artist/account">
                        <>
                          <SettingOutlined className={router.pathname === '/artist/account' ? 'active-icon' : ''} />
                          {' '}
                          <span className={router.pathname === '/artist/account' ? 'page-name-active' : 'page-name'}>Settings</span>
                        </>
                      </Link>
                      </li> */}
                      {/* <li key="airdrop">
                        <Link href="https://zealy.io/c/traxbeta/questboard" target="_blank" >
                          <>
                            <TbParachute style={{fontSize: '16px', position: 'relative', top: '4px', marginTop: '-4px'}}/>
                            <span className="page-name" style={{position: 'relative', top: '2px', marginLeft: '12px'}}>Airdrop</span>
                            <span className="required-badge" style={{position: 'relative', top: '1px', marginLeft: '0.3rem', fontSize: '9px'}}>NEW</span>
                          </>
                        </Link>
                      </li> */}
                      {/* <li key="learn-more">
                      <Link href="https://wiki.trax.so" target="_blank">
                        <>
                          <InfoCircleOutlined />
                          <span className="page-name" style={{marginLeft: '14px'}}>Learn more</span>
                        </>
                      </Link>
                      </li> */}


                      {/* <Divider />

                      <CopyReferralCode referralCode={referralCode} />

                      <Divider /> */}

                      <li key="signOut" className='sign-out-btn-wrapper'>
                        <div className="menu-item sign-out-btn" aria-hidden onClick={() => this.beforeLogout()}>
                          <LogoutOutlined style={{fontSize: '17px'}}/>
                          {!isTablet && (
                          <span className="page-name ">Sign out</span>
                          )}
                        </div>
                      </li>
                      <Divider />
                    </>
                    )}
                  </ul>
                </div>
              </Layout.Header>
              <Drawer
                style={{ backdropFilter: 'blur(12px)' }}
                title={(
                  <>
                    <div className="profile-user">
                      <img className="avatar" src={user?.avatar || '/static/no-avatar.png'} alt="avatar" />
                      <span className="profile-name">
                        <span>
                          {user?.name || 'N/A'}
                          {' '}
                          {user?.verifiedAccount ? <BadgeCheckIcon className="sidebar-v-badge" /> : ''}
                      &nbsp;

                          {user?.earlyBird ? <Image preview={false} className="early-bird-icon" src="/static/traxXLogoGreen.svg" /> : ''}
                          {' '}
                        </span>

                      </span>
                    </div>
                    <div className="sub-info">
                      <a aria-hidden className="user-balance" onClick={() => (!user?.isPerformer ? Router.push('/user/my-payments') : Router.push('/artist/earnings-page'))}>
                        <div className="wallet-balance-wrapper">
                          <p>Wallet</p>
                          <span>
                            {' '}
                            $
                            {(user?.balance || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="wallet-icon-wrapper">
                          <WalletFilled className="wallet-icon" />
                        </div>
                      </a>
                    </div>
                  </>
            )}
                closable
                onClose={() => this.setState({ openProfile: false })}
                open={openProfile}
                key="profile-drawer"
                className={ui.theme === 'light' ? 'profile-drawer mobile-navbar' : 'profile-drawer dark mobile-navbar'}
                width={300}
              >
              </Drawer>
              <SubscribePerformerModal onSubscribed={this.handleSubscribe} />
              <div className='log-in-modal-wrapper'>
                <Modal
                  key="purchase_post"
                  className="auth-modal"
                  title={null}
                  open={openLogInModal}
                  footer={null}
                  // width={600}
                  style={{minWidth: '100vw'}}
                  destroyOnClose
                  onCancel={() => this.setState({ openLogInModal: false })}
                >
                  <LogInModal onFinish={this.handleOpenSignUp.bind(this)}/>
                </Modal>
              </div>

              <div className='sign-in-modal-wrapper'>
                <Modal
                  key="purchase_post"
                  className="auth-modal"
                  title={null}
                  open={openSignUpModal}
                  footer={null}
                  // width={600}
                  style={{minWidth: '100vw'}}
                  destroyOnClose
                  onCancel={() => this.setState({ openSignUpModal: false })}
                >
                  <SignUpModal onFinish={this.handleOpenModal.bind(this)} />
                </Modal>
              </div>
              {/* <div className='email-sign-up-modal-wrapper'>
                <Modal
                  key="purchase_post"
                  className="email-sign-up-modal"
                  title={null}
                  open={openEmailSignUpModal}
                  footer={null}
                  // width={600}
                  style={{minWidth: '100vw'}}
                  destroyOnClose
                  onCancel={() => this.setState({ openEmailSignUpModal: false })}
                >
                  <EmailSignUpModal onClose={this.handleOpenModal.bind(this)}/>
                </Modal>
              </div> */}
            </div>
          </div>
        </div>
      )
    );
  }
}

Sidebar.contextType = SocketContext;

const mapState = (state: any) => ({
  user: { ...state.user.current },
  ui: { ...state.ui },
  config: { ...state.settings },
  ...state.streaming
});
const mapDispatch = {
  logout, addPrivateRequest, accessPrivateRequest, updateUIValue, updateBalance
};
export default withRouter(connect(mapState, mapDispatch)(Sidebar)) as any;
