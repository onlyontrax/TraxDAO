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
import Head from "next/head";
import {
  InstagramOutlined, TwitterOutlined
} from '@ant-design/icons';
import { GrSoundcloud, GrSpotify } from 'react-icons/gr';
import { SiApplemusic } from 'react-icons/si';
import { FaSoundcloud } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { FaInstagram } from "react-icons/fa";



import {
  authService,
  feedService,
  followService,
  nftService,
  paymentService,
  performerService,
  tokenTransctionService,
  utilsService,
} from "src/services";
import { DollarOutlined, EditOutlined, LeftOutlined } from "@ant-design/icons";
import { VideoPlayer } from "@components/common";
import { ConfirmSubscriptionPerformerForm } from "@components/performer";
import TipPerformerForm from "@components/performer/tip-form";
import { PerformerInfo } from "@components/performer/table-info";
import ScrollListFeed from "@components/post/scroll-list";
import SearchPostBar from "@components/post/search-bar";
import { ScrollListProduct } from "@components/product/scroll-list-item";
import { ScrollListTicket } from "@components/ticket/scroll-list-item";
import { ScrollListVideo } from "@components/video/scroll-list-item";
import { BadgeCheckIcon } from "@heroicons/react/solid";
import { shortenLargeNumber } from "@lib/index";
import Error from "next/error";
import Link from "next/link";
import Router from "next/router";
import { Parallax, ParallaxBanner } from "react-scroll-parallax";
import { MessageIcon } from "src/icons";
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
/*import { subscriptions } from "../../../src/smart-contracts/declarations/subscriptions";
import { SubType } from "../../../src/smart-contracts/declarations/subscriptions/subscriptions.did";*/
import { idlFactory as idlFactoryTipping } from "../../../src/smart-contracts/declarations/tipping/tipping.did.js";
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import { ScrollListNft } from "@components/nft/scroll-list-item";
import FollowerSubscriberModal from "@components/artist/follower-subscriber-modal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faSoundcloud, faXTwitter, faSpotify } from '@fortawesome/free-brands-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import PaymentProgress from '../../../src/components/user/payment-progress';

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
    itemPerPage: 12,
    videoPage: 0,
    productPage: 0,
    ticketPage: 0,
    feedPage: 0,
    galleryPage: 0,
    showWelcomVideo: false,
    openTipModal: false,
    openTipSuccessModal: false,
    submiting: false,
    isBookMarked: false,
    requesting: false,
    openSubscriptionModal: false,
    tab: "post",
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
      return {
        performer: null,
        countries: null,
      };
    }
  }

  async componentDidMount() {
    const { performer } = this.state;
    if (performer === null) {
      const data = await this.getData();

      this.setState({ performer: data.performer, countries: data.countries }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
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
    const notShownWelcomeVideos = typeof window !== "undefined" ? localStorage.getItem("notShownWelcomeVideos") : null;
    const showWelcomVideo =
      !notShownWelcomeVideos || (notShownWelcomeVideos && !notShownWelcomeVideos.includes(performer._id));
    window.addEventListener("resize", this.updateMedia);
    () => window.removeEventListener("resize", this.updateMedia);

    this.setState(
      {
        dataLoaded: true,
        isBookMarked: performer.isBookMarked,
        showWelcomVideo,
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

  // eslint-disable-next-line react/sort-comp
  handleViewWelcomeVideo() {
    const { performer } = this.state;
    if (performer === null) return;
    const notShownWelcomeVideos = typeof window !== "undefined" ? localStorage.getItem("notShownWelcomeVideos") : null;
    if (notShownWelcomeVideos && !notShownWelcomeVideos?.includes(performer._id)) {
      const Ids = JSON.parse(notShownWelcomeVideos || "[]");
      const values = Array.isArray(Ids) ? Ids.concat([performer._id]) : [performer._id];
      localStorage.setItem("notShownWelcomeVideos", JSON.stringify(values));
    }
    this.setState({ showWelcomVideo: false });
  }

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
        await this.sendTipPlug(price, ticker);
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
      Router.push("/user/my-payments/");
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

    this.setState({ openTipProgressModal: true, openTipModal: false, tipProgress: 25 });

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
    this.setState({ tipProgress: 50 });
    await ledgerActor
      .transfer(ticker === "ICP" ? transferArgs : transferParams)
      .then(async res => {
        this.setState({ tipProgress: 75 });

        await tippingActor
          .sendTip(ticker === "ICP" ? res.Ok : res, participantArgs, amountToSend, ticker)
          .then(() => {
            this.setState({ tipProgress: 100 });
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

  

  async sendTipPlug(amount: number, ticker: string) {
    const { performer } = this.state;
    const { settings } = this.props;
    let transfer;
    let amountToSend = BigInt(Math.trunc(Number(amount) * 100000000));
    this.setState({
      requesting: false,
      submiting: false,
      openTipProgressModal: false,
      tipProgress: 0,
    });
    const tippingCanID = settings.icTipping;
    const ledgerCanID = settings.icLedger;
    const ckBTCLedgerCanID = settings.icCKBTCMinter;

    const whitelist = [tippingCanID];

    if (typeof window !== "undefined" && "ic" in window) {
      const connected =
        typeof window !== "undefined" && "ic" in window
          ? // @ts-ignore
            await window?.ic?.plug?.requestConnect({
              whitelist,
              host: settings.icHost
            })
          : false;

      !connected && message.info("Failed to connected to canister. Please try again later or contact us. ");

      

      // @ts-ignore
      if (!window?.ic?.plug?.agent && connected) {
        // @ts-ignore
        await window.ic.plug.createAgent({
          whitelist,
          host: settings.icHost
        });
      }

      let tippingActor = Actor.createActor<_SERVICE_TIPPING>(idlFactoryTipping, {
        agent: (window as any).ic.plug.agent,
        canisterId: tippingCanID,
      });

      const participants = [];

      if (connected) {
        this.setState({ openTipProgressModal: true, openTipModal: false, tipProgress: 25 });
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

        if (ticker === "ckBTC") {
          if (ckBTC_balance >= amount) {
            this.setState({ tipProgress: 50 });
            const params = {
              to: tippingCanID,
              strAmount: amount,
              token: ckBTCLedgerCanID,
            };
            //@ts-ignore
            transfer = await window.ic.plug.requestTransferToken(params).catch(error => {
              message.error(`Transaction failed. ${error}`);
              console.log(error)
              this.setState({ requesting: false, submiting: false, openTipProgressModal: false, tipProgress: 0 });
            });


          } else {
            this.setState({
              requesting: false,
              submiting: false,
              openTipProgressModal: false,
              tipProgress: 0,
            });
            message.error("Insufficient balance, please top up your wallet and try again.");
          }
        }

        if (ticker === "TRAX") {
          if (TRAX_balance >= amount) {
            this.setState({ tipProgress: 50 });
            const params = {
              to: tippingCanID,
              strAmount: amount,
              token: process.env.NEXT_PUBLIC_TRAX_CANISTER_ID as string,
            };
            //@ts-ignore
            transfer = await window.ic.plug.requestTransferToken(params).catch(error => {
              message.error(`Transaction failed. ${error}`);
              console.log(error)
              this.setState({ requesting: false, submiting: false, openTipProgressModal: false, tipProgress: 0 });
            });
          } else {
            this.setState({
              requesting: false,
              submiting: false,
              openTipProgressModal: false,
              tipProgress: 0,
            });
            message.error("Insufficient balance, please top up your wallet and try again.");
          }
        }

        if (ticker === "ICP") {
          
          if (icp_balance >= amount) {
            this.setState({ tipProgress: 50 });
            const requestTransferArg = {
              to: tippingCanID,
              amount: Math.trunc(Number(amount) * 100000000),
            };
            //@ts-ignore
            transfer = await window.ic?.plug?.requestTransfer(requestTransferArg).catch(error => {
              message.error(`Transaction failed. ${error}`);
              console.log(error)
              this.setState({ requesting: false, submiting: false, openTipProgressModal: false, tipProgress: 0 });
            });

          } else {
            this.setState({
              requesting: false,
              submiting: false,
              openTipProgressModal: false,
              tipProgress: 0,
            });
            message.error("Insufficient balance, please top up your wallet and try again.");
          }
        }

       
        if (transfer.height) {
          this.setState({ tipProgress: 75 });

          const obj2: Participants = {
            participantID: Principal.fromText(performer?.wallet_icp),
            participantPercentage: 1,
          };
          participants.push(obj2);
          const participantArgs: TippingParticipants = participants;

          await tippingActor
            .sendTip(transfer.height, participantArgs, amountToSend, ticker)
            .then(() => {
              this.setState({ tipProgress: 100 });
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
                    submiting: false,
                    
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
        } else {
          message.error("Transaction failed. Please try again later.");
        }
      }
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

  render() {
    const { error, ui, user, feedState, videoState, productState, settings, ticketState } = this.props;
    const { performer, countries } = this.state;
    if (performer === null) {
      return (
        <div style={{ margin: 30, textAlign: "center" }}>
          <Spin />
        </div>
      );
    }
    if (error) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || "Sorry, we can't find this page"} />;
    }
    const { items: feeds = [], total: totalFeed = 0, requesting: loadingFeed } = feedState;
    const { items: videos = [], total: totalVideos = 0, requesting: loadingVideo } = videoState;
    const { items: products = [], total: totalProducts = 0, requesting: loadingPrd } = productState;
    const { items: tickets = [], total: totalTickets = 0, requesting: loadingTick } = ticketState;
    const {
      showWelcomVideo,
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
    } = this.state;

    return (
      <Layout
        className={styles.componentsPerformerVerificationFormModule}
        style={{
          background: `${
            isDesktop
              ? !user.isPerformer
                ? `linear-gradient(${colorHex} 27rem, #000000 40rem)`
                : `linear-gradient(${colorHex} 27rem, #000000 40rem)`
              : !user.isPerformer
                ? "#000000"
                : "#000000"
          }`,
        }}
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
            layers={[{ image: `${performer?.cover || "/static/banner-image.jpg"}`, scale: [1.2, 1], speed: -14 }]}
            className="parallax-banner-profile"
          >
            <div className="bg-2nd">
              <div className="top-banner">
                <a aria-hidden className="arrow-back" onClick={() => Router.back()}>
                  {/* <div style={{ background: "#0000008a", borderRadius: "20px", padding: "2px 5px" }}>
                    <LeftOutlined />
                  </div> */}
                </a>
                <div className="top-right-wrapper">
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

                 

                </div>
                
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
                        <Tooltip title="Send Message">
                          <button
                            type="button"
                            className="msg-btn"
                            disabled={!user._id || user.isPerformer}
                            onClick={() =>
                              Router.push({
                                pathname: "/messages",
                                query: {
                                  toSource: "performer",
                                  toId: performer?._id || "",
                                },
                              })
                            }
                          >
                            <MessageIcon />
                          </button>
                        </Tooltip>

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
                        
                          className={`${performer?.isSubscribed ? "subbed-btn" : "sub-btn"}`}
                          disabled={!user._id || user.isPerformer}
                          onClick={(e) => {
                            this.setState({ openSubscriptionModal: true, subscriptionType: "monthly" })
                            
                          }}
                        >
                          {performer?.isSubscribed ? "Subscribed" : "Subscribe"}
                        </Button>
                        <Button
                          disabled={!user._id || user.isPerformer}
                          className={`${isFollowed ? "profile-following-btn" : "profile-follow-btn"}`}
                          onClick={(e) => this.handleFollow()}
                        >
                          <p>{isFollowed ? "Following" : "Follow"}</p>
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
                      {/* {performer?.verifiedAccount && <BadgeCheckIcon className="profile-v-badge" />}
                      &nbsp;
                      {performer?.wallet_icp && (
                        <Img preview={false} src="/static/infinity-symbol.png" className="profile-icp-badge" />
                      )} */}
                      &nbsp;
                      {performer?.live > 0 && user?._id !== performer?._id && (
                        <a aria-hidden onClick={this.handleJoinStream} className="live-status">
                          Live
                        </a>
                      )}
                    </h4>
                    <div className="follow-sub-stats-container">
                    <div className="follow-sub-stats-wrapper">
                      <div className="sub-stats" key="sub-stats">
                        {shortenLargeNumber(performer?.stats?.followers || 0)}{" "}
                        <span>
                          {performer?.stats?.followers > 1 || performer?.stats?.followers === 0
                            ? "followers"
                            : "follower"}
                        </span>
                      </div>
                      
                      {user._id == performer._id && (
                        <div className="follow-stats" key="follow-stats-edit">
                          <Link href="/artist/account" className="edit-profile-link">
                            <span>Edit profile</span>
                          </Link>
                        </div>
                      )}

                    
                    <div className="profile-social-links-wrapper" style={{marginLeft: '12px'}}>
                      <div className="profile-social-links">
                        {performer.spotify && performer.spotify.length > 10 && (
                          <a target="_blank" href={performer.spotify}>
                           <FontAwesomeIcon icon={faSpotify} />
                          </a>
                        )}
                        {performer.appleMusic && performer.appleMusic.length > 10 && (
                          <a target="_blank" href={performer.appleMusic} style={{marginTop: '3px', fontSize: '17px'}}>
                            <SiApplemusic />
                          </a>
                        )}
                        {performer.soundcloud && performer.soundcloud.length > 10 && (
                          <a target="_blank" href={performer.soundcloud}>
                            <FontAwesomeIcon icon={faSoundcloud} />
                          </a>
                        )}
                        {performer.instagram && performer.instagram.length > 10 && (
                          <a target="_blank" href={performer.instagram}>
                            <FontAwesomeIcon icon={faInstagram} />
                          </a>
                        )}
                        {performer.twitter && performer.twitter.length > 10 && (
                          <a target="_blank" href={performer.twitter}>
                            <FontAwesomeIcon icon={faXTwitter} />
                          </a>
                        )}
                      </div>
                    </div>
                    </div>
                    
                    </div>
                  </Parallax>
                </div>
                {/* <div className="profile-heading-col">
                  <Parallax speed={0} easing="easeInQuad">
                    <div className="follow-sub-stats-wrapper">
                      <button
                        onClick={() => this.setState({ isOpenFollowersModal: true })}
                        disabled={performer.stats.followers <= 0}
                        className="sub-stats"
                        key="sub-stats"
                      >
                        {shortenLargeNumber(performer?.stats?.followers || 0)}{" "}
                        <span>
                          {performer?.stats?.followers > 1 || performer?.stats?.followers === 0
                            ? "followers"
                            : "follower"}
                        </span>
                      </button>
                      <FollowerSubscriberModal
                        userId={this.state.performer._id}
                        which="follower"
                        isOpen={this.state.isOpenFollowersModal}
                        close={() => {
                          this.setState({ isOpenFollowersModal: false });
                        }}
                      />
                      <span className="sub-stats">·</span>
                      <button
                        onClick={() => this.setState({ isOpenSubscribersModal: true })}
                        disabled={performer.stats.subscribers <= 0}
                        className="sub-stats"
                        key="follow-stats"
                      >
                        {shortenLargeNumber(performer?.stats?.subscribers || 0)}{" "}
                        <span>
                          {performer?.stats?.subscribers > 1 || performer?.stats?.subscribers === 0
                            ? "Subscribers"
                            : "Subscriber"}
                        </span>
                      </button>
                      <FollowerSubscriberModal
                        userId={this.state.performer._id}
                        which="subscriber"
                        isOpen={this.state.isOpenSubscribersModal}
                        close={() => {
                          this.setState({ isOpenSubscribersModal: false });
                        }}
                      />
                      {user._id == performer._id && (
                        <div className="follow-stats" key="follow-stats-edit">
                          <Link href="/artist/account" className="edit-profile-link">
                            <span>Edit profile</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </Parallax>
                </div> */}
              </div>
            </div>
          </div>
        </div>
        {user.isPerformer && <div style={{ marginTop: `${isDesktop ? "-26px" : "-4px"}` }} />}

        <div className="main-container" style={{ width: "95% !important", maxWidth: "unset" }}>
          <div className="artist-content">
            <div className="line-divider"></div>
            <Tabs
              defaultActiveKey="post"
              size="large"
              onTabClick={(t: string) => {
                this.setState({ tab: t, filter: initialFilter, isGrid: false }, () => this.loadItems());
              }}
            >

              <TabPane tab="Posts" key="post">
                {/* <div className="profile-heading-tab">
                  <SearchPostBar
                    searching={loadingFeed}
                    tab={tab}
                    handleSearch={this.handleFilterSearch.bind(this)}
                    handleViewGrid={(val) => this.setState({ isGrid: val })}
                  />
                </div> */}
                <div className={isGrid ? '' : 'custom'}>
                  <ScrollListFeed
                    items={feeds}
                    loading={loadingFeed}
                    canLoadmore={feeds && feeds.length < totalFeed}
                    loadMore={this.loadMoreItem.bind(this)}
                    isGrid={isGrid}
                    onDelete={this.handleDeleteFeed.bind(this)}
                  />
                </div>
              </TabPane>
              
              <TabPane tab="Music" key="video" className="posts-tab-wrapper">
                <div className="main-container">
                  <ScrollListVideo
                    items={videos}
                    loading={loadingVideo}
                    canLoadmore={videos && videos.length < totalVideos}
                    loadMore={this.loadMoreItem.bind(this)}
                  />
                </div>
              </TabPane>
              <TabPane tab="Merch" key="store" className="posts-tab-wrapper">
                {/* <div className="heading-tab">
                  <h4>
                    {totalProducts > 0 && totalProducts} {totalProducts > 1 ? "PRODUCTS" : "PRODUCT"}
                  </h4>
                  <SearchPostBar searching={loadingPrd} tab={tab} handleSearch={this.handleFilterSearch.bind(this)} />
                </div> */}
                <ScrollListProduct
                  items={products}
                  loading={loadingPrd}
                  canLoadmore={products && products.length < totalProducts}
                  loadMore={this.loadMoreItem.bind(this)}
                />
              </TabPane>
              <TabPane tab="Events" key="events" className="posts-tab-wrapper">
                {/* <div className="heading-tab">
                  <h4>
                    {totalTickets > 0 && totalTickets} {totalTickets > 1 ? "EVENTS" : "EVENT"}
                  </h4>
                  <SearchPostBar searching={loadingPrd} tab={tab} handleSearch={this.handleFilterSearch.bind(this)} />
                </div> */}
                <ScrollListTicket
                  items={tickets}
                  loading={loadingTick}
                  canLoadmore={tickets && tickets.length < totalTickets}
                  loadMore={this.loadMoreItem.bind(this)}
                />
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
        {performer && performer?.welcomeVideoPath && performer?.activateWelcomeVideo && (
          <Modal
            key="welcome-video"
            className="welcome-video"
            destroyOnClose
            closable={false}
            maskClosable={false}
            width={767}
            open={showWelcomVideo}
            title={null}
            centered
            onCancel={() => this.setState({ showWelcomVideo: false })}
            footer={[
              <div style={{ display: "flex", justifyContent: "center", flexDirection: "row" }} key="submit-content">
                <Button
                  key="close"
                  className="secondary submit-content-green-standard"
                  onClick={() => this.setState({ showWelcomVideo: false })}
                  style={{ marginBottom: "10px !important" }}
                >
                  Close
                </Button>
                <Button
                  key="not-show"
                  className="primary submit-content-standard"
                  onClick={this.handleViewWelcomeVideo.bind(this)}
                >
                  Don&apos;t show this again
                </Button>
              </div>,
            ]}
          >
            <VideoPlayer
              {...{
                key: `${performer._id}`,
                controls: true,
                playsinline: true,
                sources: [
                  {
                    src: performer?.welcomeVideoPath,
                    type: "video/mp4",
                  },
                ],
              }}
            />
          </Modal>
        )}

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
        <Modal
          key="tip_progress"
          className="tip-progress"
          open={openTipProgressModal}
          centered
          onOk={() => this.setState({ openTipProgressModal: false })}
          footer={null}
          width={450}
          title={null}
          onCancel={() => this.setState({ openTipProgressModal: false })}
        >
          <PaymentProgress progress={tipProgress} performer={performer}/>
        </Modal>
        <Modal
          key="tip_success"
          className="subscription-modal"
          open={openTipSuccessModal}
          centered
          onOk={() => this.setState({ openTipSuccessModal: false })}
          footer={null}
          width={420}
          title={null}
          onCancel={() => this.setState({ openTipSuccessModal: false })}
        >
          <TipPerformerForm
            user={user}
            performer={performer}
            submiting={submiting}
            participants={null}
            onFinish={this.sendTip.bind(this)}
            isProfile
          />
        </Modal>
        <Modal
          key="subscribe_performer"
          className="subscription-modal"
          width={420}
          centered
          title={null}
          open={openSubscriptionModal}
          footer={null}
          onCancel={() => this.setState({ openSubscriptionModal: false, paymentUrl: "" })}
          destroyOnClose
        >
          <ConfirmSubscriptionPerformerForm
            type={subscriptionType || "monthly"}
            performer={performer}
            submiting={submiting}
            onFinish={this.subscribe.bind(this)}
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
