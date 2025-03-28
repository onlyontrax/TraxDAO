import {
  Layout, message, Button, Spin, Modal
} from 'antd';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  getComments, moreComment, createComment, deleteComment
} from 'src/redux/comment/actions';
import { updateBalance } from '@redux/user/actions';
import { getRelated } from 'src/redux/video/actions';
import Head from 'next/head';
import {
  authService, videoService, tokenTransctionService, paymentService
} from '@services/index';
import { cryptoService } from '@services/crypto.service';
import { PPVPurchaseModal } from '@components/performer';
import ConfirmSubscriptionPerformerForm from '@components/performer/confirm-subscription';
import {
  IVideo, IUser, IUIConfig, ISettings,
  IAccount
} from 'src/interfaces';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/nns';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import Router from 'next/router';
import Error from 'next/error';
import { idlFactory as idlFactoryPPV } from '../../src/smart-contracts/declarations/ppv/ppv.did.js';
import type { _SERVICE as _SERVICE_PPV } from '../../src/smart-contracts/declarations/ppv/ppv2.did';
import { idlFactory as idlFactoryLedger } from '../../src/smart-contracts/declarations/ledger/ledger.did.js';
import type { _SERVICE as _SERVICE_LEDGER } from '../../src/smart-contracts/declarations/ledger/ledger2.did';
import {
  TransferArgs, TimeStamp, AccountBalanceArgs
} from '../../src/smart-contracts/declarations/ledger/ledger2.did';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import styles from './index.module.scss';
import PaymentProgress from '../../src/components/user/payment-progress';
import { debounce } from 'lodash';
import LogInModal from 'src/components/log-in/log-in-modal';
import SignUpModal from '@components/sign-up/sign-up-modal';
import {MusicPage} from '../../src/components/video/music';
import {VideoPage} from '../../src/components/video/video'
import { getPlugWalletIsConnected, getPlugWalletAgent, getPlugWalletProvider } from '../../src/crypto/mobilePlugWallet';
import { Sheet } from 'react-modal-sheet';
import SlideUpModal from '@components/common/layout/slide-up-modal';
import {
  requestConnectPlug,
} from "../../src/crypto/transactions/plug-tip";

import {
  purchaseVideoPlug,
} from "../../src/crypto/transactions/plug-ppv";
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

interface IProps {
  error: any;
  user: IUser;
  relatedVideos: any;
  ui: IUIConfig;
  updateBalance: Function;
  settings: ISettings;
  getRelated: Function;
  account: IAccount;
}

class VideoViewPage extends PureComponent<IProps> {
  static authenticate = true;
  static noredirect = true;

  state = {
    videoStats: {
      likes: 0, comments: 0, views: 0, bookmarks: 0
    },
    openPPVModal: false,
    isLiked: false,
    isBookmarked: false,
    isBought: false,
    isSubscribed: false,
    submiting: false,
    requesting: false,
    activeTab: 'description',
    openSubscriptionModal: false,
    subscriptionType: 'monthly',
    priceICP: 0,
    amountICPToDisplay: '',
    amountICP: '',
    amountCKBTCToDisplay: '',
    amountCKBTC: '',
    amountTRAXToDisplay: '',
    amountTRAX: '',
    openPPVProgressModal: false,
    ppvProgress: 0,
    isPriceICPLoading: true,
    video: null,
    isPlaying: false,
    isSignedIn: true,
    openLogInModal: false,
    openSignUpModal: false,
    contentUnlocked: false,
    featuredContent: [],
    artistsContent: [],
    confetti: false,
    dataLoaded: false,
    isMobile: false,
    username: '',
    trax: null,
    icp: null,
    ckbtc: null,
    rootUrl: '',
    applePaymentUrl: ''
  };

  getRootUrl = () => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const host = window.location.host;
      return `${protocol}//${host}`;
    }
    return process.env.USER_URL || '';
  };

  async componentDidMount() {
    const { video } = this.state;
    const rootUrl = this.getRootUrl();
    console.log('Video page rootUrl:', rootUrl);
    const token = authService.getToken();

    const urlParams = new URLSearchParams(window.location.search);
    const currentUrl = window.location.href;
    const newUrl = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}mobileToken=${token}&openPaymentModal=true`;

    const openPaymentModal = urlParams.get('openPaymentModal') === 'true';

    this.setState({ rootUrl, applePaymentUrl: newUrl, openPPVModal: openPaymentModal });

    if (video === null) {
      await this.initializeVideoData();
      this.promptSignIn();
    }

    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
    Router.events.on('routeChangeComplete', this.onRouteChangeComplete);
  }

  componentDidUpdate(prevProps, prevState) {
    const { user } = this.props;
    const { video } = this.state;

    // Check if the user has changed (e.g., after logging in)
    if (user && user._id !== prevProps.user?._id) {
      this.onUserUpdated();
    }

    if (prevState.video && prevState.video._id !== video._id) {
      this.onShallowRouteChange();
    }

    if (!prevState.openPPVModal && this.state.openPPVModal) {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios") {
        this.openPaymentPage();
      }
    }
  }

  componentWillUnmount() {
    Router.events.off('routeChangeComplete', this.onRouteChangeComplete);
    window.removeEventListener('resize', this.checkScreenSize);
  }

  onUserUpdated = async () => {
    // Update the `isSignedIn` status and re-run initialization logic if necessary
    this.setState({ isSignedIn: this.props.user?._id ? true : false }, async () => {
      await this.initializeVideoData();
    });
  };

  async initializeVideoData() {
    const data = await this.getData();
    if (data.video) {
      const vid = data.video;
      await this.getFeaturedContent(vid);
      await this.getArtistsContent(vid);
      this.setState({
        video: vid,
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
    }
  }

  async getData() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    try {
      const video = await (
        await videoService.findOne(id as string, {
          Authorization: authService.getToken() || ''
        })
      )?.data;
      return { video };
    } catch (e) {
      return { video: [] };
    }
  }

  checkScreenSize = () => {
    this.setState({ isMobile: window.innerWidth < 500 });
  };

  async getFeaturedContent(vid){
    let featured = [];
    await videoService.homePageSearch({
      limit: 10,
      sortBy: 'latest',
      tags: 'featured',
      offset: 0,
    }).then((res) => {
      res.data.data.map((v)=>{
        if(vid._id !== v._id){
          featured.length === 0 && featured.push(v);
          const exists = featured.some(obj => obj['_id'] === v['_id']);
          if (!exists) {
            featured.push(v);
          }
        }
      })
    })

    this.setState({featuredContent: this.shuffleArray(featured)});
  }

  async getArtistsContent(vid){
    let artist = [];
    await videoService.userSearch({
      limit: 10,
      offset: 0,
      performerId: vid.performer?._id,
      q: "",
      fromDate: "",
      toDate: ""
    }).then((res)=>{
      res.data.data.map((v)=>{
        if(vid._id !== v._id){
          artist.length === 0 && artist.push(v);
          const exists = artist.some(obj => obj['_id'] === v['_id']);
          if (!exists) {
            artist.push(v);
          }
        }
      })
    })

    this.setState({artistContent: this.shuffleArray(artist)});
  }

  shuffleArray(array){
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  promptSignIn = debounce(async () => {
    const { user } = this.props;
    this.setState({isSignedIn: user?._id ? true : false})
  })

  onRouteChangeComplete = async (url) => {
    this.setState({ dataLoaded: false });
    const data = await this.getData();

    this.setState({ video: data.video, dataLoaded: true}, async () => await this.updateDataDependencies());
  };

  async updateDataDependencies() {
    let { video, trax, icp, ckbtc } = this.state;

    if (video === null) {
      return;
    }

    if (!trax) {
      trax = (await tokenTransctionService.getExchangeRateTRAX()).data.rate;
      icp = (await tokenTransctionService.getExchangeRate()).data.rate;
      ckbtc = (await tokenTransctionService.getExchangeRateBTC()).data.rate;

      this.setState({trax, icp, ckbtc});
    }

    const amountToSendICP = video.price / parseFloat(icp);
    const amountToSendCKBTC = video.price / parseFloat(ckbtc);
    const amountToSendTRAX = video.price / parseFloat(trax);

    this.setState({
      priceICP: icp,
      amountICPToDisplay: amountToSendICP.toFixed(4).toString(),
      amountCKBTCToDisplay: amountToSendCKBTC.toFixed(8).toString(),
      amountTRAXToDisplay: amountToSendTRAX.toFixed(3).toString(),
      amountICP: amountToSendICP,
      amountCKBTC: amountToSendCKBTC,
      amountTRAX: amountToSendTRAX,
      isPriceICPLoading: false
    });
    await this.onShallowRouteChange();
  }

  async onShallowRouteChange() {
    const {
      getRelated: handleGetRelated
    } = this.props;

    const { video } = this.state;
    if (video === null) return;

    //let unlocked = (video.isSale === 'subscription' && video.isSubscribed) || (video.isSale === 'pay' && video.isBought) || (video.isSale === 'free');

    this.getFeaturedContent(video);
    this.getArtistsContent(video);

    this.setState({
      videoStats: video.stats,
      isLiked: video.isLiked,
      isBookmarked: video.isBookmarked,
      isBought: video.isBought,
      isCryptoPayment: video.isCryptoPayment,
      recipient: video.performerWalletAddress,
      isSubscribed: video.isSubscribed,
      contentUnlocked: video.contentUnlocked,
      subscriptionType: video?.performer?.isFreeSubscription ? 'free' : 'monthly'
    });

    handleGetRelated({
      performerId: video.performerId,
      excludedId: video._id,
      limit: 24
    });
  }


  async beforePurchase(ticker: string, paymentOption: string) {
    const { video } = this.state;
    try{
      if(paymentOption == 'card' || paymentOption === 'credit'){
        await this.purchaseVideo();

      }else{
        await this.beforePurchaseCrypto(ticker, paymentOption);
        // message.error("Payment option does not exist.")
      }
    }catch(error){
      console.log(error);
    }finally{
      Router.push(`/${video?.trackType === 'video' ? 'video' : 'track'}?id=${video._id}`);
    }
  }


  getAmount(ticker){
    const { amountICP, amountCKBTC, amountTRAX} = this.state;
    const amounts = { ICP: amountICP, ckBTC: amountCKBTC, TRAX: amountTRAX };
    return Number(amounts[ticker]);
  };



  async beforePurchaseCrypto(ticker, wallet){
    const { settings } = this.props;
    const { video } = this.state;


    try {
        this.setState({
          ppvProgress: 0,
          openPPVProgressModal: true,
          tipStatus: '',
          requesting: true,
          submiting: true,

        });

        console.log("@video/index beforePurchaseCrypto beforePurchaseCrypto: ",
          this.getAmount(ticker),
          ticker,
          video._id,
          settings,
          video?.performer?._id,
          wallet
        )

        const res = await purchaseVideoPlug(
            this.getAmount(ticker),
            ticker,
            video._id,
            video?.performer?._id,
            settings,
            wallet,
            (update) => {
              console.log(update)
                this.setState({
                  ppvProgress: update.progress,
                });
            }
        );
        if (res) {
          this.setState({ isBought: true, requesting: false, openPPVModal: false, submiting: false });

          setTimeout(()=>{
            this.setState({openPPVProgressModal: false})
          }, 2000)
          message.success('Payment successfull! You can now access this content.');
        }
    } catch (error) {
        this.setState({openPPVProgressModal: false, requesting: false, submiting: false, openPPVModal: false });
        message.error(error.message);
    }
  }

  async purchaseVideo() {
    const { user, updateBalance: handleUpdateBalance } = this.props;
    const { video } = this.state;
    if (!user._id) {
      message.error('Please log in!');
      Router.push('/login');
      return;
    }
    if (user.isPerformer) {
      return;
    }
    try {
      this.setState({ requesting: true });

      await (await tokenTransctionService.purchaseVideo(video._id, {})).data;
      message.success('Video is unlocked!');


      handleUpdateBalance({ token: -video.price });
      this.setState({ isBought: true, requesting: false, openPPVModal: false });
    } catch (e) {
      const error = await e;
      this.setState({ requesting: false });
      message.error(error.message || 'Error occured, please try again later');
    }
  }

  async subscribe(currency: string, subType: string, express: boolean) {

    try {
      const { user, settings } = this.props;
      const { video } = this.state;
      if (!user._id) {
        message.error('Please log in!');
        Router.push('/login');
        return;
      }
      if (user.isPerformer) {
        return;
      }
      if (settings.paymentGateway === 'stripe' && !user.stripeCardIds.length) {
        message.error('Please add a payment card');
        Router.push('/user/account');
        return;
      }
      if(!express){
        this.setState({ submiting: true });
        const resp = await paymentService.subscribePerformer({
          type: subType || 'monthly',
          performerId: video.performerId,
          paymentGateway: settings.paymentGateway
        });
        console.log("subscribe resp", resp);
        if (resp?.data?.stripeConfirmUrl) {
          window.location.href = resp?.data?.stripeConfirmUrl;
        }
        if (settings.paymentGateway === '-ccbill') {
          window.location.href = resp?.data?.paymentUrl;
        }
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || 'Error occured, please try again later');
      this.setState({ submiting: false });
    }
  }

  closeSubModal(val){
    this.setState({openSubscriptionModal: false})
  }


  handleOpenSignUp = (isOpen: boolean, loggedIn: boolean, username?: string) => {
    loggedIn ? this.setState({ openLogInModal: isOpen, openSignUpModal: false, username }) : this.setState({ openLogInModal: isOpen, openSignUpModal: true, username })
  }

  handleOpenModal = (isOpen: boolean, modal: string) => {
    if (modal === 'email') {
      this.setState({ openSignUpModal: isOpen, openLogInModal: isOpen, })
    } else {
      this.setState({ openSignUpModal: isOpen, openLogInModal: true })
    }
  }

  handleFileChange(val){
    this.setState({isPlaying: val})
  }

  openSubModal(bool){
    this.setState({openSubscriptionModal: bool})
  }
  openPurchaseModal(bool){
    this.setState({openPPVModal: bool})
  }

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

  renderPPVModal() {
    const {
      openPPVModal,
      subscriptionType,
      submiting,
      isPriceICPLoading,
      amountICPToDisplay,
      amountCKBTCToDisplay,
      amountTRAXToDisplay,
      isMobile,
      video,
      ppvProgress,
      openPPVProgressModal,
      applePaymentUrl
    } = this.state;
    const { user } = this.props;

    console.log("openPPVProgressModal: ", openPPVProgressModal)

    const content = (
      <PPVPurchaseModal
        submiting={submiting}
        onFinish={this.beforePurchase.bind(this)}
        user={user}
        video={video}
        progress={ppvProgress}
        openProgress={openPPVProgressModal}
        contentPriceTRAX={Number(amountTRAXToDisplay)}
      />
    );

    if ((Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios')) {
      return '';
    }
    return (
      <Modal
        key="ppv-purchase-modal"
        className="ppv-purchase-modal ppv-purchase-common ppv-purchase-desktop"
        centered
        title={null}
        open={openPPVModal}
        footer={null}
        onCancel={() => this.setState({ openPPVModal: false })}
      >
        {(!Capacitor.isNativePlatform()) && (
          content
        )}
      </Modal>
    );
  }

  render() {
    const {
      user,
      error,
      account,
      ui,
      settings,
      relatedVideos = {
        requesting: false,
        error: null,
        success: false,
        items: []
      },
    } = this.props;
    const { video, dataLoaded, rootUrl } = this.state;

    if (dataLoaded === false) {
      return (
        <div style={{ margin: 30, textAlign: "center" }}>
          <img src="/static/trax_loading_optimize.gif" alt="Loading..." className='w-28 m-auto'/>
        </div>
      );
    }

    if (error || video === null || video.length === 0) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Video was not found'} />;
    }

    const {
      contentUnlocked, confetti, openSignUpModal, openLogInModal, submiting, openSubscriptionModal,
      featuredContent, artistsContent, subscriptionType, openPPVModal, openPPVProgressModal, ppvProgress, isPriceICPLoading,
      amountICPToDisplay, amountTRAXToDisplay, amountCKBTCToDisplay, isMobile, username
    } = this.state;

    // Get thumbnail URL with fallbacks
    const thumbUrl = video?.thumbnail?.url ||
                     (video?.teaser?.thumbnails && video?.teaser?.thumbnails[0]) ||
                     (video?.video?.thumbnails && video?.video?.thumbnails[0]) ||
                     '/static/no-image.jpg';

    // Convert to absolute URL if it's relative
    const absoluteThumbUrl = thumbUrl.startsWith('http') ?
                            thumbUrl :
                            `${rootUrl}${thumbUrl}`;

    // Construct video URL
    const videoUrl = `${rootUrl}/${video.trackType === 'audio' ? 'track' : 'video'}?id=${video._id}`;

    console.log('Video URLs:', {
      thumbUrl: absoluteThumbUrl,
      videoUrl,
      rootUrl,
      originalThumbUrl: thumbUrl,
      videoThumbnail: video?.thumbnail?.url,
      videoTeaserThumbnails: video?.teaser?.thumbnails,
      videoThumbnails: video?.video?.thumbnails
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

    return (
      <Layout className={styles.pagesVideoModule}>
        <Head>
          <title>
            {`${video.title} | ${video.performer?.name || video.performer?.username} | ${ui.siteName}`}
          </title>
          <meta name="keywords" content={`${video.title}, ${video.performer?.name || video.performer?.username}, ${video.description}`} />
          <meta name="description" content={video.description} />
          {/* OG tags */}
          <meta property="og:type" content="video.other" />
          <meta property="og:title" content={`${video.title} | ${video.performer?.name || video.performer?.username} | ${ui.siteName}`} />
          <meta property="og:image" content={absoluteThumbUrl} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:description" content={video.description || `Watch ${video.title} by ${video.performer?.name || video.performer?.username} on TRAX`} />
          <meta property="og:url" content={videoUrl} />
          <meta property="og:site_name" content={ui.siteName} />
          {/* Twitter tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${video.title} | ${video.performer?.name || video.performer?.username} | ${ui.siteName}`} />
          <meta name="twitter:image" content={absoluteThumbUrl} />
          <meta name="twitter:description" content={video.description || `Watch ${video.title} by ${video.performer?.name || video.performer?.username} on TRAX`} />
        </Head>
        {video.trackType === "audio" ? (
          <MusicPage
            video={video}
            user={user}
            account={account}
            error={error}
            contentUnlocked={contentUnlocked}
            ui={ui}
            featuredContent={featuredContent.length > 0 ? featuredContent : relatedVideos.items}
            artistsContent={artistsContent.length > 0 ? artistsContent : relatedVideos.items}
            openLogIn={this.handleOpenModal.bind(this)}
            openSubModal={this.openSubModal.bind(this)}
            openPurchaseModal={this.openPurchaseModal.bind(this)}
            settings={settings}
          />
        ) : (
          <VideoPage
            video={video}
            account={account}
            user={user}
            error={error}
            featuredContent={featuredContent.length > 0 ? featuredContent : relatedVideos.items}
            artistsContent={artistsContent.length > 0 ? artistsContent : relatedVideos.items}
            openSubModal={this.openSubModal.bind(this)}
            openPurchaseModal={this.openPurchaseModal.bind(this)}
            contentUnlocked={contentUnlocked}
            openLogIn={this.handleOpenModal.bind(this)}
            ui={ui}
            settings={settings}
          />
        )}

        <div className='log-in-modal-wrapper'>
          {isMobile ? (
            <SlideUpModal
                  isOpen={openLogInModal}
                  onClose={() => this.setState(prevState => ({ ...prevState, openLogInModal: false }))}
                  className="auth-modal"
            >
              <LogInModal onFinish={this.handleOpenSignUp.bind(this)}/>
            </SlideUpModal>
          ):(
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
              <SignUpModal onFinish={this.handleOpenModal.bind(this)} username={username} />
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
            <SignUpModal onFinish={this.handleOpenModal.bind(this)} username={username} />
          </Modal>
          )}
        </div>

        {this.renderPPVModal()}

        <Modal
          key="subscribe_performer"
          className="subscription-modal"
          centered
          title={null}
          open={openSubscriptionModal}
          footer={null}
          onCancel={() => this.setState({ openSubscriptionModal: false })}
        >
          <ConfirmSubscriptionPerformerForm
            settings={settings}
            performer={video?.performer}
            submitting={submiting}
            onFinish={this.subscribe.bind(this)}
            onClose={this.closeSubModal.bind(this)}
            user={user}
          />
        </Modal>
      </Layout>
    );
  }
}
const mapStates = (state: any) => {
  const { commentMapping, comment } = state.comment;
  return {
    relatedVideos: { ...state.video.relatedVideos },
    commentMapping,
    comment,
    account: { ...state.user.account },
    user: { ...state.user.current },
    ui: { ...state.ui },
    settings: { ...state.settings }
  };
};

const mapDispatch = {
  getRelated,
  getComments,
  moreComment,
  createComment,
  deleteComment,
  updateBalance
};
export default connect(mapStates, mapDispatch)(VideoViewPage);