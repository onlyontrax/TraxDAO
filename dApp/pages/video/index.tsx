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
import { debounce } from 'lodash';
import LogInModal from 'src/components/log-in/log-in-modal';
import SignUpModal from '@components/sign-up/sign-up-modal';
import { Description } from '@headlessui/react/dist/components/description/description.js';
import { ChevronDownIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';
import {MusicPage} from '../../src/components/video/music'
import {VideoPage} from '../../src/components/video/video'
import {
  requestConnectPlug,
  transferPlug,
  requestPlugBalance,
  purchasePPVPlug
} from "../../src/crypto/transactions/plug-tip";
import { getPlugWalletIsConnected, getPlugWalletAgent, getPlugWalletProvider } from '../../src/crypto/mobilePlugWallet';

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
    openLogInModal: false,
    openSignUpModal: false,
    showComments: true,
    showCollabs: true,
    showDescription: true,
    contentUnlocked: false,
    suggestedVideos: [],
    confetti: false,
    dataLoaded: false
  };


  async getSuggestedVideos(vid){

    let arr = []

    if(vid?.tags?.length > 0){
      vid.tags.map(async (tag)=>{
        await videoService.homePageSearch({
          limit: 12,
          sortBy: 'latest',
          tags: tag,
          offset: 0,
        }).then((res)=>{

          res.data.data.map((v)=>{

            if(vid._id !== v._id){
              arr.length === 0 && arr.push(v);
              const exists = arr.some(obj => obj['_id'] === v['_id']);
              if (!exists) {
                arr.push(v);
              }
            }
          })
        })
      })

      // if(arr.length < 15 && relatedVideos.length > 0){
      //   console.log(relatedVideos)
      //   relatedVideos.items.map((item, index)=>{
      //     if(arr.length !== 15){
      //       arr.push(item)
      //     }
      //   })
      // }

      this.setState({suggestedVideos: arr});
    }
  }

  async componentDidMount() {
    const { video } = this.state;
    let arr = []
    if (video === null) {
      const data = await this.getData();
      this.promptSignIn();
      let vid = data.video;
      this.getSuggestedVideos(vid);
      this.setState({ video: vid, dataLoaded: true }, () => this.updateDataDependencies());
    } else {
      await this.updateDataDependencies();
    }

    Router.events.on('routeChangeComplete', this.onRouteChangeComplete);
  }

  componentWillUnmount() {
    Router.events.off('routeChangeComplete', this.onRouteChangeComplete);
  }

  promptSignIn = debounce(async () => {
    const { user } = this.props;
    this.setState({isSignedIn: user._id ? true : false})
  })

  onRouteChangeComplete = async (url) => {
    this.setState({ dataLoaded: false });
    const data = await this.getData();

    this.setState({ video: data.video, dataLoaded: true}, () => this.updateDataDependencies());
  };

  async updateDataDependencies() {
    const { settings } = this.props;
    // let identity;
    // const authClient = await AuthClient.create();
    // const host = settings.icHost;
    // let agent;

    // if (settings.icNetwork !== true) {
    //   identity = authClient.getIdentity();

    //   agent = new HttpAgent({
    //     identity,
    //     host
    //   });

    //   await agent.fetchRootKey();
    // } else {
    //   identity = await authClient.getIdentity();
    //   agent = new HttpAgent({
    //     identity,
    //     host
    //   });
    // }

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

    let unlocked = (video.isSale === 'subscription' && video.isSubscribed) || (video.isSale === 'pay' && video.isBought) || (video.isSale === 'free')

    this.getSuggestedVideos(video);

    this.setState({
      videoStats: video.stats,
      isLiked: video.isLiked,
      isBookmarked: video.isBookmarked,
      isBought: video.isBought,
      isCryptoPayment: video.isCryptoPayment,
      recipient: video.performerWalletAddress,
      isSubscribed: video.isSubscribed,
      contentUnlocked: unlocked,
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
      }else if(paymentOption === 'plug'){
        await this.purchaseVideoPlug(ticker);
      }else if(paymentOption === 'II' || paymentOption === 'nfid'){
        await this.purchaseVideoCrypto(ticker);
      }else{
        message.error("Payment option does not exist.")
      }
    }catch(error){
      console.log(error);
    }finally{
      Router.push(`/video?id=${video._id}`);
    }

    //
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

    const plugWalletProvider = await getPlugWalletProvider();
    const agent = await getPlugWalletAgent('ppvCanID');
    const connected = await getPlugWalletIsConnected();

    !connected && message.info("Failed to connected to canister. Please try again later or contact us. ")

    let ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
      agent: agent,
      canisterId: ppvCanID
    });

    if(connected){
      this.setState({ openPPVProgressModal: true, openPPVModal: false, ppvProgress: 25 });
      //@ts-ignore
      const requestBalanceResponse = await plugWalletProvider.requestBalance();
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
          transfer = await plugWalletProvider.requestTransferToken(params).catch((error) =>{
            message.error('Transaction failed. Please try again later.');
            this.setState({requesting: false, submiting: false, openPPVProgressModal: false, ppvProgress: 0})
          });

        } else {
          this.setState({ requesting: false, submiting: false, openPPVProgressModal: false, ppvProgress: 0 })
          message.error('Insufficient balance, please top up your wallet and try again.');
        }
      }

      if(ticker === 'TRAX'){
        if(TRAX_balance >= Number(amountTRAX)){
          this.setState({ ppvProgress: 50 });
          const params = {
            to: ppvCanID,
            strAmount: amountTRAX,
            token: settings.icTraxToken
          };
          //@ts-ignore
          transfer = await plugWalletProvider.requestTransferToken(params).catch((error) =>{
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
          transfer = await plugWalletProvider.requestTransfer(requestTransferArg).catch((error) =>{
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
      this.setState({ isBought: true, requesting: false, openPPVModal: false });
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

  closeSubModal(val){
    this.setState({openSubscriptionModal: false})
  }


  handleOpenSignUp = (isOpen: boolean, loggedIn: boolean) => {
    loggedIn ? this.setState({ openLogInModal: isOpen, openSignUpModal: false }) : this.setState({ openLogInModal: isOpen, openSignUpModal: true })
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
      comment
    } = this.props;
    const { video, dataLoaded } = this.state;
    if (dataLoaded === false) {
      return (
        <div style={{ margin: 30, textAlign: "center" }}>
          <Spin />
        </div>
      );
    }

    if (error || video === null || video.length === 0) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Video was not found'} />;
    }
    const { requesting: commenting } = comment;

    const {
      videoStats, contentUnlocked, confetti, showComments, showCollabs, showDescription, isLiked, isBookmarked, isSubscribed, openSignUpModal, openLogInModal, isBought, submiting, requesting, activeTab, isFirstLoadComment, isSignedIn,
      openSubscriptionModal, suggestedVideos, subscriptionType, openPPVModal, openPPVProgressModal, ppvProgress, isPriceICPLoading, amountICPToDisplay, amountTRAXToDisplay, amountCKBTCToDisplay, openInfoModal, isPlaying
    } = this.state;
    const thumbUrl = video?.thumbnail?.url || (video?.teaser?.thumbnails && video?.teaser?.thumbnails[0]) || (video?.video?.thumbnails && video?.video?.thumbnails[0]) || '/static/no-image.jpg';


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
        {video.trackType === "audio" ? (
          <MusicPage
            video={video}
            user={user}
            error={error}
            contentUnlocked={contentUnlocked}
            ui={ui}
            relatedVideos={suggestedVideos.length > 0 ? suggestedVideos : relatedVideos.items}
            openLogIn={this.handleOpenModal.bind(this)}
            openSubModal={this.openSubModal.bind(this)}
            openPurchaseModal={this.openPurchaseModal.bind(this)}
            settings={settings}
          />
        ) : (
          <VideoPage
            video={video}
            user={user}
            error={error}
            relatedVideos={suggestedVideos.length > 0 ? suggestedVideos : relatedVideos.items}
            openSubModal={this.openSubModal.bind(this)}
            openPurchaseModal={this.openPurchaseModal.bind(this)}
            contentUnlocked={contentUnlocked}
            openLogIn={this.handleOpenModal.bind(this)}
            ui={ui}
            settings={settings}
          />
        )}








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
            contentPriceICP={Number(amountICPToDisplay)}
            contentPriceCKBTC={Number(amountCKBTCToDisplay)}
            contentPriceTRAX={Number(amountTRAXToDisplay)}
          />
        </Modal>

        {/* <Modal
          key="ppv_progress"
          className="tip-progress"
          open={openPPVProgressModal}
          centered
          onOk={() => this.setState({ openPPVProgressModal: false })}
          footer={null}
          width={450}
          title={null}
          onCancel={() => this.setState({ openPPVProgressModal: false })}
        > */}
        {openPPVProgressModal && (
            <PaymentProgress stage={ppvProgress}  confetti={confetti} />
          )}

        {/* </Modal> */}

        <Modal
          key="subscribe_performer"
          className="subscription-modal"
          width={600}
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
