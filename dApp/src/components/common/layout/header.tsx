/* eslint-disable @typescript-eslint/no-unused-vars */
import { PureComponent } from 'react';
import {
  Layout, Drawer, Divider, Avatar,
  Modal
} from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link';
import {
  IUser, StreamSettings, IUIConfig, ISettings,
  IAccount
} from 'src/interfaces';
import { logout } from '@redux/auth/actions';
import Router, { withRouter, Router as RouterEvent } from 'next/router';
import {
  authService
} from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { addPrivateRequest, accessPrivateRequest } from '@redux/streaming/actions';
import { updateUIValue } from 'src/redux/ui/actions';
import { updateBalance, setAccount } from '@redux/user/actions';
import { SubscribePerformerModal } from 'src/components/subscription/subscribe-performer-modal';
import CopyReferralCode from 'src/components/common/referralCode';
import styles from './header.module.scss';
import { ArrowRightEndOnRectangleIcon  } from '@heroicons/react/24/outline';
import { Home, Bookmark, WalletCards, Settings, Video, User, CircleUserRound, Search, UserRoundPlus, UserPen, InfoIcon, ChevronRight, Clapperboard, ChartColumn } from 'lucide-react';
import LogInModal from 'src/components/log-in/log-in-modal';
import SignUpModal from '@components/sign-up/sign-up-modal';
import Forgot from 'pages/auth/forgot-password';
import { Sheet } from 'react-modal-sheet';
import NavigationContents from "../navigation"
import DropdownModal from "../base/drop-down-modal";
import { videoService } from 'src/services';
import SlideUpModal from '@components/common/layout/slide-up-modal';
import CreateArtistModal from '@components/sign-up/create-artist';


interface IProps {
  updateBalance: Function;
  updateUIValue: Function;
  setAccount: Function;
  user: IUser;
  logout: Function;
  router: any;
  ui: IUIConfig;
  account: IAccount;
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
    openSplashScreen: false,
    openNavDropDown: false,
    performers: [],
    featuredContent: [],
    username: '',
    openSignUpModal: false,
    openCreateArtistModal: false
  };

  componentDidMount() {
    const { user } = this.props;

    if(!user._id && window.innerWidth < 640){
      this.setState({ openSplashScreen: true})
    }else{
      this.setState({ openSplashScreen: false})
    }

    RouterEvent.events.on('routeChangeStart', this.handleChangeRoute);

    this.updateMedia();

    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  updateMedia = () => {
    // @ts-ignore
    const { user } = this.props;
    if (user?.account?.activeSubaccount === "performer") {
      this.setState({ isMobile: window.innerWidth < 1024 });
    } else {
      this.setState({ isMobile: window.innerWidth < 640 });
    }
  };


  componentWillUnmount() {
    RouterEvent.events.off('routeChangeStart', this.handleChangeRoute);
    const token = authService.getToken() || '';
    const socket = this.context;


    // @ts-ignore
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
    if (user?.account?.activeSubaccount === "performer") {
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

  handleOpenSignUp = (isOpen: boolean, loggedIn: boolean, username?: string) => {
    loggedIn ? this.setState({ openLogInSheet: isOpen, openSignUpSheet: false, username }) : this.setState({ openLogInSheet: isOpen, openSignUpSheet: true, username })
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

  handleNavigationPage = () => {
    const {openNavDropDown} = this.state;
    this.setState({openNavDropDown: !openNavDropDown});
  }

  async getFeaturedContent(){
    let featured = [];
    await videoService.homePageSearch({
      limit: 10,
      sortBy: 'latest',
      tags: 'featured',
      offset: 0,
    }).then((res) => {
      res.data.data.map((v)=>{
        if(v._id){
          featured.length === 0 && featured.push(v);
          const exists = featured.some(obj => obj['_id'] === v['_id']);
          if (!exists) {
            if(v.trackType === 'audio'){
              featured.push(v);
            }
          }
        }
      })
    })

    this.setState({featuredContent: this.shuffleArray(featured)});
  }


  async switchSubaccount(activeSubaccount) {
    const { user, account, setAccount: handleSetAccount } = this.props;
    const setActiveSubaccount = activeSubaccount === 'user' ? 'user' : 'performer';
    const updatedAccount = await authService.setActiveSubaccount({ activeSubaccount : setActiveSubaccount });
    await handleSetAccount(updatedAccount.data);
  }

  async createArtistProfile() {
    this.setState({openLogInModal: false, openSignUpModal: true, openCreateArtistModal: true, username: '' });
  }


  shuffleArray(array){
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  getProfileImage(){
    const {account} = this.props;
    let pic;
    if(account.activeSubaccount === 'user'){
      pic = account.performerInfo?.avatar ? account.performerInfo?.avatar : "/static/no-avatar.png"
    }else if(account.activeSubaccount === 'performer'){
      pic = account?.userInfo?.avatar ? account?.userInfo?.avatar : "/static/no-avatar.png"
    }else{
      pic = "/static/no-avatar.png"
    }

    return pic
  }

  render() {
    const {
      user, router, ui, account
    } = this.props;
    const {
      openProfile, isMobile, openSplashScreen, featuredContent, performers, openCreateArtistModal, openSignUpModal, openNavDropDown, openLogInSheet, openSignUpSheet, openForgotSheet, username
    } = this.state;
    const referralCode = user?.account?.userReferral;

    const activeSubaccount = account?.activeSubaccount || 'user';
    const isUser = activeSubaccount === 'user';
    const isPerformer = activeSubaccount === 'performer';

    return (

      (
        <div>
          <DropdownModal isOpen={openNavDropDown} onClose={() => this.setState({openNavDropDown: false})} isMobile={isMobile} isNavigation={true}>
              <NavigationContents user={user} isMobile={isMobile}/>
            </DropdownModal>

        <div className={styles.headerModule}>
          <div className={isMobile ? user._id ? 'main-header mobile-navbar' : 'main-header pb-0'  : 'main-header'} style={{ backdropFilter: 'blur(10px)' }}>
            <Event
              event="update_balance"
              handler={this.handleUpdateBalance.bind(this)}
            />
            <Event
              event="payment_status_callback"
              handler={this.handlePaymentStatusCallback.bind(this)}
            />

            <div className="feed-container main-container">
              {user._id && (
                <Layout.Header className="header" id="layoutHeader">
                  <div className="nav-bar">
                    <ul className='nav-icons' style={{ justifyContent: user._id ? 'space-between' : 'space-around' }}>
                      {user._id && !isPerformer && (
                        <>
                          <li>
                            <Link href="/" className='nav-link'>
                              <Home className={router.pathname === '/' ? 'active-icon' : 'menu-icon-mobile size-6'} />
                            </Link>
                          </li>
                          <li key="wallet_user">
                            <div className='nav-link'>
                              <Search className={`size-6  ${openNavDropDown ? 'trax-white-trax' : 'menu-icon-mobile'}`} onClick={() => this.handleNavigationPage()} />
                            </div>
                          </li>
                          <li key="library">
                            <Link href="/user/library" as="/user/library" className='nav-link'>
                              <Bookmark className={router.pathname === '/user/library' ? 'active-icon' : 'menu-icon-mobile size-6'} />
                            </Link>
                          </li>
                        </>
                      )}

                      {user._id && isPerformer && (
                        <>
                          <li key="profile" className={router.pathname === '/artist/profile' ? 'active' : ''}>
                            <Link
                              href={`/artist/profile/?id=${user?.username || user?._id}`}
                              as={`/artist/profile/?id=${user?.username || user?._id}`}
                              className='nav-link'
                            >
                              <User className={router.pathname === '/artist/profile' ? 'active-icon' : 'menu-icon-mobile size-6'} />
                            </Link>
                          </li>
                          <li key="studio" className={router.pathname === '/artist/studio' ? 'active' : ''}>
                            <Link href="/artist/studio" as="/artist/studio" className='nav-link'>
                              <Clapperboard className={router.pathname === '/artist/studio' ? 'active-icon' : 'menu-icon-mobile size-6'} />
                            </Link>
                          </li>
                          <li key="analytics" className={router.pathname === '/artist/analytics' ? 'active' : ''}>
                            <Link href="/artist/analytics" as="/artist/analytics" className='nav-link'>
                              <ChartColumn className={router.pathname === '/artist/analytics' ? 'active-icon' : 'menu-icon-mobile size-6'} />
                            </Link>
                          </li>
                        </>
                      )}

                      {user._id && (
                        <li key="avatar" aria-hidden onClick={() => this.setState({ openProfile: true })} className='nav-link'>
                          {user?.avatar ? <Avatar className='size-9' src={user?.avatar || '/static/no-avatar.png'} /> : <CircleUserRound className='menu-icon-mobile size-6' />}
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
                    href={isPerformer ? `/artist/profile/?id=${user?.username || user?._id}` : "/user/account"}
                    as={isPerformer ? `/artist/profile/?id=${user?.username || user?._id}` : "/user/account"}
                    legacyBehavior
                  >
                    <div className="profile-user mt-4">
                      <img className="avatar" src={user?.avatar || '/static/no-avatar.png'} alt="avatar" />
                      <div className="flex flex-col">
                        <span className='font-body flex mx-auto text-4xl uppercase text-trax-white font-[600] font-heading'>
                          {user?.name || 'N/A'}
                        </span>
                        <span className='font-body flex text-lg mx-auto text-trax-white/50 mt-1 font-light'>
                        {isUser ? (
                        <span>@{account?.userInfo?.username || 'N/A'}</span>
                      ) : (
                        <span>@{account?.performerInfo?.username || 'N/A'}</span>
                      )}
                        </span>
                      </div>
                    </div>
                  </Link>
                )}
                closable
                onClose={() => this.setState({ openProfile: false })}
                open={openProfile}
                key="profile-drawer"
                className={`${styles.headerModule} profile-drawer ${ui.theme === 'light' ? '' : 'dark'} mobile-navbar`}
                width="100%"
              >

                  {(isUser && account.performerId) || isPerformer ? (
                    <div
                      className='flex flex-row bg-slaps-gray rounded-full justify-between pr-4 border border-trax-transparent hover:border-custom-green cursor-pointer'
                      onClick={() => isUser ? this.switchSubaccount('artist') : this.switchSubaccount('user')}
                    >
                      <div className='flex flex-row gap-2'>
                        <div className='rounded-full border border-trax-white'>
                          <img src={this.getProfileImage()} alt="" className='w-10 h-10 rounded-full'/>
                        </div>
                        <span className='flex items-center'>
                          {isUser ? account?.performerInfo?.name : account?.userInfo?.name}
                        </span>
                      </div>

                      <span className='flex items-center text-trax-gray-400'>
                      {isUser ? 'Artist' : 'Fan'}
                      </span>
                    </div>
                  ) : (
                    <div
                      className='flex flex-row bg-slaps-gray rounded-full justify-center pr-4 py-2 border border-trax-transparent hover:border-custom-green cursor-pointer'
                      onClick={() => this.createArtistProfile()}
                    >
                      <div className='flex flex-row gap-2'>
                        <div className=''>
                          <UserRoundPlus className='w-6 h-6'/>
                        </div>
                        <span className='flex items-center'>
                          Create artist account
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="profile-menu-items mt-3 bg-slaps-gray rounded-lg">
                    <Link href={"/account"} as={"/account"} legacyBehavior >
                      <div className='border-b border-[#4f4f4f]'>
                        <div  className="menu-item">
                          <span className='menu-icon-text'>My Account</span>
                          <ChevronRight className="menu-icon" />
                        </div>
                      </div>
                    </Link>

                    <Link href={isUser ? "/user/account" : "/artist/account"} as={isUser ? "/user/account" : "/artist/account"} legacyBehavior >
                      <div className='border-b border-[#4f4f4f]'>
                        <div className="menu-item">
                          <span className='menu-icon-text'>Edit profile</span>
                          <ChevronRight className="menu-icon" />
                        </div>
                      </div>
                    </Link>

                    {/* {(!isPerformer && user._id) &&(
                      <Link href="/user/wallet/" as="/user/wallet/" legacyBehavior >
                        <div className='border-b border-[#4f4f4f]'>
                          <div className="menu-item">
                            <span className='menu-icon-text'>Wallet</span>
                            <ChevronRight className="menu-icon" />
                          </div>
                        </div>
                      </Link>
                    )} */}

                    {user._id && (
                      isPerformer ? (
                        <Link href="/account/earnings" as="/account/earnings" legacyBehavior >
                          <div className='border-b border-[#4f4f4f]'>
                            <div className="menu-item">
                              <span className='menu-icon-text'>Earnings</span>
                              <ChevronRight className="menu-icon" />
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <Link href="/user/wallet/" as="/user/wallet/" legacyBehavior >
                          <div className='border-b border-[#4f4f4f]'>
                            <div className="menu-item">
                              <span className='menu-icon-text'>Wallet</span>
                              <ChevronRight className="menu-icon" />
                            </div>
                          </div>
                        </Link>
                      )
                    )}

                    <Link href='https://info.trax.so/contact' legacyBehavior >
                      <div className="menu-item">
                        <span className='menu-icon-text'>Support</span>
                        <ChevronRight className="menu-icon" />
                      </div>
                    </Link>
                  </div>
                  <div className="profile-menu-items mt-3 bg-slaps-gray rounded-lg">
                    <div className="menu-item" onClick={() => this.beforeLogout()}>
                      <span className='menu-icon-text'>Sign out</span>
                      <ChevronRight className="menu-icon" />
                    </div>
                  </div>


                  <div className='mt-4'>
                      <CopyReferralCode referralCode={referralCode} isMobile={isMobile} />
                    </div>
              </Drawer>

              <SubscribePerformerModal onSubscribed={this.handleSubscribe} />

              <div className='log-in-modal-wrapper'>
                <SlideUpModal
                  isOpen={openLogInSheet}
                  onClose={() => this.setState(prevState => ({ ...prevState, openLogInSheet: false }))}
                  className="auth-modal"
                >
                  <LogInModal
                    onFinish={this.handleOpenSignUp.bind(this)}
                    onForgotPassword={this.handleOpenForgotSheet}
                  />
                </SlideUpModal>
              </div>

              <div className='sign-in-modal-wrapper'>
                <SlideUpModal
                  isOpen={openSignUpModal}
                  onClose={() => this.setState(prevState => ({ ...prevState, openSignUpModal: false }))}
                >
                  {openCreateArtistModal ?
                    <CreateArtistModal onFinish={this.handleOpenModal.bind(this)} /> :
                    <SignUpModal onFinish={this.handleOpenModal.bind(this)} username={username} />
                  }
                </SlideUpModal>
              </div>

              <div className='sign-in-modal-wrapper'>
                <SlideUpModal
                  isOpen={openSignUpSheet}
                  onClose={() => this.setState(prevState => ({ ...prevState, openSignUpSheet: false }))}
                  className="auth-modal"
                >
                  <SignUpModal onFinish={this.handleOpenModal.bind(this)} username={username} />
                </SlideUpModal>
              </div>

              {/* Forgot Password Sheet for Mobile */}
              {isMobile && openForgotSheet && (
                <SlideUpModal
                  isOpen={openForgotSheet}
                  onClose={this.handleCloseForgotSheet}
                >
                  <Forgot onClose={this.handleCloseForgotSheet} />
                </SlideUpModal>
              )}
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
  account: { ...state.user.account },
  user: { ...state.user.current },
  ui: { ...state.ui },
  config: { ...state.settings },
  ...state.streaming
});
const mapDispatch = {
  logout, addPrivateRequest, accessPrivateRequest, updateUIValue, updateBalance, setAccount
};
export default withRouter(connect(mapState, mapDispatch)(Header)) as any;
