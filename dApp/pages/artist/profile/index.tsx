/* eslint-disable react/sort-comp, no-nested-ternary */
import { Alert } from "antd";
import { getFeeds, moreFeeds, removeFeedSuccess } from "@redux/feed/actions";
import { getGalleries, moreGalleries } from "@redux/gallery/actions";
import { listProducts, moreProduct } from "@redux/product/actions";
import { listTickets, moreTicket } from "@redux/ticket/actions";
import { updateBalance } from "@redux/user/actions";
import { getVideos, moreVideo } from "@redux/video/actions";
import { Avatar, Button, Image as Img, Layout, Modal, Progress, Tabs, Tooltip, message, Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import { PureComponent } from "react";
import { connect } from "react-redux";
import { cryptoService } from '@services/crypto.service';
import { debounce } from 'lodash';
import Head from "next/head";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  authService,
  feedService,
  followService,
  nftService,
  paymentService,
  performerService,
  tokenTransctionService,
  utilsService,
  subscriptionService,
  routerService,
} from "src/services";
import { DollarOutlined } from "@ant-design/icons";

import { ConfirmSubscriptionPerformerForm } from "@components/performer";
import TipPerformerForm from "@components/performer/TipPerformerForm";
import { PerformerInfo } from "@components/performer/table-info";

import { ScrollListVideo } from "@components/video/scroll-list-item";
import { ScrollListMusic } from "@components/video/scroll-list-music";

import Error from "next/error";
import Link from "next/link";
import Router from "next/router";
import { Parallax, ParallaxBanner } from "react-scroll-parallax";

import { ICountry, IFeed, IPerformer, ISettings, IUIConfig, IUser, IAccount } from "src/interfaces";

import { FastAverageColor } from "fast-average-color";
import { Principal } from "@dfinity/principal";
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { AccountIdentifier } from "@dfinity/nns";
import { IDL } from "@dfinity/candid";
import { AccountBalanceArgs } from "@dfinity/nns/dist/candid/ledger";
import { idlFactory as idlFactoryLedger } from 'src/smart-contracts/declarations/ledger/ledger.did.js';
import type { _SERVICE as _SERVICE_LEDGER } from 'src/smart-contracts/declarations/ledger/ledger2.did';
import type {
  _SERVICE as _SERVICE_TIPPING,
  TippingParticipants,
  Participants,
} from "../../../src/smart-contracts/declarations/tipping/tipping2.did";
import { TransferArgs, Tokens, TimeStamp } from "src/smart-contracts/declarations/ledger/ledger2.did";
import styles from "../../../src/components/performer/performer.module.scss";

import { idlFactory as idlFactoryTipping } from "../../../src/smart-contracts/declarations/tipping/tipping.did.js";
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import PaymentProgress from '../../../src/components/user/payment-progress';

import {
  requestConnectPlug,
  tipCrypto,
} from "../../../src/crypto/transactions/plug-tip";
import { getPlugWalletIsConnected, getPlugWalletAgent, getPlugWalletProvider, getPrincipalId, createPlugwalletActor } from '../../../src/crypto/mobilePlugWallet';

import TraxButton from "@components/common/TraxButton";
import FollowNotification from "@components/common/layout/FollowNotification";
import { AnimatePresence, motion } from "framer-motion";
import { Sheet } from 'react-modal-sheet';
import Confetti from "react-dom-confetti";
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

interface IProps {
  ui: IUIConfig;
  error: any;
  user: IUser;
  account: IAccount;
  performer: IPerformer;
  listProducts: Function;
  listTickets: Function;
  getVideos: Function;
  moreVideo: Function;
  moreProduct: Function;
  moreTicket: Function;
  videoState: any;
  productState: any;
  ticketState: any;
  getGalleries: Function;
  moreGalleries: Function;
  galleryState: any;
  feedState: any;
  getFeeds: Function;
  moreFeeds: Function;
  removeFeedSuccess: Function;
  updateBalance: Function;
  countries: ICountry[];
  settings: ISettings;
}

const { TabPane } = Tabs;


const initialFilter = {
  q: "",
  fromDate: "",
  toDate: "",
};


const initial_1 = { opacity: 0, y: 0 };
const animate_1 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 1.3,
    delay: 0.3,
    ease: "easeOut",
    once: true,
  },
}
const initial_2 = { opacity: 0, y: 20 };
const animate_2 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.5,
    delay: 0.4,
    ease: "easeOut",
    once: true,
  },
}

const animate_3 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.5,
    delay: 0.6,
    ease: "easeOut",
    once: true,
  },
}

const animate_4 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.5,
    delay: 0.9,
    ease: "easeOut",
    once: true,
  },
}

class PerformerProfile extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  state = {
    itemPerPage: 100,
    videoPage: 0,
    productPage: 0,
    ticketPage: 0,
    feedPage: 0,
    galleryPage: 0,
    openTipModal: false,
    openTipSuccessModal: false,
    submiting: false,
    isBookMarked: false,
    requesting: false,
    openSubscriptionModal: false,
    tab: "video",
    activeTab: "music",
    filter: initialFilter,
    isGrid: false,
    subscriptionType: 'monthly',
    isFollowed: false,
    colorHex: "",
    isDesktop: false,
    openTipProgressModal: false,
    tipProgress: 0,
    nfts: [],
    loadNft: false,
    performer: null,
    countries: null,
    dataLoaded: false,
    isOpenFollowersModal: false,
    isOpenSubscribersModal: false,
    _videos: [],
    music: [],
    isMobile: false,
    confetti: false,
    showFollowNotification: false,
    showFollowModal: false,
    openCancelSubscriptionModal: false,
    rootUrl: '',
    applePaymentUrl: ''
  };

  async getData() {
    try {
      const url = new URL(window.location.href);

      // First try to get ID from search params
      let id = url.searchParams.get("id");

      // If ID is not in search params, try to extract from pathname
      if (!id) {
        // Extract the last part of the pathname (after the last slash)
        const pathParts = url.pathname.split('/').filter(part => part);
        if (pathParts.length > 0) {
          id = pathParts[pathParts.length - 1];
        }
      }

      const [performer, countries] = await Promise.all([
        performerService.findOne(id as string, {
          Authorization: authService.getToken() || "",
        }),
        utilsService.countriesList(),
      ]);

      return {
        performer: performer?.data,
        countries: countries?.data || [],
      };
    } catch (e) {
      if (e.message === 'Entity is not found') {
        message.error("Artist not found.");
      }
      return {
        performer: null,
        countries: null,
      };
    }
  }

  getRootUrl = () => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const host = window.location.host;
      return `${protocol}//${host}`;
    }
    return process.env.USER_URL || '';
  };

  async componentDidMount() {
    const { performer } = this.state;
    const rootUrl = this.getRootUrl();
    console.log('Profile page rootUrl:', rootUrl);
    const token = authService.getToken();

    const urlParams = new URLSearchParams(window.location.search);
    const currentUrl = window.location.href;
    const newUrl = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}mobileToken=${token}&openPaymentModal=true`;

    const openPaymentModal = urlParams.get('openPaymentModal') === 'true';

    this.setState({ rootUrl, applePaymentUrl: newUrl, openTipModal: openPaymentModal });

    if (performer === null) {
      const data = await this.getData();
      await routerService.changeUrlPath();
      this.setState({
        performer: data.performer,
        countries: data.countries,
        dataLoaded: true
      }, () => {
        this.updateDataDependencies();
        // Force a re-render of meta tags
        if (typeof window !== 'undefined') {
          console.log('Removing existing meta tags...');
          const head = document.getElementsByTagName('head')[0];
          const metaTags = head.getElementsByTagName('meta');
          let removedCount = 0;
          for (let i = 0; i < metaTags.length; i++) {
            if (metaTags[i].getAttribute('property')?.startsWith('og:') ||
                metaTags[i].getAttribute('name')?.startsWith('twitter:')) {
              console.log('Removing meta tag:', metaTags[i].getAttribute('property') || metaTags[i].getAttribute('name'));
              metaTags[i].remove();
              removedCount++;
            }
          }
          console.log(`Removed ${removedCount} meta tags`);
        }
      });
    } else {
      this.updateDataDependencies();
      routerService.changeUrlPath();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.openTipModal && this.state.openTipModal) {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios") {
        this.openPaymentPage();
      }
    }
  }

  animateButton = (e) => {
    e.preventDefault();

    // Reset animation
    e.target.classList.remove('animate');

    e.target.classList.add('animate');
    setTimeout(function(){
      e.target.classList.remove('animate');
    }, 700);
  };

  async updateDataDependencies() {
    const { performer } = this.state;
    const { settings } = this.props;
    if (performer === null) return;
    this.checkWindowInnerWidth();
    window.addEventListener("resize", this.updateMedia);
    () => window.removeEventListener("resize", this.updateMedia);

    this.setState(
      {
        dataLoaded: true,
        isBookMarked: performer.isBookMarked,
        isFollowed: !!performer.isFollowed,
        isDesktop: window.innerWidth > 500,
      },
      () => {
        this.loadItems();
        this.getColorImage();
      }
    );
    // const nfts = await nftService.getArtistNfts(performer.account?.wallet_icp);
    // this.setState({ nfts, loadNft: false });
  }

  checkWindowInnerWidth = () => {
    this.setState({ isDesktop: window.innerWidth > 500 });
    this.setState({ isMobile: window.innerWidth < 640});
    window.addEventListener("resize", this.updateMedia);
    return () => window.removeEventListener("resize", this.updateMedia);
  };

  updateMedia = () => {
    this.setState({ isMobile: window.innerWidth < 640});
    this.setState({ isDesktop: window.innerWidth > 500 });
  };

  async handleDeleteFeed(feed: IFeed) {
    const { user, removeFeedSuccess: handleRemoveFeed } = this.props;
    if (user._id !== feed.fromSourceId) {
      message.error("Permission denied");
      return;
    }
    if (!window.confirm("All earnings are related to this post will be refunded. Are you sure to remove?")) {
      return;
    }
    try {
      await feedService.delete(feed._id);
      message.success("Deleted post success");
      handleRemoveFeed({ feed });
    } catch {
      message.error("Something went wrong, please try again later");
    }
  }

  handleFollow = async () => {
    const { user } = this.props;
    const { performer } = this.state;
    if (performer === null) return;
    const { isFollowed, requesting, tab } = this.state;
    if (!user._id) {
      message.error("Please log in or register!");
      return;
    }
    if (requesting || user.isPerformer) return;
    try {
      this.setState({ requesting: true });
      if (!isFollowed) {
        this.setState({ showFollowModal: false })
        await followService.create(performer?._id);
        this.setState({ isFollowed: true, requesting: false });
        // this.openFollowNotification();
      } else {
        await followService.delete(performer?._id);
        this.setState({ isFollowed: false, requesting: false });
        // this.closeFollowNotification()
      }
      if (tab === "post") {
        this.loadItems();
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || "An error occured, please try again later");
      this.setState({ requesting: false });
    }
  };

  openFollowNotification = () => {
    this.setState({ showFollowNotification: true });
  };

  closeFollowNotification = () => {
    this.setState({ showFollowNotification: false });
  };

  async handleFilterSearch(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.loadItems();
  }

  handleJoinStream = () => {
    const { user } = this.props;
    const { performer } = this.state;
    if (performer === null) return;
    if (!user._id) {
      message.error("Please log in or register!");
      return;
    }
    if (user.isPerformer) return;
    if (!performer?.isSubscribed) {
      message.error("Please subscribe to this artist!");
      return;
    }
    Router.push(
      {
        pathname: `/streaming/details?id=${performer?.username || performer?._id}`,
      },
      `/streaming/details?id=${performer?.username || performer?._id}`
    );
  };

  async loadItems() {
    const {
      getGalleries: handleGetGalleries,
      getVideos: handleGetVids,
      getFeeds: handleGetFeeds,
      listProducts: handleGetProducts,
      listTickets: handleGetTickets,
    } = this.props;
    const { performer } = this.state;
    if (performer === null) return;
    const { itemPerPage, filter, tab } = this.state;
    const query = {
      limit: itemPerPage,
      offset: 0,
      performerId: performer?._id,
      q: filter.q || "",
      fromDate: filter.fromDate || "",
      toDate: filter.toDate || ""
    };
    switch (tab) {
      case "post":
        this.setState({ feedPage: 0 }, () =>
          handleGetFeeds({
            ...query,
          })
        );
        break;
      case "photo":
        this.setState({ galleryPage: 0 }, () =>
          handleGetGalleries({
            ...query,
          })
        );
        break;
      case "video":
        this.setState({ videoPage: 0 }, () =>
          handleGetVids({
            ...query,
          })
        );
        break;
      case "store":
        this.setState({ productPage: 0 }, () =>
          handleGetProducts({
            ...query,
          })
        );
        break;
      case "events":
        this.setState({ ticketPage: 0 }, () =>
          handleGetTickets({
            ...query,
          })
        );
        break;
      default:
        break;
    }
  }

  async subscribe(currency: string, subType: string, express: boolean) {

    console.log("in subscribe from profile page", subType, express)
    try {
      await this.subscribeFiat(subType, express);

    } catch (error) {
      message.error(error?.message || 'Subscription failed');
    }
  }

  async subscribeFiat(subType: string, express: boolean) {
    console.log("in subscribeFiat from profile page", subType, express)
    const { user, settings } = this.props;
    const { performer } = this.state;
    if (performer === null) return;
    if (!user._id) {
      message.error("Please log in!");
      Router.push("/login");
      return;
    }
    if(!express){

      if (settings.paymentGateway === "stripe" && !user.stripeCardIds.length) {
        message.error("Please add a payment card");
        Router.push("/user/account");
        return;
      }
      try {
        this.setState({ submiting: true });
        const resp = await paymentService.subscribePerformer({
          type: subType,
          performerId: performer._id,
          paymentGateway: settings.paymentGateway,
        });
        if (resp?.data?.stripeConfirmUrl) {
          window.location.href = resp?.data?.stripeConfirmUrl;
          return;
        }
        if (settings.paymentGateway === "-ccbill") {
          window.location.href = resp?.data?.paymentUrl;
          return;
        }

        this.setState({ openSubscriptionModal: false });

        window.location.reload();
        message.success(`Subscription successfull! You are now a member of ${performer?.name}'s channel`);

      } catch (e) {
        const err = await e;
        message.error(err.message || "error occured, please try again later");
        this.setState({ openSubscriptionModal: false, submiting: false });
      } finally {
        this.setState({ submiting: false });
      }
  }
  }

  /*async subscribeCrypto(currency: string, subType: string) {
    const { user } = this.props;
    const { performer } = this.state;
    if (performer === null) return;

    if (!user._id) {
      message.error("Please log in!");
      Router.push("/login");
      return;
    }
    try {
      let type: SubType;
      let amount: number;

      if (subType === "monthly") {
        type = { monthly: null };
        amount = performer?.monthlyPrice;
      } else if (subType === "yearly") {
        type = { yearly: null };
        amount = performer?.yearlyPrice;
      } else {
        // if subType === free
        type = { monthly: null };
        amount = performer?.monthlyPrice;
      }
      this.setState({ submiting: true });
      // artist: ArtistID, fan: FanID, priceOfSub: Float, ticker: Ticker, period: SubType, freeTrial: Bool
      await subscriptions.subscribe(
        Principal.fromText(performer.account?.wallet_icp),
        Principal.fromText(user.account?.wallet_icp),
        amount,
        currency,
        type
      );

      this.setState({ openSubscriptionModal: false });
      message.success(`Payment successfull! You are now a subscriber to ${performer?.name}`);
    } catch (e) {
      const err = await e;
      message.error(err.message || "error occured, please try again later");
      this.setState({ openSubscriptionModal: false, submiting: false });
    } finally {
      this.setState({ submiting: false });
    }
  }*/

  async sendTip(price: number, ticker: string, paymentOption: string) {
    if (ticker === "USD") {
      await this.sendTipFiat(price);
    } else {
      await this.beforeSendTipPlug(price, ticker);
    }
  }

  async sendTipFiat(price: number) {
    const { user, updateBalance: handleUpdateBalance } = this.props;
    const { performer } = this.state;
    if (performer === null) return;
    // if (user.balance < price) {
    //   message.error("You have an insufficient wallet balance. Please top up.");
    //   Router.push("/user/wallet/");
    //   return;
    // }
    try {
      this.setState({ requesting: true });
      await tokenTransctionService.sendTip(performer?._id, { performerId: performer?._id, price });
      message.success(`Thank you for supporting ${performer.name}! Your tip has been sent successfully`, 5);
      handleUpdateBalance({ token: -price });
    } catch (e) {
      const err = await e;
      message.error(err.message || "error occured, please try again later");
    } finally {
      this.setState({ requesting: false, openTipModal: false });
    }
  }


  async beforeSendTipPlug(amount: number, ticker: string) {
    const { settings } = this.props;
    const { performer } = this.state;

    try {
      this.setState({
        tipProgress: 0,
        openTipModal: true,
        tipStatus: '',
        requesting: true,
        submiting: true,
        openTipProgressModal: true
      });

      const participant: any = [{
        participantID: Principal.fromText(performer.account?.wallet_icp),
        participantPercentage: 1.0
      }];

      const res = await tipCrypto(
          participant,
          amount,
          ticker,
          settings,
          performer,
          (update) => {
            console.log(update)
              this.setState({
                  tipProgress: update.progress,
              });
          }
      );

      if (res) {
          this.setState({requesting: false, submiting: false, confetti: true });
          this.setState({openTipModal: false});
          message.success('Tip sent successfully!');
      }
    } catch (error) {
      this.setState({openTipModal: false, requesting: false, submiting: false });
      message.error(error.message);
    }

  }

  async loadMoreItem() {
    const { feedPage, videoPage, productPage, ticketPage, itemPerPage, galleryPage, tab, filter } = this.state;
    const {
      moreFeeds: getMoreFeed,
      moreVideo: getMoreVids,
      moreProduct: getMoreProd,
      moreTicket: getMoreTick,
      moreGalleries: getMoreGallery,
    } = this.props;
    const { performer } = this.state;
    if (performer === null) return;
    const query = {
      limit: itemPerPage,
      performerId: performer._id,
      q: filter.q || "",
      fromDate: filter.fromDate || "",
      toDate: filter.toDate || ""
    };
    if (tab === "post") {
      this.setState(
        {
          feedPage: feedPage + 1,
        },
        () =>
          getMoreFeed({
            ...query,
            offset: (feedPage + 1) * itemPerPage,
          })
      );
    }
    if (tab === "video") {
      this.setState(
        {
          videoPage: videoPage + 1,
        },
        () =>
          getMoreVids({
            ...query,
            offset: (videoPage + 1) * itemPerPage,
          })
      );
    }
    if (tab === "photo") {
      await this.setState(
        {
          galleryPage: galleryPage + 1,
        },
        () => {
          getMoreGallery({
            ...query,
            offset: (galleryPage + 1) * itemPerPage,
          });
        }
      );
    }
    if (tab === "store") {
      this.setState(
        {
          productPage: productPage + 1,
        },
        () =>
          getMoreProd({
            ...query,
            offset: (productPage + 1) * itemPerPage,
          })
      );
    }
    if (tab === "events") {
      this.setState(
        {
          ticketPage: ticketPage + 1,
        },
        () =>
          getMoreTick({
            ...query,
            offset: (ticketPage + 1) * itemPerPage,
          })
      );
    }
  }

  getColorImage() {
    const fac = new FastAverageColor();
    const img = new Image();
    img.crossOrigin = "anonymous";

    const {
      performer: { cover: imgSrc },
    } = this.state;

    img.src = imgSrc;

    fac
      .getColorAsync(img, { algorithm: "dominant" })
      .then(color => {
        this.setState({ colorHex: color.hex });
        return color.hex;
      })
      .catch(() => {});
  }

  closeSubModal(val){
    this.setState({openSubscriptionModal: val})
  }

  handleSubscriptionBtn = () => {
    this.state.performer?.isSubscribed
    ? this.setState({openCancelSubscriptionModal: true})
    : this.setState({ openSubscriptionModal: true, subscriptionType: "monthly" })
  }


  async cancelSubscription(){
    const {user} = this.props;
    const {performer} = this.state;
    // if (!window.confirm('Are you sure you want to cancel this subscription!')) return;
    const subInfo = await subscriptionService.userSearch({
      userId: user._id,
      performerId: performer._id
    });

    try {
      await subscriptionService.cancelSubscription(subInfo.data.data._id, subInfo.data.data.paymentGateway);
      message.success('Subscription cancelled successfully');
    } catch (e) {
      message.error(e?.message || 'Error occurred, please try again later');
    }
  };

  async openPaymentPage() {
    let { applePaymentUrl } = this.state;
    if (!applePaymentUrl) return;

    applePaymentUrl = applePaymentUrl.replace(/^capacitor:\/\/localhost/, '').replace(/^\/+/, '');

    const baseDomain = "https://trax.so";

    if (!applePaymentUrl.startsWith("http://") && !applePaymentUrl.startsWith("https://")) {
        applePaymentUrl = `${baseDomain}/${applePaymentUrl}`;
    }

    try {
      //await Browser.open({ url: applePaymentUrl });
      window.open(applePaymentUrl, '_blank');
    } catch (error) {
      console.error("Failed to open browser:", error);
    }
  }

  render() {
    const { error, ui, user, account, feedState, videoState, productState, settings, ticketState } = this.props;
    const { performer, countries, dataLoaded, rootUrl } = this.state;

    if (dataLoaded === false) {
      return (
        <div style={{ margin: 30, textAlign: "center" }}>
          <img src="/static/trax_loading_optimize.gif" alt="Loading..." className='w-28 m-auto'/>
        </div>
      );
    }

    if (error || performer === null || performer.length === 0) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || "Artist not found"} />;
    }

    // Construct absolute URLs for images
    const avatarUrl = performer?.avatar ? `${rootUrl}${performer.avatar}` : `${rootUrl}/static/no-avatar.png`;
    const coverUrl = performer?.cover ? `${rootUrl}${performer.cover}` : `${rootUrl}/static/placeholder-cover-image.jpg`;
    const profileUrl = `${rootUrl}/artist/${performer?.username || performer?._id}`;

    console.log('Profile URLs:', {
      avatarUrl,
      coverUrl,
      profileUrl,
      rootUrl,
      performerAvatar: performer?.avatar,
      performerCover: performer?.cover
    });

    // Log all meta tags before rendering
    if (typeof window !== 'undefined') {
      const head = document.getElementsByTagName('head')[0];
      const metaTags = head.getElementsByTagName('meta');
      console.log('Current meta tags before render:', Array.from(metaTags).map(tag => ({
        property: tag.getAttribute('property'),
        name: tag.getAttribute('name'),
        content: tag.getAttribute('content')
      })));
    }

    const { items: feeds = [], total: totalFeed = 0, requesting: loadingFeed } = feedState;
    const { items: videos = [], total: totalVideos = 0, requesting: loadingVideo } = videoState;
    const { items: products = [], total: totalProducts = 0, requesting: loadingPrd } = productState;
    const { items: tickets = [], total: totalTickets = 0, requesting: loadingTick } = ticketState;
    const {
      openTipModal,
      openTipSuccessModal,
      submiting,
      openSubscriptionModal,
      tab,
      isGrid,
      subscriptionType,
      isFollowed,
      isDesktop,
      isMobile,
      colorHex,
      openTipProgressModal,
      tipProgress,
      showFollowModal,
      nfts,
      activeTab,
      loadNft,
      _videos,
      music,
      confetti,
      openCancelSubscriptionModal
    } = this.state;
    const activeSubaccount = account.activeSubaccount || 'user';
    const isUser = activeSubaccount === 'user';
    const isPerformer = activeSubaccount === 'performer';


    return (
      <Layout
        className={styles.componentsPerformerVerificationFormModule}
        style={{
          borderRadius: isPerformer ? '0.5rem' : '0',
          marginTop: isPerformer ? 0 : -80,
          backgroundColor: performer?.backgroundColor || '#0e0e0e'
        }}
        // `linear-gradient(180deg, #0e0e0e 25%, ${performer?.backgroundColor} 50%, transparent 100%)`
        // style={{
        //   background: `${
        //     isDesktop
        //       ? !user.isPerformer
        //         ? `linear-gradient(${colorHex} 27rem, #000000 40rem)`
        //         : `linear-gradient(${colorHex} 27rem, #000000 40rem)`
        //       : !user.isPerformer
        //         ? "#000000"
        //         : "#000000"
        //   }`,
        // }}
      >
        <Head>
          <title>{`${ui?.siteName} | ${performer?.name || performer?.username}`}</title>
          <meta name="keywords" content={`${performer?.username}, ${performer?.name}`} />
          <meta name="description" content={`Follow ${performer.name} on TRAX and stay up-to-date with their latest releases`} />
          {/* OG tags */}
          <meta property="og:type" content="profile" />
          <meta property="og:title" content={`${performer?.name || performer?.username} | ${ui?.siteName}`} />
          <meta property="og:image" content={performer.avatar || performer.cover} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:description" content={`Follow ${performer.name} on TRAX and stay up-to-date with their latest releases`} />
          <meta property="og:url" content={profileUrl} />
          <meta property="og:site_name" content={ui?.siteName} />
          {/* Twitter tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${performer?.name || performer?.username} | ${ui?.siteName}`} />
          <meta name="twitter:image" content={performer.avatar || performer.cover} />
          <meta name="twitter:description" content={`Follow ${performer.name} on TRAX and stay up-to-date with their latest releases`} />
        </Head>
        <motion.div initial={initial_1} animate={animate_1} className="top-profile">
          <ParallaxBanner
            layers={[{ image: `${performer?.cover || "/static/placeholder-cover-image.jpg"}`, scale: [1.1, 1], speed: -14 }]}
            className={`parallax-banner-profile ${isPerformer ? 'rounded-lg' : ''}`}
            style={{ '--background-color': performer?.backgroundColor || '#0e0e0e' } as React.CSSProperties}
          >
            <div className="bg-2nd" >
              <div className="top-banner"/>
            </div>
          </ParallaxBanner>
        </motion.div>
        <div className="main-profile">
          <div className="" style={{ width: "95% !important", maxWidth: "unset", margin: 'unset' }}>
            <FollowNotification
              visible={this.state.showFollowNotification}
              closeNotification={this.closeFollowNotification}
              artist={performer?.name}
            />
            <div className={!user._id ? "fl-col fl-col-not-logged" : "fl-col"}>
              <Parallax speed={-0.8} easing="easeInQuad">
                {user._id && isUser && account?.performerId !== performer._id && (
                  <motion.div initial={initial_2} animate={animate_3} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pb-12">
                    <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                      <TraxButton
                        htmlType="button"
                        styleType="primaryPerformer"
                        buttonSize={!isMobile? "large" : 'full'}
                        buttonText={performer?.isSubscribed ? "Subscribed" : "Subscribe"}
                        disabled={!user._id}
                        isActive={performer?.isSubscribed}
                        onClick={() => this.handleSubscriptionBtn()}
                        color={performer?.themeColor || '#A8FF00'}
                      />
                    </div>
                    <div className="w-full sm:w-auto flex justify-center sm:justify-start sm:gap-4 gap-3">
                      <TraxButton
                        htmlType="button"
                        styleType="secondaryPerformer"
                        buttonSize={isMobile ? "full" : "medium"}
                        buttonText={isFollowed ? "Following" : "Follow"}
                        disabled={!user._id}
                        isActive={isFollowed}
                        onClick={() => !isFollowed ? this.setState({showFollowModal: true}) : this.handleFollow()}
                        color={performer?.themeColor || '#A8FF00'}
                      />
                      <TraxButton
                        htmlType="button"
                        styleType="secondaryPerformer"
                        buttonSize={isMobile ? "full" : "medium"}
                        buttonText="Support"
                        disabled={!user._id || user.isPerformer}
                        onClick={() => this.setState({ openTipModal: true })}
                        color={performer?.themeColor || '#A8FF00'}
                      />
                    </div>
                  </motion.div>
                )}
              </Parallax>
              <div className={user.isPerformer ? "m-user-name-artist" : "m-user-name"}>
                <div className="profile-heading-col">
                  <Parallax speed={0} easing="easeInQuad">
                    <motion.h4
                    initial={initial_2}
                    animate={animate_2}
                    className="uppercase tracking-tight"
                    style={{
                      color: performer?.themeColor || "#A8FF00",
                       }}>
                      {performer?.name || "N/A"}
                    </motion.h4>
                    <motion.div initial={initial_2} animate={animate_3} className="follow-sub-stats-container">
                      <div className={`follow-sub-stats-wrapper ${user.isPerformer ? 'pb-12' : 'pb-0'}`}>
                        {user._id == performer._id && (
                            <Link href="/artist/account" className="edit-profile-link" style={{ '--theme-color': performer?.themeColor || '#A8FF00' } as React.CSSProperties}>
                              Edit profile
                            </Link>
                        )}
                      </div>
                    </motion.div>
                  </Parallax>
                </div>
              </div>
            </div>
          </div>
        </div>
        {user.isPerformer && <div style={{ marginTop: `${isDesktop ? "15px" : "-4px"}` }} />}

        <div className="" style={{ width: "95% !important", maxWidth: "unset" }}>
          <motion.div initial={initial_2} animate={animate_4} className="artist-content"
          style={{willChange: 'unset !important', background: `linear-gradient(0deg, #0e0e0e, transparent)`, minHeight: '60vh'}}>
            <div className="line-divider"/>
            <Tabs
              defaultActiveKey="music"
              className="profile-tabs"
              style={{ '--theme-color': performer?.themeColor || '#A8FF00' } as React.CSSProperties}
              size="large"
              onTabClick={(t: string) => {
                this.setState({ tab: t, filter: initialFilter, isGrid: false, activeTab: t }, () => this.loadItems());
              }}
            >

              <TabPane
                key="music"
                className="posts-tab-wrapper"
                tab={ isMobile ? "Music" :
                  <div className="flex flex-row">
                    <span style={activeTab === "music" ? { color: performer?.themeColor || '#A8FF00' } : {color: '#7a7a7a'}}>Music</span>
                    <div
                    className={`absolute right-2 bg-[#414141B2] rounded-lg ${activeTab === "music" ? "border" : ""}`}
                    style={activeTab === "music" ? { borderColor: performer?.themeColor || '#A8FF00' } : undefined}
                    >
                      <ChevronRightIcon
                      className={`w-7 h-7 ${activeTab !== "music" ? "text-trax-white" : ""}`}
                      style={activeTab === "music" ? { color: performer?.themeColor || '#A8FF00' } : undefined}/>
                    </div>
                  </div>
                }>

                  <ScrollListMusic
                    user={user}
                    isProfileGrid={true}
                    items={videos.filter((video) => video.trackType === "audio")}
                    loading={loadingVideo}
                    canLoadmore={videos && videos.length < totalVideos}
                    loadMore={this.loadMoreItem.bind(this)}
                    performerThemeColor={performer?.themeColor || '#A8FF00'}
                  />
              </TabPane>

              <TabPane
                key="video"
                className="posts-tab-wrapper"
                tab={ isMobile ? "Video" :
                  <div className="flex flex-row">
                    <span style={activeTab === "video" ? { color: performer?.themeColor || '#A8FF00' } : {color: '#7a7a7a'}}>Video</span>
                    <div
                    className={`absolute right-2 bg-[#414141B2] rounded-lg ${activeTab === "video" ? `border` : ""}`}
                    style={activeTab === "video" ? { borderColor: performer?.themeColor || '#A8FF00' } : undefined}>
                      <ChevronRightIcon
                      className={`w-7 h-7 ${activeTab !== "video" ? 'text-trax-white' : ''}`}
                      style={activeTab === "video" ? { color: performer?.themeColor || '#A8FF00' } : undefined}/>
                    </div>
                  </div>
                }>
                  <ScrollListVideo
                    user={user}
                    isProfileGrid={true}
                    isDesktop={isDesktop}
                    items={videos.filter((video) => video.trackType === "video")}
                    loading={loadingVideo}
                    canLoadmore={videos && videos.length < totalVideos}
                    loadMore={this.loadMoreItem.bind(this)}
                  />
              </TabPane>

              <TabPane tab={ isMobile ? "About" :
                  <div className="flex flex-row">
                    <span style={activeTab === "about" ? { color: performer?.themeColor || '#A8FF00' } : {color: '#7a7a7a'}}>About</span>
                    <div
                    className={`absolute right-2 bg-[#414141B2] rounded-lg ${activeTab === "about" ? `border` : ""}`}
                    style={activeTab === "about" ? { borderColor: performer?.themeColor || '#A8FF00' } : undefined}
                    >
                      <ChevronRightIcon
                      className={`w-7 h-7 ${activeTab !== "about" ? 'text-trax-white' : ''}`}
                      style={activeTab === "about" ? { color: performer?.themeColor || '#A8FF00' } : undefined}
                      />
                    </div>
                  </div>
                } key="about" className="posts-tab-wrapper">
                <div className="about-container">
                  <div className="about-wrapper">
                    <div className="about-metrics">
                      <div className={user.isPerformer ? 'mar-0 pro-desc' : 'pro-desc'}>

                      <div className="about-img">
                        <img src={performer?.avatar || '/static/no-avatar.png'}/>
                      </div>

                      </div>
                    </div>
                    <div className="about-intro">
                      <p className="bio">{performer?.bio}</p>
                      <PerformerInfo countries={countries} performer={performer} />
                    </div>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </motion.div>
        </div>

        <Modal
          key="follow_performer"
          className="subscription-modal border border-[#282828]"
          open={showFollowModal}
          centered
          onOk={() => this.setState({ showFollowModal: false })}
          footer={null}
          title={null}
          onCancel={() => this.setState({ showFollowModal: false })}
        >
          <div className="text-trax-white mx-auto px-4 pb-6 pt-16 gap-4 flex flex-col">
            <span className="flex justify-center uppercase font-heading font-extrabold text-5xl text-center"
            style={{ color: performer?.themeColor || '#A8FF00' }}>
              Communication Consent
            </span>
            <span className="text-base px-4 text-center">By following, you'll allow us to share your name and email with {performer.name} so you can receive exclusive updates about new music, upcoming shows, and special announcements.</span>
            <div className="flex justify-center mt-3">
              <TraxButton
                htmlType="button"
                styleType="secondary"
                buttonSize={isMobile ? "full" : "medium"}
                buttonText="Follow"
                disabled={!user._id || user.isPerformer}
                onClick={() => this.handleFollow()}
              />
            </div>
          </div>
        </Modal>

        {((!Capacitor.isNativePlatform() && Capacitor.getPlatform() !== 'ios')) && (
          <Modal
            key="tip_performer"
            className="ppv-purchase-common ppv-purchase-desktop"
            open={openTipModal}
            centered
            onOk={() => this.setState({ openTipModal: false })}
            footer={null}
            title={null}
            onCancel={() => this.setState({ openTipModal: false })}
          >
            {(!Capacitor.isNativePlatform()) && (
              <TipPerformerForm
                user={user}
                account={account}
                performer={performer}
                submiting={submiting}
                progress={tipProgress}
                openProgress={openTipProgressModal}
                onFinish={this.sendTip.bind(this)}
              />
            )}
          </Modal>
        )}

        <Modal
          key="subscribe_performer"
          className="subscription-modal"
          width={500}
          centered
          title={null}
          open={openSubscriptionModal}
          footer={null}
          onCancel={() => this.setState({ openSubscriptionModal: false, paymentUrl: "" })}
          destroyOnClose
        >
          <ConfirmSubscriptionPerformerForm
            performer={performer}
            settings={settings}
            submitting={submiting}
            onFinish={this.subscribe.bind(this)}
            onClose={this.closeSubModal.bind(this)}
            user={user}
          />
        </Modal>

        <Modal
          key="cancel_subscription"
          className="subscription-modal"
          width={500}
          centered
          title={null}
          open={openCancelSubscriptionModal}
          footer={null}
          onCancel={() => this.setState({ openCancelSubscriptionModal: false})}
          destroyOnClose
        >
          <div className="send-tip-container gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <span className="text-4xl uppercase font-heading font-bold text-trax-white mt-2">Cancel Subscription</span>
                <span className="text-trax-gray-400 text-base font-base ">Are you sure you want to cancel your subscription to {performer.name}? After your current term finishes you will lose access to their members only content.</span>
              </div>

              <TraxButton
                htmlType="button"
                styleType="alert"
                buttonSize='full'
                buttonText="Cancel"
                onClick={() => this.cancelSubscription()}
              />
            </div>
          </div>
        </Modal>

      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: { ...state.ui },
  videoState: { ...state.video.videos },
  feedState: { ...state.feed.feeds },
  productState: { ...state.product.products },
  ticketState: { ...state.ticket.tickets },
  galleryState: { ...state.gallery.galleries },
  user: { ...state.user.current },
  account: { ...state.user.account },
  settings: { ...state.settings },
});

const mapDispatch = {
  getFeeds,
  moreFeeds,
  getVideos,
  moreVideo,
  listProducts,
  listTickets,
  moreProduct,
  moreTicket,
  getGalleries,
  moreGalleries,
  removeFeedSuccess,
  updateBalance,
};

export default connect(mapStates, mapDispatch)(PerformerProfile);