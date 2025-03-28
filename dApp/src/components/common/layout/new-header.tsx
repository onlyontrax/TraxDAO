/* eslint-disable @typescript-eslint/no-unused-vars */

import { PureComponent, createRef } from 'react';
import {
  Layout, Badge, Drawer, Divider, Avatar, Image, Modal, message
} from 'antd';
import React, { useRef} from "react";
import { connect } from 'react-redux';
import Link from 'next/link';
import {
  IUser, IAccount, StreamSettings, IUIConfig, ISettings,
  IVerifyEmail
} from 'src/interfaces';
import { logout } from '@redux/auth/actions';
import Router, { withRouter, Router as RouterEvent } from 'next/router';
import { Store } from 'redux';

import {
  messageService, authService, tokenTransctionService, userService
} from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { addPrivateRequest, accessPrivateRequest } from '@redux/streaming/actions';
import { updateUIValue } from 'src/redux/ui/actions';
import { updateBalance } from '@redux/user/actions';
import { SubscribePerformerModal } from 'src/components/subscription/subscribe-performer-modal';
import  LogInModal  from 'src/components/log-in/log-in-modal';
import SignUpModal from '@components/sign-up/sign-up-modal';
import NavMenu from './nav-menu';
import { Sheet } from 'react-modal-sheet';
import styles from './new-header.module.scss';
import { PerformerAdvancedFilter } from '@components/common/base/performer-advanced-filter';
import { performerService, utilsService, videoService } from 'src/services';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { SHORT_GENRES, GENRES } from 'src/constants';
import { HoverBorderGradient } from "@components/ui/hover-border-gradient";
import { useState } from "react";
import { BackgroundBeams } from "@components/ui/background-beams";
import { Bars3Icon } from '@heroicons/react/24/outline';
import DropdownGenres from '../simple-dropdown';
import { HomeIcon as HomeIconActive, VideoCameraIcon as VideoCameraIconActive, UserIcon as UserIconActive,
  WalletIcon as WalletIconActive, BookmarkIcon as BookmarkIconActive,
 } from '@heroicons/react/24/solid';
import { HomeIcon, VideoCameraIcon, UserIcon, WalletIcon, BookmarkIcon, } from '@heroicons/react/24/outline';
import {MultiColumnDropdown} from '../genre-drop-box';
import {useOutsideClick} from "@components/ui/use-outside-click"
import NavigationContents from "../navigation"
import DropdownModal from "../base/drop-down-modal";
import { motion, AnimatePresence } from 'framer-motion';
import SlideUpModal from './slide-up-modal';
import TraxButton from '../TraxButton';
import { ArrowDownLeft, ArrowDownRight, CircleUserRound } from 'lucide-react';
import { EmailVerificationBanner } from '../email-verification-banner';

interface IProps {
  updateBalance: Function;
  updateUIValue: Function;
  account: IAccount;
  user: IUser;
  logout: Function;
  router: any;
  ui: IUIConfig;
  privateRequests: any;
  addPrivateRequest: Function;
  accessPrivateRequest: Function;
  settings: StreamSettings;
  config: ISettings;
  onFinish(isSearch: boolean, performers: [], total: number): Function;
  onSidebarToggle: () => void;
  setSidebar: boolean;
  onOutsideClick: () => {};
  onInsideClick: () => {};
  isClickedOutside: boolean;
  sendGenreToParent(genre): Function;
}



const countryToCurrencyMap = {
  'United States': 'USD',
  'Spain': 'EUR',
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Portugal': 'EUR',
  'Greece': 'EUR',
  'Ireland': 'EUR',
  'Netherlands': 'EUR',
  'Belgium': 'EUR',
  'Luxembourg': 'EUR',
  'Finland': 'EUR',
  'Austria': 'EUR',
  'Slovakia': 'EUR',
  'Latvia': 'EUR',
  'Lithuania': 'EUR',
  'Estonia': 'EUR',
  'Slovenia': 'EUR',
  'Cyprus': 'EUR',
  'Malta': 'EUR',
  'Japan': 'JPY',
  'United Kingdom': 'GBP',
  'Australia': 'AUD',
  'Canada': 'CAD',
  'Switzerland': 'CHF',
  'China': 'CNY',
  'Sweden': 'SEK',
  'New Zealand': 'NZD',
  'Mexico': 'MXN',
  'Singapore': 'SGD',
  'Hong Kong': 'HKD',
  'Norway': 'NOK',
  'South Korea': 'KRW',
  'Turkey': 'TRY',
  'India': 'INR',
  'Brazil': 'BRL',
  'South Africa': 'ZAR',
  'Russia': 'RUB',
};

// const router = useRouter()

const navbarBackground = (scrollNav: boolean, isArtist: boolean, isHome: boolean) => ({
  transition: `0.5s all ease-in-out`,
  background: (scrollNav) ? 'linear-gradient(177deg, #c8ff0200 5%, #cbcbcb00 50%)' : '#00000000',
})



const headerBackground = (scrollNav: boolean) => ({
  transition: `0.5s all ease-in-out`,
  backdropFilter: (scrollNav) && 'blur(12px)',
  height: '100px !important',
  background: (scrollNav) ?  '#090909cc' : 'linear-gradient(180deg, #000000, #00000000)',
})
class NewHeader extends PureComponent<IProps> {

  static authenticate = true;

  static noredirect = true;

  state = {
    totalNotReadMessage: 0,
    openProfile: false,
    balanceICP: 0,
    isMobile: false,
    openLogInModal: false,
    openSignUpModal: false,
    openEmailSignUpModal: false,
    offset: 0,
    limit: 15,
    filter: {
      sortBy: 'latest'
    } as any,
    trendingArtistsFilter: {
      sortBy: 'popular'
    } as any,
    recentlyJoinedFilter: {
      sortBy: 'latest'
    } as any,
    performers: [],
    suggestions: [],
    countries: null,
    musicInfo: null,
    isSearchEmpty: true,
    total: 0,
    fetching: true,
    openSearchBox: false,
    openGenreSelection: false,
    selectedGenre: 'featured',
    openNavMenuModal: false,
    scrollNav: false,
    scrollTop: false,
    openCurrencyModal: false,
    country: '',
    currency: '',
    openNavDropDown: false,
    featuredContent: [],
    lastScrollY: 0,
    isHeaderVisible: true,
    username: '',
    openEmailVerifyModal: false
  };

  myRef: any;

  // checkFirstVisit() {
  //   if (localStorage.getItem('was_visited')) {
  //     return false;
  //   }else{
  //     this.setState({ firstVisit: true });
  //     localStorage.setItem('was_visited', 'first_user');
  //     return true;
  //   }
  // }


  getCurrency(){
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        // Fetch the country using the Nominatim reverse geocoding API
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();

        if (data && data.address && data.address.country) {
          const userCountry = data.address.country;
          const recommendedCurrency = countryToCurrencyMap[userCountry] || 'USD';

          this.setState({openCurrencyModal: true, country: userCountry, currency: recommendedCurrency});
          // TODO - set user currency in dto
          let payload = {
            symbol: recommendedCurrency
          }
          userService.setFIATCurrency(payload)
        } else {
          console.log('Unable to determine country');
        }
      } catch (err) {
        console.log('Error fetching location data');
      }
    }, (err) => {
      console.log('Error getting location');
    });
  }

  async componentDidMount() {
    if (!this.myRef) this.myRef = createRef();
    const { countries, selectedGenre, filter, limit } = this.state;
    const { user } = this.props;

    // if(!user?.currency){
    //   this.getCurrency()
    // }

    // let values = 'featured'

    // let vals = {searchValue: values, q: values}
    // let f = { ...filter, ...vals };
    // this.setState({ offset: 0, filter: f, showFeaturedArtists: false });
    // this.getPerformersByGenre(0, f, limit);
    // this.getFeaturedContent()
    // this.handleGenreFilter('featured')

    window.addEventListener('scroll', this.changeNav);
    window.addEventListener('scroll', this.handleScroll);

    // let curr = await tokenTransctionService.getExchangeRateFIAT()
    // console.log("curr: ", curr)

    const listener = () => {
      if (!this.myRef.current || this.myRef.current.contains(event.target)) {
        return;
      }
      this.setState({openNavMenuModal: null})
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    RouterEvent.events.on('routeChangeStart', this.handleChangeRoute);

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentPathCleaned = currentPath.replace(/^\/+|\/+$/g, '');

    if (currentPathCleaned === '') {
      this.setState({ openGenreSelection: true });
    }else{
      this.setState({ openGenreSelection: false });
    };

    if (user._id) {
      this.handleCountNotificationMessage();
    };

    const data = await this.getData();
    this.setState({ musicInfo: data.musicInfo, countries: data.countries }, () => this.updateDataDependencies());

    this.setState({ isMobile: window.innerWidth < 640 });
    window.addEventListener('resize', this.updateMedia);
    return () => window.removeEventListener('resize', this.updateMedia);
  }

  changeNav = ()=> {

    if(window.scrollY > 80) {
      this.setState({scrollTop: true});
    }else{
      this.setState({scrollTop: false});
    }

    if(window.scrollY !== 0){
      this.setState({scrollNav: true});

    }else{
      this.setState({scrollNav: false});
    }
  }


  async componentDidUpdate(prevProps: any) {
    const { user } = this.props;
    window.addEventListener('scroll', this.changeNav);


    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentPathCleaned = currentPath.replace(/^\/+|\/+$/g, '');

    if (currentPathCleaned === '') {
      this.setState({ openGenreSelection: true });
    }else{
      this.setState({ openGenreSelection: false });
      this.setState({ selectedGenre: 'featured' })
    }


    const listener = () => {
      if (!this.myRef.current || this.myRef.current.contains(event.target)) {
        return;
      }
      this.setState({openNavMenuModal: null})
    }
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);



    if (user._id && prevProps.user._id !== user._id) {
      this.handleCountNotificationMessage();
    }
  }

  async componentWillUnmount() {
    window.addEventListener('scroll', this.changeNav);
    window.removeEventListener('scroll', this.handleScroll);
    // document.removeEventListener('click', this.handleClick);

    RouterEvent.events.off('routeChangeStart', this.handleChangeRoute);
    const token = authService.getToken() || '';
    const socket = this.context;
    // @ts-ignore
    token && socket && socket.emit('auth/logout', { token });
  }

  // handleClick = (event) => {
  //   const { onOutsideClick, onInsideClick } = this.props;
  //   const clickedInside = this.componentRef && this.componentRef.contains(event.target);

  //   if (onInsideClick && clickedInside) {
  //     // If click is inside the component and the insideComponent prop is true, trigger the onClickInside function
  //     onInsideClick();
  //   } else if (!onInsideClick && !clickedInside) {
  //     // If click is outside the component and the insideComponent prop is false, trigger the onOutsideClick function
  //     onOutsideClick();
  //   }
  // };




  updateDataDependencies() {
    const { filter, limit } = this.state;
    // this.getPerformers(0, filter, limit);
  }

  async getData() {
    try {
      const [countries, musicInfo] = await Promise.all([utilsService.countriesList(), utilsService.musicInfo()]);
      return {
        countries: countries?.data || [],
        musicInfo: musicInfo?.data
      };
    } catch (e) {
      return {
        countries: [],
        musicInfo: null
      };
    }
  }

  updateMedia = () => {
    // @ts-ignore
    this.setState({ isMobile: window.innerWidth < 640 });
  };



  handleOpenSignUp = (isOpen: boolean, loggedIn: boolean, username?: string) =>{
    loggedIn ? this.setState({openLogInModal: isOpen, openSignUpModal: false, username }) : this.setState({openLogInModal: isOpen, openSignUpModal: true, username })
  }

  handleOpenModal = (isOpen: boolean, modal: string) => {
    if(modal === 'email'){
      this.setState({openSignUpModal: isOpen, openLogInModal: isOpen, openEmailSignUpModal: true})
    }else if(modal === 'exit'){
      this.setState({openSignUpModal: isOpen, openLogInModal: isOpen, openEmailSignUpModal: isOpen})
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


  handleGenreFilter(genreName: string) {
    const { selectedGenre } = this.state;
    const { sendGenreToParent } = this.props;

    if(genreName === selectedGenre){
      this.props.onFinish(false, [], 0);
      this.setState({selectedGenre: ''})
      return;
    }

    this.setState({selectedGenre: genreName})
    const { filter, limit } = this.state;
    let f, vals;
    if(genreName !== 'featured'){

      vals = {searchValue: genreName, q: genreName}
      f = { ...filter, ...vals };
      this.setState({ offset: 0, filter: f});
      this.getPerformersByGenre(0, f, limit);
    }else{
      // this.setState(() => this.updateDataDependencies())
      this.setState({showFeaturedArtists: true});
      vals = {searchValue: '', q: ''}
      this.handleFilter(vals, true);
      // this.updateDataDependencies();
    }


    this.setState({genre: genreName})
    sendGenreToParent(genreName)

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentPathCleaned = currentPath.replace(/^\/+|\/+$/g, '');

    if (currentPathCleaned !== '') {
      Router.push('/');
    }
  }


  handleFilter(values: any, getGenre: boolean) {
    this.setState({showFeaturedArtists: !values.searchValue ? true : false});
    const { filter, limit } = this.state;
    const f = { ...filter, ...values };
    this.setState({ offset: 0, filter: f });
    this.getPerformers(0, f, limit, getGenre);
  }





  async getPerformers(offset: any, filter: any, limit: any, submit: boolean) {
    const {onFinish: getSuggested} = this.props;
    try {
      this.setState({ fetching: true });
      const resp = await performerService.search({
        limit,
        ...filter,
        offset: limit * offset
      });

      submit && getSuggested(true, resp.data.data, resp.data.total);
      this.setState({ performers: resp.data.data, total: resp.data.total, fetching: false });
      // isSearch(false, resp.data.data);
    } catch {
      message.error('Error occured, please try again later');
      this.setState({ fetching: false });
    }
  }

  async getPerformersByGenre(offset: any, filter: any, limit: any) {
    const {onFinish: getSuggested} = this.props;

    try {
      this.setState({ fetching: true });
      const resp = await videoService.homePageSearch({
        limit,
        ...filter,
        offset: limit * offset
      });
      getSuggested(true, resp.data.data, resp.data.total);
      this.setState({ performers: resp.data.data, total: resp.data.total, fetching: false });
    } catch {
      message.error('Error occured, please try again later');
      this.setState({ fetching: false });
    }
  }

  changeEmptySearchBar(bool){
    const { onFinish: isSearch } = this.props;

    if(bool){
      isSearch(false, [], 0);
    }
    // console.log("changeEmptySearchBar", bool)
    this.setState({openSearchBox: !bool})
    this.setState({isSearchEmpty: bool})
  }

  handleCloseMenu(val){
    this.setState({openNavMenuModal: val})

  }

  // async getSuggestions(vals){

  //   this.setState({showFeaturedArtists: !vals ? true : false});
  //   const { filter, limit } = this.state;
  //   const f = { ...filter, ...vals };
  //   this.setState({ offset: 0, filter: f });
  //   this.getPerformers(0, f, limit, false);
  // }




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


  handleChangePage(path: string){
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentPathCleaned = currentPath.replace(/^\/+|\/+$/g, '');

    this.handleGenreFilter('featured');
    Router.push(path);

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

  shuffleArray(array){
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  handlePressHome(){
    const { selectedGenre } = this.state;
    if(selectedGenre !== "featured"){
      this.handleGenreFilter("featured");
    }
    this.handleChangePage("/");
  }

  openDropDown(val: boolean){
    this.setState({openNavDropDown: val})
  }

  handleScroll = () => {
    const { lastScrollY } = this.state;
    const currentScrollY = window.scrollY;

    // Determine if scrolling up or down
    const isScrollingUp = currentScrollY < lastScrollY;

    // Update header visibility based on scroll direction
    this.setState({
      isHeaderVisible: isScrollingUp || currentScrollY < 100, // Show header when scrolling up or near top
      lastScrollY: currentScrollY,
      scrollNav: currentScrollY > 0,
      scrollTop: currentScrollY > 70
    });
  };

  handleSendEmail = async() => {
    const {account} = this.props;

    let token: IVerifyEmail = {
      source: account,
      sourceType: 'account'
    }

    try{
      await authService.verifyEmail(token)
      message.success("Email verification link sent!")
    }catch(error){
      console.log(error)
    }

  }



  render() {
    const menuVariants = {
      initial: {
        x: 320, // Start from outside the viewport (width + 20px)
        opacity: 0
      },
      animate: {
        x: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 1
        }
      },
      exit: {
        x: 320,
        opacity: 0,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 40,
          mass: 0.8
        }
      }
    };


    const {
      user, account, router, ui, settings, onFinish, onSidebarToggle, setSidebar, isClickedOutside
    } = this.props;
    const {
      isHeaderVisible, openEmailVerifyModal,
      totalNotReadMessage, openNavDropDown, featuredContent, openNavMenuModal, selectedGenre, suggestions, scrollNav, scrollTop, openSearchBox, isSearchEmpty, limit, openGenreSelection, offset, performers, fetching, total, openProfile,
      isMobile, openLogInModal, openSignUpModal, openEmailSignUpModal, musicInfo, countries, username
    } = this.state;
    const referralCode = account?.userReferral;
    const activeSubaccount = account.activeSubaccount || 'user';
    const isUser = activeSubaccount === 'user';
    const isPerformer = activeSubaccount === 'performer';


    const isEmailVerified = !account._id || account?.verifiedEmail ? true : false;

    const headerStyle: React.CSSProperties = {
      transition: '0.3s all ease-in-out',
      transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)',
      position: 'fixed' as const,
      width: '100%',
      zIndex: 30,
      backdropFilter: scrollNav ? 'blur(12px)' : undefined,
      height: isEmailVerified ? isMobile ? '60px' : '80px' : isMobile ? '168px' : '188px',
      background: scrollNav ? '#090909cc' : 'linear-gradient(180deg,rgba(0,0,0,.7) 10%,transparent)'
    };

    return (
      (
        <div className={styles.headerModule}>

          <div style={headerStyle} className={isMobile ? 'main-header-mobile mobile-navbar' : 'main-header'}>
            {/* <Event
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
            /> */}

            <div className="feed-container main-container">

              {!isEmailVerified && (
                <EmailVerificationBanner onVerify={() => this.setState({openEmailVerifyModal: true})} />
              )}
              {/* linear-gradient(177deg, #f602ff33 5%, #cbcbcb00 50%) */}
              <Layout.Header className="header" id="layoutHeader"
              style={navbarBackground(scrollNav, user.isPerformer, openGenreSelection)}>
               {/*  style={{background: !scrollNav ? 'transparent' : 'linear-gradient(177deg, #c8ff0217 5%, #cbcbcb00 50%)'}}> */}
               {/* style={{background: user.isPerformer ? 'linear-gradient(177deg, rgb(2 255 192 / 20%) 5%, rgba(203, 203, 203, 0) 50%)' : 'linear-gradient(177deg, #c8ff0217 5%, #cbcbcb00 50%)'}}> */}
                <div className="nav-bar">


                  <ul className={user._id ? 'nav-icons' : 'nav-icons custom'}>

                  <Link href={'/'} className='my-auto relative  flex cursor-pointer z-[10]'>
                  <Image alt="logo" preview={false} width="140px" className='' src="/static/trax_primary_logotype.svg" />
                  </Link>

                    {/* {!user._id && !isMobile && [
                    <li key="login2" className={router.pathname === '/login' ? 'active btn' : 'btnn'}>
                      <span className="btnn__inner">
                        <span className="btnn__label" data-label="Get in touch" data-hover="Go for it 💪">
                          Get in touch
                          <span className="btnn__label__background"></span>
                        </span>
                      </span>
                      <span className="btnn__background"></span>
                    </li>
                    ]} */}

                    {!isMobile && (
                      <div className='top-nav-container'>
                        <ul className='top-nav-icons-wrapper'>
                        {user._id && isUser && (
                          <li className="relative overflow-hidden rounded-lg">
                              <div
                                  onClick={()=> this.handlePressHome()}
                                  className={`${selectedGenre === 'featured' && router.pathname === '/' ? 'bg-[#ffffff20] backdrop-blur-2xl' : ''} hover:bg-[#ffffff4d] hover:backdrop-blur-2xl transition rounded-lg nav-link ${user._id ? '' : 'logged-out'}`}
                              >
                                  <span className={selectedGenre === 'featured' &&router.pathname === '/' ? 'page-name-active' : 'page-name'}>Home</span>
                              </div>
                          </li>
                        )}

                        {(user._id) && isUser &&(
                        <li >
                            <MultiColumnDropdown isMobile={isMobile} selectedGenre={selectedGenre} onSelect={this.handleGenreFilter.bind(this)}/>
                        </li>
                        )}

                        {user._id && isUser && (
                          <li key="library" className="relative overflow-hidden rounded-lg">
                            <div
                              onClick={() => this.handleChangePage("/user/library")}
                              className={`${router.pathname === '/user/library' || router.pathname === '/user/purchased' ? 'bg-[#ffffff20] backdrop-blur-2xl' : ''} hover:bg-[#ffffff4d] hover:backdrop-blur-2xl transition rounded-lg nav-link`}
                            >
                              <span className={router.pathname === '/user/library' || router.pathname === '/user/purchased' ? 'page-name-active' : 'page-name'}>
                                Library
                              </span>
                            </div>
                          </li>
                        )}

                        {user._id && isPerformer && (
                          <>
                            <li key="content" className="relative overflow-hidden rounded-lg">
                              <div
                                onClick={() => this.handleChangePage("/artist/studio")}
                                className={`${router.pathname === '/artist/studio' ? 'bg-[#ffffff20] backdrop-blur-2xl' : ''} hover:bg-[#ffffff4d] transition hover:backdrop-blur-2xl rounded-lg nav-link`}
                              >
                                <span className={router.pathname === '/artist/studio' ? 'page-name-active' : 'page-name'}>
                                  Studio
                                </span>
                              </div>
                            </li>

                            {<li key="earnings" className="relative overflow-hidden rounded-lg">
                              <div
                                onClick={() => this.handleChangePage("/artist/earnings")}
                                className={`${router.pathname === '/artist/earnings' ? 'bg-[#ffffff20] backdrop-blur' : ''} hover:bg-[#ffffff4d] transition rounded-lg nav-link`}
                              >
                                <span className={router.pathname === '/artist/earnings' ? 'page-name-active' : 'page-name'}>
                                  Earnings
                                </span>
                              </div>
                            </li>}

                            <li key="profile" className="relative overflow-hidden rounded-lg">
                              <div
                                onClick={() => this.handleChangePage(`/artist/profile/?id=${user?.username || user?._id}`)}
                                className={`${router.pathname === '/artist/profile' ? 'bg-[#ffffff20] backdrop-blur' : ''} hover:bg-[#ffffff4d] transition rounded-lg nav-link`}
                              >
                                <span className={router.pathname === '/artist/profile' ? 'page-name-active' : 'page-name'}>
                                  You
                                </span>
                              </div>
                            </li>
                          </>
                        )}
                        </ul>
                      </div>
                    )}

                      {(user._id && isMobile && openGenreSelection) && (
                        <div  className='flex flex-row gap-2 sm:gap-4 w-full justify-end mr-4'>

                          {/* <div onClick={()=> this.handleGenreFilter("featured")} className='py-[5px] px-[1rem] border  rounded-lg bg-[#b3b3b3200] w-fit flex items-center'>
                            <span style={{color: selectedGenre === 'featured' ? "white" : "#b3b3b3", borderColor: selectedGenre === 'featured' ? "white" : "#b3b3b3" }}>Featured</span>
                          </div>
                          <div onClick={()=> this.handleGenreFilter("new")} className='py-[5px] px-[1rem] border  rounded-lg bg-[#b3b3b3200] w-fit flex items-center'>
                            <span style={{color: selectedGenre === 'new' ? "white" : "#b3b3b3", borderColor: selectedGenre === 'new' ? "white" : "#b3b3b3"}}>New</span>
                          </div> */}
                          <div className=' w-fit'>
                              <MultiColumnDropdown isMobile={isMobile} selectedGenre={selectedGenre} onSelect={this.handleGenreFilter.bind(this)}/>
                          </div>
                        </div>
                      )}

                      {!isMobile && isUser && (
                        <div
                        className={` ${user._id ? 'right-8' : 'right-8'} flex relative  rounded-lg hover:bg-[#ffffff20] transition p-2 cursor-pointer`}
                        onClick={()=>  this.setState({openNavDropDown: !openNavDropDown})}
                        >
                          <MagnifyingGlassIcon  className='w-6 h-6'/>
                        </div>
                      )}

                      {!user._id  && [
                        <li key="login2" className={router.pathname === '/login' ? 'active logged-out kr ' : 'logged-out kr'} >
                          {/* <div className='logged-out-link' onClick={()=> this.setState({openLogInModal: true})}>
                             <UserCircleIcon className="logged-out-link-icon"/> <span>Sign In</span>
                          </div> */}
                          <CircleUserRound className='w-7 h-7 my-auto mt-[11px] sm:mt-0 stroke-[1.5]' onClick={()=> this.setState({openLogInModal: true})}/>

                        </li>
                      ]}


                      <DropdownModal isOpen={openNavDropDown} onClose={() => this.setState({openNavDropDown: false})} isMobile={isMobile} isNavigation={true}>
                        <NavigationContents isMobile={isMobile} user={user}/>
                      </DropdownModal>

                    {!isMobile && (
                      <>
                        {user._id && (
                          <li key="avatar" aria-hidden onClick={() => this.setState({ openNavMenuModal: !openNavMenuModal })}>
                            <Avatar className='z-[40]' style={{minWidth: '45px', minHeight: '45px'}} src={user?.avatar || '/static/no-avatar.png'} />
                          </li>
                        )}
                      </>
                    )}
                  </ul>
                </div>
              </Layout.Header>

                <AnimatePresence>
                  {openNavMenuModal && (
                    <motion.div
                      className="nav-menu-wrapper"
                      variants={menuVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <NavMenu ref={this.myRef} onFinish={this.handleOpenModal.bind(this)} onClose={this.handleCloseMenu.bind(this)}/>
                      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                    </motion.div>
                  )}
                </AnimatePresence>

              <SubscribePerformerModal onSubscribed={this.handleSubscribe} />

              <div className='log-in-modal-wrapper'>

              {isMobile ? (
                  <SlideUpModal
                  isOpen={openLogInModal}
                  onClose={() => this.setState(prevState => ({ ...prevState, openLogInModal: false }))}
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
                  // width={600}
                  style={{minWidth: '100vw'}}
                  destroyOnClose
                  onCancel={() => this.setState({ openLogInModal: false })}
                >
                  <LogInModal onFinish={this.handleOpenSignUp.bind(this)}/>
                </Modal>
              )}
              </div>

              <div className='sign-in-modal-wrapper'>
              {isMobile ? (

                  <SlideUpModal
                  isOpen={openSignUpModal}
                  onClose={() => this.setState(prevState => ({ ...prevState, openSignUpModal: false }))}
                  >
                    <SignUpModal onFinish={this.handleOpenModal.bind(this)} username={username}/>
                  </SlideUpModal>


              ):(

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
                  <SignUpModal onFinish={this.handleOpenModal.bind(this)} username={username}/>
                </Modal>

              )}


              </div>
              <Modal
                  key="email-verify"
                  className="subscription-modal border border-[#282828] min-w-[400px]"
                  title={null}
                  open={openEmailVerifyModal}
                  footer={null}
                  width={600}
                  style={{minWidth: '100vw'}}
                  destroyOnClose
                  onCancel={() => this.setState({ openEmailVerifyModal: false })}
                >
                  <div className=' mx-auto px-4 pb-6 pt-8 gap-4 flex flex-col'>

                      <span className='flex justify-center text-trax-white uppercase font-heading font-extrabold text-4xl text-center'>Verify your email</span>
                      <span className='text-base text-trax-gray-300 px-4 text-center'>
                        We've sent a verification link to your email. Can't find it? Check in your spam folder or click below to resend.
                      </span>
                       <div className='flex mx-auto mt-2'>
                       <TraxButton
                        htmlType="button"
                        styleType="primary"
                        buttonSize={"large"}
                        buttonText="Resend email"
                        onClick={() => this.handleSendEmail()}
                      />
                       </div>

                  </div>
                </Modal>
              {/* <div className='nav-menu-modal-wrapper'>
                <Modal
                  key="nav-menu"
                  className="nav-menu-modal"
                  title={null}
                  open={openNavMenuModal}
                  footer={null}
                  width={300}
                  // style={{minWidth: '100vw'}}
                  destroyOnClose
                  onCancel={() => this.setState({ openNavMenuModal: false })}
                >
                  <NavMenu onFinish={this.handleOpenModal.bind(this)} />
                </Modal>
              </div> */}
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
  account: { ...state.user.account },
  ui: { ...state.ui },
  config: { ...state.settings },
  ...state.streaming
});
const mapDispatch = {
  logout, addPrivateRequest, accessPrivateRequest, updateUIValue, updateBalance
};
export default withRouter(connect(mapState, mapDispatch)(NewHeader)) as any;

