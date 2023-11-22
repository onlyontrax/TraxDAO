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
  DollarOutlined, HomeFilled,
  LogoutOutlined, TeamOutlined, WalletFilled, SettingOutlined, InfoCircleOutlined
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
import  LogInModal  from 'src/components/log-in/log-in-modal';
import SignUpModal from '@components/sign-up/sign-up-modal';
import EmailSignUpModal from '@components/sign-up/email-sign-up-modal';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import CopyReferralCode from 'src/components/common/referralCode';

import type { _SERVICE as _SERVICE_PPV } from '../../../smart-contracts/declarations/ppv/ppv.did';
import styles from './new-header.module.scss';

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

class NewHeader extends PureComponent<IProps> {
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

  handleOpenSignUp = (isOpen: boolean) =>{
    this.setState({openLogInModal: isOpen, openSignUpModal: true})
  }

  handleOpenModal = (isOpen: boolean, modal: string) =>{
    if(modal === 'email'){
      this.setState({openSignUpModal: isOpen, openLogInModal: isOpen, openEmailSignUpModal: true})
    }else{
      this.setState({openSignUpModal: isOpen, openEmailSignUpModal: isOpen, openLogInModal: true})
    }
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
            <div className="feed-container main-container">

              <Layout.Header className="header" id="layoutHeader">
                <div className="nav-bar">

                  <ul className={user._id ? 'nav-icons' : 'nav-icons custom'}>
                    {!user._id && [
                      <li key="login" onClick={()=> this.setState({openLogInModal: true})}>
                        <div>
                          Log In
                        </div>
                      </li>,
                      <li key="login2" className={router.pathname === '/login' ? 'active logged-out' : 'logged-out'}>
                      <Link href="/login" className='logged-out-link'>
                        Sign In
                      </Link>
                    </li>,
                      <li key="signup" className={router.pathname === '/auth/register' ? 'active logged-out' : 'logged-out'}>
                        <Link href="/auth/register" className='logged-out-link'>
                          Create account
                        </Link>
                      </li>,
                      <li key="artists" className={router.pathname === 'https://artists.trax.so' ? 'active logged-out' : 'logged-out'}>
                      <Link href="https://artists.trax.so" target='_blank' className='logged-out-link'>
                        For Artists
                      </Link>
                    </li>
                    ]}
                    {user._id && (
                    <div className="sub-info">
                      <a aria-hidden className="user-balance" onClick={() => (!user?.isPerformer ? Router.push('/user/my-payments') : Router.push('/artist/earnings-page'))}>
                        <div className="wallet-balance-wrapper">
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
                    )}
                    {user._id && (
                    <li key="avatar" aria-hidden onClick={() => this.setState({ openProfile: true })}>
                      {user?.avatar ? <Avatar style={{minWidth: '32px', minHeight: '32px'}} src={user?.avatar || '/static/no-avatar.png'} /> : <UserIcon />}
                      <p className='header-username'>{user?.name}</p>
                      {' '}
                          {user?.verifiedAccount ? <BadgeCheckIcon className="sidebar-v-badge" /> : ''}
                      &nbsp;

                          {user?.earlyBird ? <Image preview={false} className="early-bird-icon" src="/static/traxXLogoGreen.svg" /> : ''}
                          {' '}
                    </li>
                    )}
                  </ul>
                </div>

              </Layout.Header>

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

NewHeader.contextType = SocketContext;

const mapState = (state: any) => ({
  user: { ...state.user.current },
  ui: { ...state.ui },
  config: { ...state.settings },
  ...state.streaming
});
const mapDispatch = {
  logout, addPrivateRequest, accessPrivateRequest, updateUIValue, updateBalance
};
export default withRouter(connect(mapState, mapDispatch)(NewHeader)) as any;
