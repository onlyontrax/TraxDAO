/* eslint-disable @typescript-eslint/no-unused-vars */
import { PureComponent } from 'react';
import {
  Layout, Badge, Drawer, Divider, Avatar, Image, Modal, Button
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
  DollarOutlined, HomeFilled,
  LogoutOutlined, TeamOutlined, WalletFilled, SettingOutlined, InfoCircleOutlined, TagsOutlined
} from '@ant-design/icons';
import { TbParachute } from 'react-icons/tb';
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
import { PiVinylRecordFill } from 'react-icons/pi';
import { IoIosVideocam } from 'react-icons/io';
import styles from './header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquarePlus, faCompass, faComment, faCirclePlay, faBookmark, faNewspaper  } from '@fortawesome/free-regular-svg-icons'
import { faBars, faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons'
import { BiWalletAlt } from 'react-icons/bi';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { LiaMoneyBillWaveSolid } from 'react-icons/lia';
import {AiOutlineHome} from 'react-icons/ai'
import  LogInModal  from 'src/components/log-in/log-in-modal';
import SignUpModal from '@components/sign-up/sign-up-modal';
import EmailSignUpModal from '@components/sign-up/email-sign-up-modal';

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

    this.setState({ isMobile: window.innerWidth < 450 });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  updateMedia = () => {
    // @ts-ignore
    this.setState({ isMobile: window.innerWidth < 450 });
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
    }else{
      this.setState({openSignUpModal: isOpen, openEmailSignUpModal: isOpen, openLogInModal: true})
    }
  }

  render() {
    const {
      user, router, ui, settings
    } = this.props;
    const {
      totalNotReadMessage, openProfile, isMobile, openLogInModal, openSignUpModal, openEmailSignUpModal
    } = this.state;
    const referralCode = user?.userReferral;

    return (
      (
        <div className={styles.headerModule}>
          <div className={isMobile ? 'main-header mobile-navbar' : 'main-header'} style={{ backdropFilter: 'blur(12px)' }}>
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
            {!user._id && isMobile &&(
              <div className='sign-in-prompt-container'>
                <div className='overlay-sign-in'/>
                <div className='sign-in-prompt-header'>
                  <span>Stay up-to-date with your favourite artists.</span>
                </div>
                <div className='sign-in-btn-wrapper'>
                  <div className='sign-in-btn' onClick={() => this.setState({ openLogInModal: true })}>
                    <span>Sign in to TRAX</span>
                  </div>
                  <div className='sign-up-btn-mobile' onClick={() => this.setState({ openSignUpModal: true })}>
                    <span>Sign up</span>
                  </div>
                </div>
              </div>
            )}
            <div>

            </div>
            <div className="feed-container main-container">

              <Layout.Header className="header" id="layoutHeader">
                <a href="https://trax.so/">
                  <div className="trax-logo-wrapper-alternate">
                    <img src="/static/LogoAlternate.png" width="120px" alt="Loading..." />
                  </div>
                </a>
                <div className="nav-bar">
                  <ul className='nav-icons' style={{justifyContent: user._id ? 'space-between' : 'space-around'}}>
                    <li className={router.pathname === '/home' ? 'active' : ''}>
                      <Link href="/home">
                      {/* <AiOutlineHome style={{fontSize: '28px', position: 'relative', top: '-8px', marginTop: '-4px', left: '1px'}} className={router.pathname === '/home' ? 'active-icon' : ''}/> */}
                      <FontAwesomeIcon style={{fontSize: '24px', position: 'relative', top: '-9px', marginBottom: '1px'}} icon={faNewspaper} className={router.pathname === '/home' ? 'active-icon' : ''}/>
                        {/* <span className={router.pathname === '/home' ? 'mobile-nav-label-active' : 'mobile-nav-label'}>Home</span> */}
                      </Link>
                    </li>

                    <li className={router.pathname === '/' ? 'active' : ''}>
                      <Link href="/">
                      <FontAwesomeIcon style={{fontSize: '24px', position: 'relative', top: '-9px', marginBottom: '1px'}} icon={faCompass} className={router.pathname === '/' ? 'active-icon' : ''}/>
                      {/* <span className={router.pathname === '/' ? 'mobile-nav-label-active' : 'mobile-nav-label'}>Explore</span> */}
                      </Link>
                    </li>

                    {user._id && (user?.isPerformer && (
                      <li className={router.pathname === '/artist/my-post/create' ? 'active' : ''}>
                        <Link href="/artist/my-post/create">
                        <FontAwesomeIcon style={{fontSize: '25px', position: 'relative', top: '-9px', marginTop: '0px', left: '-1px'}} icon={faSquarePlus} className={router.pathname === '/artist/my-post/create' ? 'active-icon' : ''}/>
                        {/* <span className={router.pathname === '/artist/my-post/create' ? 'mobile-nav-label-active' : 'mobile-nav-label'}>Create</span> */}
                        </Link>
                      </li>
                    ))}
                    {!user.isPerformer && (
                    <li key="artist" className={router.pathname === '/artist' ? 'active' : ''}>
                      <Link href="/artist">
                        <FontAwesomeIcon style={{fontSize: '24px', position: 'relative', top: '-8px', marginTop: '0px', left: '-2px'}} icon={faMagnifyingGlass} className={router.pathname === '/artist' ? 'active-icon' : ''} />
                        {/* <span className={router.pathname === '/artist' ? 'mobile-nav-label-active' : 'mobile-nav-label'}>Search</span> */}
                      </Link>
                    </li>
                    )}
                    {user._id && (
                    <li key="messenger" className={router.pathname === '/messages' ? 'active' : ''}>
                      <Link href="/messages">
                      <FontAwesomeIcon style={{fontSize: '24px', position: 'relative', top: '-7px', marginTop: '-4px', marginBottom: '5px', left: '-2px'}} icon={faComment} className={router.pathname === '/messages' ? 'active-icon' : ''}/>
                        <Badge
                          className="cart-total"
                          count={totalNotReadMessage}
                          showZero
                        />
                        {/* <span className={router.pathname === '/messages' ? 'mobile-nav-label-active' : 'mobile-nav-label'}>Messages</span> */}
                      </Link>
                    </li>
                    )}
                    {user._id && (
                    <li key="avatar" aria-hidden onClick={() => this.setState({ openProfile: true })} style={{display: 'flex', flexDirection: 'column'}}>
                      <FontAwesomeIcon style={{fontSize: '24px', position: 'relative', top: '-7px', marginTop: '-4px', marginBottom: '5px', left: '-1px', color: 'grey'}} icon={faBars} />
                      {/* {user?.avatar ? <Avatar style={{minWidth: '32px', minHeight: '32px'}} src={user?.avatar || '/static/no-avatar.png'} /> : <UserIcon />} */}
                      {/* <p className='header-username'>{user?.name}</p> */}
                      {/* <span className='mobile-nav-label'>More</span> */}
                    </li>
                    )}
                  </ul>
                </div>
              </Layout.Header>
              <Drawer
                style={{ backdropFilter: 'blur(12px)' }}
                title={(
                  <Link
                    href={user.isPerformer ? `/artist/profile?id=${user?.username || user?._id}` : "/user/account"}
                    as={user.isPerformer ? `/artist/profile?id=${user?.username || user?._id}` : "/user/account"}
                    legacyBehavior
                  >
                    <div className="profile-user">
                    {user.isPerformer && (

                          <Link
                              href={user.isPerformer ? `/artist/profile?id=${user?.username || user?._id}` : "/user/account"}
                              as={user.isPerformer ? `/artist/profile?id=${user?.username || user?._id}` : "/user/account"}
                              // legacyBehavior
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
                          {user?.verifiedAccount ? <BadgeCheckIcon className="sidebar-v-badge" /> : ''}
                      &nbsp;

                          {user?.earlyBird ? <Image preview={false} className="early-bird-icon" src="/static/traxXLogoGreen.svg" /> : ''}
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
                  <Link href="/artist/my-content" as="/artist/my-content" legacyBehavior>
                    <div className={router.pathname === '/artist/my-content' ? 'menu-item active' : 'menu-item'}>
                    <FontAwesomeIcon style={{fontSize: '20px', position: 'relative', top: '1px', marginRight: '0.7rem', paddingLeft: '0.5rem'}} icon={faCirclePlay} className={router.pathname === '/artist/my-content' ? 'active-icon' : ''}/>
                      {' '}
                      <span className={router.pathname === '/artist/my-content' ? 'page-name-active' : 'page-name'}>Content</span>
                    </div>
                  </Link>
                  <Link href="/artist/earnings-page" as="/artist/earnings-page" legacyBehavior>
                    <div className={router.pathname === '/artist/earnings-page' ? 'menu-item active' : 'menu-item'} style={{padding:' 3px 0.25rem', paddingBottom: '11px'}}>
                    <RiMoneyDollarCircleLine className={router.pathname === '/artist/earnings-page' ? 'active-icon' : ''} style={{fontSize: '25px', position: 'relative', top: '7px', left: '6px', marginRight: '1.2rem'}}/>
                      <span  className={router.pathname === '/artist/earnings-page' ? 'page-name-active' : 'page-name'}>Earnings</span>

                    </div>
                  </Link>
                  <Link href="/artist/account" as="/artist/account" legacyBehavior>
                    <div className={router.pathname === '/artist/account' ? 'menu-item active' : 'menu-item'}>
                      <SettingOutlined style={{paddingLeft: '0.6rem'}} className={router.pathname === '/artist/account' ? 'active-icon' : ''}/>
                      {' '}
                      Settings
                    </div>
                  </Link>



                  <Divider />

                  <CopyReferralCode referralCode={referralCode} />

                  <Divider />

                  <div aria-hidden className="menu-item" onClick={() => this.beforeLogout()}>
                    <LogoutOutlined style={{paddingLeft: '1rem'}}/>
                    {' '}
                    Sign Out
                  </div>
                  <Divider />
                </div>
                )}
                {!user.isPerformer && (
                <div className="profile-menu-item">
                  <Link href="/user/my-payments" as="/user/my-payments" legacyBehavior>
                    <div className={router.pathname === 'user/my-payments' ? 'menu-item active' : 'menu-item'}>
                    <BiWalletAlt style={{fontSize: '21px', position: 'relative', top: '5px', left: '7px', marginRight: '1rem'}} className={router.pathname === '/user/my-payments' ? 'active-icon' : ''} />
                      {' '}
                      Wallet
                    </div>
                  </Link>
                  <Link href="/user/bookmarks" as="/user/bookmarks" legacyBehavior>
                    <div className={router.pathname === '/user/bookmarks' ? 'menu-item active' : 'menu-item'}>
                    <FontAwesomeIcon style={{fontSize: '19px', position: 'relative', top: '1px', marginRight: '0.9rem', paddingLeft: '0.7rem'}} icon={faBookmark} className={router.pathname === '/user/bookmarks' ? 'active-icon' : ''}/>
                      {' '}
                      Saved
                    </div>
                  </Link>
                  <Link href="/user/artist-sign-up" as="/user/artist-sign-up" legacyBehavior>
                  <div className={router.pathname === '/user/artist-sign-up' ? 'menu-item active' : 'menu-item'}>
                    {/* <PlusIcon  />  */}
                    <FontAwesomeIcon style={{fontSize: '19px', position: 'relative', top: '1px', marginRight: '0.9rem', paddingLeft: '0.6rem'}} icon={faSquarePlus} className={router.pathname === '/user/artist-sign-up' ? 'active-icon' : ''}/>

                    Create
                    </div>

                  </Link>

                <Link href="/user/account" as="/user/account" legacyBehavior>
                    <div className={router.pathname === '/user/account' ? 'menu-item active' : 'menu-item'}>
                      <SettingOutlined style={{paddingLeft: '0.6rem'}} className={router.pathname === '/user/account' ? 'active-icon' : ''}/>
                      {' '}
                      Settings
                    </div>
                  </Link>
                  <Divider />
                  <CopyReferralCode referralCode={referralCode} />
                  <Divider />
                  <div className="menu-item" aria-hidden onClick={() => this.beforeLogout()}>
                    <LogoutOutlined />
                    {' '}
                    Sign Out
                  </div>

                  <Divider />

                </div>

                )}
              </Drawer>

              <SubscribePerformerModal onSubscribed={this.handleSubscribe} />

              <div className='log-in-modal-wrapper'>
                <Modal
                  key="purchase_post"
                  className="auth-modal"
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
                  className="auth-modal"
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
