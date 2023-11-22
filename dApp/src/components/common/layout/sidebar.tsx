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
import { faSquarePlus, faCompass, faComment, faCirclePlay, faBookmark } from '@fortawesome/free-regular-svg-icons'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

import type { _SERVICE as _SERVICE_PPV } from '../../../smart-contracts/declarations/ppv/ppv.did';
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
    const { user } = this.props;
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
    if (user._id && prevProps.user._id !== user._id) {
      this.handleCountNotificationMessage();
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
                    <img src={isTablet ? "/static/LogoAlternateCropped.png" : "/static/LogoAlternate.png"} width={isTablet ? "30px" : "85px"} alt="Loading..." />
                  </div>
                </a>
                <div className="nav-bar">
                  <ul className={user._id ? 'nav-icons' : 'nav-icons custom'}>
                    <li className={router.pathname === '/home' ? 'active' : ''}>
                      <Link href="/home">
                            <AiOutlineHome style={{fontSize: '24px', position: 'relative', top: '4px', marginTop: '-4px', left: '-2px'}} className={router.pathname === '/home' ? 'active-icon' : ''}/>
                           {!isTablet && (
                            <span className={router.pathname === '/home' ? 'page-name-active' : 'page-name'}>Home</span>
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
                          <Link href="/user/my-payments">
                            <>
                            <BiWalletAlt style={{fontSize: '24px', position: 'relative', top: '4px', marginTop: '-4px', left: '1.5px'}} className={router.pathname === '/user/my-payments' ? 'active-icon' : ''} />
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
                            Log In
                          </div>
                        </li>
                      </>
                    )}

                    {user._id && !user.isPerformer && (
                      <li className={router.pathname === '/user/artist-sign-up' ? 'active' : ''}>
                        <Link href="/user/artist-sign-up">
                        <>
                          <FontAwesomeIcon icon={faSquarePlus} className={router.pathname === '/user/artist-sign-up' ? 'active-icon' : ''}style={{marginLeft: 4}} />
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
                    {user._id && !user.isPerformer &&(
                    <li key="avatar" aria-hidden className={router.pathname === '/user/account' ? 'active' : ''}>
                      <Link href="/user/account" as="/user/account">
                      {user?.avatar ? <Avatar style={{marginLeft: '2px', minWidth: '25px', minHeight: '25px', height: '25px', width: '25px'}} src={user?.avatar || '/static/no-avatar.png'} /> : <UserIcon />}
                      {!isTablet && (
                          <span style={{marginLeft: '14px'}} className={router.pathname === '/user/account' ? 'page-name-active' : 'page-name'}>{user.name.length > 12 ? `${user.name.substring(0, 12)}...` : user.name }</span>
                      )}
                          </Link>
                    </li>
                    )}
                      <div className='sidebar-subtitle'>
                      </div>
                      <li key="signOut">
                        <div className="menu-item sign-out-btn" aria-hidden onClick={() => this.beforeLogout()}>
                          <LogoutOutlined />
                          {!isTablet && (
                          <span className="page-name">Sign Out</span>
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
                          <FontAwesomeIcon icon={faSquarePlus} className={router.pathname === '/artist/my-post/create' ? 'active-icon' : ''}/> 
                          {!isTablet && (
                          <span className={router.pathname === '/artist/my-post/create' ? 'page-name-active' : 'page-name'}>Create</span>
                          )}
                        </>
                        </Link>
                      </li>
                      <li key="content" className={router.pathname === '/artist/my-content' ? 'active' : ''}>
                      <Link href="/artist/my-content" as="/artist/my-content">
                        <>
                          <FontAwesomeIcon icon={faCirclePlay} className={router.pathname === '/artist/my-content' ? 'active-icon' : ''}/> 
                          {!isTablet && (
                          <span className={router.pathname === '/artist/my-content' ? 'page-name-active' : 'page-name'}>Content</span>
                          )}
                        </>
                      </Link>
                      </li>
                      <li key="earnings" className={router.pathname === '/artist/earnings-page' ? 'active' : ''}>
                      <Link href="/artist/earnings-page" as="/artist/earnings-page">
                        <>
                          <RiMoneyDollarCircleLine className={router.pathname === '/artist/earnings-page' ? 'active-icon' : ''} style={{fontSize: '20px', position: 'relative', top: '4px', marginTop: '-4px', left: '-2px'}}/> 
                          {!isTablet && (
                          <span style={{marginLeft: '6px'}} className={router.pathname === '/artist/earnings-page' ? 'page-name-active' : 'page-name'}>Earnings</span>
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
                        {user?.avatar ? <Avatar style={{marginLeft: '2px', minWidth: '25px', minHeight: '25px', height: '25px', width: '25px'}} src={user?.avatar || '/static/no-avatar.png'} /> : <UserIcon />}
                        {!isTablet && (
                          <span style={{marginLeft: '14px'}} className={router.pathname === '/artist/profile' ? 'page-name-active' : 'page-name'}>{user.name.length > 12 ? `${user.name.substring(0, 12)}...` : user.name }</span>
                        )}
                        </>
                      </Link>
                      </li>
                      <div className='sidebar-subtitle'>
                      </div>
                      <li key="signOut" className={router.pathname === '/user/account' ? 'active' : ''}>
                        <div className="menu-item sign-out-btn" aria-hidden onClick={() => this.beforeLogout()}>
                          <LogoutOutlined />
                          {!isTablet && (
                          <span className="page-name ">Sign Out</span>
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
                  className="log-in-modal"
                  title={null}
                  open={openLogInModal}
                  footer={null}
                  width={600}
                  destroyOnClose
                  onCancel={() => this.setState({ openLogInModal: false })}
                >
                  <LogInModal onFinish={this.handleOpenSignUp.bind(this)}/>
                </Modal>
              </div>

              <div className='sign-in-modal-wrapper'>
                <Modal
                  key="purchase_post"
                  className="sign-in-modal"
                  title={null}
                  open={openSignUpModal}
                  footer={null}
                  width={600}
                  destroyOnClose
                  onCancel={() => this.setState({ openSignUpModal: false })}
                >
                  <SignUpModal onFinish={this.handleOpenModal.bind(this)}/>
                </Modal>
              </div>
              <div className='email-sign-up-modal-wrapper'>
                <Modal
                  key="purchase_post"
                  className="email-sign-up-modal"
                  title={null}
                  open={openEmailSignUpModal}
                  footer={null}
                  width={600}
                  destroyOnClose
                  onCancel={() => this.setState({ openEmailSignUpModal: false })}
                >
                  <EmailSignUpModal onClose={this.handleOpenModal.bind(this)}/>
                </Modal>
              </div>
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
