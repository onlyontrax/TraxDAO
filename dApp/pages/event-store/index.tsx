import { HeartOutlined, LoadingOutlined } from '@ant-design/icons';
import { PurchaseTicketForm } from '@components/ticket/confirm-purchase';
import { PerformerListTicket } from '@components/ticket/performer-list-ticket';
import { updateBalance } from '@redux/user/actions';
import { followService, cryptoService } from 'src/services';
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  authService, ticketService, reactionService, tokenTransctionService, performerService, utilsService
} from '@services/index';
import {
  Avatar, Button, Image, Layout, Modal, Spin, Tooltip, message, Progress
} from 'antd';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import Error from 'next/error';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { TickIcon } from 'src/icons';
import {
  ICountry, IError, IPerformer, ITicket, IUIConfig, IUser, ISettings
} from 'src/interfaces';
import styles from './event-store.module.scss';

import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory as idlFactoryLedger } from '../../src/smart-contracts/declarations/ledger/ledger.did.js';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import type { _SERVICE as _SERVICE_LEDGER } from '../../src/smart-contracts/declarations/ledger/ledger2.did';
import { TransferArgs, Tokens, TimeStamp } from '../../src/smart-contracts/declarations/ledger/ledger2.did';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import { Principal } from '@dfinity/principal';
import { debounce, divide } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronDown, faCheck, faLocationDot, faTicket, faDoorClosed, faDoorOpen } from '@fortawesome/free-solid-svg-icons'
import Places from './places'
import PaymentProgress from '../../src/components/user/payment-progress';

interface IProps {
  user: IUser;
  ui: IUIConfig;
  error: IError;
  updateBalance: Function;
  ticket: ITicket;
  countries: ICountry[];
  onFollow?: Function;
  settings: ISettings;
}

interface IStates {
  isBookmarked: boolean;
  relatedTickets: ITicket[];
  loading: boolean;
  submiting: boolean;
  openPurchaseModal: boolean;
  openProgressModal: boolean;
  progress: number;
  ticket: ITicket;
  countries: any;
  selectedOption: string;
  ticketsAvalable: boolean;
  venue: string;
  selectedTier: string;
  caption: boolean;
  requesting: boolean;
  isFollowed: boolean;
  hasEventDatePassed: boolean;
}

class TicketViewPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static noredirect = true;

  async getData() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    try {
      const [ticket, countries] = await Promise.all([
        ticketService.userView(id, {
          Authorization: authService.getToken() || ''
        }),
        utilsService.countriesList()
      ]);
      return {
        ticket: ticket.data,
        countries: countries.data || []
      };
    } catch (e) {
      return {
        ticket: null,
        countries: null
      };
    }
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      relatedTickets: [],
      loading: false,
      submiting: false,
      isBookmarked: false,
      openPurchaseModal: false,
      openProgressModal: false,
      progress: 0,
      ticket: null,
      selectedOption: null,
      countries: null,
      ticketsAvalable: false,
      venue: '',
      selectedTier: '',
      caption: false,
      requesting: false,
      isFollowed: false,
      hasEventDatePassed: false
    };
  }

  async componentDidMount() {
    const { ticket } = this.state;
    this.setState({ isFollowed: !!ticket?.performer?.isFollowed });

    if (ticket === null) {
      const data = await this.getData();

      this.setState({ ticket: data.ticket, countries: data.countries }, () => this.updateTicketShallowRoute());
    } else {
      this.updateTicketShallowRoute();
    }

    Router.events.on('routeChangeComplete', this.onRouteChangeComplete);
  }

  componentWillUnmount() {
    Router.events.off('routeChangeComplete', this.onRouteChangeComplete);
  }

  onRouteChangeComplete = async (url) => {
    const data = await this.getData();
    this.setState({ ticket: data.ticket, countries: data.countries }, () => this.updateTicketShallowRoute());
  };

  copy = async (text: any) => {
    await navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  }

  fullCaption(val: boolean) {
    this.setState({ caption: val });
  }

  handleFollow = async () => {
    const { ticket, user, onFollow } = this.props;
    const { isFollowed, requesting } = this.state;
    if (requesting || user.isPerformer) return;
    if (!user._id) {
      message.error('Please log in or register!');
      return;
    }
    try {
      this.setState({ requesting: true });
      if (!isFollowed) {
        await followService.create(ticket?.performer?._id);
        this.setState({ isFollowed: true, requesting: false });
      } else {
        await followService.delete(ticket?.performer?._id);
        this.setState({ isFollowed: false, requesting: false });
      }
      onFollow && onFollow();
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
      this.setState({ requesting: false });
    }
  };

  async handleBookmark() {
    const { isBookmarked } = this.state;
    const { ticket } = this.state;
    if (ticket === null) return;
    try {
      this.setState({ submiting: true });
      if (!isBookmarked) {
        await reactionService.create({
          objectId: ticket._id,
          action: 'book_mark',
          objectType: 'ticket'
        });
        this.setState({ isBookmarked: true });
      } else {
        await reactionService.delete({
          objectId: ticket._id,
          action: 'book_mark',
          objectType: 'ticket'
        });
        this.setState({ isBookmarked: false });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    } finally {
      await this.setState({ submiting: false });
    }
  }

  async updateTicketShallowRoute() {
    const { ticket } = this.state;
    if (ticket === null) return;

    let timestamp;

    if (ticket.start < ticket.end) {
      timestamp = Date.parse(ticket.date + ticket.end) + (86400000);
    } else {
      timestamp = Date.parse(ticket.date + ticket.end);
    }
    // timestamp = Date.parse(ticket.date + ticket.end)
    this.setState({ hasEventDatePassed: timestamp < Math.floor(Date.now()) });

    ticket?.tiers.map((t) => {
      if (Number(t.supply) > 0) {
        this.setState({ ticketsAvalable: true});
        return true;
      }
      return false;
    });
    try {
      await this.setState({ loading: true });
      const relatedTickets = await (
        await ticketService.userSearch({
          limit: 24,
          excludedId: ticket._id,
          performerId: ticket.performerId
        })
      ).data;
      this.setState({
        isBookmarked: ticket.isBookMarked,
        relatedTickets: relatedTickets.data,
        loading: false
      });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
      this.setState({ loading: false });
    }
  }

  async purchaseTicket(payload: any) {
    const { user, updateBalance: handleUpdateBalance } = this.props;
    const { ticket } = this.state;
    if (ticket === null) return;
    if (user?.isPerformer) return;
    
    if (payload.currency === 'USD' && user.balance < payload.price) {
      message.error('You have an insufficient token balance. Please top up.');
      return;
    }
    
    try {
      this.setState({ submiting: true });

      if(payload.currency === "USD"){
        await tokenTransctionService.purchaseTicket(ticket._id, payload).then(()=>{
          message.success('Payment success');
          handleUpdateBalance({ token: -payload.price });
        }).catch((error) => {
          console.log(error)
        })
        
        // handleUpdateBalance({ token: -ticket.price - fee });
        Router.push('/user/my-payments');
      }else if(payload.currency !== "USD"){
        if(payload.paymentOption === 'plug'){
          await this.purchaseTicketPlug(payload);
        }else{
          await this.purchaseTicketCrypto(payload.currencyOption, payload.amountToSendICP, payload)
        }
        
      }else{
        message.error('Invalid ticket');
      }
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
      this.setState({ submiting: false, openPurchaseModal: false });
    }
  };


  getPlatformAccountIdentity(principal: Principal){
    const platformAI = AccountIdentifier.fromPrincipal({
      principal: principal
    });
    // @ts-ignore
    const { bytes } = platformAI;
    const accountIdBlob = Object.keys(bytes).map((m) => bytes[m]);
    return accountIdBlob;
  }

  getRecipientAccountIdentity(principal: Principal){
    const recipientAI = AccountIdentifier.fromPrincipal({
      principal: principal
    });
    // @ts-ignore
    const { bytes } = recipientAI;
    const accountIdBlob = Object.keys(bytes).map((m) => bytes[m]);
    return accountIdBlob;
  }

  async purchaseTicketPlug(payload: any){
    const {ticket} = this.state;
    const { settings } = this.props;
    let transferToTrax;
    let transferToArtist;
    let transfer;
    const ckBTCLedgerCanID = settings.icCKBTCMinter;

    this.setState({
      openProgressModal: true,
      openPurchaseModal: false,
      progress: 0
    });

    if(typeof window !== 'undefined' && 'ic' in window){
      // @ts-ignore
      const connected = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug?.requestConnect({
        host: settings.icHost
      }) : false;

      !connected && message.error("Failed to connected to canister. Please try again later or contact us. ")

      if(connected){
        this.setState({ progress: 25 });
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

        let amountToSendArtist = payload.price * 0.9;
        let amountToSendTRAX = payload.price * 0.1;
        let decimals = 100000000;

        if(payload.currency === 'ckBTC'){
          if((ckBTC_balance * decimals) >= (payload.price * decimals) + 200000){
            this.setState({ progress: 50 });

            const params = {
              to: payload.wallet_address,
              strAmount: payload.price.toString(),
              token: ckBTCLedgerCanID
            };

            //@ts-ignore
            transfer = await window.ic?.plug?.requestTransfer(params).then(async ()=>{
              
            }).catch((error) =>{
              message.error(`Transaction failed. ${error}`);
              console.log(error)
              this.setState({progress: 0})
            })


            // //@ts-ignore
            // transferToTrax = await window.ic.plug.requestTransferToken(traxParams).then( async ()=>{
            //   //@ts-ignore
            //   transferToArtist = await window.ic.plug.requestTransferToken(artistParams).catch((error) => {
            //     message.error(`Transaction failed. ${error}`);
            //     this.setState({progress: 0})
            //   })
            // }).catch((error) =>{
            //   message.error(`Transaction failed. ${error}`);
            //   this.setState({progress: 0})
            // });
            
          } else {
            this.setState({ progress: 0 })
            message.error('Insufficient balance, please top up your wallet and try again.');
          }
        }


        if(payload.currency === 'TRAX'){
          if((TRAX_balance * decimals) >= (payload.price * decimals) + 200000){
            this.setState({ progress: 50 });

            const params = {
              to: payload.wallet_address,
              strAmount: payload.price.toString(),
              token: process.env.NEXT_PUBLIC_TRAX_CANISTER_ID as string
            };

            // const traxParams = {
            //   to: payload.wallet_address,
            //   strAmount: amountToSendTRAX.toString(),
            //   token: process.env.NEXT_PUBLIC_TRAX_CANISTER_ID as string
            // };

            // const artistParams = {
            //   to: payload.wallet_address,
            //   strAmount: amountToSendArtist.toString(),
            //   token: process.env.NEXT_PUBLIC_TRAX_CANISTER_ID as string
            // };


            //@ts-ignore
            transfer = await window.ic?.plug?.requestTransfer(params).then(async ()=>{
              
            }).catch((error) =>{
              message.error(`Transaction failed. ${error}`);
              console.log(error)
              this.setState({progress: 0})
            })

            // //@ts-ignore
            // transferToTrax = await window.ic.plug.requestTransferToken(traxParams).then( async ()=>{
            //   //@ts-ignore
            //   transferToArtist = await window.ic.plug.requestTransferToken(artistParams).catch((error) =>{
            //     message.error(`Transaction failed. ${error}`);
            //     this.setState({progress: 0})
            //   })
            // }).catch((error) =>{
            //   message.error(`Transaction failed. ${error}`);
            //   this.setState({progress: 0})
            // });
            
          } else {
            this.setState({ progress: 0 })
            message.error('Insufficient balance, please top up your wallet and try again.');
          }
        }
        
        
        if (payload.currency === 'ICP') {
          if((icp_balance * decimals) >= (payload.price * decimals) + 200000){
            this.setState({ progress: 50 });

            const param = {
              to: payload.wallet_address,
              amount: Math.trunc(payload.price * decimals),
            }

            // const traxParam = {
            //   to: payload.wallet_address,
            //   amount: Math.trunc(amountToSendTRAX * 100000000),
            // }

            // const artistParam = {
            //   to: payload.wallet_address,
            //   amount: Math.trunc(amountToSendArtist * 100000000),
            // }

            //@ts-ignore
            transfer = await window.ic?.plug?.requestTransfer(param).then(async ()=>{
              
            }).catch((error) =>{
              message.error(`Transaction failed. ${error}`);
              console.log(error)
              this.setState({progress: 0})
            })

            // //@ts-ignore
            // transferToTrax = await window.ic?.plug?.requestTransfer(traxParam).then(async ()=>{
            //   //@ts-ignore
            //   transferToArtist = await window.ic?.plug?.requestTransfer(artistParam).catch( async (error) =>{
            //     message.error(`Transaction failed. ${error}`);
            //     console.log(error)
            //     this.setState({progress: 0})
            //   })
            // }).catch((error) =>{
            //   message.error(`Transaction failed. ${error}`);
            //   console.log(error)
            //   this.setState({progress: 0})
            // })
            
          } else {
            this.setState({progress: 0})
            message.error('Insufficient balance, please top up your wallet and try again.');
          }
        }

        if(transfer.height){
          this.setState({ progress: 75 });
          
          await tokenTransctionService.purchaseTicketCrypto(ticket?.performer?._id, 
            { 
              performerId: ticket?.performer?._id, 
              price: payload.price, 
              tokenSymbol: payload.currency, 
              id: ticket._id, 
              tier: payload.tier, 
              cryptoTx: transfer.height,
              quantity: payload.quantity
            }).then(() => {
            this.setState({ progress: 100 });
            message.success(`Payment successful! You are going to ${ticket.name}`);
          });

        }else{
          setTimeout(() => this.setState({
            progress: 0
          }), 1000);
          message.error('Transaction failed. Please try again later.');
        }
      }
    }
  }

  async purchaseTicketCrypto(ticker: string, amount: number, payload: any){
    this.setState({
        openProgressModal: true,
        openPurchaseModal: false,
        progress: 0
      });

    const { user, settings } = this.props;
    const { ticket } = this.state;
    if (ticket === null) return;
    let amountToSend = BigInt(Math.trunc((amount * 100000000) / 0.9));
    let amountToSendPlatform = BigInt(Math.trunc((amount * 100000000) / 0.1));

    let identity;
    let ledgerActor;
    const authClient = await AuthClient.create();
    let sender;
    let agent;
    let transferArgs: TransferArgs;
    let transferParams: TransferParams;
    let transferArgsPlatform: TransferArgs;
    let transferParamsPlatform: TransferParams;
    const uuid = BigInt(Math.floor(Math.random() * 1000));

    const TRAXLedgerCanID = Principal.fromText(settings.icTraxToken);
    const ledgerCanID = settings.icLedger;
    const ckBTCLedgerCanID = Principal.fromText(settings.icCKBTCMinter);

    const recipientAccountIdBlob = this.getRecipientAccountIdentity(Principal.fromText(ticket?.performer?.wallet_icp))
    const platformAccountIdBlob = this.getPlatformAccountIdentity(Principal.fromText(settings.icTraxAccountPercentage))
    
    const fanAI = AccountIdentifier.fromPrincipal({
      principal: Principal.fromText(user.wallet_icp)
    });
    // @ts-ignore
    const fanBytes = fanAI.bytes;
    const txTime: TimeStamp = {
      timestamp_nanos: BigInt(Date.now() * 1000000)
    };
    const balArgs: AccountBalanceArgs = {
      account: fanBytes
    };

    if(ticker == "ICP"){
      transferArgs = {
        memo: uuid,
        amount: { e8s: amountToSend },
        fee: { e8s: BigInt(10000) },
        from_subaccount: [],
        to: recipientAccountIdBlob,
        created_at_time: [txTime]
      };
      transferArgsPlatform = {
        memo: uuid,
        amount: { e8s: amountToSendPlatform },
        fee: { e8s: BigInt(10000) },
        from_subaccount: [],
        to: platformAccountIdBlob,
        created_at_time: [txTime]
      };
    }else if(ticker ==="ckBTC"){
      transferParams = {
        amount: amountToSend,
        fee: BigInt(10),
        from_subaccount: null,
        to: {
          owner: Principal.fromText(ticket?.performer?.wallet_icp),
          subaccount: [],
        },
        created_at_time: BigInt(Date.now() * 1000000)
      };
      transferParamsPlatform = {
        amount: amountToSendPlatform,
        fee: BigInt(10),
        from_subaccount: null,
        to: {
          owner: Principal.fromText(settings.icTraxAccountPercentage),
          subaccount: [],
        },
        created_at_time: BigInt(Date.now() * 1000000)
      };
    }else if(ticker ==="TRAX"){
      transferParams = {
        amount: amountToSend,
        fee: BigInt(100000),
        from_subaccount: null,
        to: {
          owner: Principal.fromText(ticket?.performer?.wallet_icp),
          subaccount: [],
        },
        created_at_time: BigInt(Date.now() * 1000000)
      };
      transferParamsPlatform = {
        amount: amountToSendPlatform,
        fee: BigInt(100000),
        from_subaccount: null,
        to: {
          owner: Principal.fromText(settings.icTraxAccountPercentage),
          subaccount: [],
        },
        created_at_time: BigInt(Date.now() * 1000000)
      };
    }else{
      message.error('Invalid ticker, please select a different token!');
      return;
    }

    if (settings.icNetwork !== true) {
      await authClient.login({
        identityProvider: cryptoService.getIdentityProviderLink(),
        onSuccess: async () => {

          identity = authClient.getIdentity();
          const host = settings.icHost;
          agent = new HttpAgent({
            identity,
            host
          });

          agent.fetchRootKey();
          sender = await agent.getPrincipal();

          // Balance checks first
          if(ticker == "ICP"){
            ledgerActor = Actor.createActor<_SERVICE_LEDGER>(idlFactoryLedger, {
              agent,
              canisterId: ledgerCanID
            });

            let balICP = await ledgerActor.account_balance(balArgs);
            if(Number(balICP.e8s) < Number(amountToSend + amountToSendPlatform) + 20000){
              this.setState({
                submiting: false,
                openPurchaseModal: false,
                openProgressModal: false,
                progress: 0
              });
              message.error('Insufficient balance, please top up your wallet and try again.');
              return;
            }

          }else if(ticker === "ckBTC"){
            ledgerActor = IcrcLedgerCanister.create({
              agent,
              canisterId: ckBTCLedgerCanID
            });

            let balICRC1 = await ledgerActor.balance({
              owner: Principal.fromText(user?.wallet_icp),
              certified: false,
            });     
            if(Number(balICRC1) < Number(amountToSend + amountToSendPlatform) + 20){
              this.setState({
                submiting: false,
                openProgressModal: false,
                progress: 0
              });
              message.error('Insufficient balance, please top up your wallet and try again.');
              return;
            }

          }else if(ticker === "TRAX"){
            ledgerActor = IcrcLedgerCanister.create({
              agent,
              canisterId: TRAXLedgerCanID
            });

            let balICRC1 = await ledgerActor.balance({
              owner: Principal.fromText(user?.wallet_icp),
              certified: false,
            });     
            if(Number(balICRC1) < Number(amountToSend + amountToSendPlatform) + 200000){
              this.setState({
                submiting: false,
                openProgressModal: false,
                progress: 0
              });
              message.error('Insufficient balance, please top up your wallet and try again.');
              return;
            }

          }else{ message.error('Invalid ticker, please select a different token!'); return;}

          this.setState({ progress: 50 });

          // transfer platform fee to trax account.
          await ledgerActor.transfer(ticker === "ICP" ? transferArgsPlatform : transferParamsPlatform).then(async (res) => {
            this.setState({ progress: 75 });
          }).catch((error) => {
            this.setState({ submiting: false, openProgressModal: false, progress: 0 });
            message.error(error.message || 'error occured, please try again later');
            return error;
          });

          // transfer remaining funds to artist
          await ledgerActor.transfer(ticker === "ICP" ? transferArgs : transferParams).then(async (res) => {

            await tokenTransctionService.purchaseTicketCrypto(ticket?.performer?._id, 
              { 
                performerId: ticket?.performer?._id, 
                price: payload.price, 
                tokenSymbol: payload.currency, 
                id: ticket._id, 
                tier: payload.tier, 
                cryptoTx: res.Ok,
                quantity: payload.quantity
              }).then(() => {
              this.setState({ progress: 100 });
              message.success(`Payment successful! You are going to ${ticket.name}`);
            });

          }).catch((error) => {
            this.setState({
              submiting: false,
              openProgressModal: false,
              progress: 0
            });
            message.error(error.message || 'error occured, please try again later');
            return error;
          });
        }
      });

    } else {
      const host = settings.icHost;

      await authClient.login({
        onSuccess: async () => {

          identity = authClient.getIdentity();
          agent = new HttpAgent({ identity, host });
          sender = await agent.getPrincipal();

          if(ticker === "ICP"){
            ledgerActor = Actor.createActor<_SERVICE_LEDGER>(idlFactoryLedger, {
              agent,
              canisterId: ledgerCanID
            });
            let balICP = await ledgerActor.account_balance(balArgs);
            if(Number(balICP.e8s) < Number(amountToSend) + 20000){
              this.setState({
                submiting: false,
                openPurchaseModal: false,
                openProgressModal: false,
                progress: 0
              });
              message.error('Insufficient balance, please top up your wallet and try again.');
              return;
            }

          }else if(ticker == "ckBTC"){
            ledgerActor = IcrcLedgerCanister.create({
              agent,
              canisterId: ckBTCLedgerCanID
            });
            let balICRC1 = await ledgerActor.balance({
              owner: Principal.fromText(user?.wallet_icp),
              certified: false,
            });
            if(Number(balICRC1) < Number(amountToSend) + 20){
              this.setState({
                submiting: false,
                openPurchaseModal: false,
                openProgressModal: false,
                progress: 0
              });
              message.error('Insufficient balance, please top up your wallet and try again.');
              return;
            }
          }else if(ticker == "TRAX"){
            ledgerActor = IcrcLedgerCanister.create({
              agent,
              canisterId: TRAXLedgerCanID
            });
            let balICRC1 = await ledgerActor.balance({
              owner: Principal.fromText(user?.wallet_icp),
              certified: false,
            });
            if(Number(balICRC1) < Number(amountToSend) + 200000){
              this.setState({
                submiting: false,
                openPurchaseModal: false,
                openProgressModal: false,
                progress: 0
              });
              message.error('Insufficient balance, please top up your wallet and try again.');
              return;
            }
          }else{
            message.error('Invalid ticker, please select a different token!');
            return;
          }

          // transfer platform fee to trax account.
          await ledgerActor.transfer(ticker === "ICP" ? transferArgsPlatform : transferParamsPlatform).then(async (res) => {
            this.setState({ progress: 60 });
          }).catch((error) => {
            this.setState({
              submiting: false,
              openProgressModal: false,
              openPurchaseModal: false,
              progress: 0
            });
            message.error(error.message || 'error occured, please try again later');
            return error;
          });

          // transfer remaining funds to artist
          await ledgerActor.transfer(ticker === "ICP" ? transferArgs : transferParams).then(async (res) => {
            this.setState({ progress: 100 });
            this.setState({
                submiting: false,
                openProgressModal: false,
                openPurchaseModal: false,
                progress: 100
              });
              message.success("Payment successful! Your order has been placed.")

          }).catch((error) => {
            this.setState({
              // requesting: false,
              submiting: false,
              openProgressModal: false,
              openPurchaseModal: false,
              progress: 0
            });
            message.error(error.message || 'error occured, please try again later');
            return error;
          });
        }
      });
    }
  };

  handleOptionClick = (id) => {
    this.setState((prevState) => ({
      selectedOption: id === prevState.selectedOption ? null : id,
    }));
  }

  getAddress = (val) =>{
    this.setState({venue: val})
  }



  render() {
    const {
      ui, error, user
    } = this.props;
    const {
      selectedOption, caption, isFollowed, ticket, countries, relatedTickets, isBookmarked, loading, openPurchaseModal, submiting, progress, openProgressModal, ticketsAvalable, venue, selectedTier, hasEventDatePassed
    } = this.state;
    if (ticket === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    if (error) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Ticket was not found'} />;
    }

    return (
      <Layout className={styles.pagesStoreModule}>
        <Head>
          <title>{`${ui?.siteName} | ${ticket?.name || 'Ticket'}`}</title>
          <meta name="keywords" content={ticket?.description} />
          <meta name="description" content={ticket?.description} />
          {/* OG tags */}
          <meta property="og:title" content={`${ui?.siteName} | ${ticket?.name || 'Ticket'}`} key="title" />
          <meta property="og:image" content={ticket?.image || '/static/empty_product.svg'} />
          <meta property="og:description" content={ticket?.description} />
          {/* Twitter tags */}
          <meta name="twitter:title" content={`${ui.siteName} | ${ticket.name || 'Product'}`} />
          <meta name="twitter:image" content={ticket?.image || '/static/empty_product.svg'} />
          <meta name="twitter:description" content={ticket.description} />
        </Head>
        {ticket && !loading ? (
              <div className="tick-img-background" style={{backgroundImage: ticket?.image ? `url('${ticket?.image}')`: '/static/empty_product.svg'}}>
                <div className='tick-img-blur-background'>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Spin />
              </div>
            )}

          <div className="tick-card">
            
            {ticket && !loading ? (
              <div className='ticket-img-wrapper'>
                <div className="ticket-img-thumb">
                  <div className="ticket-img-bg" style={{backgroundImage: ticket?.image ? `url('${ticket?.image}')`: '/static/empty_product.svg'}} />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Spin />
              </div>
            )}

            {ticket && (
              <div className="tick-info">
                <p className="tick-name">{ticket.name || 'N/A'}</p>
                <div className="add-cart">

                  <div>
                    <span className='ticket-date'>
                      {ticket.date}
                    </span>
                  </div>

                  <div className='ticket-badge-wrapper'>
                  <span className='ticket-type'>
                    <div className='ticket-icon-wrapper'>
                      <FontAwesomeIcon className='ticket-icon' icon={faTicket} />
                    </div>
                    <span>
                      Gigs
                    </span>
                  </span>

                    <span className='ticket-location'>
                      <div className='ticket-icon-wrapper'>
                        <FontAwesomeIcon className='pin-icon' icon={faLocationDot} />
                      </div>
                    
                      <span>
                      {(ticket?.address).substring(0, ticket.address.indexOf(','))}
                      </span>
                    </span>
                  </div>
                  
                  <p>
                  {!hasEventDatePassed && ticketsAvalable &&(
                    <div className='tick-stock-wrapper'>
                      <span className="tick-stock" >
                        <FontAwesomeIcon className='faCheck-prod'  icon={faCheck} />
                        <span>Tickets available</span>
                      </span>
                    </div>
                  )}

                  {hasEventDatePassed &&(
                    <div className='event-passed-wrapper'>
                      <span className="event-passed" >
                        {/* <FontAwesomeIcon className='faCheck-prod'  icon={faCheck} /> */}
                        <span>Tickets are no longer available</span>
                      </span>
                    </div>
                  )}

                  {/* {ticket.stock && ticket.type === 'digital' ? (
                    <div className='prod-stock-wrapper'>
                      <span className="prod-stock">
                        <FontAwesomeIcon className='faCheck-prod' icon={faCheck} />
                        In stock and ready to buy
                      </span>
                    </div>
                    
                  ) : null} */}
                  {/* {ticket.stock === 0 && (
                  <span style={{color: 'red'}}>Sold out!</span>
                )} */}
                  {/* {!ticket.stock && ticket.type === 'physical' && <span className="prod-stock">Out of stock!</span>} */}
                  
                </p>

                  <div className='ticket-description-wrapper'>
                    <span>Event information</span>
                    <p className="tick-desc">
                      {caption ? ticket?.description : ticket?.description?.split(' ').splice(0, 15).join(' ')}
                      <span onClick={() => this.fullCaption(true)} style={{ color: 'white', cursor: 'pointer', fontSize: '18px', fontWeight: '400' }}>
                        {(caption || ticket?.description?.split(' ').filter((word) => word !== '').length < 15) ? ' ' : <div>read more</div>}
                      </span>
                    </p>
                  </div>

                    <div style={{display: 'flex', flexDirection: 'row', gap: 4, marginBottom: '1rem'}}>
                    <Button
                      className="buy-ticket-button"
                      disabled={loading}
                      onClick={() => {
                        if (!user?._id) {
                          message.error('Please log in or register!');
                          return;
                        }
                        if (user?.isPerformer) {
                          message.error('Artists cannot purchase their own tickets!');
                          return;
                        }
                        // if (ticket?.type === 'physical' && !ticket?.stock) {
                        //   message.error('Out of stock, please comeback later!');
                        //   return;
                        // }
                        this.setState({ openPurchaseModal: true });
                      }}
                    >
                      Purchase
                    </Button>
                    <div className="act-btns">
                      <Tooltip title={isBookmarked ? 'Unsave item' : 'Save item'}>
                        <button
                          type="button"
                          className={isBookmarked ? 'like-button-active' : 'like-button'}
                          disabled={submiting}
                          onClick={this.handleBookmark.bind(this)}
                        >
                          <HeartOutlined />
                        </button>
                      </Tooltip>
                    </div>
                  </div>




                  
                    <div className='product-options-container'>
                        <div className='product-option-wrapper' key="dateTime">
                          <div
                            onClick={() => this.handleOptionClick("dateTime")}
                            className={`product-option ${'dateTime' === selectedOption ? "selected" : ""}`}
                          >
                            <span>Information</span>
                            {'dateTime' === selectedOption ?(
                              <FontAwesomeIcon style={{marginTop: '6px'}} icon={faChevronDown} />
                            ):(
                              <FontAwesomeIcon style={{marginTop: '6px'}} icon={faChevronRight} />
                            )}
                          </div>
                          {'dateTime' === selectedOption && (
                            <div className="product-option-content">
                                <span className='ticket-option-date'>
                                    {ticket.description}
                                </span>
                                
                            </div>
                          )}
                        </div>
                        <div className='product-option-wrapper' key="location">
                          <div
                            onClick={() => this.handleOptionClick("location")}
                            className={`product-option ${
                              'location' === selectedOption ? "selected" : ""
                            }`}
                          >
                            <span>Venue</span>
                            {'location' === selectedOption ?(
                              <FontAwesomeIcon style={{marginTop: '6px'}} icon={faChevronDown} />
                            ):(
                              <FontAwesomeIcon style={{marginTop: '6px'}} icon={faChevronRight} />
                            )}
                          </div>
                          {'location' === selectedOption && (
                            <div className="product-option-content">
                                <span>
                                    {ticket.address}
                                    <div className="copy-clipboard" onClick={() => this.copy(ticket.address)}>
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#999999">
                                        <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                        <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                                      </svg>
                                    </div>
                                </span>
                                <span>
                                  <FontAwesomeIcon icon={faDoorOpen} style={{color: '#a8a8a8', marginRight: '5px'}}/>
                                  <span style={{color: '#a8a8a8'}}>Doors open </span> {ticket.start}
                                </span>
                                <span>
                                  <FontAwesomeIcon icon={faDoorClosed} style={{color: '#a8a8a8', marginRight: '5px'}}/>
                                  <span style={{color: '#a8a8a8'}}>Doors close </span> {ticket.end}
                                </span>
                                <Places latitude={ticket.latitude} longitude={ticket.longitude}/>
                            </div>
                          )}
                        </div>

                        <div className='ticket-artist-profile-container'>
                            <Avatar className='ticket-artist-avatar' src={ticket?.performer?.avatar || '/no-avatar.png'}/>
                            <span className='ticket-profile-name'>{ticket.performer?.name}</span>
                            {/* onClick={() => this.handleFollow()} */}
                            <Link 
                              className='ticket-profile-link'
                              href={`/artist/profile?id=${ticket?.performer?.username || ticket?.performer?._id}`}
                              as={`/artist/profile?id=${ticket?.performer?.username || ticket?.performer?._id}`}>
                              <Button className={`${isFollowed ? 'ticket-profile-following-btn' : 'ticket-profile-follow-btn'} `}>Visit profile</Button>
                            </Link>
                        </div>
                  
                    </div>
                  
                </div>
              </div>
            )}
          </div>

        <div className="main-container">
          <div className="related-items" style={{padding: '5px'}}>
            <h4 className="ttl-1">You may also like</h4>
            {!loading && relatedTickets.length > 0 && <PerformerListTicket tickets={relatedTickets} />}
            {!loading && !relatedTickets.length && <p>No ticket was found</p>}
            {loading && (
              <div style={{ margin: 10, textAlign: 'center' }}>
                <Spin />
              </div>
            )}
          </div>
        </div>

        {!hasEventDatePassed && (
        <Modal
          key="purchase-product"
          width={420}
          title={null}
          open={openPurchaseModal}
          onOk={() => this.setState({ openPurchaseModal: false })}
          footer={null}
          onCancel={() => this.setState({ openPurchaseModal: false })}
          destroyOnClose
          centered
        >
          <PurchaseTicketForm
            countries={countries}
            ticket={ticket}
            submiting={submiting}
            user={user}
            performer={ticket?.performer}
            onFinish={this.purchaseTicket.bind(this)}
          />
        </Modal>
        )}


        <Modal
          key="ppv_progress"
          className="tip-progress"
          open={openProgressModal}
          centered
          onOk={() => this.setState({ openProgressModal: false })}
          footer={null}
          width={450}
          title={null}
          onCancel={() => this.setState({ openProgressModal: false })}
        >

          <PaymentProgress progress={progress} performer={ticket?.performer}/>

        </Modal>



        {hasEventDatePassed && (

          <Modal
            key="purchase-product"
            width={400}
            title={null}
            open={openPurchaseModal}
            onOk={() => this.setState({ openPurchaseModal: false })}
            footer={null}
            onCancel={() => this.setState({ openPurchaseModal: false })}
            destroyOnClose
            centered
          >
            <div className='guest-list-expired-wrapper'>
              <div className='guest-list-expired-header'>
                  <span>Event has passed</span>
                </div>
              <div className='event-has-passed-msg'>
                <span>You're too late :&#40;  </span>
                 
                <span> Follow this artist to be notified on any future events. Subscribe to this artist to get early access to future event sales. </span>
              </div>
            </div>
          </Modal>
        )}


        {/* <Modal
          key="ppv_progress"
          className="tip-progress"
          open={openProgressModal}
          centered
          onOk={() => this.setState({ openProgressModal: false })}
          footer={null}
          width={400}
          title={null}
          onCancel={() => this.setState({ openProgressModal: false })}
        >
          <div className="confirm-purchase-form">
            <div className="left-col">
              <Avatar src={ticket?.performer?.avatar || '/static/no-avatar.png'} />
              <div className="p-name">
                Purchase ticket from
                {' '}
                {ticket?.performer?.name || 'N/A'}
                {' '}
                {ticket?.performer?.verifiedAccount && <BadgeCheckIcon style={{ height: '1.5rem' }} className="primary-color" />}
              </div>
              <p className="p-subtitle">Transaction progress</p>

            </div>
            <Progress percent={Math.round(progress)} />
          </div>

        </Modal> */}
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  user: state.user.current,
  ui: { ...state.ui },
  settings: { ...state.settings }
});

const mapDispatch = { updateBalance };
export default connect(mapStates, mapDispatch)(TicketViewPage);
