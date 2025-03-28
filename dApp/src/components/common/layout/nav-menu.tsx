/* eslint-disable @typescript-eslint/no-unused-vars */
import { PureComponent } from 'react';
import { Divider, Image, Modal
} from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link';
import {
  IUser, IAccount, StreamSettings, IUIConfig, ISettings
} from 'src/interfaces';
import { logout } from '@redux/auth/actions';
import { CreditCardIcon, Settings, WalletCards, X, MessageSquareIcon, InfoIcon, XIcon, Twitter, PlusCircle, UserRoundPlus, UserPen, CircleUserRound, ChevronRight } from 'lucide-react';
import { ArrowRightEndOnRectangleIcon  } from '@heroicons/react/24/outline';
import Router, { withRouter, Router as RouterEvent } from 'next/router';
import {
  messageService, authService, routerService
} from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { addPrivateRequest, accessPrivateRequest } from '@redux/streaming/actions';
import { updateUIValue } from 'src/redux/ui/actions';
import { updateBalance, setAccount } from '@redux/user/actions';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import CopyReferralCode from 'src/components/common/referralCode';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import LogInModal from 'src/components/log-in/log-in-modal';
import SignUpModal from '@components/sign-up/sign-up-modal';
import CreateArtistModal from '@components/sign-up/create-artist';
import EmailSignUpModal from '@components/sign-up/email-sign-up-modal';
import { BackgroundBeams } from "@components/ui/background-beams";
import { Sheet } from 'react-modal-sheet';
import { AnimatePresence, motion } from "framer-motion";
import TraxButton from '../TraxButton';
import { PlusIcon } from 'src/icons';
import SlideUpModal from '@components/common/layout/slide-up-modal';

interface IProps {
  updateBalance: Function;
  updateUIValue: Function;
  setAccount: Function;
  user: IUser;
  account: IAccount;
  logout: Function;
  router: any;
  ui: IUIConfig;
  privateRequests: any;
  addPrivateRequest: Function;
  accessPrivateRequest: Function;
  settings: StreamSettings;
  config: ISettings;
  onClose(closed: boolean): Function;
}

class NavMenu extends PureComponent<IProps> {
  state = {
    totalNotReadMessage: 0,
    openProfile: false,
    balanceICP: 0,
    isMobile: false,
    openLogInModal: false,
    openSignUpModal: false,
    openCreateArtistModal: false,
    openEmailSignUpModal: false,
    username: ''
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

    this.props.onClose(false)
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
    //if (user.isPerformer) {
      handleUpdateBalance({ token: event.token });
    //}
  }

  async handlePaymentStatusCallback({ redirectUrl }) {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }

  async beforeLogout() {

    const { logout: handleLogout, onClose } = this.props;
    onClose(false)
    const token = authService.getToken() || '';
    const socket = this.context;
    // @ts-ignore
    token && socket && (await socket.emit('auth/logout', {
      token
    }));
    handleLogout();
  }

  async switchSubaccount(activeSubaccount) {
    const { user, account, setAccount: handleSetAccount } = this.props;
    const setActiveSubaccount = activeSubaccount === 'user' ? 'user' : 'performer';
    const updatedAccount = await authService.setActiveSubaccount({ activeSubaccount : setActiveSubaccount });

    if (updatedAccount.data._id) {
      await handleSetAccount(updatedAccount.data);

      await routerService.redirectAfterSwitchSubaccount(updatedAccount.data);
    }
  }

  async createArtistProfile() {
    this.setState({openLogInModal: false, openSignUpModal: true, openCreateArtistModal: true, username: '' });
  }

  handleOpenSignUp = (isOpen: boolean, loggedIn: boolean, username?: string) =>{
    loggedIn ? this.setState({openLogInModal: isOpen, openSignUpModal: false, openCreateArtistModal: false, username}) : this.setState({openLogInModal: isOpen, openSignUpModal: true, openCreateArtistModal: false, username})
  }

  handleOpenModal = (isOpen: boolean, modal: string, username?: string) =>{
    if (modal === 'email'){
      this.setState({openSignUpModal: isOpen, openLogInModal: isOpen, openEmailSignUpModal: true, openCreateArtistModal: false})
    }else{
      this.setState({openSignUpModal: isOpen, openEmailSignUpModal: isOpen, openLogInModal: true, openCreateArtistModal: false})
    }
  }

  handleCreateArtistModal = (isOpen: boolean, modal: string, username?: string) =>{
    if (modal === 'email'){
      this.setState({openSignUpModal: isOpen, openLogInModal: isOpen, openEmailSignUpModal: true, openCreateArtistModal: false})
    }else{
      this.setState({openSignUpModal: isOpen, openEmailSignUpModal: isOpen, openLogInModal: true, openCreateArtistModal: false})
    }

    this.switchSubaccount('performer');
  }

  getProfileImage(){
    const {account} = this.props;
    let pic;
    if(account?.activeSubaccount === 'user'){
      pic = account?.performerInfo?.avatar ? account.performerInfo?.avatar : "/static/no-avatar.png"
    }else if(account.activeSubaccount === 'performer'){
      pic = account?.userInfo?.avatar ? account?.userInfo?.avatar : "/static/no-avatar.png"
    }else{
      pic = "/static/no-avatar.png"
    }

    return pic
  }

  render() {
    const {
      user, account, router, ui, settings, onClose
    } = this.props;
    const {
      totalNotReadMessage, openProfile, isMobile, openLogInModal, openSignUpModal, openEmailSignUpModal, openCreateArtistModal, username
    } = this.state;
    const referralCode = user?.account?.userReferral;
    const activeSubaccount = account.activeSubaccount || 'user';
    const isUser = activeSubaccount === 'user';
    const isPerformer = activeSubaccount === 'performer';

    return (
      (
            <div className="feed-container main-container p-2">
            {/* <BackgroundBeams/> */}
              {(!isPerformer) ? (
                <div className='flex justify-end relative z-1'>
                  <div className='flex flex-end cursor-pointer w-fit' onClick={()=> onClose(false)}>
                    <X className='text-font-light-gray hover:text-custom-green transition size-5'/>
                  </div>
                </div>
              ) : (
                <div className='flex justify-end relative z-1 pt-4'></div>
              )}

              <div className="profile-drawer dark mobile-navbar">
                <div className="profile-user">
                  <img className="avatar" style={{marginTop: '0rem'}} src={user?.avatar || '/static/no-avatar.png'} alt="avatar" />
                  <div className=''>
                    <span className="profile-name">
                      <span>{user?.name || 'N/A'}</span>
                    </span>
                    <span className="sub-name">
                      {isUser ? (
                        <span>@{account?.userInfo?.username || 'N/A'}</span>
                      ) : (
                        <span>@{account?.performerInfo?.username || 'N/A'}</span>
                      )}

                    </span>
                  </div>

                  {/* <span className="sub-name">
                      <span>Currently using {isUser ? 'Fan account' : 'Artist account'}</span>
                  </span> */}
                </div>

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


                    <div className="profile-menu-items mt-3 bg-slaps-gray/50 rounded-lg">

                    {isUser && (
                      <>
                      <Link href={"/account"} as={"/account"} legacyBehavior >
                        <div className='border-b border-slaps-gray'>
                          <div  className="menu-item">
                            <span className='menu-icon-text'>My Account</span>
                            <ChevronRight className="menu-icon" />
                          </div>
                        </div>
                      </Link>
                      <Link href="/user/account" as="/user/account" legacyBehavior >
                        <div className='border-b border-slaps-gray'>
                          <div className="menu-item">
                            <span className='menu-icon-text'>Edit profile</span>
                            <ChevronRight className="menu-icon" />
                          </div>
                        </div>
                      </Link>
                        <Link href="/account/wallet" as="/account/wallet" legacyBehavior >
                          <div className='border-b border-slaps-gray'>
                            <div className="menu-item">
                              <span className='menu-icon-text'>Wallet</span>
                              <ChevronRight className="menu-icon" />
                            </div>
                          </div>
                        </Link>
                      <Link href='https://info.trax.so/contact' legacyBehavior >
                          <div  className="menu-item">
                            <span className='menu-icon-text'>Support</span>
                            <ChevronRight className="menu-icon" />
                          </div>
                      </Link>
                      </>
                    )}




                      {/* <CopyReferralCode referralCode={referralCode} isMobile={isMobile}/> */}

                    </div>
                      <div className='profile-menu-items mt-3 bg-slaps-gray/50 rounded-lg'>
                        <div  className="menu-item" onClick={() => this.beforeLogout()}>
                          <span className='menu-icon-text'>Sign out</span>
                          <ChevronRight className="menu-icon" />
                        </div>
                      </div>
                    <div className='flex flex-row w-full pt-2'>
                        <div className='flex flex-row gap-2'>
                          <Link className="text-[#FFFFFF70]" href='/page/?id=privacy-policy'>Privacy</Link>
                          <Link className="text-[#FFFFFF70]" href='/page/?id=terms-of-service'>Terms</Link>
                          <Link className="text-[#FFFFFF70]" href='/page/?id=copyright'>Copyright</Link>
                        </div>
                        <div className='flex my-auto ml-20'>
                          <Link href='https://x.com/trax_so'><img src='/static/xIcon.png' className='opacity-75 my-auto' alt='X icon' height={16} width={16}/> </Link>
                        </div>
                      </div>

              </div>

              <div className='log-in-modal-wrapper'>
              {isMobile ? (
                <SlideUpModal
                  isOpen={openLogInModal}
                  onClose={() => this.setState(prevState => ({ ...prevState, openLogInModal: false }))}
                  className="auth-modal"
                >
                  <LogInModal onFinish={this.handleOpenSignUp.bind(this)}/>
                </SlideUpModal>
              ) : (
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
              )}
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
                  {openCreateArtistModal ?
                    <CreateArtistModal onFinish={this.handleCreateArtistModal.bind(this)} /> :
                    <SignUpModal onFinish={this.handleOpenModal.bind(this)} username={username} />
                  }
                </Modal>

              </div>
            </div>
      )
    );
  }
}

NavMenu.contextType = SocketContext;

const mapState = (state: any) => ({
  user: { ...state.user.current },
  account: { ...state.user.account },
  ui: { ...state.ui },
  config: { ...state.settings },
  ...state.streaming
});
const mapDispatch = {
  logout, addPrivateRequest, accessPrivateRequest, updateUIValue, updateBalance, setAccount
};
export default withRouter(connect(mapState, mapDispatch)(NavMenu)) as any;
