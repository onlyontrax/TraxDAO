/* eslint-disable @typescript-eslint/no-unused-vars */
import { PureComponent } from 'react';
import { Divider, Image, Modal
} from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link';
import {
  IUser, StreamSettings, IUIConfig, ISettings
} from 'src/interfaces';
import { logout } from '@redux/auth/actions';
import {
  LogoutOutlined, SettingOutlined, CloseOutlined 
} from '@ant-design/icons';
import Router, { withRouter, Router as RouterEvent } from 'next/router';
import {
  messageService, authService
} from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { addPrivateRequest, accessPrivateRequest } from '@redux/streaming/actions';
import { updateUIValue } from 'src/redux/ui/actions';
import { updateBalance } from '@redux/user/actions';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import CopyReferralCode from 'src/components/common/referralCode';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import LogInModal from 'src/components/log-in/log-in-modal';
import SignUpModal from '@components/sign-up/sign-up-modal';
import EmailSignUpModal from '@components/sign-up/email-sign-up-modal';
import { BackgroundBeams } from "@components/ui/background-beams";

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
      user, router, ui, settings, onClose
    } = this.props;
    const {
      totalNotReadMessage, openProfile, isMobile, openLogInModal, openSignUpModal, openEmailSignUpModal
    } = this.state;
    const referralCode = user?.userReferral;

    return (
      (
            <div className="feed-container main-container">
            {/* <BackgroundBeams/> */}
              <div className='flex w-full flex-start cursor-pointer' onClick={()=> onClose(false)}>
                <CloseOutlined/>
              </div>
                
              <div className="profile-drawer dark mobile-navbar">
                <div className="profile-user" style={{borderBottom: '1px solid #383838', paddingBottom: '1.5rem'}}>
                  <img className="avatar" style={{marginTop: '0rem'}} src={user?.avatar || '/static/no-avatar.png'} alt="avatar" />
                  <span className="profile-name">
                      <span>{user?.name || 'N/A'}</span>
                      &nbsp;
                      {user?.verifiedAccount ? <CheckBadgeIcon className="sidebar-v-badge" /> : ''}
                      &nbsp;
                      {user?.earlyBird && <Image preview={false} className="early-bird-icon" src="/static/traxXLogoGreen.svg" />}
                  </span>
                </div>
          
                
                    <div className="profile-menu-item">
                    {user.isPerformer ? (
                      <Link href="/artist/account" as="/artist/account" legacyBehavior >
                        <div className="flex justify-start flex-row gap-2 cursor-pointer mt-4">
                          <SettingOutlined  className='flex text-lg'/>
                          {' '}
                          <span className='flex text-md'>Settings</span>
                        </div>
                      </Link>
                    ):(
                        <Link href="/user/account" as="/user/account" legacyBehavior >
                            <div className="flex justify-start flex-row gap-2 cursor-pointer mt-4">
                                <SettingOutlined className='flex text-lg'/>
                                {' '}
                                <span className='flex text-md'>Settings</span>
                            </div>
                        </Link>
                      )}
              
                      <div aria-hidden className="flex justify-start flex-row gap-2 cursor-pointer mt-4" onClick={() => this.beforeLogout()}>
                        <LogoutOutlined className='flex text-lg'/>
                        {' '}
                        <span className='flex text-md'>Sign out</span>
                      </div>  
                      <Divider />
                      <CopyReferralCode referralCode={referralCode} />
                    
                      
                   
                    </div>
                
              </div>

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
              
            </div>
         
      )
    );
  }
}

NavMenu.contextType = SocketContext;

const mapState = (state: any) => ({
  user: { ...state.user.current },
  ui: { ...state.ui },
  config: { ...state.settings },
  ...state.streaming
});
const mapDispatch = {
  logout, addPrivateRequest, accessPrivateRequest, updateUIValue, updateBalance
};
export default withRouter(connect(mapState, mapDispatch)(NavMenu)) as any;
