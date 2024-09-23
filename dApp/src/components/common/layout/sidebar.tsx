/* eslint-disable @typescript-eslint/no-unused-vars */
import { PureComponent } from 'react';
import {
  Layout, Divider, Modal
} from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link';
import {
  IUser, StreamSettings, IUIConfig, ISettings
} from 'src/interfaces';
import { logout } from '@redux/auth/actions';
import {
  LogoutOutlined, TeamOutlined, WalletFilled,
} from '@ant-design/icons';
import Router, { withRouter, Router as RouterEvent } from 'next/router';
import {
  authService
} from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { addPrivateRequest, accessPrivateRequest } from '@redux/streaming/actions';
import { updateUIValue } from 'src/redux/ui/actions';
import { updateBalance } from '@redux/user/actions';
import { HomeIcon as HomeIconActive, VideoCameraIcon as VideoCameraIconActive, UserIcon as UserIconActive,
  WalletIcon as WalletIconActive, BookmarkIcon as BookmarkIconActive,
 } from '@heroicons/react/24/solid';
import { HomeIcon, VideoCameraIcon, UserIcon, WalletIcon, BookmarkIcon, } from '@heroicons/react/24/outline';
import styles from './sidebar.module.scss';
import { Bars3Icon } from '@heroicons/react/24/outline';

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
  setSidebar: boolean;
  onSidebarToggle: () => void;
}

class Sidebar extends PureComponent<IProps> {
  state = {
    totalNotReadMessage: 0,
    openProfile: false,
    balanceICP: 0,
    isNotMobile: false,
    isTablet: false,
    openLogInModal: false,
  };

  componentDidMount() {

    RouterEvent.events.on('routeChangeStart', this.handleChangeRoute);
    const { user, router } = this.props;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentPathCleaned = currentPath.replace(/^\/+|\/+$/g, '');
    if (currentPathCleaned === 'login') {
      this.setState({ openLogInModal: true });
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

  handleOpenModal = (isOpen: boolean, modal: string) => {
    if (modal === 'email') {
      this.setState({ openLogInModal: isOpen })
    } else if (modal === 'exit') {
      this.setState({ openLogInModal: isOpen, })
    } else {
      this.setState({ openLogInModal: true })
    }
  }

  render() {
    const {
      user, router, setSidebar, onSidebarToggle
    } = this.props;
    const {
      isNotMobile, isTablet,
    } = this.state;
    const referralCode = user?.userReferral;

    return (
      (
        <div className={styles.sidebarModule}>
          <div className={!isNotMobile ? 'main-header mobile-navbar' : 'main-header'}>

            <Event
              event="update_balance"
              handler={this.handleUpdateBalance.bind(this)}
            />
            <Event
              event="payment_status_callback"
              handler={this.handlePaymentStatusCallback.bind(this)}
            />
            <div className='sidebar-container'>
              <Layout.Header className='header' id="layoutHeader">
              {/* {isNotMobile && (
                      <div key="sideBar" className='text-left absolute left-5 top-3.5 mb-8 text-trax-white cursor-pointer' onClick={onSidebarToggle} >
                      <Bars3Icon className='size-6'/>
                    </div>
                    )} */}
                <nav className={`nav-bar ${ setSidebar ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                
                  <ul className='nav-icons'>
                  
                    <li className={router.pathname === '/' ? 'active' : ''}>
                      <Link href="/" className={user._id ? 'nav-link' : 'nav-link logged-out'}>
                        <HomeIconActive className={router.pathname === '/' ? 'active-icon size-6' : 'display-none'} />
                        <HomeIcon className={router.pathname === '/' ? 'display-none' : 'size-6'} />
                        <span className={router.pathname === '/' ? 'page-name-active' : 'page-name'}>Home</span>
                      </Link>
                    </li>

                    {user._id && !user.isPerformer && (
                      <li key="wallet_user" className={router.pathname === '/user/wallet' ? 'active' : ''}>
                        <Link href="/user/wallet" className='nav-link'>
                          <>
                            <WalletIconActive className={router.pathname === '/user/wallet' ? 'active-icon size-6' : 'display-none'} />
                            <WalletIcon className={router.pathname === '/user/wallet' ? 'display-none' : 'size-6'} />
                            <span className={router.pathname === '/user/wallet' ? 'page-name-active' : 'page-name'} >Wallet</span>
                            </>
                        </Link>
                      </li>
                    )}

                    {user._id && !user.isPerformer && (
                      <>
                        <li key="library" className={router.pathname === '/user/library' ? 'active' : ''}>
                          <Link href="/user/library" as="/user/library" className='nav-link'>
                            <>
                              <BookmarkIconActive className={router.pathname === '/user/library' ? 'active-icon size-6' : 'display-none'} />
                              <BookmarkIcon className={router.pathname === '/user/library' ? 'display-none' : 'size-6'} />
                              <span className={router.pathname === '/user/library' ? 'page-name-active' : 'page-name'}>Library</span>
                            </>
                          </Link>
                        </li>

                        {/* <li key="signOut" className='sign-out-btn-wrapper'>
                          <div className="menu-item sign-out-btn" aria-hidden onClick={() => this.beforeLogout()}>
                            <LogoutOutlined style={{ fontSize: '17px' }} />

                          </div>
                        </li> */}
                  
                      </>
                    )}
                    {user._id && user.isPerformer && (
                      <>
                        <li key="content" className={router.pathname === '/artist/studio' ? 'active' : ''}>
                          <Link href="/artist/studio" as="/artist/studio" className='nav-link'>
                            <>
                              <VideoCameraIconActive className={router.pathname === '/artist/studio' ? 'active-icon size-6' : 'display-none'} />
                              <VideoCameraIcon className={router.pathname === '/artist/studio' ? 'display-none' : 'size-6'} />
                              <span className={router.pathname === '/artist/studio' ? 'page-name-active' : 'page-name'} >Studio</span>
                            </>
                          </Link>
                        </li>
                        <li key="earnings" className={router.pathname === '/artist/earnings' ? 'active' : ''}>
                          <Link href="/artist/earnings" as="/artist/earnings" className='nav-link'>
                            <>
                              <WalletIconActive className={router.pathname === '/artist/earnings' ? 'active-icon size-6' : 'display-none'} />
                              <WalletIcon className={router.pathname === '/artist/earnings' ? 'display-none' : 'size-6'} />
                              <span className={router.pathname === '/artist/earnings' ? 'page-name-active' : 'page-name'}>Earnings</span>
                            </>
                          </Link>
                        </li>
                        <li key="profile" className={router.pathname === '/artist/profile' ? 'active' : ''}>
                          <Link
                            href={`/${user?.username || user?._id}`}
                            as={`/${user?.username || user?._id}`}
                            className='nav-link'
                          >
                            <>
                              <UserIconActive className={router.pathname === '/artist/profile' ? 'active-icon size-6' : 'display-none'}/>
                              <UserIcon className={router.pathname === '/artist/profile' ? 'display-none' : 'size-6'}/>
                              <span className={router.pathname === '/artist/profile' ? 'page-name-active' : 'page-name'}>You</span>
                            </>
                          </Link>
                        </li>

                        {/* <li key="signOut" className='sign-out-btn-wrapper'>
                          <div className="menu-item sign-out-btn" aria-hidden onClick={() => this.beforeLogout()}>
                            <LogoutOutlined style={{ fontSize: '17px' }} />
                          </div>
                        </li> */}
                  
                      </>
                    )}
                  </ul>
                </nav>
              </Layout.Header>
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
