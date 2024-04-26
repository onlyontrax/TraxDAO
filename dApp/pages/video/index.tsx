/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-prototype-builtins */
import {
  Layout, Tabs, message, Button, Spin, Tooltip, Avatar, Modal, Progress, Image
} from 'antd';
import { BsCheckCircleFill } from 'react-icons/bs';
import {
  PlusOutlined, FireOutlined, FireFilled, CommentOutlined, LoadingOutlined
} from '@ant-design/icons';
import { BadgeCheckIcon } from '@heroicons/react/solid';

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
import { RelatedListVideo } from '@components/video';
import { VideoPlayer } from '@components/common/video-player';
import { AudioPlayer_ } from '@components/common/audio-player';

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

import { idlFactory as idlFactoryPPV } from '../../src/smart-contracts/declarations/ppv/ppv.did.js';
import type { _SERVICE as _SERVICE_PPV, Content } from '../../src/smart-contracts/declarations/ppv/ppv2.did';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'

import { idlFactory as idlFactoryLedger } from '../../src/smart-contracts/declarations/ledger/ledger.did.js';
import type { _SERVICE as _SERVICE_LEDGER } from '../../src/smart-contracts/declarations/ledger/ledger2.did';
import {
  TransferArgs, Tokens, TimeStamp, AccountBalanceArgs
} from '../../src/smart-contracts/declarations/ledger/ledger2.did';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import { faInstagram, faSoundcloud, faXTwitter, faSpotify } from '@fortawesome/free-brands-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import styles from './index.module.scss';
import PaymentProgress from '../../src/components/user/payment-progress';

const { TabPane } = Tabs;

interface IProps {
  query: any;
  error: any;
  user: IUser;
  relatedVideos: any;
  commentMapping: any;
  comment: any;
  getRelated: Function;
  getComments: Function;
  moreComment: Function;
  createComment: Function;
  ui: IUIConfig;
  video: IVideo;
  deleteComment: Function;
  updateBalance: Function;
  settings: ISettings;
}

const variants = {
  isPlaying: { scale: 1, type: 'spring'},
  isPaused: { scale: 0.8, type: 'spring'},
}

class VideoViewPage extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  async getData() {
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
    activeTab: 'comment',
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
    stopTeaser: false
  };

  async componentDidMount() {
    const { video } = this.state;
    if (video === null) {
      const data = await this.getData();

      this.setState({ video: data.video }, () => this.updateDataDependencies());
    } else {
      await this.updateDataDependencies();
    }

    Router.events.on('routeChangeComplete', this.onRouteChangeComplete);
  }

  componentWillUnmount() {
    Router.events.off('routeChangeComplete', this.onRouteChangeComplete);
  }

  onRouteChangeComplete = async (url) => {
    const data = await this.getData();

    this.setState({ video: data.video }, () => this.updateDataDependencies());
  };

  async updateDataDependencies() {
    const { settings } = this.props;
    let identity;
    const authClient = await AuthClient.create();
    const host = settings.icHost;
    let agent;

    if (settings.icNetwork !== true) {
      identity = authClient.getIdentity();

      agent = new HttpAgent({
        identity,
        host
      });

      await agent.fetchRootKey();
    } else {
      identity = await authClient.getIdentity();
      agent = new HttpAgent({
        identity,
        host
      });
    }

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

    await tokenTransctionService.sendCryptoPpv(video?.performer?._id, { performerId: video?.performer?._id, price: Number(amountToSendICP), tokenSymbol: 'ICP' }).then(() => {
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      commentMapping, comment
    } = this.props;
    const { video } = this.state;
    if (video === null) return;
    const { totalComment } = this.state;

    if (prevState.video && prevState.video._id !== video._id) {
      this.onShallowRouteChange();
    }
    if (
      (!prevProps.comment.data
        && comment.data
        && comment.data.objectId === video._id)
      || (prevProps.commentMapping[video._id]
        && totalComment !== commentMapping[video._id].total)
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ totalComment: commentMapping[video._id].total });
    }
  }

  onShallowRouteChange() {
    const {
      getRelated: handleGetRelated
    } = this.props;
    const { getComments: handleGetComments } = this.props;
    const { video, itemPerPage } = this.state;
    if (video === null) return;
    this.setState({
      videoStats: video.stats,
      isLiked: video.isLiked,
      isBookmarked: video.isBookmarked,
      isBought: video.isBought,
      isCryptoPayment: video.isCryptoPayment,
      recipient: video.performerWalletAddress,
      isSubscribed: video.isSubscribed,
      subscriptionType: video?.performer?.isFreeSubscription ? 'free' : 'monthly'
    });
    handleGetRelated({
      performerId: video.performerId,
      excludedId: video._id,
      limit: 24
    });
    handleGetComments({
      objectId: video._id,
      objectType: 'video',
      limit: itemPerPage,
      offset: 0
    });
  }

  onChangeTab(tab: string) {
    this.setState({ activeTab: tab });
    const { isFirstLoadComment, itemPerPage } = this.state;
    const { getComments: handleGetComments } = this.props;
    const { video } = this.state;
    if (tab === 'comment' && isFirstLoadComment) {
      this.setState(
        {
          isFirstLoadComment: false,
          commentPage: 0
        },
        () => {
          handleGetComments({
            objectId: video._id,
            objectType: 'video',
            limit: itemPerPage,
            offset: 0
          });
        }
      );
    }
  }

  async onReaction(action: string) {
    const { videoStats, isLiked, isBookmarked, video } = this.state;
    try {
      if (action === 'like') {
        !isLiked ? await reactionService.create({
          objectId: video._id,
          action,
          objectType: 'video'
        }) : await reactionService.delete({
          objectId: video._id,
          action,
          objectType: 'video'
        });
        this.setState({
          isLiked: !isLiked,
          videoStats: {
            ...videoStats,
            likes: videoStats.likes + (isLiked ? -1 : 1)
          }
        });
        message.success(!isLiked ? 'Liked' : 'Unliked');
      }
      if (action === 'book_mark') {
        !isBookmarked ? await reactionService.create({
          objectId: video._id,
          action,
          objectType: 'video'
        }) : await reactionService.delete({
          objectId: video._id,
          action,
          objectType: 'video'
        });
        message.success(!isBookmarked ? 'Added to Saved' : 'Removed from Saved');
        this.setState({
          isBookmarked: !isBookmarked,
          videoStats: {
            ...videoStats,
            bookmarks: videoStats.bookmarks + (isBookmarked ? -1 : 1)
          }
        });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    }
  }

  async onSubmitComment(values: any) {
    const { createComment: handleComment } = this.props;
    handleComment(values);
  }

  loadMoreComment = async (videoId: string) => {
    const { moreComment: handleMoreComment } = this.props;
    const { itemPerPage, commentPage } = this.state;
    await this.setState({
      commentPage: commentPage + 1
    });
    handleMoreComment({
      limit: itemPerPage,
      objectType: 'video',
      offset: (commentPage + 1) * itemPerPage,
      objectId: videoId
    });
  };

  async deleteComment(item) {
    const { deleteComment: handleDeleteComment } = this.props;
    if (!window.confirm('Are you sure to remove this comment?')) return;
    handleDeleteComment(item._id);
  }

  beforePurchase(ticker: string, paymentOption: string) {
    if(paymentOption == 'card'){
      this.purchaseVideo()
    }else if(paymentOption === 'plug'){
      this.purchaseVideoPlug(ticker)
    }else if(paymentOption === 'II' || paymentOption === 'nfid'){
      this.purchaseVideoCrypto(ticker)
    }
  }

  async purchaseVideoPlug(ticker){
    const { video } = this.state;
    const { amountICP, amountCKBTC, amountTRAX } = this.state;
    const { settings } = this.props;

    this.setState({ openPPVProgressModal: true, openPPVModal: false, ppvProgress: 20 });

    let amountToSendICP = Math.trunc(Number(amountICP) * 100000000)
    let amountToSendCKBTC = Math.trunc(Number(amountCKBTC) * 100000000)

    let transfer;

    const ledgerCanID = settings.icLedger;
    const ckBTCLedgerCanID = settings.icCKBTCMinter;
    const ppvCanID = settings.icPPV;

    this.setState({
      requesting: false,
      submiting: false,
      openPPVProgressModal: false,
      openPPVModal: false,
      ppvProgress: 0
    });

    const whitelist = [
      ppvCanID, 
    ];

    if(typeof window !== 'undefined' && 'ic' in window){
      // @ts-ignore
      const connected = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug?.requestConnect({
        whitelist,
        host: settings.icHost
      }) : false;

      !connected && message.info("Failed to connected to canister. Please try again later or contact us. ")
        
      

      // @ts-ignore
      if (!window?.ic?.plug?.agent && connected  ) {
        // @ts-ignore
        await window.ic.plug.createAgent({ 
          whitelist, 
          host: settings.icHost
        });
      }
      let ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
        agent: (window as any).ic.plug.agent,
        canisterId: ppvCanID
      });
      
      if(connected){
        this.setState({ openPPVProgressModal: true, openPPVModal: false, ppvProgress: 25 });
        //@ts-ignore
        const requestBalanceResponse = await window.ic?.plug?.requestBalance();
        let icp_balance;
        let ckBTC_balance;
        let TRAX_balance;

        for(let i = 0; i < requestBalanceResponse.length; i++){
          if(requestBalanceResponse[i]?.symbol === 'ICP'){
            icp_balance = requestBalanceResponse[i]?.amount;
          }
          if(requestBalanceResponse[i]?.symbol === 'ckBTC'){
            ckBTC_balance = requestBalanceResponse[i]?.amount;
          }
          if(requestBalanceResponse[i]?.symbol === 'TRAX'){
            TRAX_balance = requestBalanceResponse[i]?.amount;
          }

        };

        if(ticker === 'ckBTC'){
          if(ckBTC_balance >= Number(amountCKBTC)){
            this.setState({ ppvProgress: 50 });
            const params = {
              to: ppvCanID,
              strAmount: amountCKBTC,
              token: 'mxzaz-hqaaa-aaaar-qaada-cai'
            };
            //@ts-ignore
            transfer = await window.ic.plug.requestTransferToken(params).catch((error) =>{
              message.error('Transaction failed. Please try again later.');
              this.setState({requesting: false, submiting: false, openPPVProgressModal: false, ppvProgress: 0})
            });
            
          } else {
            this.setState({ requesting: false, submiting: false, openPPVProgressModal: false, ppvProgress: 0 })
            message.error('Insufficient balance, please top up your wallet and try again.');
          }
        }

        if(ticker === 'TRAX'){
          if(ckBTC_balance >= Number(amountTRAX)){
            this.setState({ ppvProgress: 50 });
            const params = {
              to: ppvCanID,
              strAmount: amountTRAX,
              token: process.env.NEXT_PUBLIC_TRAX_CANISTER_ID as string
            };
            //@ts-ignore
            transfer = await window.ic.plug.requestTransferToken(params).catch((error) =>{
              message.error('Transaction failed. Please try again later.');
              this.setState({requesting: false, submiting: false, openPPVProgressModal: false, ppvProgress: 0})
            });
            
          } else {
            this.setState({ requesting: false, submiting: false, openPPVProgressModal: false, ppvProgress: 0 })
            message.error('Insufficient balance, please top up your wallet and try again.');
          }
        }
        
        if (ticker === 'ICP') {
          this.setState({ ppvProgress: 50 });
          if(icp_balance >= Number(amountICP)){
            const requestTransferArg = {
              to: ppvCanID,
              amount: amountToSendICP
            }
            //@ts-ignore
            transfer = await window.ic?.plug?.requestTransfer(requestTransferArg).catch((error) =>{
              message.error('Transaction failed. Please try again later.');
              this.setState({requesting: false, submiting: false, openPPVProgressModal: false, ppvProgress: 0})
            })
            
          } else {
            this.setState({requesting: false, submiting: false, openPPVProgressModal: false, ppvProgress: 0})
            message.error('Insufficient balance, please top up your wallet and try again.');
          }
        }

        this.setState({ ppvProgress: 50 });

        if(transfer.height){

          this.setState({ ppvProgress: 75 });
        
          await ppvActor.purchaseContent(transfer.height, video._id, ticker, ticker === "ICP" ? BigInt(amountToSendICP) : BigInt(amountToSendCKBTC)).then(async () => {
            
            await tokenTransctionService.sendCryptoPpv(video?.performer?._id, { performerId: video?.performer?._id, price: Number(amountToSendICP), tokenSymbol: ticker }).then(() => {
              this.setState({ ppvProgress: 100 });
              this.setState({ requesting: false, openPPVModal: false, submiting: false });
              message.success('Payment successful! You can now access this content');
            });
            setTimeout(() => this.setState({
              requesting: false, submiting: false
            }), 1000);
  
            this.setState({ isBought: true, requesting: false });
          }).catch((error) => {
            this.setState({
              requesting: false, submiting: false, openPPVProgressModal: false, ppvProgress: 0
            });
  
            // message.(`Payment successful! You can now access this content` );
            console.error(error);
            message.error(error.message || 'error occured, please try again later');
            return error;
          });
        }else{
          setTimeout(() => this.setState({
            requesting: false, submiting: false, openPPVProgressModal: false, ppvProgress: 0
          }), 1000);
          message.error('Transaction failed. Please try again later.');
        }
    }
    }
  }

  async handlePurchaseVideoCrypto(ppvCanID: Principal, fanID: Principal, ledgerActor: any, ppvActor: any, ticker: string) {
    const { video } = this.state;
    const { amountICP, amountCKBTC, amountTRAX } = this.state;

    this.setState({ openPPVProgressModal: true, openPPVModal: false, ppvProgress: 20 });

    await ppvActor.getContent(video?._id).then(async (res) => {
      if(!res[0].contentType){
        message.error('This content has not been registered on-chain. Crypto purchases for this content are not available. Purchase with USD instead.');
        this.setState({ requesting: false, openPPVModal: false, submiting: false, ppvProgress: 0 });
        return;
      }
    }).catch((error)=>{
    });

    const ppvCanister = AccountIdentifier.fromPrincipal({
      principal: ppvCanID
    });
    // @ts-ignore
    const { bytes } = ppvCanister;
    const accountIdBlob = Object.keys(bytes).map((m) => bytes[m]);


    const fanAI = AccountIdentifier.fromPrincipal({
      principal: fanID
    });
    // @ts-ignore
    const fanBytes = fanAI.bytes;

    const txTime : TimeStamp = {
      timestamp_nanos: BigInt(Date.now() * 1000000)
    };

    const uuid = BigInt(Math.floor(Math.random() * 1000));
    const amountToSendICP = BigInt(Math.trunc(Number(amountICP) * 100000000));
    const amountToSendCKBTC = BigInt(Math.trunc(Number(amountCKBTC) * 100000000));
    const amountToSendTRAX = BigInt(Math.trunc(Number(amountTRAX) * 100000000));
    let transferArgs: TransferArgs;
    let transferParams: TransferParams;
    const balArgs: AccountBalanceArgs = {
      account: fanBytes
    };

    if(ticker == "ICP"){
      transferArgs = {
        memo: uuid,
        amount: { e8s: amountToSendICP },
        fee: { e8s: BigInt(10000) },
        from_subaccount: [],
        to: accountIdBlob,
        created_at_time: [txTime]
      };

      let balICP = await ledgerActor.account_balance(balArgs);
      
      if(Number(balICP.e8s) < Number(amountToSendICP) + 10000){
        this.setState({
          requesting: false,
          submiting: false,
          openPPVProgressModal: false,
          ppvProgress: 0
        });
        message.error('Insufficient balance, please top up your wallet and try again.');
      }

    }else if(ticker ==="ckBTC"){

      transferParams = {
        amount: amountToSendCKBTC,
        fee: BigInt(10),
        from_subaccount: null,
        to: {
          owner: ppvCanID,
          subaccount: [],
        },
        created_at_time: BigInt(Date.now() * 1000000)
      };

      let balICRC1 = await ledgerActor.balance({
        owner: fanID,
        certified: false
      });

      if(Number(balICRC1) < Number(amountToSendCKBTC) + 10){
        this.setState({
          requesting: false,
          submiting: false,
          openPPVProgressModal: false,
          ppvProgress: 0
        });
        message.error('Insufficient balance, please top up your wallet and try again.');
      }

    }else if(ticker ==="TRAX"){

      transferParams = {
        amount: amountToSendTRAX,
        fee: BigInt(100000),
        from_subaccount: null,
        to: {
          owner: ppvCanID,
          subaccount: [],
        },
        created_at_time: BigInt(Date.now() * 1000000)
      };

      let balICRC1 = await ledgerActor.balance({
        owner: fanID,
        certified: false
      });

      if(Number(balICRC1) < Number(amountToSendTRAX) + 100000){
        this.setState({
          requesting: false,
          submiting: false,
          openPPVProgressModal: false,
          ppvProgress: 0
        });
        message.error('Insufficient balance, please top up your wallet and try again.');
      }

    }else{
      message.error('Invalid ticker, please select a different token!');
    }

      this.setState({ ppvProgress: 50 });
      await ledgerActor.transfer(ticker === "ICP" ? transferArgs : transferParams).then(async (res) => {
        this.setState({ ppvProgress: 75 });

        await ppvActor.purchaseContent(
          ticker === "ICP" ? res.Ok : res, 
          video._id, ticker, 
          ticker === "ICP" ? amountToSendICP : ( ticker === "ckBTC" ? amountToSendCKBTC : amountToSendTRAX)
          ).then(async () => {

          
          await tokenTransctionService.sendCryptoPpv(video?.performer?._id, { performerId: video?.performer?._id, price: Number(amountToSendICP), tokenSymbol: ticker }).then(() => {
            this.setState({ ppvProgress: 100 });
            this.setState({ requesting: false, openPPVModal: false, submiting: false });
            message.success('Payment successful! You can now access this content');
          });
          setTimeout(() => this.setState({
            requesting: false, submiting: false
          }), 1000);

          this.setState({ isBought: true, requesting: false });
        }).catch((error) => {
          this.setState({
            requesting: false, submiting: false, openPPVProgressModal: false, ppvProgress: 0
          });

          // message.(`Payment successful! You can now access this content` );
          console.error(error);
          message.error(error.message || 'error occured, please try again later');
          return error;
        });
      }).catch((error) => {
        this.setState({
          requesting: false, submiting: false, openPPVProgressModal: false, ppvProgress: 0
        });
        this.setState({ requesting: false, openPPVModal: false, submiting: false });
        console.error(error);
        message.error(error.message || 'error occured, please try again later');
        return error;
      });
  }

  async purchaseVideoCrypto(ticker: string) {
    this.setState({ requesting: true, submiting: true });
    const { settings } = this.props;

    try {
      let ppvActor;
      let ledgerActor;
      let sender;
      let identity;
      let agent;

      const ledgerCanID = settings.icLedger;
      const ckBTCLedgerCanID = Principal.fromText(settings.icCKBTCMinter);
      const ppvCanID = Principal.fromText(settings.icPPV);
      const traxLedgerCanID = Principal.fromText(settings.icTraxToken);

      const authClient = await AuthClient.create();

      if (settings.icNetwork !== true) {
        await authClient.login({
          identityProvider: cryptoService.getIdentityProviderLink(),
          onSuccess: async () => {
            if (await authClient.isAuthenticated()) {
              identity = authClient.getIdentity();

              const host = settings.icHost;
              agent = new HttpAgent({
                identity,
                host
              });

              agent.fetchRootKey();
              sender = await agent.getPrincipal();

              if(ticker == "ICP"){
                ledgerActor = Actor.createActor<_SERVICE_LEDGER>(idlFactoryLedger, {
                  agent,
                  canisterId: ledgerCanID
                });
              }else if(ticker === "ckBTC"){
                ledgerActor = IcrcLedgerCanister.create({
                  agent,
                  canisterId: ckBTCLedgerCanID
                });
              }else if(ticker === "TRAX"){
                ledgerActor = IcrcLedgerCanister.create({
                  agent,
                  canisterId: traxLedgerCanID
                });
              }else{
                message.error('Invalid ticker, please select a different token!');
              }

              ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
                agent,
                canisterId: ppvCanID
              });
              await this.handlePurchaseVideoCrypto(ppvCanID, sender, ledgerActor, ppvActor, ticker);
            }
          }
        });
      } else {
        const host = settings.icHost;

        await authClient.login({
          onSuccess: async () => {
            identity = authClient.getIdentity();
            agent = new HttpAgent({ identity, host });
            sender = await agent.getPrincipal();

            if(ticker == "ICP"){
              ledgerActor = Actor.createActor<_SERVICE_LEDGER>(idlFactoryLedger, {
                agent,
                canisterId: ledgerCanID
              });

            }else if(ticker === "ckBTC"){

              ledgerActor = IcrcLedgerCanister.create({
                agent,
                canisterId: ckBTCLedgerCanID
              });


            }else if(ticker === "TRAX"){

              ledgerActor = IcrcLedgerCanister.create({
                agent,
                canisterId: ckBTCLedgerCanID
              });


            }else{
              message.error('Invalid ticker, please select a different token!');
            }
            ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
              agent,
              canisterId: ppvCanID
            });


            await this.handlePurchaseVideoCrypto(ppvCanID, sender, ledgerActor, ppvActor, ticker);
          }
        });
      }
    } catch (err) {
      message.error(err || 'Error occured, please try again later');
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
      this.setState({ isBought: true, requesting: false });
    } catch (e) {
      const error = await e;
      this.setState({ requesting: false });
      message.error(error.message || 'Error occured, please try again later');
    }
  }

  async subscribe(currency: string, subType: string) {
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
      this.setState({ submiting: true });
      const resp = await paymentService.subscribePerformer({
        type: subType || 'monthly',
        performerId: video.performerId,
        paymentGateway: settings.paymentGateway
      });
      if (resp?.data?.stripeConfirmUrl) {
        window.location.href = resp?.data?.stripeConfirmUrl;
      }
      if (settings.paymentGateway === '-ccbill') {
        window.location.href = resp?.data?.paymentUrl;
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || 'Error occured, please try again later');
      this.setState({ submiting: false });
    }
  }

  /*async subscribeCrypto(currency: string, subType: string) {
    const { user } = this.props;
    const { video } = this.state;
    if (!user._id) {
      message.error('Please log in!');
      Router.push('/login');
      return;
    }
    try {
      let type: SubType;
      let amount: number;

      if (subType === 'monthly') {
        type = { monthly: null };
        amount = video.performer?.monthlyPrice;
      } else if (subType === 'yearly') {
        type = { yearly: null };
        amount = video.performer?.yearlyPrice;
      } else { // if subType === free
        type = { monthly: null };
        amount = video.performer?.monthlyPrice;
      }
      this.setState({ submiting: true });
      await subscriptions.subscribe(
        Principal.fromText(video.performer?.wallet_icp),
        Principal.fromText(user.wallet_icp),
        amount,
        currency,
        type
      );

      this.setState({ openSubscriptionModal: false });
      message.success(`Payment successfull! You are now a subscriber to ${video.performer?.username}`);
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
      this.setState({ openSubscriptionModal: false, submiting: false });
    } finally {
      this.setState({ submiting: false });
    }
  }*/

  handleFileChange(val){
    this.setState({isPlaying: val})
  }

  render() {
    const {
      user,
      error,
      ui,
      settings,
      relatedVideos = {
        requesting: false,
        error: null,
        success: false,
        items: []
      },
      commentMapping,
      comment
    } = this.props;
    const { video, openTeaserModal, stopTeaser } = this.state;
    if (error) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Video was not found'} />;
    }
    if (video === null || !settings) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    const { requesting: commenting } = comment;
    const fetchingComment = commentMapping.hasOwnProperty(video._id) ? commentMapping[video._id].requesting : false;
    const comments = commentMapping.hasOwnProperty(video._id) ? commentMapping[video._id].items : [];
    const totalComments = commentMapping.hasOwnProperty(video._id) ? commentMapping[video._id].total : 0;
    const {
      videoStats, isLiked, isBookmarked, isSubscribed, isBought, submiting, requesting, activeTab, isFirstLoadComment,
      openSubscriptionModal, subscriptionType, openPPVModal, openPPVProgressModal, ppvProgress, isPriceICPLoading, amountICPToDisplay, amountTRAXToDisplay, amountCKBTCToDisplay, openInfoModal, isPlaying
    } = this.state;
    const thumbUrl = video?.thumbnail?.url || (video?.teaser?.thumbnails && video?.teaser?.thumbnails[0]) || (video?.video?.thumbnails && video?.video?.thumbnails[0]) || '/static/no-image.jpg';
    
    const videoJsOptions = {
      key: video._id,
      autoplay: true,
      controls: true,
      playsinline: true,
      poster: thumbUrl,
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
    const teaserOptions = {
      key: `${video._id}_teaser`,
      autoplay: true,
      controls: true,
      playsinline: true,
      sources: [
        {
          src: video?.teaser?.url,
          type: video?.trackType === 'audio' ? 'audio/mp3' : 'video/mp4',
          uploadedToIC: video?.teaser?.uploadedToIC
        }
      ],
      source: video?.teaser?.url,
      stop: stopTeaser
    };
    const teaserOptionsAudio = {
      key: `${video._id}_teaser`,
      source: video?.teaser?.url,
      poster: thumbUrl,
      uploadedToIC: video?.teaser?.uploadedToIC,
      stop: stopTeaser
    };

    

    return (
      <Layout className={styles.pagesVideoModule}>
        <Head>
          <title>
            {`${ui.siteName} | ${video.title}`}
          </title>
          <meta name="description" content={video.description} />
          {/* OG tags */}
          <meta
            property="og:title"
            content={`${ui.siteName} | ${video.title || 'Video'}`}
          />
          <meta property="og:image" content={thumbUrl} />
          <meta
            property="og:description"
            content={video.description}
          />
          {/* Twitter tags */}
          <meta
            name="twitter:title"
            content={`${ui.siteName} | ${video.title || 'Video'}`}
          />
          <meta name="twitter:image" content={thumbUrl} />
          <meta
            name="twitter:description"
            content={video.description}
          />
        </Head>
        <div className="tick-img-background" style={{backgroundImage: thumbUrl ? `url('${thumbUrl}')`: '/static/empty_product.svg'}}>
                <div className='tick-img-blur-background' style={{background: `${video.isSale === 'pay' || video.isSale === 'subscription' && '#000'}`}}>
                </div>
              </div>
        <div className="main-container" style={{position: 'relative', maxWidth: `${video?.trackType === 'audio' ? '350px' : '100vw'}`, marginTop: `${video?.trackType === 'audio' ? '4rem' : 'unset'}` }}>
        
          <div 
          className={(video.isSale === 'pay' && !isBought) || (video.isSale === 'subscription' && !isSubscribed) ? 'vid-player-locked' : 'vid-player'} 
          // style={{width: `${video?.trackType === 'audio' ? '500px' : '100%'}` }}
          >
            
            {((video.isSale === 'subscription' && isSubscribed && !video.isSchedule) || (video.isSale === 'pay' && isBought && !video.isSchedule) || (video.isSale === 'free' && !video.isSchedule)) && (
            <>
              {video.processing ? (
                <div className="vid-processing">
                  <div className="text-center">
                    <Spin />
                    <br />
                    Track file is currently processing
                  </div>
                </div>
              ) : video?.trackType === 'audio'
                ? (
                  <div className="audio-track-wrapper">
                    <motion.div animate={isPlaying ? "isPlaying" : "isPaused"} variants={variants}
                    whileHover={{ scale: 1 }} whileTap={{ scale: 0.9 }} 
                    className="audio-thumbs">
                      <img alt="thumbnail" src={thumbUrl} />
                    </motion.div>
                    <div className='vid-heading-wrapper' >
                      <div className="vid-heading" style={{justifyContent: 'flex-start', width: '100%'}}>
                        <span className="vid-heading-span" >{video.title || 'Untitled'}</span>
                      </div>
                      <Link 
                        href={`/artist/profile?id=${video?.performer?.username || video?.performer?._id}`}
                        as={`/artist/profile?id=${video?.performer?.username || video?.performer?._id}`} 
                        style={{justifyContent: 'flex-start', width: '100%'}}
                        className="vid-artist-wrapper"
                        >
                        <span className="vid-artist">{video?.performer?.name || 'N/A'}</span>
                      </Link>
                    </div>
                    <AudioPlayer_ {...videoJsOptionsAudio} />
                  </div>
                )
                : <div><VideoPlayer {...videoJsOptions} /></div>}
            </>
            )}
            {(video.isSale === 'pay' && !isBought && !video.isSchedule) && (
              <>
              <img className='track-thumbnail' alt="thumbnail" src={thumbUrl} />
              </>

            )}
          </div>
        </div>

        <div className="secondary-container">
          {video?.trackType === 'video' && (
            <div className='vid-heading-wrapper'>
              <div className="vid-heading">
                <span className="vid-heading-span">{video.title || 'Untitled'}</span>
              </div>
              <Link 
                href={`/artist/profile?id=${video?.performer?.username || video?.performer?._id}`}
                as={`/artist/profile?id=${video?.performer?.username || video?.performer?._id}`} 
                className="vid-artist-wrapper"
                >
                <span className="vid-artist">{video?.performer?.name || 'N/A'}</span>
              </Link>
            </div>
          )}
          
          <div className='vid-more-info-btn-wrapper'>
            {(video.isSale !== 'pay' && video.isSale !== 'subscription') && (
              <Button className='vid-more-info-btn-free' >
                Free
              </Button>
            )}

            {/* {((video.isSale === 'pay' && !isBought) || (video.isSale === 'subscription' && !isSubscribed) || video.isSchedule) && (
                <Button
            
                  className="show-teaser-btn"
                  onClick={() => this.setState({ openTeaserModal: true })}
                >
                  Show teaser
                </Button>
              )} */}

            {/* {((video.isSale === 'pay' && !isBought) || (video.isSale === 'subscription' && !isSubscribed) || video.isSchedule) && (
            <div style={{ textAlign: 'center' }}>
              
              <Modal
                key="teaser"
                className="teaser-modal"
                open={openTeaserModal}
                centered
                onOk={() => this.setState({ stopTeaser: true }, () => this.setState({ openTeaserModal: false }))}
                footer={null}
                width={420}
                title={null}
                onCancel={() => this.setState({ stopTeaser: true }, () => this.setState({ openTeaserModal: false }))}
              >
                <div className="vid-group">
                  {video.teaser && video.teaserProcessing && (
                  <div className="vid-processing">
                    <div className="text-center">
                      <Spin />
                      <br />
                      Teaser is currently processing
                    </div>
                  </div>
                  )}
                  {video.teaser && !video.teaserProcessing && video?.trackType === 'audio' ? <AudioPlayer_ {...teaserOptionsAudio} /> : <VideoPlayer {...teaserOptions} />}
                  {!video.teaser && (
                  <div className="video-thumbs">
                    <img alt="thumbnail" src={thumbUrl} />
                  </div>
                  )}
                  <div className="vid-exl-group">

                    <h3>{(video.isSale === 'pay' && !isBought && !video.isSchedule) ? 'This content is locked' : (video.isSale === 'subscription' && !isSubscribed && !video.isSchedule) ? `Only subscribers of ${video?.performer?.name} can view this content.` : 'Soon to be released'}</h3>
                    <div className="text-center" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    </div>
                    {video.isSchedule && (
                    <h4>
                      Main video will be premiered on
                      {' '}
                      {formatDate(video.scheduledAt, 'll')}
                    </h4>
                    )}
                  </div>
                </div>
              </Modal>
            </div>
            )} */}

              {video.isSale === 'pay' && !isBought && (
                <>
                  <Button block className='vid-more-info-btn-ppv' loading={requesting} disabled={requesting} onClick={() => this.setState({ openPPVModal: true })} style={{ width: 'unset' }}>
                    Purchase
                  </Button>
                </>
              )}
              {video.isSale === 'subscription' && !isSubscribed && (
                <div>
                  <Button
                    className='vid-more-info-btn-sub'
                    style={{ marginRight: '15px' }}
                    disabled={!user || !user._id}
                    onClick={() => {
                      this.setState({ openSubscriptionModal: true, subscriptionType: 'monthly' });
                    }}
                  >
                    Subscribe
                  </Button>
                </div>
              )}
               
              <div className="like-act-btns">
              <button
                type="button"
                className={isLiked ? 'react-btn active' : 'react-btn'}
                onClick={this.onReaction.bind(this, 'like')}
              >
                {isLiked ? <FireFilled /> : <FireOutlined />}
                {isLiked && (
                  <>
                  {' '}
                    {shortenLargeNumber(videoStats.likes || 0)}
                  </>
                )}
              </button>
            </div>
            <button
                type="button"
                className={isBookmarked ? 'react-btn-lg active' : 'react-btn-lg'}
                onClick={this.onReaction.bind(this, 'book_mark')}
              >
                {isBookmarked ? (
                  <BsCheckCircleFill style={{ color: '#c7ff02' }} />
                ) : (
                  <PlusOutlined />
                )}
                {' '}
              </button>

              {/* <button
                type="button"
                className={isBookmarked ? 'react-btn-lg active' : 'react-btn-lg'}
                onClick={()=>this.setState({openInfoModal: true})}
              >
                <FontAwesomeIcon icon={faEllipsis} />
              </button> */}
          </div>

          <div>
          
          <div className='vid-tab-wrapper'>
            <Tabs
              defaultActiveKey="comment"
              activeKey={activeTab}
              onChange={(tab) => this.onChangeTab(tab)}
              className=""
            >
              <TabPane
                tab="Comments"
                key="comment"
              >
                <CommentForm
                  creator={user}
                  onSubmit={this.onSubmitComment.bind(this)}
                  objectId={video._id}
                  requesting={commenting}
                  objectType="video"
                  siteName={ui?.siteName}
                />

                <ListComments
                  key={`list_comments_${comments.length}`}
                  requesting={fetchingComment}
                  comments={comments}
                  total={totalComments}
                  onDelete={this.deleteComment.bind(this)}
                  user={user}
                  canReply
                />

                {comments.length < totalComments && (
                  <p className="text-center">
                    <a aria-hidden onClick={this.loadMoreComment.bind(this)}>
                      More comments
                    </a>
                  </p>
                )}
              </TabPane>
              
              <TabPane tab="Participants" key="participants">
                {video.participants && video.participants.length > 0 ? (
                  video.participants.map((per: IPerformer) => (
                    <Link
                      key={per._id}
                      href={`/artist/profile?id=${per?.username || per?._id}`}
                      as={`/artist/profile?id=${per?.username || per?._id}`}
                      legacyBehavior
                    >
                      <div key={per._id} className="participant-card">
                        <img
                          alt="per_atv"
                          src={per?.avatar || '/no-avatar.png'}
                        />
                        <div className="participant-info">
                          <h4>
                            {per?.name || 'N/A'}
                            &nbsp;
                            {per?.verifiedAccount && <BadgeCheckIcon style={{ height: '1rem', color: '#c8ff02' }} />}
                            &nbsp;
                            {per?.wallet_icp && (

                              <Image src="/static/infinity-symbol.png" style={{ height: '1rem' }} />
                            )}
                          </h4>

                          <h5>
                            @
                            {per?.username || 'n/a'}
                          </h5>
                          <Tooltip title={per?.bio}>
                            <div className="p-bio">
                              {per?.bio || 'No bio'}
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p style={{color: 'white'}}>No profile was found.</p>
                )}
              </TabPane>
              <TabPane tab="Description" key="description">
                <div className='descriptions-wrapper'>
                  <span className=''>
                    {shortenLargeNumber(videoStats.views || 0)}
                    &nbsp;
                    <span>streams</span>
                  </span>
                  <span className=''>
                    {formatDate(video.updatedAt, 'll')}
                  </span>

                  <span>
                    {video.tags && video.tags.length > 0 && (
                    
                    <>
                      {video.tags.map((tag) => (
                        <a color="magenta" key={tag} style={{ marginRight: 5 }}>
                          #
                          {tag || 'tag'}
                        </a>
                      ))}
                    
                    </>
                  )}
                  </span>

                  
                </div>
              
              
                <p style={{ color: '#959595' }}>{video.description || 'No description...'}</p>
              </TabPane>
              
            </Tabs>
          </div>
          </div>
          
          <div className="related-items">
            <h4 className="ttl-1">You may also like</h4>
            {relatedVideos.requesting && <div className="text-center"><Spin /></div>}
            {relatedVideos.items.length > 0 && !relatedVideos.requesting && (
              <RelatedListVideo videos={relatedVideos.items} />
            )}
            {!relatedVideos.items.length && !relatedVideos.requesting && (
              <p>No video was found</p>
            )}
          </div>
        </div>
        <Modal
          key="ppv-purchase-modal"
          className="ppv-purchase-modal"
          width={500}
          centered
          title={null}
          open={openInfoModal}
          footer={null}
          onCancel={() => this.setState({ openInfoModal: false })}
        >

          <div className="vid-split">
            <div className='track-info-modal-title'>
              <span>Track info</span>
            </div>
            
            <div className="track-info-title">
              <span >{video?.title || ' '}</span>
            </div>
            <div className="main-container">
              <div className="vid-act">
                <Link
                  href={`/artist/profile?id=${video?.performer?.username || video?.performer?._id}`}
                  as={`/artist/profile?id=${video?.performer?.username || video?.performer?._id}`}
                >
                  <div className="o-w-ner">
                    <Avatar
                      alt="performer avatar"
                      src={video?.performer?.avatar || '/static/no-avatar.png'}
                    />
                    <div className="owner-name">
                      <div className="name inline-flex items-center">
                        {video?.performer?.name || 'N/A'}
                      &nbsp;
                        {video?.performer?.verifiedAccount && <BadgeCheckIcon style={{ height: '1rem', color: '#c8ff02' }} />}
                          &nbsp;
                        {video?.performer?.wallet_icp && (
                        <Image src="/static/infinity-symbol.png" style={{ height: '1rem', width: '1rem' }} />
                        )}
                      </div>
                      <small>
                        @
                        {video?.performer?.username || 'n/a'}
                      </small>
                    </div>
                  </div>
                </Link>

                <div className="act-btns">
                  <button
                    type="button"
                    className={isLiked ? 'react-btn active' : 'react-btn'}
                    onClick={this.onReaction.bind(this, 'like')}
                  >
                    {isLiked ? <FireFilled /> : <FireOutlined />}
                    {' '}
                    {shortenLargeNumber(videoStats.likes || 0)}
                  </button>
                  <button
                    onClick={() => this.setState({ activeTab: 'comment' })}
                    type="button"
                    className={activeTab === 'comment' ? 'react-btn active' : 'react-btn'}
                  >
                    <CommentOutlined />
                    {' '}
                    {!isFirstLoadComment && !fetchingComment ? shortenLargeNumber(videoStats.comments || 0) : shortenLargeNumber(totalComments)}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="vid-duration">
            <a className="vid-duration-wrapper">
              {shortenLargeNumber(videoStats.views || 0)}
              &nbsp;
              <span>views</span>
              &nbsp;&nbsp;&nbsp;
              &nbsp;
              {formatDate(video.updatedAt, 'll')}
            </a>
          </div>
          {video.tags && video.tags.length > 0 && (
          <div className="vid-tags">
            {video.tags.map((tag) => (
              <a color="magenta" key={tag} style={{ marginRight: 5 }}>
                #
                {tag || 'tag'}
              </a>
            ))}
          </div>
          )}
          <Tabs
            defaultActiveKey="description"
            activeKey={activeTab}
            onChange={(tab) => this.onChangeTab(tab)}
            className=""
          >
            <TabPane tab="Description" key="description">
              <p style={{ color: '#959595' }}>{video.description || 'No description...'}</p>
            </TabPane>
            <TabPane tab="Participants" key="participants">
              {video.participants && video.participants.length > 0 ? (
                video.participants.map((per: IPerformer) => (
                  <Link
                    key={per._id}
                    href={`/artist/profile?id=${per?.username || per?._id}`}
                    as={`/artist/profile?id=${per?.username || per?._id}`}
                    legacyBehavior
                  >
                    <div key={per._id} className="participant-card">
                      <img
                        alt="per_atv"
                        src={per?.avatar || '/no-avatar.png'}
                      />
                      <div className="participant-info">
                        <h4>
                          {per?.name || 'N/A'}
                          &nbsp;
                          {per?.verifiedAccount && <BadgeCheckIcon style={{ height: '1rem', color: '#c8ff02' }} />}
                          &nbsp;
                          {per?.wallet_icp && (

                            <Image src="/static/infinity-symbol.png" style={{ height: '1rem' }} />
                          )}
                        </h4>

                        <h5>
                          @
                          {per?.username || 'n/a'}
                        </h5>
                        <Tooltip title={per?.bio}>
                          <div className="p-bio">
                            {per?.bio || 'No bio'}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p style={{color: 'white'}}>No profile was found.</p>
              )}
            </TabPane>
            <TabPane
              tab="Comments"
              key="comment"
            >
              <CommentForm
                creator={user}
                onSubmit={this.onSubmitComment.bind(this)}
                objectId={video._id}
                requesting={commenting}
                objectType="video"
                siteName={ui?.siteName}
              />

              <ListComments
                key={`list_comments_${comments.length}`}
                requesting={fetchingComment}
                comments={comments}
                total={totalComments}
                onDelete={this.deleteComment.bind(this)}
                user={user}
                canReply
              />

              {comments.length < totalComments && (
                <p className="text-center">
                  <a aria-hidden onClick={this.loadMoreComment.bind(this)}>
                    More comments
                  </a>
                </p>
              )}
            </TabPane>
          </Tabs>
        </Modal>


        <Modal
          key="ppv-purchase-modal2"
          className="ppv-purchase-modal"
          width={420}
          centered
          title={null}
          open={openPPVModal}
          footer={null}
          onCancel={() => this.setState({ openPPVModal: false })}
        >

          <PPVPurchaseModal
            type={subscriptionType || 'monthly'}
            performer={video?.performer}
            submiting={submiting}
            onFinish={this.beforePurchase.bind(this)}
            isPriceICPLoading={isPriceICPLoading}
            user={user}
            video={video}
            contentPriceICP={amountICPToDisplay}
            contentPriceCKBTC={amountCKBTCToDisplay}
            contentPriceTRAX={amountTRAXToDisplay}
          />
        </Modal>

        <Modal
          key="ppv_progress"
          className="tip-progress"
          open={openPPVProgressModal}
          centered
          onOk={() => this.setState({ openPPVProgressModal: false })}
          footer={null}
          width={450}
          title={null}
          onCancel={() => this.setState({ openPPVProgressModal: false })}
        >

          <PaymentProgress progress={ppvProgress} performer={video?.performer}/>

        </Modal>

        <Modal
          key="subscribe_performer"
          className="subscription-modal"
          width={420}
          centered
          title={null}
          open={openSubscriptionModal}
          footer={null}
          onCancel={() => this.setState({ openSubscriptionModal: false })}
        >
          <ConfirmSubscriptionPerformerForm
            type={subscriptionType || 'monthly'}
            performer={video?.performer}
            submiting={submiting}
            onFinish={this.subscribe.bind(this)}
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
