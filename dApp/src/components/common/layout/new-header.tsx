/* eslint-disable @typescript-eslint/no-unused-vars */

import { PureComponent, createRef } from 'react';
import {
  Layout, Badge, Drawer, Divider, Avatar, Image, Modal, message
} from 'antd';
import React, { useRef} from "react";
import { connect } from 'react-redux';
import Link from 'next/link';
import {
  IUser, StreamSettings, IUIConfig, ISettings
} from 'src/interfaces';
import { logout } from '@redux/auth/actions';
import Router, { withRouter, Router as RouterEvent } from 'next/router';
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

import styles from './new-header.module.scss';
import { PerformerAdvancedFilter } from '@components/common/base/performer-advanced-filter';
import { performerService, utilsService, videoService } from 'src/services';
import { UserCircleIcon } from '@heroicons/react/24/outline';
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
  // background: (scrollNav) ?  'linear-gradient(177deg, #c8ff0217 5%, #cbcbcb00 50%)' : 'transparent',
  // background: linear-gradient(177deg, #cc550066 5%, rgba(203, 203, 203, 0) 50%);


  // background: (scrollNav) ? (isArtist) ? 'linear-gradient(178deg, rgb(182 2 255 / 22%) 5%, rgba(203, 203, 203, 0) 50%)' : 'linear-gradient(178deg, #c8ff0233 5%, #cbcbcb00 50%)' : '#00000000',

  background: (scrollNav) ? 'linear-gradient(177deg, #c8ff0200 5%, #cbcbcb00 50%)' : '#00000000',
})


const genreSelection = (scrollTop: boolean, isMobile: boolean) => ({
  opacity: (isMobile && scrollTop) && '0',
  transition: `0.5s all ease-in-out`,
});

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
    currency: ''

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
    const { countries, selectedGenre } = this.state;
    const { user } = this.props;

    // if(!user?.currency){
    //   this.getCurrency()
    // }

    window.addEventListener('scroll', this.changeNav);

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
      this.setState({ offset: 0, filter: f, showFeaturedArtists: false });
      this.getPerformersByGenre(0, f, limit);
    }else{
      // this.setState(() => this.updateDataDependencies())
      this.setState({showFeaturedArtists: true});
      vals = {searchValue: '', q: ''}
      this.handleFilter(vals, true);
      // this.updateDataDependencies();
    }



    // const { filter, limit } = this.state;
    // const f = { ...filter, ...vals };
    // this.setState({ offset: 0, filter: f });
    // this.getPerformersByGenre(0, f, limit);
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
    // if(currentPathCleaned !== ''){
    //   Router.push(path);
    // }else{
    //   Router.push('/');
    // }

  }




  render() {
    const {
      user, router, ui, settings, onFinish, onSidebarToggle, setSidebar, isClickedOutside
    } = this.props;
    const {
      totalNotReadMessage, openNavMenuModal, selectedGenre, suggestions, scrollNav, scrollTop, openSearchBox, isSearchEmpty, limit, openGenreSelection, offset, performers, fetching, total, openProfile, isMobile, openLogInModal, openSignUpModal, openEmailSignUpModal, musicInfo, countries
    } = this.state;
    const referralCode = user?.userReferral;


    return (
      (
        <div className={styles.headerModule}>
          <div style={headerBackground(scrollNav)} className={isMobile ? 'main-header-mobile mobile-navbar' : 'main-header'} >
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
{/* linear-gradient(177deg, #f602ff33 5%, #cbcbcb00 50%) */}
              <Layout.Header className="header" id="layoutHeader"
              style={navbarBackground(scrollNav, user.isPerformer, openGenreSelection)}>
               {/*  style={{background: !scrollNav ? 'transparent' : 'linear-gradient(177deg, #c8ff0217 5%, #cbcbcb00 50%)'}}> */}
               {/* style={{background: user.isPerformer ? 'linear-gradient(177deg, rgb(2 255 192 / 20%) 5%, rgba(203, 203, 203, 0) 50%)' : 'linear-gradient(177deg, #c8ff0217 5%, #cbcbcb00 50%)'}}> */}
                <div className="nav-bar">


                  <ul className={user._id ? 'nav-icons' : 'nav-icons custom'}>

                    {!user._id && !isMobile && [
                      <li key="login2" className={router.pathname === '/login' ? 'active logged-out kr ' : 'logged-out kr'} >
                        {/* <div className='logged-out-link' onClick={()=> this.setState({openLogInModal: true})}>
                           <UserCircleIcon className="logged-out-link-icon"/> <span>Sign In</span>
                        </div> */}
                        <HoverBorderGradient
                          containerClassName="rounded-md"
                          as="button"
                          onClick={()=> this.setState({openLogInModal: true})}
                          className="logged-out-link bg-[#A8FF00] tracking-loose text-trax-black font-regular flex items-center  space-x-2 "
                        >

                          {/* <UserCircleIcon className="logged-out-link-icon"/> */} <span className='font-heading uppercase font-bold text-[20px]'>Sign in</span>
                        </HoverBorderGradient>
                      </li>
                    ]}


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
                        {user._id && (
                          <li className={router.pathname === '/' ? 'active' : ''}>
                            <div onClick={()=> this.handleChangePage("/")} className={user._id ? 'nav-link' : 'nav-link logged-out'}>
                              {/* <HomeIconActive className={router.pathname === '/' ? 'active-icon size-6' : 'display-none'} />
                              <HomeIcon className={router.pathname === '/' ? 'display-none' : 'size-6'} /> */}
                              <span className={router.pathname === '/' ? 'page-name-active' : 'page-name'}>Home</span>
                            </div>
                          </li>
                        )}
                        {(user._id) &&(
                        <li>
                            <MultiColumnDropdown isMobile={isMobile} selectedGenre={selectedGenre} onSelect={this.handleGenreFilter.bind(this)}/>
                        </li>
                        )}
                          {user._id && !user.isPerformer && (
                            <li key="wallet_user" className={router.pathname === '/user/wallet' ? 'active' : ''}>
                              <div onClick={()=> this.handleChangePage("/user/wallet")} className='nav-link'>
                                <>
                                  {/* <WalletIconActive className={router.pathname === '/user/wallet' ? 'active-icon size-6' : 'display-none'} />
                                  <WalletIcon className={router.pathname === '/user/wallet' ? 'display-none' : 'size-6'} /> */}
                                  <span className={router.pathname === '/user/wallet' ? 'page-name-active' : 'page-name'} >Wallet</span>
                                  </>
                              </div>
                            </li>
                          )}

                          {user._id && !user.isPerformer && (
                              <li key="library" className={router.pathname === '/user/library' || router.pathname === '/user/purchased' ? 'active' : ''}>
                                <div onClick={()=> this.handleChangePage("/user/library")} className='nav-link'>
                                  <>
                                    {/* <BookmarkIconActive className={router.pathname === '/user/library' ? 'active-icon size-6' : 'display-none'} />
                                    <BookmarkIcon className={router.pathname === '/user/library' ? 'display-none' : 'size-6'} /> */}
                                    <span className={router.pathname === '/user/library' || router.pathname === '/user/purchased' ? 'page-name-active' : 'page-name'}> {router.pathname === '/user/purchased' ? 'Purchased' : 'Library'}</span>
                                  </>
                                </div>
                              </li>
                          )}
                          {user._id && user.isPerformer && (
                            <>
                              <li key="content" className={router.pathname === '/artist/studio' ? 'active' : ''}>
                                <div onClick={()=> this.handleChangePage("/artist/studio")} className='nav-link'>
                                  <>
                                    {/* <VideoCameraIconActive className={router.pathname === '/artist/studio' ? 'active-icon size-6' : 'display-none'} />
                                    <VideoCameraIcon className={router.pathname === '/artist/studio' ? 'display-none' : 'size-6'} /> */}
                                    <span className={router.pathname === '/artist/studio' ? 'page-name-active' : 'page-name'} >Studio</span>
                                  </>
                                </div>
                              </li>
                              <li key="earnings" className={router.pathname === '/artist/earnings' ? 'active' : ''}>
                                <div onClick={()=> this.handleChangePage("/artist/earnings")} className='nav-link'>
                                  <>
                                    {/* <WalletIconActive className={router.pathname === '/artist/earnings' ? 'active-icon size-6' : 'display-none'} />
                                    <WalletIcon className={router.pathname === '/artist/earnings' ? 'display-none' : 'size-6'} /> */}
                                    <span className={router.pathname === '/artist/earnings' ? 'page-name-active' : 'page-name'}>Earnings</span>
                                  </>
                                </div>
                              </li>
                              <li key="profile" className={router.pathname === '/artist/profile' ? 'active' : ''}>
                                <div onClick={()=> this.handleChangePage(`/${user?.username || user?._id}`)} className='nav-link'
                                >
                                  <>
                                    {/* <UserIconActive className={router.pathname === '/artist/profile' ? 'active-icon size-6' : 'display-none'}/>
                                    <UserIcon className={router.pathname === '/artist/profile' ? 'display-none' : 'size-6'}/> */}
                                    <span className={router.pathname === '/artist/profile' ? 'page-name-active' : 'page-name'}>You</span>
                                  </>
                                </div>
                              </li>

                            </>
                          )}
                        </ul>
                      </div>
                    )}

                      {(user._id && isMobile && openGenreSelection) && (
                        <div style={genreSelection(scrollTop, isMobile)} className='flex flex-row-reverse gap-4'>
                          <li className='p-0 left-[11.3rem]'>
                              <MultiColumnDropdown isMobile={isMobile} selectedGenre={selectedGenre} onSelect={this.handleGenreFilter.bind(this)}/>
                          </li>
                          <div onClick={()=> this.handleGenreFilter("featured")} className='py-[0.5rem] px-[1rem] border  rounded-full absolute left-[1rem] top-[3.7rem] m-auto bg-[#b3b3b3200] w-fit'>
                            <span style={{color: selectedGenre === 'featured' ? "white" : "#b3b3b3", borderColor: selectedGenre === 'featured' ? "white" : "#b3b3b3" }}>Featured</span>
                          </div>
                          <div onClick={()=> this.handleGenreFilter("new")} className='py-[0.5rem] px-[1rem] border  rounded-full absolute left-[7rem] top-[3.7rem] m-auto bg-[#b3b3b3200] w-fit'>
                            <span style={{color: selectedGenre === 'new' ? "white" : "#b3b3b3", borderColor: selectedGenre === 'new' ? "white" : "#b3b3b3"}}>New</span>
                          </div>
                        </div>
                      )}

                      <PerformerAdvancedFilter
                        isMobile={isMobile}
                        onSubmit={this.handleFilter.bind(this)}
                        countries={countries}
                        musicInfo={musicInfo}
                        onSearch={this.changeEmptySearchBar.bind(this)}
                        user={user}
                      />

                      {openSearchBox && (
                        <div className='search-box-container'>
                          <div className='search-box-wrapper'>
                            {performers.map((p) => (
                              <Link href={`/${p?.username || p?._id}`} onClick={()=> this.setState({openSearchBox: false})}>
                                <Avatar src={p?.avatar || '/no-avatar.png'}></Avatar>
                                <span className='search-box-artist-name'>{p.name}</span>
                              </Link>
                            ))}
                            {performers.length === 0 && (
                              <span className="search-box-no-res">No artists found.</span>
                            )}
                          </div>
                        </div>
                      )}





                    {!isMobile && (
                      <>
                    {user._id && (
                      <li key="avatar" aria-hidden onClick={() => this.setState({ openNavMenuModal: !openNavMenuModal })}>
                        {user?.avatar ? <Avatar style={{minWidth: '32px', minHeight: '32px'}} src={user?.avatar || '/static/no-avatar.png'} /> : <UserIcon style={{minWidth: '24px', minHeight: '24px', marginTop: '3px'}}/>}


                      </li>
                      )}
                      </>
                    )}

                  </ul>
                </div>
              </Layout.Header>
              {/* {openGenreSelection && (
                <div className='genre-selection-container'>
                  <div className={isMobile ? 'genre-selection-wrapper-mobile' : 'genre-selection-wrapper'} style={{marginLeft: !isMobile && (setSidebar ? "4.6rem" : "0rem")}}>
                    {musicInfo?.activeTags.data.map((genre) => (
                      <span className={selectedGenre === genre.value ? 'genre-selected-item' : 'genre-selection-item'} onClick={()=> this.handleGenreFilter(genre.value)}>
                        {genre.text}
                      </span>
                    ))}
                  </div>
                </div>
              )} */}
              {/* {openGenreSelection && (
                <DropdownGenres genres={musicInfo?.activeTags.data} onSelect={this.handleGenreFilter.bind(this)}/>
              )} */}

              {(openNavMenuModal) &&(
                <div  className='nav-menu-wrapper'>
                  <NavMenu ref={this.myRef} onFinish={this.handleOpenModal.bind(this)} onClose={this.handleCloseMenu.bind(this)}/>
                  {/* <BackgroundBeams/> */}
                 <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                </div>
              )}

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
  ui: { ...state.ui },
  config: { ...state.settings },
  ...state.streaming
});
const mapDispatch = {
  logout, addPrivateRequest, accessPrivateRequest, updateUIValue, updateBalance
};
export default withRouter(connect(mapState, mapDispatch)(NewHeader)) as any;

