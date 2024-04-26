/* eslint-disable no-await-in-loop */
/* eslint-disable no-prototype-builtins */
import {
  FireFilled,
  FireOutlined,
  CommentOutlined,
  PlusOutlined,
  MoreOutlined,
  DollarOutlined,
  FlagOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  EyeOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { BsCheckCircleFill } from "react-icons/bs";
import { CommentForm, ListComments } from "@components/comment";
import { VideoPlayer } from "@components/common/video-player";
import ConfirmSubscriptionPerformerForm from "@components/performer/confirm-subscription";
import TipPerformerForm from "@components/performer/tip-form";
import { ReportForm } from "@components/report/report-form";
import { BadgeCheckIcon } from "@heroicons/react/solid";
import { formatDate, shortenLargeNumber, videoDuration } from "@lib/index";
import { createComment, deleteComment, getComments, moreComment } from "@redux/comment/actions";
import { updateBalance } from "@redux/user/actions";
import {
  reactionService,
  feedService,
  tokenTransctionService,
  paymentService,
  reportService,
  performerService,
} from "@services/index";
import { cryptoService } from '@services/crypto.service';
import { Avatar, Button, Divider, Dropdown, Image, Menu, Modal, Progress, Tooltip, message, Spin } from "antd";
import moment from "moment";
import Link from "next/link";
import Router from "next/router";
import { Component } from "react";
import ReactMomentCountDown from "react-moment-countdown";
import { connect } from "react-redux";
import { IFeed, ISettings, IUser } from "src/interfaces";
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { AccountIdentifier } from "@dfinity/nns";
import { AccountBalanceArgs } from "@dfinity/nns/dist/candid/ledger";
import { Principal } from "@dfinity/principal";
import { debounce } from "lodash";
import PurchaseFeedForm from "./confirm-purchase";
import styles from "./index.module.scss";
import FeedSlider from "./post-slider";
import LikesModal from "./likes-modal";

import { idlFactory as idlFactoryLedger } from "../../smart-contracts/declarations/ledger/ledger.did.js";
import { idlFactory as idlFactoryTipping } from "../../smart-contracts/declarations/tipping/tipping.did.js";
import type { _SERVICE as _SERVICE_LEDGER } from "../../smart-contracts/declarations/ledger/ledger2.did";
import type {
  _SERVICE as _SERVICE_TIPPING,
  TippingParticipants,
  Participants,
} from "../../smart-contracts/declarations/tipping/tipping2.did";
import { TransferArgs, TimeStamp } from "../../smart-contracts/declarations/ledger/ledger2.did";
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen, faCheck } from "@fortawesome/free-solid-svg-icons";
import PaymentProgress from '../../../src/components/user/payment-progress';

interface IProps {
  feed: IFeed;
  onDelete?: Function;
  user: IUser;
  updateBalance: Function;
  getComments: Function;
  moreComment: Function;
  createComment: Function;
  deleteComment: Function;
  commentMapping: any;
  comment: any;
  siteName: string;
  settings: ISettings;
  fromExplore?: boolean;
  isPostDetails?: boolean;
}

class FeedCard extends Component<IProps> {
  static defaultProps: Partial<IProps>;

  state = {
    isOpenComment: false,
    isOpenLikesModal: false,
    isLiked: false,
    isBookMarked: false,
    isBought: false,
    totalLike: 0,
    totalComment: 0,
    isFirstLoadComment: true,
    itemPerPage: 10,
    commentPage: 0,
    isHovered: false,
    openTipModal: false,
    openPurchaseModal: false,
    openTeaser: false,
    submiting: false,
    polls: [],
    requesting: false,
    openSubscriptionModal: false,
    openReportModal: false,
    subscriptionType: "monthly",
    caption: false,
    openTipProgressModal: false,
    tipProgress: 0,
    participants: [],
    amountICPToDisplay: "",
  };

  fullCaption(val: boolean) {
    this.setState({ caption: val });
  }

  componentDidMount() {
    const { feed } = this.props;
    if (feed) {
      this.setState({
        isLiked: feed.isLiked,
        isBookMarked: feed.isBookMarked,
        isBought: feed.isBought,
        totalLike: feed.totalLike,
        totalComment: feed.totalComment,
        polls: feed.polls ? feed.polls : [],
      });
    }
    this.getRSPerformers();
  }

  componentDidUpdate(prevProps) {
    const { feed, commentMapping, comment } = this.props;
    const { totalComment } = this.state;
    if (
      (!prevProps.comment.data && comment.data && comment.data.objectId === feed._id) ||
      (prevProps.commentMapping[feed._id] && totalComment !== commentMapping[feed._id].total)
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ totalComment: commentMapping[feed._id].total });
    }
  }

  handleLike = async () => {
    const { feed } = this.props;
    const { isLiked, totalLike, requesting } = this.state;
    if (requesting) return;
    try {
      this.setState({ requesting: true });
      if (!isLiked) {
        await reactionService.create({
          objectId: feed._id,
          action: "like",
          objectType: "feed",
        });
        this.setState({ isLiked: true, totalLike: totalLike + 1, requesting: false });
      } else {
        await reactionService.delete({
          objectId: feed._id,
          action: "like",
          objectType: "feed",
        });
        this.setState({ isLiked: false, totalLike: totalLike - 1, requesting: false });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || "Error occured, please try again later");
      this.setState({ requesting: false });
    }
  };

  handleBookmark = async () => {
    const { feed, user } = this.props;
    const { isBookMarked, requesting } = this.state;
    if (requesting || !user._id || user.isPerformer) return;
    try {
      this.setState({ requesting: true });
      if (!isBookMarked) {
        await reactionService.create({
          objectId: feed._id,
          action: "book_mark",
          objectType: "feed",
        });
        this.setState({ isBookMarked: true, requesting: false });
      } else {
        await reactionService.delete({
          objectId: feed._id,
          action: "book_mark",
          objectType: "feed",
        });
        this.setState({ isBookMarked: false, requesting: false });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || "Error occured, please try again later");
      this.setState({ requesting: false });
    }
  };

  handleReport = async (payload: any) => {
    const { feed } = this.props;
    try {
      this.setState({ requesting: true });
      await reportService.create({
        ...payload,
        target: "feed",
        targetId: feed._id,
        performerId: feed.fromSourceId,
      });
      message.success("Your report has been sent");
    } catch (e) {
      const err = await e;
      message.error(err.message || "error occured, please try again later");
    } finally {
      this.setState({ requesting: false, openReportModal: false });
    }
  };

  onOpenComment = () => {
    const { feed, getComments: handleGetComment } = this.props;
    const { isOpenComment, isFirstLoadComment, itemPerPage, commentPage } = this.state;
    this.setState({ isOpenComment: !isOpenComment });
    if (isFirstLoadComment) {
      this.setState({ isFirstLoadComment: false });
      handleGetComment({
        objectId: feed._id,
        limit: itemPerPage,
        offset: commentPage,
      });
    }
  };

  copyLink = () => {
    const { feed } = this.props;
    const str = `${window.location.origin}/post?id=${feed?.slug || feed?._id}`;
    const el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    message.success("Copied to clipboard");
  };

  moreComment = async () => {
    const { feed, moreComment: handleLoadMore } = this.props;
    const { commentPage, itemPerPage } = this.state;
    this.setState({
      commentPage: commentPage + 1,
    });
    handleLoadMore({
      limit: itemPerPage,
      offset: (commentPage + 1) * itemPerPage,
      objectId: feed._id,
    });
  };

  deleteComment = item => {
    const { deleteComment: handleDelete } = this.props;
    if (!window.confirm("Are you sure to remove this comment?")) return;
    handleDelete(item._id);
  };

  subscribe = async () => {
    const { feed, user, settings } = this.props;
    const { subscriptionType } = this.state;
    if (!user._id) {
      message.error("Please log in!");
      Router.push("/login");
      return;
    }
    if (user.isPerformer) return;
    if (settings.paymentGateway === "stripe" && !user.stripeCardIds.length) {
      message.error("Please add payment card");
      Router.push("/user/account");
      return;
    }
    try {
      this.setState({ submiting: true });
      const resp = await paymentService.subscribePerformer({
        type: subscriptionType || "monthly",
        performerId: feed.fromSourceId,
        paymentGateway: settings.paymentGateway,
      });
      if (resp?.data?.stripeConfirmUrl) {
        window.location.href = resp?.data?.stripeConfirmUrl;
      }
      if (settings.paymentGateway === "-ccbill") {
        window.location.href = resp?.data?.paymentUrl;
      } else {
        this.setState({ openSubscriptionModal: false });
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || "error occured, please try again later");
      this.setState({ openSubscriptionModal: false, submiting: false });
    }
  };

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

  sendTipFiat = async price => {
    const { feed, user, updateBalance: handleUpdateBalance } = this.props;
    if (user._id === feed?.performer?._id) {
      message.error("Artists cannot tip for themselves");
      return;
    }
    if (user.balance < price) {
      message.error("Your wallet balance is not enough");
      Router.push("/wallet");
      return;
    }
    try {
      await this.setState({ requesting: true });
      await tokenTransctionService.sendTip(feed?.performer?._id, { performerId: feed?.performer?._id, price });
      message.success("Thank you for the tip");
      handleUpdateBalance({ token: -price });
    } catch (e) {
      const err = await e;
      message.error(err.message || "error occured, please try again later");
    } finally {
      this.setState({ requesting: false, openTipModal: false });
    }
  };

  async handleSendTipCrypto(
    tippingCanID: Principal,
    fanID: Principal,
    amountToSend: bigint,
    ledgerActor: any,
    tippingActor: any,
    ticker: string
  ) {
    const { feed } = this.props;

    this.setState({ openTipProgressModal: true, openTipModal: false, tipProgress: 20 });
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
    const uuid = BigInt(Math.floor(Math.random() * 1000));

    const balArgs: AccountBalanceArgs = {
      account: fanBytes,
    };

    let transferArgs: TransferArgs;
    let transferParams: TransferParams;

    if (ticker == "ICP") {
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
        message.error("Insufficient balance, please top up your wallet and try again.");
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
        message.error("Insufficient balance, please top up your wallet and try again.");

        this.setState({
          requesting: false,
          submiting: false,
          openTipProgressModal: false,
          tipProgress: 0,
        });
      }
    } else {
      message.error("Invalid ticker, please select a different token!");
    }

    const participants = [];
    const rc = feed?.royaltySharing;
    if (rc.length >= 1) {
      for (let i = 0; i < rc.length; i += 1) {
        const obj: Participants = {
          participantID: Principal.fromText(rc[i].wallet_id),
          participantPercentage: rc[i].percentage / 100,
        };
        participants.push(obj);
      }
    } else {
      const obj2: Participants = {
        participantID: Principal.fromText(feed?.performer?.wallet_icp),
        participantPercentage: 1,
      };
      participants.push(obj2);
    }

    const participantArgs: TippingParticipants = participants;
    this.setState({ tipProgress: 30 });
    await ledgerActor
      .transfer(ticker === "ICP" ? transferArgs : transferParams)
      .then(async res => {
        this.setState({ tipProgress: 50 });
        await tippingActor
          .sendTip(ticker === "ICP" ? res.Ok : res, participantArgs, amountToSend, ticker)
          .then(() => {
            this.setState({ tipProgress: 100 });
            tokenTransctionService
              .sendCryptoTip(feed?.performer?._id, {
                performerId: feed?.performer?._id,
                price: Number(amountToSend),
                tokenSymbol: ticker,
              })
              .then(() => {});
            setTimeout(
              () =>
                this.setState({
                  requesting: false,
                  submiting: false,
                  openTipProgressModal: false,
                  tipProgress: 0,
                }),
              1000
            );
            message.success(`Payment successful! ${feed?.performer?.name} has recieved your tip`);
          })
          .catch(error => {
            // send failed tx reciept to montior for us to manually send back the funds
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
    const { feed, settings } = this.props;
    let transfer;
    let amountToSend = BigInt(Math.trunc(Number(amount) * 100000000));
    const tippingCanID = settings.icTipping;
    const ledgerCanID = settings.icLedger;
    const ckBTCLedgerCanID = settings.icCKBTCMinter;
    this.setState({
      requesting: false,
      submiting: false,
      openTipProgressModal: false,
      tipProgress: 0,
    });

    const whitelist = [
      tippingCanID,
    ];

    if (typeof window !== "undefined" && "ic" in window) {
      // @ts-ignore
      const connected =
        typeof window !== "undefined" && "ic" in window
          // @ts-ignore
          ? await window?.ic?.plug?.requestConnect({
              whitelist,
              host: settings.icHost
            })
          : false;

      !connected && message.info("Failed to connected to canister. Please try again later or contact us. ");

      this.setState({ openTipProgressModal: true, openTipModal: false, tipProgress: 25 });

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
              token: "mxzaz-hqaaa-aaaar-qaada-cai",
            };
            //@ts-ignore
            transfer = await window.ic.plug.requestTransferToken(params).catch(error => {
              message.error("Transaction failed. Please try again later.");
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
              message.error("Transaction failed. Please try again later.");
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
          this.setState({ tipProgress: 50 });
          if (icp_balance >= amount) {
            const requestTransferArg = {
              to: tippingCanID,
              amount: Math.trunc(Number(amount) * 100000000),
            };
            //@ts-ignore
            transfer = await window.ic?.plug?.requestTransfer(requestTransferArg).catch(error => {
              message.error("Transaction failed. Please try again later.");
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

        this.setState({ tipProgress: 50 });

        if (transfer.height) {
          this.setState({ tipProgress: 75 });
          const obj2: Participants = {
            participantID: Principal.fromText(feed.performer?.wallet_icp),
            participantPercentage: 1,
          };
          participants.push(obj2);
          const participantArgs: TippingParticipants = participants;


          await tippingActor
            .sendTip(transfer.height, participantArgs, amountToSend, ticker)
            .then(() => {
              this.setState({ tipProgress: 100 });
              tokenTransctionService
                .sendCryptoTip(feed.performer?._id, {
                  performerId: feed.performer?._id,
                  price: Number(amountToSend),
                  tokenSymbol: ticker,
                })
                .then(() => {});
              setTimeout(
                () =>
                  this.setState({
                    requesting: false,
                    submiting: false,
                    openTipProgressModal: false,
                    tipProgress: 0,
                  }),
                1000
              );
              message.success(`Payment successful! ${feed.performer?.name} has recieved your tip`);
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
    const { feed, settings } = this.props;

    if (!feed?.performer?.wallet_icp) {
      this.setState({
        requesting: false,
        submiting: false,
        openTipProgressModal: false,
        tipProgress: 0,
      });
      message.info("This artist is not a web3 user and therefore cannot recieve tips in crypto at this time.");
      return;
    }

    let amountToSend: any = 0;
    amountToSend = BigInt(amount * 100000000);

    try {
      this.setState({ requesting: true, submiting: true });
      let identity;
      let ledgerActor;
      const authClient = await AuthClient.create();
      let sender;
      let tippingActor;
      let agent;
      const tippingCanID = Principal.fromText(settings.icTipping);
      const ledgerCanID = Principal.fromText(settings.icLedger);
      const ckBTCLedgerCanID = Principal.fromText(settings.icCKBTCMinter);
      const TRAXLedgerCanID = Principal.fromText(settings.icTraxToken);

      if (settings.icNetwork !== true) {
        await authClient.login({
          identityProvider: cryptoService.getIdentityProviderLink(),
          onSuccess: async () => {
            identity = authClient.getIdentity();

            const host = settings.icHost;

            agent = new HttpAgent({
              identity,
              host,
            });

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
        await authClient.login({
          onSuccess: async () => {
            const host = settings.icHost;

            identity = authClient.getIdentity();
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

  purchaseFeed = async () => {
    const { feed, user, updateBalance: handleUpdateBalance } = this.props;
    if (user.balance < feed.price) {
      message.error("Your wallet balance is not enough");
      Router.push("/wallet");
      return;
    }
    try {
      this.setState({ requesting: true });
      await tokenTransctionService.purchaseFeed(feed._id, {});
      message.success("Unlocked successfully!");
      this.setState({ isBought: true });
      handleUpdateBalance({ token: -feed.price });
    } catch (e) {
      const error = await e;
      message.error(error.message || "Error occured, please try again later");
    } finally {
      this.setState({ requesting: false, openPurchaseModal: false });
    }
  };

  votePoll = async (poll: any) => {
    const { feed } = this.props;
    const { polls } = this.state;
    const isExpired = new Date(feed.pollExpiredAt) < new Date();
    if (isExpired) {
      message.error("The poll is now closed");
      return;
    }
    if (!window.confirm("Vote?")) return;
    try {
      this.setState({ requesting: true });
      await feedService.votePoll(poll._id);
      const index = polls.findIndex(p => p._id === poll._id);
      this.setState((prevState: any) => {
        const newItems = [...prevState.polls];
        newItems[index].totalVote += 1;
        return { polls: newItems, requesting: false };
      });
    } catch (e) {
      const error = await e;
      message.error(error.message || "Something went wrong, please try again later");
      this.setState({ requesting: false });
    }
  };

  getRSPerformers = debounce(async () => {
    const { feed } = this.props;
    const rc = feed?.royaltySharing;
    const part = [];
    for (let i = 0; i < rc?.length; i += 1) {
      const data = await performerService.findOne(rc[i]?.performerId);
      part.push(data.data);
    }
    this.setState({ participants: part });
  }, 500);

  render() {
    const {
      feed,
      user,
      settings,
      commentMapping,
      comment,
      onDelete: handleDelete,
      createComment: handleCreateComment,
      siteName,
      fromExplore,
      isPostDetails,
    } = this.props;
    const { performer } = feed;
    const { requesting: commenting } = comment;
    const fetchingComment = commentMapping.hasOwnProperty(feed?._id) ? commentMapping[feed?._id].requesting : false;
    const comments = commentMapping.hasOwnProperty(feed?._id) ? commentMapping[feed?._id].items : [];
    const totalComments = commentMapping.hasOwnProperty(feed?._id) ? commentMapping[feed?._id].total : 0;
    const {
      isOpenComment,
      isLiked,
      totalLike,
      isHovered,
      isBought,
      openTipModal,
      openPurchaseModal,
      submiting,
      polls,
      isBookMarked,
      openTeaser,
      openSubscriptionModal,
      openReportModal,
      requesting,
      subscriptionType,
      caption,
      openTipProgressModal,
      tipProgress,
      participants,
    } = this.state;
    let canView =
      (feed?.isSale === "subscription" && (feed?.isSubscribed || fromExplore === true)) ||
      (feed?.isSale === "pay" && isBought) ||
      feed?.type === "text" ||
      (feed?.isSale === "pay" && !feed?.price) ||
      feed?.isSale === "free";

    if ((!user?._id || (`${user?._id}` !== `${feed?.fromSourceId}` && user?.isPerformer)) && fromExplore !== true) {
      canView = false;
    }
    const images = feed?.files && feed?.files.filter(f => f.type === "feed-photo");
    const videos = feed?.files && feed?.files.filter(f => f.type === "feed-video");
    const thumbUrl =
      (feed?.thumbnail?.thumbnails && feed?.thumbnail?.thumbnails[0]) ||
      (images && images[0] && images[0]?.thumbnails && images[0]?.thumbnails[0]) ||
      (feed?.teaser && feed?.teaser?.thumbnails && feed?.teaser?.thumbnails[0]) ||
      (videos && videos[0] && videos[0]?.thumbnails && videos[0]?.thumbnails[0]) ||
      "/static/leaf.jpg";
    let totalVote = 0;
    polls &&
      polls.forEach(poll => {
        totalVote += poll.totalVote;
      });
    const menu = (
      <Menu style={{ background: "#000" }} key={`menu_${feed?._id}`}>
        <Menu.Item key={`post_detail_${feed?._id}`}>
          <Link href={`/post?id=${feed?.slug || feed?._id}`} as={`/post?id=${feed?.slug || feed?._id}`}>
            Details
          </Link>
        </Menu.Item>
        {user._id === feed?.fromSourceId && (
          <Menu.Item key={`edit_post_${feed?._id}`}>
            <Link href={{ pathname: "/artist/my-post/edit", query: { id: feed._id } }}>Edit post</Link>
          </Menu.Item>
        )}
        <Menu.Item key={`copy_link_${feed?._id}`} onClick={() => this.copyLink()}>
          <a>Copy link to clipboard</a>
        </Menu.Item>
        {user._id === feed?.fromSourceId && <Divider style={{ margin: "10px 0" }} />}
        {user._id === feed?.fromSourceId && (
          <Menu.Item key={`delete_post_${feed?._id}`}>
            <a aria-hidden onClick={handleDelete.bind(this, feed)}>
              Delete post
            </a>
          </Menu.Item>
        )}
      </Menu>
    );
    const dropdown = (
      <Dropdown overlay={menu}>
        <a aria-hidden className="dropdown-options" onClick={e => e.preventDefault()}>
          <MoreOutlined style={{ transform: "rotate(90deg)" }} />
        </a>
      </Dropdown>
    );

    return (
      <div className={styles.componentsPostPostCardModule}>
        <div className="feed-card" style={{ margin: isPostDetails ? "auto" : "" }}>
          <div className="feed-top">
            <Link
              href={`/artist/profile?id=${performer?.username || performer?._id}`}
              as={`/artist/profile?id=${performer?.username || performer?._id}`}
              legacyBehavior
            >
              <div className="feed-top-left">
                <Avatar
                  className="ant-avatart-image"
                  alt="per_atv"
                  src={performer?.avatar || "/static/no-avatar.png"}
                  size={40}
                  style={{ minHeight: "40px", minWidth: "40px" }}
                />
                {participants?.length === 2 && (
                  <Avatar
                    alt="per_atv"
                    className="participant-avatar-feed"
                    src={participants[1].avatar || "/static/no-avatar.png"}
                    size={40}
                    style={{ minHeight: "40px", minWidth: "40px" }}
                  />
                )}
                <div className="feed-name">
                  <h4>
                    {performer?.name || "N/A"}
                    &nbsp;
                    {participants?.length > 2 && <> &amp; others </>}
                    {participants?.length === 2 && <>&amp; {participants[1].name}</>}{" "}
                    {performer?.verifiedAccount && <BadgeCheckIcon className="feed-v-badge" />}
                    &nbsp;
                    {performer?.wallet_icp && (
                      <Image preview={false} src="/static/infinity-symbol.png" className="profile-icp-badge-feed" />
                    )}
                    &nbsp; &nbsp;
                  </h4>
                </div>
              </div>
            </Link>
            <div className="feed-top-right">
              <span className="feed-time">{formatDate(feed?.updatedAt, "MMM DD")}</span>
              {dropdown}
            </div>
          </div>
          <div className="post-container">
            {canView && (
              <div className="feed-content">
                {feed.type === "text" && (
                  <div className="text-post-wrapper">
                    <span className="text-post">{feed.text}</span>
                  </div>
                )}
                <FeedSlider feed={feed} />
              </div>
            )}
            {!canView && (
              <div className="lock-content">
                {/* eslint-disable-next-line no-nested-ternary */}
                <div
                  className="feed-bg"
                  style={{
                    backgroundImage: `url(${thumbUrl})`,
                    filter: thumbUrl === "/static/leaf.jpg" ? "blur(2px)" : "blur(20px)",
                  }}
                />
                <div className="lock-middle">
                  {isHovered ? (
                    <FontAwesomeIcon icon={faLockOpen} className="lock-icon" />
                  ) : (
                    <FontAwesomeIcon icon={faLock} className="lock-icon" />
                  )}
                  {feed?.isSale === "subscription" && !feed?.isSubscribed && fromExplore !== true && (
                    <Button
                      onMouseEnter={() => this.setState({ isHovered: true })}
                      onMouseLeave={() => this.setState({ isHovered: false })}
                      disabled={user.isPerformer}
                      className="lock-btn"
                      onClick={() => this.setState({ openSubscriptionModal: true })}
                    >
                      Subscribe to unlock
                    </Button>
                  )}
                  {feed?.isSale === "pay" && feed?.price > 0 && !isBought && (
                    <Button
                      onMouseEnter={() => this.setState({ isHovered: true })}
                      onMouseLeave={() => this.setState({ isHovered: false })}
                      disabled={user.isPerformer}
                      className="lock-btn"
                      onClick={() => this.setState({ openPurchaseModal: true })}
                    >
                      Unlock for ${(feed?.price || 0).toFixed(2)}
                    </Button>
                  )}
                  {feed?.isSale === "pay" && !feed?.price && !user._id && (
                    <Button
                      onMouseEnter={() => this.setState({ isHovered: true })}
                      onMouseLeave={() => this.setState({ isHovered: false })}
                      disabled={user.isPerformer}
                      className="lock-btn"
                      onClick={() =>
                        Router.push(
                          { pathname: `/artist/profile?id=${performer?.username || performer?._id}` },
                          `/artist/profile?id=${performer?.username || performer?._id}`
                        )
                      }
                    >
                      Follow for free
                    </Button>
                  )}
                  {feed?.teaser && (
                    <EyeOutlined
                      className="teaser-btn"
                      // type="link"
                      onClick={() => this.setState({ openTeaser: true })}
                      style={{ marginTop: "10px" }}
                    />
                  )}
                </div>
                {feed?.files && feed?.files.length > 0 && (
                  <div className="count-media">
                    <span className="count-media-item">
                      {images.length > 0 && (
                        <span>
                          {images.length} <FileImageOutlined />{" "}
                        </span>
                      )}
                      {videos.length > 0 && images.length > 0 && "|"}
                      {videos.length > 0 && (
                        <span>
                          {videos.length > 1 && videos.length} <VideoCameraOutlined />{" "}
                          {videos.length === 1 && videoDuration(videos[0].duration)}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="feed-bottom">
            {polls && polls.length > 0 && (
              <div className="feed-polls">
                {feed?.pollDescription && <h4 className="p-question">{feed?.pollDescription}</h4>}
                {polls.map(poll => (
                  <div aria-hidden className="p-item" key={poll._id} onClick={this.votePoll.bind(this, poll)}>
                    <span className="p-desc">{poll?.description}</span> <span>{poll?.totalVote || 0}</span>
                  </div>
                ))}
                <div className="total-vote">
                  <span style={{ marginLeft: "20px" }}>
                    Total {shortenLargeNumber(totalVote)} {totalVote < 2 ? "vote" : "votes"}
                  </span>
                  {feed?.pollExpiredAt && moment(feed.pollExpiredAt).isAfter(moment()) ? (
                    <span>
                      {`${moment(feed?.pollExpiredAt).diff(moment(), "days")}d `}
                      <ReactMomentCountDown toDate={moment(feed?.pollExpiredAt)} />
                    </span>
                  ) : (
                    <span style={{ marginRight: "20px" }}>Closed</span>
                  )}
                </div>
              </div>
            )}
            <div className="feed-actions">
              <div className="action-item">
                <span
                  aria-hidden
                  className={isLiked ? "action-ico active" : "action-ico"}
                  onClick={this.handleLike.bind(this)}
                >
                  {isLiked ? <FireFilled /> : <FireOutlined />}{" "}
                </span>
                <span
                  aria-hidden
                  className={isOpenComment ? "action-ico active" : "action-ico"}
                  onClick={this.onOpenComment.bind(this)}
                >
                  <CommentOutlined />{" "}
                </span>
                {performer && (
                  <span aria-hidden className="action-ico" onClick={() => this.setState({ openTipModal: true })}>
                    <DollarOutlined /> {/* Send tip */}
                  </span>
                )}
              </div>
              <div className="action-item">
                <span
                  aria-hidden
                  className={openReportModal ? "action-ico active" : "action-ico"}
                  onClick={() => this.setState({ openReportModal: true })}
                >
                  <Tooltip title="Report">
                    <FlagOutlined />
                  </Tooltip>
                </span>
                <span
                  aria-hidden
                  className={isBookMarked ? "action-ico active" : "action-ico"}
                  onClick={this.handleBookmark.bind(this)}
                >
                  {isBookMarked ? (
                    <BsCheckCircleFill style={{ color: "#c7ff02", marginTop: "1px" }} />
                  ) : (
                    <PlusOutlined />
                  )}
                </span>
              </div>
            </div>

            <div className="feed-text">
              <div className="num-likes-wrapper">
                <button disabled={totalLike <= 0} onClick={() => this.setState({ isOpenLikesModal: true })}>
                  {shortenLargeNumber(totalLike)} {totalLike === 1 ? "like" : "likes"}
                </button>
              </div>
              <LikesModal
                postId={feed._id}
                isOpen={this.state.isOpenLikesModal}
                close={() => this.setState({ isOpenLikesModal: false })}
              />
              {feed.type !== "text" && (
                <div className="caption-wrapper">
                  <span className="artist-username">{performer?.username || "n/a"}</span>
                  <span className="artist-caption">
                    {" "}
                    {caption ? feed.text : feed?.text?.split(" ").splice(0, 15).join(" ")}
                    <span onClick={() => this.fullCaption(true)} style={{ color: "grey", cursor: "pointer" }}>
                      {caption || feed?.text?.split(" ").filter(word => word !== "").length < 15 ? " " : "... more"}
                    </span>
                  </span>
                </div>
              )}
            </div>
            {isOpenComment && (
              <div className="feed-comment">
                <ListComments
                  key={`list_comments_${feed?._id}_${comments.length}`}
                  requesting={fetchingComment}
                  comments={comments}
                  total={totalComments}
                  onDelete={this.deleteComment.bind(this)}
                  user={user}
                  canReply
                />
                {comments.length < totalComments && (
                  <p className="text-center">
                    <a aria-hidden onClick={this.moreComment.bind(this)}>
                      More comments...
                    </a>
                  </p>
                )}
                <CommentForm
                  creator={user}
                  onSubmit={handleCreateComment.bind(this)}
                  objectId={feed?._id}
                  objectType="feed"
                  requesting={commenting}
                  siteName={siteName}
                />
              </div>
            )}
          </div>

          <Modal
            key="tip_performer"
            className="tip-modal"
            title={null}
            width={420}
            open={openTipModal}
            onOk={() => this.setState({ openTipModal: false })}
            footer={null}
            onCancel={() => this.setState({ openTipModal: false })}
          >
            <TipPerformerForm
              user={user}
              isProfile={false}
              performer={performer}
              participants={participants}
              submiting={requesting}
              onFinish={this.sendTip.bind(this)}
            />
          </Modal>

          <Modal
            key="purchase_post"
            className="purchase-modal ppv-modal"
            title={null}
            open={openPurchaseModal}
            footer={null}
            width={420}
            destroyOnClose
            onCancel={() => this.setState({ openPurchaseModal: false })}
          >
            <PurchaseFeedForm feed={feed} submiting={requesting} onFinish={this.purchaseFeed.bind(this)} />
          </Modal>

          <Modal
            key="report_post"
            className="subscription-modal sub-modal"
            title={null}
            open={openReportModal}
            footer={null}
            destroyOnClose
            onCancel={() => this.setState({ openReportModal: false })}
          >
            <ReportForm performer={performer} submiting={requesting} onFinish={this.handleReport.bind(this)} />
          </Modal>

          <Modal
            key="subscribe_performer"
            className="subscription-modal"
            centered
            width={420}
            title={null}
            open={openSubscriptionModal}
            footer={null}
            destroyOnClose
            onCancel={() => this.setState({ openSubscriptionModal: false, subscriptionType: "" })}
          >
            <ConfirmSubscriptionPerformerForm
              type={subscriptionType}
              performer={performer}
              submiting={submiting}
              onFinish={this.subscribe.bind(this)}
              user={user}
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
            key="teaser_video"
            open={openTeaser}
            footer={null}
            onCancel={() => this.setState({ openTeaser: false })}
            width={650}
            destroyOnClose
            className="modal-teaser-preview"
          >
            <VideoPlayer
              key={feed?.teaser?._id}
              {...{
                autoplay: true,
                controls: true,
                playsinline: true,
                fluid: true,
                sources: [
                  {
                    src: feed?.teaser?.url,
                    type: "video/mp4",
                    uploadedToIC: feed?.teaser?.uploadedToIC,
                  },
                ],
              }}
            />
          </Modal>
        </div>
      </div>
    );
  }
}

FeedCard.defaultProps = {
  onDelete: () => {},
  fromExplore: false,
} as Partial<IProps>;

const mapStates = (state: any) => {
  const { commentMapping, comment } = state.comment;
  return {
    siteName: state.ui.siteName,
    user: state.user.current,
    commentMapping,
    comment,
    settings: state.settings
  };
};

const mapDispatch = {
  getComments,
  moreComment,
  createComment,
  deleteComment,
  updateBalance,
};
export default connect(mapStates, mapDispatch)(FeedCard);
