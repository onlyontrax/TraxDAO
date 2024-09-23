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

import {
  authService,
  feedService,
  followService,
  nftService,
  paymentService,
  performerService,
  tokenTransctionService,
  utilsService,
  routerService,
} from "src/services";
import { DollarOutlined } from "@ant-design/icons";

import { ConfirmSubscriptionPerformerForm } from "@components/performer";
import TipPerformerForm from "@components/performer/tip-form";
import { PerformerInfo } from "@components/performer/table-info";

import { ScrollListVideo } from "@components/video/scroll-list-item";
import { ScrollListMusic } from "@components/video/scroll-list-music";

import Error from "next/error";
import Link from "next/link";
import Router from "next/router";
import { Parallax, ParallaxBanner } from "react-scroll-parallax";

import { ICountry, IFeed, IPerformer, ISettings, IUIConfig, IUser } from "src/interfaces";

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
  transferPlug,

  sendTipPlug,

  requestPlugBalance
} from "../../../src/crypto/transactions/plug-tip";
import { getPlugWalletIsConnected, getPlugWalletAgent, getPlugWalletProvider, getPrincipalId, createPlugwalletActor } from '../../../src/crypto/mobilePlugWallet';


interface IProps {
  ui: IUIConfig;
  error: any;
  user: IUser;
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
    confetti: false
  };

  async getData() {
    try {
      const url = new URL(window.location.href);
      const id = url.searchParams.get("id");

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
      console.log("performer fetch error", e);
      console.log("performer fetch error2", await e);
      return {
        performer: null,
        countries: null,
      };
    }
  }


  getMusic = debounce(async () => {
    const { videoState, getVideos: handleGetVids, performer } = this.props;
    const { filter} = this.state;
    let vids = videoState.item
    if(vids){
      let videosArr = []
      let audioArr = []
      vids.map((vid)=>{
        if(vid.trackType === 'video'){
          videosArr.push(vid)
        }else{
          audioArr.push(vid)
        }
      });

      const query = {
        limit: 10,
        offset: 0,
        performerId: performer?._id,
        q: filter.q || "",
        fromDate: filter.fromDate || "",
        toDate: filter.toDate || ""
      };

      // this.setState({_videos: videosArr, music: audioArr});
      handleGetVids({
        ...query,
      })
    }
  });

  async componentDidMount() {
    const { performer } = this.state;

    if (performer === null) {
      const data = await this.getData();
      routerService.changeUrlPath();
      this.getMusic();
      this.setState({ performer: data.performer, countries: data.countries, dataLoaded: true }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
      routerService.changeUrlPath();
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

  // const bubblyButtons = document.getElementsByClassName("bubbly-button");

  // for (let i = 0; i < bubblyButtons.length; i++) {
  //   bubblyButtons[i].addEventListener('click', animateButton, false);
  // }


  // componentWillUnmount() {
  //   const bubblyButtons = document.getElementsByClassName("bubbly-button");

  //   for (let i = 0; i < bubblyButtons.length; i++) {
  //     bubblyButtons[i].removeEventListener('click', this.animateButton, false);
  //   }
  // }





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
    // const nfts = await nftService.getArtistNfts(performer?.wallet_icp);
    // this.setState({ nfts, loadNft: false });
  }

  checkWindowInnerWidth = () => {
    this.setState({ isDesktop: window.innerWidth > 500 });
    window.addEventListener("resize", this.updateMedia);
    return () => window.removeEventListener("resize", this.updateMedia);
  };

  updateMedia = () => {
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
        await followService.create(performer?._id);
        this.setState({ isFollowed: true, requesting: false });
      } else {
        await followService.delete(performer?._id);
        this.setState({ isFollowed: false, requesting: false });
      }
      if (tab === "post") {
        this.loadItems();
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || "Error occured, please try again later");
      this.setState({ requesting: false });
    }
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

  async subscribe(currency: string, subType: string) {
    currency === "USD" ? await this.subscribeFiat(subType) : await this.subscribeFiat(subType); //await this.subscribeCrypto(currency, subType);
  }

  async subscribeFiat(subType: string) {
    const { user, settings } = this.props;
    const { performer } = this.state;
    if (performer === null) return;
    if (!user._id) {
      message.error("Please log in!");
      Router.push("/login");
      return;
    }
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
      //message.success(`Payment successfull! You are now a subscriber to ${performer?.name}`);
    } catch (e) {
      const err = await e;
      message.error(err.message || "error occured, please try again later");
      this.setState({ openSubscriptionModal: false, submiting: false });
    } finally {
      this.setState({ submiting: false });
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
        Principal.fromText(performer?.wallet_icp),
        Principal.fromText(user.wallet_icp),
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
      if (paymentOption === "plug") {
        await this.beforeSendTipPlug(price, ticker);
      } else {
        await this.sendTipCrypto(price, ticker);
      }
    }
  }

  async sendTipFiat(price: number) {
    const { user, updateBalance: handleUpdateBalance } = this.props;
    const { performer } = this.state;
    if (performer === null) return;
    if (user.balance < price) {
      message.error("You have an insufficient wallet balance. Please top up.");
      Router.push("/user/wallet/");
      return;
    }
    try {
      this.setState({ requesting: true });
      await tokenTransctionService.sendTip(performer?._id, { performerId: performer?._id, price });
      message.success("Thank you for the tip");
      handleUpdateBalance({ token: -price });
    } catch (e) {
      const err = await e;
      message.error(err.message || "error occured, please try again later");
    } finally {
      this.setState({ requesting: false, openTipModal: false });
    }
  }

  async handleSendTipCrypto(
    tippingCanID: Principal,
    fanID: Principal,
    amountToSend: bigint,
    ledgerActor: any,
    tippingActor: any,
    ticker: string
  ) {
    const { performer } = this.state;
    if (performer === null) return;

    this.setState({ openTipProgressModal: true, openTipModal: false, tipProgress: 1 });

    const tippingCanisterAI = AccountIdentifier.fromPrincipal({
      principal: tippingCanID,
    });

    // @ts-ignore
    const { bytes } = tippingCanisterAI;
    const accountIdBlob = Object.keys(bytes).map(m => bytes[m]);

    const fanAI = AccountIdentifier.fromPrincipal({
      principal: fanID,
    });

    // @ts-ignore
    const fanBytes = fanAI.bytes;

    const txTime: TimeStamp = {
      timestamp_nanos: BigInt(Date.now() * 1000000),
    };
    const balArgs: AccountBalanceArgs = {
      account: fanBytes,
    };

    const uuid = BigInt(Math.floor(Math.random() * 1000));
    let transferArgs: TransferArgs;
    let transferParams: TransferParams;
    if (ticker === "ICP") {
      transferArgs = {
        memo: uuid,
        amount: { e8s: amountToSend },
        fee: { e8s: BigInt(10000) },
        from_subaccount: [],
        to: accountIdBlob,
        created_at_time: [txTime],
      };

      let balICP = await ledgerActor.account_balance(balArgs);

      if (Number(balICP.e8s) < Number(amountToSend) + 10000) {
        this.setState({
          requesting: false,
          submiting: false,
          openTipProgressModal: false,
          tipProgress: 0,
        });
        message.error("Insufficient balance, please top up your wallet with ICP and try again.");
      }
    } else if (ticker === "ckBTC") {
      transferParams = {
        amount: amountToSend,
        fee: BigInt(10),
        from_subaccount: null,
        to: {
          owner: tippingCanID,
          subaccount: [],
        },
        created_at_time: BigInt(Date.now() * 1000000),
      };

      let balICRC1 = await ledgerActor.balance({
        owner: fanID,
        certified: false,
      });

      if (Number(balICRC1) < Number(amountToSend) + 10) {
        this.setState({
          requesting: false,
          submiting: false,
          openTipProgressModal: false,
          tipProgress: 0,
        });
        message.error("Insufficient balance, please top up your wallet with ckBTC and try again.");
      }
    }else if (ticker === "TRAX"){
      transferParams = {
        amount: amountToSend,
        fee: BigInt(100000),
        from_subaccount: null,
        to: {
          owner: tippingCanID,
          subaccount: [],
        },
        created_at_time: BigInt(Date.now() * 1000000),
      };

      let balICRC1 = await ledgerActor.balance({
        owner: fanID,
        certified: false,
      });

      if (Number(balICRC1) < Number(amountToSend) + 100000) {
        this.setState({
          requesting: false,
          submiting: false,
          openTipProgressModal: false,
          tipProgress: 0,
        });
        message.error("Insufficient balance, please top up your wallet with TRAX and try again.");
      }
    }else {
      this.setState({
        requesting: false,
        submiting: false,
        openTipProgressModal: false,
        tipProgress: 0,
      });
      message.error("Invalid ticker, please select a different token!");
    }

    const participants = [];

    const obj2: Participants = {
      participantID: Principal.fromText(performer?.wallet_icp),
      participantPercentage: 1,
    };
    participants.push(obj2);

    const participantArgs: TippingParticipants = participants;
    this.setState({ tipProgress: 2 });
    await ledgerActor
      .transfer(ticker === "ICP" ? transferArgs : transferParams)
      .then(async res => {
        this.setState({ tipProgress: 3 });

        await tippingActor
          .sendTip(ticker === "ICP" ? res.Ok : res, participantArgs, amountToSend, ticker)
          .then(() => {
            this.setState({ tipProgress: 4 });
            tokenTransctionService
              .sendCryptoTip(performer?._id, {
                performerId: performer?._id,
                price: Number(amountToSend),
                tokenSymbol: ticker,
              })
              .then(() => {});
            setTimeout(
              () =>
                this.setState({
                  requesting: false,
                  submiting: false
                }),
              1000
            );

            message.success(`Payment successful! ${performer?.name} has recieved your tip`);
            this.setState({ requesting: false, submiting: false });
          })
          .catch(error => {
            this.setState({
              requesting: false,
              submiting: false,
              openTipProgressModal: false,
              tipProgress: 0,
            });
            message.error(error.message || "error occured, please try again later");
            return error;
          });
        // }
      })
      .catch(error => {
        this.setState({
          requesting: false,
          submiting: false,
          openTipProgressModal: false,
          tipProgress: 0,
        });
        message.error(error.message || "error occured, please try again later");
        return error;
      });
  }



  async beforeSendTipPlug(amount: number, ticker: string) {
    const { performer } = this.state;
    const { settings } = this.props;

    this.setState({requesting: false, submiting: false, openTipProgressModal: false, tipProgress: 0});
    let currentCanId, transfer;
    let amountToSend = BigInt(Math.trunc(Number(amount) * 100000000));
    const tippingCanID = settings.icTipping;
    const whitelist = [tippingCanID];

    try{
      ticker === "ICP" && (currentCanId = null)
      ticker === "ckBTC" && (currentCanId = settings.icCKBTCMinter)
      ticker === "TRAX" && (currentCanId = settings.icTraxToken)

      const mobileProvider = await getPlugWalletProvider();
      const agent = await getPlugWalletAgent("icTipping");
      const delegatedIdentity = await mobileProvider?.delegatedIdentity;

      if (agent) {
        let connected = await getPlugWalletIsConnected();
        if (connected) {
          let tippingActor:any = createPlugwalletActor(idlFactoryTipping, tippingCanID, settings.icHost, delegatedIdentity, agent);

          /*let tippingActor = Actor.createActor<_SERVICE_TIPPING>(idlFactoryTipping, {
            agent: (window as any).ic.plug.agent,
            canisterId: tippingCanID,
          });*/

          this.setState({ openTipProgressModal: true, openTipModal: false, tipProgress: 1 });

            transfer = await transferPlug(tippingCanID, amount.toString(), Number(amountToSend), ticker, currentCanId);
            this.setState({ tipProgress: 2 });
            if(!transfer){
              message.error(`Transaction failed, please try again.`);
              this.setState({ requesting: false, submiting: false, openTipProgressModal: false, tipProgress: 0 });
            }


          if (transfer) {
            this.setState({ tipProgress: 3 });

            await sendTipPlug(Principal.fromText(performer?.wallet_icp), tippingActor, transfer, amountToSend, ticker, performer?._id).then(()=>{
              this.setState({confetti: true})
            message.success(`Payment successful! ${performer.name} has recieved your tip`);
              this.setState({ tipProgress: 5, requesting: false, submiting: false});
            })

          } else {
            message.error("Transaction failed. Please try again later.");
          }
        }
      }
    }catch(error){
      console.log(error)
      message.error("Transaction failed. Please try again later.");
      this.setState({ requesting: false, submiting: false, openTipProgressModal: false, tipProgress: 0});
    }
  }

  async sendTipCrypto(amount: number, ticker: string) {
    const { performer } = this.state;
    const { settings } = this.props;
    if (performer === null) return;
    if (!performer?.wallet_icp) {
      this.setState({
        requesting: false,
        submiting: false,
        openTipProgressModal: false,
        tipProgress: 0,
      });
      message.info("This artist is not a web3 user and therefore cannot recieve tips in crypto at this time.");
      return;
    }

    let amountToSend = BigInt(Math.trunc(Number(amount) * 100000000));

    try {
      this.setState({ requesting: true, submiting: true });

      let identity;
      let ledgerActor;
      const authClient = await AuthClient.create();
      let sender;
      let tippingActor;
      let agent;

      const tippingCanID = Principal.fromText(settings.icTipping);
      const ledgerCanID = settings.icLedger;
      const ckBTCLedgerCanID = Principal.fromText(settings.icCKBTCMinter);
      const TRAXLedgerCanID = Principal.fromText(settings.icTraxToken);

      if (settings.icNetwork !== true) {
        await authClient.login({
          identityProvider: cryptoService.getIdentityProviderLink(),
          onSuccess: async () => {
            identity = authClient.getIdentity();

            const host = settings.icHost;

            agent = new HttpAgent({ identity, host });

            agent.fetchRootKey();
            sender = await agent.getPrincipal();
            if (ticker == "ICP") {
              ledgerActor = Actor.createActor<_SERVICE_LEDGER>(idlFactoryLedger, {
                agent,
                canisterId: ledgerCanID,
              });
            } else if (ticker === "ckBTC") {
              ledgerActor = IcrcLedgerCanister.create({
                agent,
                canisterId: ckBTCLedgerCanID,
              });
            }else if ( ticker === "TRAX") {
              ledgerActor = IcrcLedgerCanister.create({
                agent,
                canisterId: TRAXLedgerCanID,
              });
            } else {
              message.error("Invalid ticker, please select a different token!");
            }
            tippingActor = Actor.createActor<_SERVICE_TIPPING>(idlFactoryTipping, {
              agent,
              canisterId: tippingCanID,
            });
            await this.handleSendTipCrypto(
              tippingCanID,
              sender,
              amountToSend,
              ledgerActor,
              tippingActor,
              ticker
            );
          },
        });
      } else {
        const host = settings.icHost;

        await authClient.login({
          onSuccess: async () => {
            identity = await authClient.getIdentity();
            agent = new HttpAgent({ identity, host });
            sender = await agent.getPrincipal();
            if (ticker === "ICP") {
              ledgerActor = Actor.createActor<_SERVICE_LEDGER>(idlFactoryLedger, {
                agent,
                canisterId: ledgerCanID,
              });
            } else if (ticker == "ckBTC") {
              ledgerActor = IcrcLedgerCanister.create({
                agent,
                canisterId: ckBTCLedgerCanID,
              });
            } else if ( ticker === "TRAX") {
              ledgerActor = IcrcLedgerCanister.create({
                agent,
                canisterId: TRAXLedgerCanID,
              });
            } else {
              message.error("Invalid ticker, please select a different token!");
            }
            tippingActor = Actor.createActor<_SERVICE_TIPPING>(idlFactoryTipping, {
              agent,
              canisterId: tippingCanID,
            });

            await this.handleSendTipCrypto(
              tippingCanID,
              sender,
              amountToSend,
              ledgerActor,
              tippingActor,
              ticker
            );
          },
        });
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || "error occured, please try again later");
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

  render() {
    const { error, ui, user, feedState, videoState, productState, settings, ticketState } = this.props;
    const { performer, countries, dataLoaded } = this.state;
    if (dataLoaded === false) {
      return (
        <div style={{ margin: 30, textAlign: "center" }}>
          <Spin />
        </div>
      );
    }
    if (error || performer === null || performer.length === 0) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || "Artist not found"} />;
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
      colorHex,
      openTipProgressModal,
      tipProgress,
      nfts,
      loadNft,
      _videos,
      music,
      confetti
    } = this.state;

    return (
      <Layout
        className={styles.componentsPerformerVerificationFormModule}
        style={{marginTop: -55}}
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
          <meta name="description" content={performer?.bio} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={`${ui?.siteName} | ${performer?.name || performer?.username}`} />
          <meta property="og:image" content={performer?.avatar || "/static/no-avatar.png"} />
          <meta property="og:description" content={performer?.bio} />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={`${ui?.siteName} | ${performer?.name || performer?.username}`} />
          <meta name="twitter:image" content={performer?.avatar || "/static/no-avatar.png"} />
          <meta name="twitter:description" content={performer?.bio} />
        </Head>
        <div className="top-profile">
          <ParallaxBanner
            layers={[{ image: `${performer?.cover || "/static/banner-image.jpg"}`, scale: [1.1, 1], speed: -14 }]}
            className="parallax-banner-profile"
          >
            <div className="bg-2nd">
              <div className="top-banner">
                <a aria-hidden className="arrow-back" onClick={() => Router.back()}>
                  {/* <div style={{ background: "#0000008a", borderRadius: "20px", padding: "2px 5px" }}>
                    <LeftOutlined />
                  </div> */}
                </a>
                {/* <div className="top-right-wrapper">
                  <div className="profile-genres-row">
                    {performer?.genreOne && performer?.genreOne !== "Unset" && (
                      <span className="genre-profile-val">{performer?.genreOne}</span>
                    )}
                    {performer?.genreTwo && performer?.genreTwo !== "Unset" && (
                      <span className="genre-profile-val">{performer?.genreTwo}</span>
                    )}
                    {performer?.genreThree && performer?.genreThree !== "Unset" && (
                      <span className="genre-profile-val">{performer?.genreThree}</span>
                    )}
                    {performer?.genreFour && performer?.genreFour !== "Unset" && (
                      <span className="genre-profile-val">{performer?.genreFour}</span>
                    )}
                    {performer?.genreFive && performer?.genreFive !== "Unset" && (
                      <span className="genre-profile-val">{performer?.genreFive}</span>
                    )}
                  </div>
                  {performer?.verifiedAccount && (
                    <div className="verified-artist-tag-wrapper">
                      <div className="verified-artist-tag">
                        <span>Verified artist</span>
                      </div>
                    </div>
                  )}

                  {performer?.wallet_icp && (
                    <div className="verified-artist-tag-wrapper">
                      <div className="verified-artist-tag">
                        <span>Accepts crypto</span>
                      </div>
                    </div>
                  )}



                </div> */}

              </div>
            </div>
          </ParallaxBanner>
        </div>
        <div className="main-profile">
          <div className="main-container" style={{ width: "95% !important", maxWidth: "unset" }}>
            <div className={!user._id ? "fl-col fl-col-not-logged" : "fl-col"}>
              <Parallax speed={-0.8} easing="easeInQuad">
                {user._id && [
                  <div className="btn-grp" key="btn-grp">
                    {!user.isPerformer && (
                      <div className="msg-tip-wrapper" style={{ display: "flex" }}>

                        <Tooltip title="Send Tip">
                          <button
                            type="button"
                            className="profile-tip-btn"
                            disabled={!user._id || user.isPerformer}
                            onClick={() => this.setState({ openTipModal: true })}
                          >
                            <DollarOutlined />
                          </button>




                        </Tooltip>
                      </div>
                    )}
                    {!user.isPerformer && (
                      <div style={{ display: "flex" }}>
                        <Button
                          disabled={!user._id}
                          className={`${isFollowed ? "profile-following-btn" : "profile-follow-btn"}`}
                          onClick={(e) => this.handleFollow()}
                        >
                          <p>{isFollowed ? "Following" : "Follow"}</p>
                        </Button>
                          <Button
                            className={`${performer?.isSubscribed ? "subbed-btn" : "sub-btn"}`}
                            disabled={!user._id}
                            onClick={(e) => { this.setState({ openSubscriptionModal: true, subscriptionType: "monthly" }) }}
                          >
                            {performer?.isSubscribed ? "Subscribed" : "Subscribe"}
                          </Button>
                        {/* <button className="bubbly-button" onClick={(e)=> this.animateButton(e)}>Click me!</button> */}
                      </div>
                    )}
                  </div>,
                ]}
              </Parallax>
              <div className={user.isPerformer ? "m-user-name-artist" : "m-user-name"}>

                <div className="profile-heading-col">
                  <Parallax speed={0} easing="easeInQuad">

                    <h4>
                      {performer?.name || "N/A"}
                      &nbsp;
                      {performer?.live > 0 && user?._id !== performer?._id && (
                        <a aria-hidden onClick={this.handleJoinStream} className="live-status">
                          Live
                        </a>
                      )}
                    </h4>
                    {performer.promoMsg && (
                      <div className="performer-profile-desc">
                            <span>{performer.promoMsg}</span>
                      </div>
                    )}

                    <div className="follow-sub-stats-container">
                    <div className="follow-sub-stats-wrapper">
                      {/* <div className="sub-stats" key="sub-stats">
                        {shortenLargeNumber(performer?.stats?.followers || 0)}{" "}
                        <span>
                          {performer?.stats?.followers > 1 || performer?.stats?.followers === 0
                            ? "followers"
                            : "follower"}
                        </span>
                      </div> */}



                      {user._id == performer._id && (
                        <div className="follow-stats" key="follow-stats-edit">
                          <Link href="/artist/account" className="edit-profile-link">
                            <span className="">Edit profile</span>
                          </Link>
                        </div>
                      )}



                    </div>

                    </div>
                  </Parallax>
                </div>

              </div>
            </div>
          </div>
        </div>
        {user.isPerformer && <div style={{ marginTop: `${isDesktop ? "15px" : "-4px"}` }} />}

        <div className="main-container" style={{ width: "95% !important", maxWidth: "unset" }}>
          <div className="artist-content">
            <div className="line-divider"/>
            <Tabs
              defaultActiveKey="music"
              className="profile-tabs"
              size="large"
              onTabClick={(t: string) => {
                this.setState({ tab: t, filter: initialFilter, isGrid: false }, () => this.loadItems());
              }}
            >



              <TabPane tab="Music" key="music" className="posts-tab-wrapper">
                {/* <div className="performer-container"> */}
                  <ScrollListMusic
                    isProfileGrid={true}

                    items={videos.filter((video) => video.trackType === "audio")}
                    loading={loadingVideo}
                    canLoadmore={videos && videos.length < totalVideos}
                    loadMore={this.loadMoreItem.bind(this)}
                  />



                {/* </div> */}
              </TabPane>

              <TabPane tab="Video" key="video" className="posts-tab-wrapper">
                {/* <div className="performer-container"> */}
                  <ScrollListVideo

                    isProfileGrid={true}
                    isDesktop={isDesktop}
                    items={videos.filter((video) => video.trackType === "video")}
                    loading={loadingVideo}
                    canLoadmore={videos && videos.length < totalVideos}
                    loadMore={this.loadMoreItem.bind(this)}
                  />



                {/* </div> */}
              </TabPane>



              <TabPane tab="About" key="about" className="posts-tab-wrapper">
                <div className="about-container">
                  <div className="about-wrapper">

                    <div className="about-metrics">

                      <div className={user.isPerformer ? 'mar-0 pro-desc' : 'pro-desc'}>
                      <div className="about-img">
                        <img src={performer?.avatar}/>
                      </div>
                        <PerformerInfo countries={countries} performer={performer} />
                      </div>
                    </div>
                    <div className="about-intro">
                      <p className="bio">{performer?.bio}</p>
                    </div>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>

        <Modal
          key="tip_performer"
          className="subscription-modal"
          open={openTipModal}
          centered
          onOk={() => this.setState({ openTipModal: false })}
          footer={null}
          width={420}
          title={null}
          onCancel={() => this.setState({ openTipModal: false })}
        >

          <TipPerformerForm
            user={user}
            performer={performer}
            submiting={submiting}
            onFinish={this.sendTip.bind(this)}
            participants={null}
            isProfile
          />
        </Modal>
        {/* <Modal
          key="tip_progress"
          className="progress-modal"
          open={openTipProgressModal}
          centered
          onOk={() => this.setState({ openTipProgressModal: false })}
          footer={null}
          width={450}
          title={null}
          onCancel={() => this.setState({ openTipProgressModal: false })}
        > */}
        {openTipProgressModal && (
            <PaymentProgress stage={tipProgress}  confetti={confetti}/>
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
