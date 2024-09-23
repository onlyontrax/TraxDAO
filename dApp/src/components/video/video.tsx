/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-prototype-builtins */
import React from 'react';
import {
    Layout, Tabs, message, Button, Spin, Tooltip, Avatar, Modal, Progress, Image
  } from 'antd';
  import { BsCheckCircleFill } from 'react-icons/bs';
  import {
    PlusOutlined, FireOutlined, FireFilled, CommentOutlined, LoadingOutlined
  } from '@ant-design/icons';
  import { CheckBadgeIcon, LockClosedIcon } from '@heroicons/react/24/solid';

  import { PureComponent } from 'react';
  import { connect } from 'react-redux';
  import {
    getComments, moreComment, createComment, deleteComment
  } from 'src/redux/comment/actions';
  import { updateBalance } from '@redux/user/actions';
  import { getRelated } from 'src/redux/video/actions';
  import Head from 'next/head';
  import { motion } from 'framer-motion';
  import {
    authService, videoService, reactionService, tokenTransctionService, paymentService
  } from '@services/index';
  import { cryptoService } from '@services/crypto.service';
  import { RelatedListVideo, RelatedList } from '@components/video';
  import { VideoPlayer } from '@components/common/video-player';

  import { ListComments, CommentForm } from '@components/comment';
  import ConfirmSubscriptionPerformerForm from '@components/performer/confirm-subscription';
  import { PPVPurchaseModal } from '@components/performer';
  import { shortenLargeNumber, formatDate } from '@lib/index';
  import {
    IVideo, IUser, IUIConfig, IPerformer, ISettings
  } from 'src/interfaces';

  // import { ppv } from "../../src/smart-contracts/ppv";
  // import { idlFactorySUB } from "../../src/smart-contracts/declarations/subscriptions";
  import { Principal } from '@dfinity/principal';
  import { AccountIdentifier } from '@dfinity/nns';
  import { Actor, HttpAgent } from '@dfinity/agent';
  import { AuthClient } from '@dfinity/auth-client';
  import Link from 'next/link';
  import Router, { useRouter } from 'next/router';
  import Error from 'next/error';
  /*import { subscriptions } from '../../src/smart-contracts/declarations/subscriptions';
  import { SubType } from '../../src/smart-contracts/declarations/subscriptions/subscriptions.did';*/

  import { idlFactory as idlFactoryPPV } from '../../smart-contracts/declarations/ppv/ppv.did.js';
  import type { _SERVICE as _SERVICE_PPV, Content } from '../../smart-contracts/declarations/ppv/ppv2.did.js';

  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
  import { faEllipsis } from '@fortawesome/free-solid-svg-icons'

  import { idlFactory as idlFactoryLedger } from '../../smart-contracts/declarations/ledger/ledger.did.js';
  import type { _SERVICE as _SERVICE_LEDGER } from '../../smart-contracts/declarations/ledger/ledger2.did.js';
  import {
    TransferArgs, Tokens, TimeStamp, AccountBalanceArgs
  } from '../../smart-contracts/declarations/ledger/ledger2.did.js';
  import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
  import { faInstagram, faSoundcloud, faXTwitter, faSpotify } from '@fortawesome/free-brands-svg-icons'
  import { faCheck } from '@fortawesome/free-solid-svg-icons'
  import PaymentProgress from '../user/payment-progress.js';
  import { debounce } from 'lodash';
  import LogInModal from 'src/components/log-in/log-in-modal';
  import SignUpModal from '@components/sign-up/sign-up-modal';
  import { Description } from '@headlessui/react/dist/components/description/description.js';
  import { ChevronDownIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';
  import ContentData from './contentData'
  const { TabPane } = Tabs;

  interface IProps {
    user: IUser;
    relatedVideos: any;
    error: any
    ui: IUIConfig;
    video: IVideo;
    settings: ISettings;
    contentUnlocked: boolean;
    openLogIn(isOpen: boolean, logIn: boolean): Function
    openSubModal(open: boolean): Function;
    openPurchaseModal(open: boolean): Function;
  }

  const variants = {
    isPlaying: { scale: 1, type: 'spring'},
    isPaused: { scale: 0.8, type: 'spring'},
  }

  export class VideoPage extends PureComponent<IProps> {
    static authenticate = true;

    static noredirect = true;

    async getData() {
      if (this.props.video && this.props.video._id) {
        return { video: this.props.video };
      }
      const url = new URL(window.location.href);
      const id = url.searchParams.get('id');
      try {
        const video = await (
          await videoService.findOne(id as string, {
            Authorization: authService.getToken() || ''
          })
        ).data;
        return { video };
      } catch (e) {
        return { video: [] };
      }
    }

    state = {
      videoStats: {
        likes: 0, comments: 0, views: 0, bookmarks: 0
      },
      openPPVModal: false,
      isLiked: false,
      isBookmarked: false,
      itemPerPage: 24,
      commentPage: 0,
      isFirstLoadComment: true,
      isBought: false,
      isSubscribed: false,
      totalComment: 0,
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
      openInfoModal: false,
      isPlaying: false,
      openTeaserModal: false,
      stopTeaser: false,
      isSignedIn: true,
      showComments: true,
      showCollabs: true,
      showDescription: true,
      isTablet: false,
      isSoldOut: true,
      userBookmarks: [],
      userLikes: [],
    };

    async componentDidMount() {
      const { video } = this.state;
      if (video === null) {
        const data = await this.getData();
        this.promptSignIn();
        this.checkScreenSize();
        this.setState({ video: data.video }, () => {
          this.updateDataDependencies();
          this.fetchUserBookmarks();
          this.fetchUserLikes();
        });
      } else {
        await this.updateDataDependencies();
      }

      Router.events.on('routeChangeComplete', this.onRouteChangeComplete);
    }

    async fetchUserBookmarks() {
      const { user } = this.props;
      if (user && user._id) {
        try {
          const response = await videoService.getBookmarks({ userId: user._id });
          const bookmarks = response.data?.data || [];
          this.setState({ userBookmarks: bookmarks }, () => {
          this.updateBookmarkStatus();
        });
        } catch (error) {
          console.error('Error fetching user bookmarks:', error);
        }
      }
    }

    async fetchUserLikes() {
      const { user } = this.props;
      if (user && user._id) {
        try {
          const response = await videoService.getLikes({ userId: user._id });
          const likes = response.data?.data || [];
          this.setState({ userLikes: likes }, () => {
            this.updateLikeStatus();
          });
        } catch (error) {
          console.error('Error fetching user likes:', error);
        }
      }
    }

    updateBookmarkStatus() {
      const { video, userBookmarks } = this.state;
      if (video && Array.isArray(userBookmarks)) {
        const isBookmarked = userBookmarks.some(bookmark => bookmark.objectId === video._id);
        this.setState({ isBookmarked });
      } else {
        this.setState({ isBookmarked: false });
      }
    }

    updateLikeStatus() {
      const { video, userLikes } = this.state;
      if (video && Array.isArray(userLikes)) {
        const isLiked = userLikes.some(like => like.objectId === video._id);
        this.setState({ isLiked });
      } else {
        this.setState({ isLiked: false });
      }
    }

    componentWillUnmount() {
      Router.events.off('routeChangeComplete', this.onRouteChangeComplete);
    }

    checkScreenSize(){
      this.setState({ isTablet: window.innerWidth < 1000 });
      window.addEventListener('resize', this.updateMedia);
      return () => window.removeEventListener('resize', this.updateMedia);
    }

    updateMedia = () => {
      // @ts-ignore
      this.setState({ isTablet: window.innerWidth < 1000 });
    };

    promptSignIn = debounce(async () => {
      const { user } = this.props;
      this.setState({isSignedIn: user._id ? true : false})
    })

    onRouteChangeComplete = async (url) => {
      const data = await this.getData();

      this.setState({ video: data.video }, () => this.updateDataDependencies());
    };

    async updateDataDependencies() {
      const { settings } = this.props;

      const { video, activeTab } = this.state;

      if (video === null) {
        return;
      }

      const icp = (await tokenTransctionService.getExchangeRate()).data.rate;
      const ckbtc = (await tokenTransctionService.getExchangeRateBTC()).data.rate;
      const trax = (await tokenTransctionService.getExchangeRateTRAX()).data.rate;

      // const icp   = '14.50';
      // const ckbtc = '70000';
      // const trax  = '0.0285';

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
        isPriceICPLoading: false
      });
      this.onShallowRouteChange();

      // await tokenTransctionService.sendCryptoPpv(video?.performer?._id, { performerId: video?.performer?._id, price: Number(amountToSendICP), tokenSymbol: 'ICP' }).then(() => {
      // });
    }

    componentDidUpdate(prevProps, prevState) {

      const { video } = this.state;
      if (video === null) return;
      const { totalComment } = this.state;

      if (prevState.video && prevState.video._id !== video._id) {
        this.onShallowRouteChange();
      }
    }

    onShallowRouteChange() {
      const { video, userBookmarks, userLikes } = this.state;
      if (video === null) return;

      const isBookmarked = Array.isArray(userBookmarks) && userBookmarks.some(bookmark => bookmark.objectId === video._id);
      const isLiked = Array.isArray(userLikes) && userLikes.some(like => like.objectId === video._id);

      this.setState({
        videoStats: video.stats,
        isLiked,
        isBookmarked,
        isBought: video.isBought,
        isCryptoPayment: video.isCryptoPayment,
        recipient: video.performerWalletAddress,
        isSubscribed: video.isSubscribed,
        isSoldOut: (video.limitSupply && video.supply === 0),
        subscriptionType: video?.performer?.isFreeSubscription ? 'free' : 'monthly'
      });
    }

    async onReaction(action: string) {
      const { videoStats, isLiked, isBookmarked, video, isSignedIn } = this.state;
      const { openLogIn: openModal } = this.props;

      if (!isSignedIn) {
        openModal(false, true);
        return;
      }

      try {
        const isActionLike = action === 'like';
        const currentState = isActionLike ? isLiked : isBookmarked;
        const stateKey = isActionLike ? 'isLiked' : 'isBookmarked';
        const userArrayKey = isActionLike ? 'userLikes' : 'userBookmarks';
        const statsKey = isActionLike ? 'likes' : 'bookmarks';

        const reactionData = {
          objectId: video._id,
          action: isActionLike ? 'like' : 'book_mark',
          objectType: 'video'
        };

        await reactionService[currentState ? 'delete' : 'create'](reactionData);

        this.setState(prevState => ({
          [stateKey]: !currentState,
          [userArrayKey]: currentState
            ? prevState[userArrayKey].filter(item => item.objectId !== video._id)
            : [...prevState[userArrayKey], { objectId: video._id }],
          videoStats: {
            ...videoStats,
            [statsKey]: videoStats[statsKey] + (currentState ? -1 : 1)
          }
        }));

        message.success(
          isActionLike
            ? (currentState ? 'Unliked' : 'Liked')
            : (currentState ? 'Removed from Saved' : 'Added to Saved')
        );
      } catch (e) {
        const error = await e;
        message.error(error.message || 'Error occurred, please try again later');
      }
    }

    handlePlay(){
      const { isSignedIn } = this.state;
      const { openLogIn: openModal, user } = this.props;
      if(!isSignedIn){
        openModal(false, true);
      }
    }

    handlePurchaseBtnClick(){
      const { isSignedIn } = this.state;
      const { openLogIn: openModal, openPurchaseModal: openPurchase } = this.props;
      if(isSignedIn){
        openPurchase(true)
      }else{
        openModal(false, true)
      }
    }

    handleSubBtnClick(){
      const { isSignedIn } = this.state;
      const { openLogIn: openModal, openSubModal: openSub  } = this.props;
      if(isSignedIn){
        openSub(true)
      }else{
        openModal(false, true);
      }
    }

    handleFileChange(val){
      this.setState({isPlaying: val})
    }

    render() {
      const {
        user,
        error,
        ui,
        settings,
        contentUnlocked,
        relatedVideos,
      } = this.props;
      const { video, openTeaserModal, stopTeaser } = this.state;
      if (error) {
        return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Video was not found'} />;
      }
      if (video === null || !settings) {
        return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
      }

      const {
        videoStats, isTablet, isSoldOut, showComments, showCollabs, showDescription, isLiked, isBookmarked, isSubscribed, isBought, submiting, requesting, activeTab, isFirstLoadComment, isSignedIn,
        openSubscriptionModal, subscriptionType, openPPVModal, openPPVProgressModal, ppvProgress, isPriceICPLoading, amountICPToDisplay, amountTRAXToDisplay, amountCKBTCToDisplay, openInfoModal, isPlaying
      } = this.state;
      const thumbUrl = video?.thumbnail?.url || (video?.teaser?.thumbnails && video?.teaser?.thumbnails[0]) || (video?.video?.thumbnails && video?.video?.thumbnails[0]) || '/static/no-image.jpg';

      const videoJsOptions = {
        key: video._id,
        autoplay: false,
        controls: true,
        playsinline: true,
        poster: thumbUrl,
        relatedVideos,
        showPrevious: true,
        showNext: true,
        sources: [
          {
            src: video?.video?.url,
            type: video?.trackType === 'audio' ? 'audio/mp3' : 'video/mp4',
            uploadedToIC: video?.video?.uploadedToIC
          }
        ],
        source: video?.video?.url
      };
      const videoJsOptionsAudio = {
        key: video._id,
        source: video?.video?.url,
        stop: false
      };

      return (
        <div>
          <div className="tick-img-background" style={{backgroundImage: thumbUrl ? `url('${thumbUrl}')`: '/static/empty_product.svg'}}>
            <div className='tick-img-blur-background' />
          </div>
          <div className='vid-container'>
            <div className='vid-left-wrapper'>
              <div className="main-container" style={{position: 'relative', maxWidth: '100vw', marginTop: '1rem' }}>
                <div className={!contentUnlocked ? 'vid-player-locked' : 'vid-player'}>
                  {(contentUnlocked && !video.isSchedule) && (
                    <>
                      {video.processing ? (
                        <div className="vid-processing">
                          <div className="text-center">
                            <Spin />
                            <br />
                            Track file is currently processing
                          </div>
                        </div>
                      ) : (
                        <div>
                          <VideoPlayer hasSignedIn={isSignedIn} onPressPlay={() => this.handlePlay()} {...videoJsOptions} />
                          <div className='flex justify-between '>

                          <div className='vid-heading-wrapper' >
                            <div className="vid-heading" style={{width: "100%", justifyContent: 'flex-start'}}>
                              <span className="vid-heading-span">{video.title || 'Untitled'}</span>
                            </div>
                            <Link
                              href={`/${video?.performer?.username || video?.performer?._id}`}
                              as={`/${video?.performer?.username || video?.performer?._id}`}
                              className="vid-artist-wrapper"
                              style={{width: "100%", justifyContent: 'flex-start'}}
                              >
                              <span className="vid-artist">{video?.performer?.name || 'N/A'}</span>
                            </Link>
                          </div>
                          <div className='flex flex-row '>
                            <div className="like-act-btns">
                              <button
                                className={isLiked ? 'react-btn-lg active' : 'react-btn-lg'}
                                onClick={this.onReaction.bind(this, 'like')}
                              >
                                {isLiked ? <FireFilled /> : <FireOutlined />}
                              </button>
                            </div>
                            <button
                              className={isBookmarked ? 'react-btn-lg active' : 'react-btn-lg'}
                              onClick={this.onReaction.bind(this, 'book_mark')}
                              >
                              {isBookmarked ? (
                                <BsCheckCircleFill style={{ color: '#c7ff02' }} />
                              ) : (
                                <PlusOutlined />
                              )}
                            </button>
                          </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {(!contentUnlocked || (video.isSale === 'free' && video.isSchedule)) && (
                    <div className='relative'>
                      <div className='track-thumbnail' style={{ backgroundImage: `url(${thumbUrl})` }}>

                        {video.isSale === 'subscription' && !isSubscribed && (
                          <div onClick={() => this.handleSubBtnClick()} className='cursor-pointer w-full flex relative justify-center items-center h-full inset-0'>
                            <div className='absolute m-auto flex justify-center items-center bg-trax-black rounded-full flex flex-row py-2 px-3 gap-1'>
                              <LockClosedIcon className='text-trax-white text-sm' width={18} height={18}/>
                              <span className='text-trax-white '>Members only</span>
                            </div>
                          </div>
                        )}

                        {video.isSale === 'pay' && !isBought && !video.isSchedule && (
                          <>
                            {(!video.limitSupply || (video.limitSupply && video.supply > 0)) && (
                              <div onClick={() => this.handlePurchaseBtnClick()} className='cursor-pointer w-full flex relative justify-center items-center h-full inset-0'>
                                <div className='absolute m-auto flex justify-center items-center bg-trax-black rounded-full flex flex-row py-2 px-3 gap-1'>
                                  <LockClosedIcon className='text-trax-white text-sm' width={18} height={18}/>
                                  <span className='text-trax-white text-xl ml-1 font-heading uppercase '>Unlock for ${video.price}</span>
                                </div>
                              </div>
                            )}

                            {(video.limitSupply && video.supply === 0) && (
                              <div className='w-full flex relative justify-center items-center h-full inset-0'>
                                <div className='absolute m-auto flex justify-center items-center bg-trax-black rounded-full flex flex-row py-2 px-3 gap-1'>
                                  <span className='text-trax-red-500 '>Sold out</span>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {video.isSchedule && (
                          <div onClick={() => this.handlePurchaseBtnClick()} className='cursor-pointer w-full flex relative justify-center items-center h-full inset-0'>
                          <div className='absolute m-auto flex justify-center items-center bg-trax-black rounded-full flex flex-row py-2 px-3 gap-1'>
                            <LockClosedIcon className='text-trax-white text-sm' width={18} height={18}/>
                            <span className='text-trax-white'>This video is scheduled</span>
                          </div>
                        </div>
                        )}


                      </div>
                      <div className='vid-heading-wrapper-locked'>
                        <div className="vid-heading">
                          <span className="vid-heading-span">{video.title || 'Untitled'}</span>
                        </div>
                        <Link
                          href={`/${video?.performer?.username || video?.performer?._id}`}
                          as={`/${video?.performer?.username || video?.performer?._id}`}
                          className="vid-artist-wrapper"
                        >
                          <span className="vid-artist">{video?.performer?.name || 'N/A'}</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {(video?.limitSupply && video?.supply > 0 && !contentUnlocked) && (
                  <div className='m-auto flex justify-center w-full'>
                    <span className='text-[#ff6767] text-sm'>{video?.supply} {video?.supply === 1 ? "copy" : "copies"} left.</span>
                  </div>
                )}


                <div>
                  <ContentData contentUnlocked={contentUnlocked} video={video} settings={settings} ui={ui} user={user}/>
                </div>
              </div>
            </div>

            <div className='vid-right-wrapper'>

                {relatedVideos.length > 0 && (
                  <div className="related-items mt-1 px-1">
                    {/* {relatedVideos.requesting && <div className="text-center"><Spin /></div>} */}
                    {relatedVideos.length > 0 && !relatedVideos.requesting && (
                      <>
                      {isTablet ? (
                        <RelatedList videos={relatedVideos} />
                      ) : (
                        <RelatedListVideo videos={relatedVideos} />
                      )}
                      </>
                    )}
                  </div>
                )}

            </div>
          </div>

        </div>
      );
    }
  }
