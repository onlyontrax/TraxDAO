import { HeartOutlined, LoadingOutlined } from '@ant-design/icons';
import { PurchaseProductForm } from '@components/product/confirm-purchase';
import { PerformerListProduct } from '@components/product/performer-list-product';
import { updateBalance } from '@redux/user/actions';
import {
  authService, productService, reactionService, tokenTransctionService, performerService, utilsService
} from '@services/index';
import { cryptoService } from '@services/crypto.service';
import {
  Avatar, Button, Image, Layout, Modal, Spin, Tooltip, message, Progress
} from 'antd';
import Error from 'next/error';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { TickIcon } from 'src/icons';
import {
  ICountry, IError, IPerformer, IProduct, IUIConfig, IUser, ISettings
} from 'src/interfaces';
import styles from './store.module.scss';

import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory as idlFactoryLedger } from '../../src/smart-contracts/declarations/ledger/ledger.did.js';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import type { _SERVICE as _SERVICE_LEDGER } from '../../src/smart-contracts/declarations/ledger/ledger2.did';
import { TransferArgs, Tokens, TimeStamp } from '../../src/smart-contracts/declarations/ledger/ledger2.did';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import { Principal } from '@dfinity/principal';
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronDown, faCheck, faStore, faXmark } from '@fortawesome/free-solid-svg-icons'
import PaymentProgress from '../../src/components/user/payment-progress';
import { getPlugWalletIsConnected, getPlugWalletAgent, getPlugWalletProvider } from '../../src/crypto/mobilePlugWallet';

interface IProps {
  user: IUser;
  ui: IUIConfig;
  error: IError;
  updateBalance: Function;
  product: IProduct;
  countries: ICountry[];
  settings: ISettings;
}

interface IStates {
  isBookmarked: boolean;
  relatedProducts: IProduct[];
  loading: boolean;
  submiting: boolean;
  openPurchaseModal: boolean;
  openProgressModal: boolean;
  progress: number;
  product: IProduct;
  countries: any;
  selectedOption: number;
  caption: boolean;
  isFollowed: boolean;
  requesting: boolean;
  confetti: boolean;
}

class ProductViewPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static noredirect = true;

  async getData() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    try {
      const [product, countries] = await Promise.all([
        productService.userView(id, {
          Authorization: authService.getToken() || ''
        }),
        utilsService.countriesList()
      ]);
      return {
        product: product.data,
        countries: countries.data || []
      };
    } catch (e) {
      return {
        product: null,
        countries: null
      };
    }
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      relatedProducts: [],
      loading: false,
      submiting: false,
      isBookmarked: false,
      openPurchaseModal: false,
      openProgressModal: false,
      progress: 0,
      product: null,
      selectedOption: null,
      countries: null,
      caption: false,
      requesting: false,
      isFollowed: false,
      confetti: false
    };
  }

  async componentDidMount() {
    const { product } = this.state;
    this.setState({ isFollowed: !!product?.performer?.isFollowed });
    if (product === null) {
      const data = await this.getData();
      this.setState({ product: data.product, countries: data.countries }, () => this.updateProductShallowRoute());
    } else {
      this.updateProductShallowRoute();
    }

    Router.events.on('routeChangeComplete', this.onRouteChangeComplete);
  }

  componentWillUnmount() {
    Router.events.off('routeChangeComplete', this.onRouteChangeComplete);
  }

  onRouteChangeComplete = async (url) => {
    const data = await this.getData();
    this.setState({ product: data.product, countries: data.countries }, () => this.updateProductShallowRoute());
  };

  async handleBookmark() {
    const { isBookmarked } = this.state;
    const { product } = this.state;
    if (product === null) return;
    try {
      this.setState({ submiting: true });
      if (!isBookmarked) {
        await reactionService.create({
          objectId: product._id,
          action: 'book_mark',
          objectType: 'product'
        });
        this.setState({ isBookmarked: true });
      } else {
        await reactionService.delete({
          objectId: product._id,
          action: 'book_mark',
          objectType: 'product'
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


  async updateProductShallowRoute() {
    const { product } = this.state;
    if (product === null) return;
    try {
      await this.setState({ loading: true });
      const relatedProducts = await (
        await productService.userSearch({
          limit: 24,
          excludedId: product._id,
          performerId: product.performerId
        })
      ).data;
      this.setState({
        isBookmarked: product.isBookMarked,
        relatedProducts: relatedProducts.data,
        loading: false
      });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
      this.setState({ loading: false });
    }
  }

  async purchaseProduct(payload: any) {
    const { user, updateBalance: handleUpdateBalance } = this.props;
    const { product } = this.state;

    if (product === null) return;
    if (user?.isPerformer) return;
    const fee = payload.shippingFee ? payload.shippingFee : 0;

    if (payload.currencyOption === 'USD' && (user?.account?.balance < product.price + fee)) {
      message.error('You have an insufficient token balance. Please top up.');
      return;
    }

    if (product.type === 'physical' && !payload.deliveryAddressId) {
      message.error('Please select or create new the delivery address!');
      return;
    }

    try {
      this.setState({ submiting: true });

      if(payload.currencyOption === "USD"){
        await tokenTransctionService.purchaseProduct(product._id, payload);
        message.success('Payment success');
        handleUpdateBalance({ token: -product.price - fee });
        Router.push('/user/wallet');

      }else if(payload.currencyOption !== "USD"){
        if(payload.paymentOption === 'plug'){
          await this.purchaseProductPlug(payload);
        }else{
          await this.purchaseProductCrypto(payload.currencyOption, payload.price)
        }

      }else{
        message.error('This is an invalid currency option. Please pick a different currency to pay in.');
        return;
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

  async purchaseProductPlug(payload: any){
    const { product } = this.state;
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

    const plugWalletProvider = await getPlugWalletProvider();
    const agent = await getPlugWalletAgent();
    const connected = await getPlugWalletIsConnected();

    !connected && message.error("Failed to connected to canister. Please try again later or contact us. ")

    if(connected){
      this.setState({ progress: 25 });
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

      let decimals = 100000000;

      if(payload.currencyOption === 'ckBTC'){
        if((ckBTC_balance * decimals) >= (payload.price * decimals) + 200000){
          this.setState({ progress: 50 });
          (async () => {
          const params = {
            to: payload.wallet_address,
            strAmount: payload.price.toString(),
            token: ckBTCLedgerCanID
          };

          //@ts-ignore
          transfer = await plugWalletProvider.requestTransferToken(params).catch((error) =>{
            message.error(`Transaction failed. ${error}`);
            console.log(error)
            this.setState({progress: 0})
          })
        })();
        } else {
          this.setState({ progress: 0 })
          message.error('Insufficient balance, please top up your wallet and try again.');
        }
      }


      if(payload.currencyOption === 'TRAX'){
        if((TRAX_balance * decimals) >= (payload.price * decimals) + 200000){
          this.setState({ progress: 50 });

          const params = {
            to: payload.wallet_address,
            strAmount: payload.price.toString(),
            token: settings.icTraxToken
          };


          //@ts-ignore
          transfer = await plugWalletProvider.requestTransferToken(params).catch((error) =>{
            message.error(`Transaction failed. ${error}`);
            console.log(error)
            this.setState({progress: 0})
          })


        } else {
          this.setState({ progress: 0 })
          message.error('Insufficient balance, please top up your wallet and try again.');
        }
      }


      if (payload.currencyOption === 'ICP') {
        if((icp_balance * decimals) >= (payload.price * decimals) + 200000){

          this.setState({ progress: 50 });

          const param = {
            to: payload.wallet_address,
            amount: Math.trunc(payload.price * decimals),
          }

          //@ts-ignore
          transfer = await plugWalletProvider.requestTransfer(param).catch((error) =>{
            message.error(`Transaction failed. ${error}`);
            console.log(error)
            this.setState({progress: 0})
          })
          // transfer = await plugWalletProvider.requestTransfer(param).catch((error) =>{
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

        await tokenTransctionService.purchaseProductCrypto(product?.performer?._id,
          {
            performerId: product?.performer?._id,
            price: payload.price,
            tokenSymbol: payload.currency,
            id: product._id,
            shippingOption: payload.shippingOption,
            cryptoTx: transfer.height,
            quantity: payload.quantity
          }).then(() => {
          this.setState({ progress: 100 });
          message.success(`Payment successful! You are going to ${product.name}`);
        });

      }else{
        setTimeout(() => this.setState({
          progress: 0
        }), 1000);
        message.error('Transaction failed. Please try again later.');
      }
    }
  }

  async purchaseProductCrypto(ticker: string, amount: number){
    this.setState({
        openProgressModal: true,
        progress: 10
      });

    const { user, settings } = this.props;
    const { product } = this.state;
    if (product === null) return;
    let amountToSend = BigInt(Math.trunc((amount * 100000000) * 0.9));
    let amountToSendPlatform = BigInt(Math.trunc((amount * 100000000) * 0.1));

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
    const ledgerCanID = settings.icLedger;
    const ckBTCLedgerCanID = Principal.fromText(settings.icCKBTCMinter);

    const recipientAccountIdBlob = this.getRecipientAccountIdentity(Principal.fromText(product?.performer.account?.wallet_icp))
    const platformAccountIdBlob = this.getPlatformAccountIdentity(Principal.fromText(settings.icTraxAccountPercentage))

    const fanAI = AccountIdentifier.fromPrincipal({
      principal: Principal.fromText(user.account?.wallet_icp)
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
          owner: Principal.fromText(product?.performer.account?.wallet_icp),
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
              owner: Principal.fromText(user.account?.wallet_icp),
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

          }else{ message.error('Invalid ticker, please select a different token!'); return;}

          this.setState({ progress: 30 });

          // transfer platform fee to trax account.
          await ledgerActor.transfer(ticker === "ICP" ? transferArgsPlatform : transferParamsPlatform).then(async (res) => {
            this.setState({ progress: 60 });
          }).catch((error) => {
            this.setState({ submiting: false, openProgressModal: false, progress: 0 });
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
              message.success("Payment successful! Your order has been placed.");

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
              owner: Principal.fromText(user.account?.wallet_icp),
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

  fullCaption(val: boolean) {
    this.setState({ caption: val });
  }

  render() {
    const {
      ui, error, user
    } = this.props;
    const {
      selectedOption, confetti, product, countries, relatedProducts, isBookmarked, loading, openPurchaseModal, submiting, progress, openProgressModal, caption, isFollowed
    } = this.state;
    if (product === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    if (error) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Product was not found'} />;
    }

    const options = [
      { id: 1, title: "Product information", content: product?.description },
      { id: 2, title: "Shipping info", content: `Shipping type: ${product?.shippingFees[0]?.type} ($${product?.shippingFees[0]?.fee})` },
      { id: 3, title: "Returns", content: "No return information provided" }
    ];

    return (
      <Layout className={styles.pagesStoreModule}>
        <Head>
          <title>{`${ui?.siteName} | ${product?.name || 'Product'}`}</title>
          <meta name="keywords" content={product?.description} />
          <meta name="description" content={product?.description} />
          {/* OG tags */}
          <meta property="og:title" content={`${ui?.siteName} | ${product?.name || 'Product'}`} key="title" />
          <meta property="og:image" content={product?.image || '/static/empty_product.svg'} />
          <meta property="og:description" content={product?.description} />
          {/* Twitter tags */}
          <meta name="twitter:title" content={`${ui.siteName} | ${product.name || 'Product'}`} />
          <meta name="twitter:image" content={product?.image || '/static/empty_product.svg'} />
          <meta name="twitter:description" content={product.description} />
        </Head>

          {product && !loading ? (
              <div className="tick-img-background" style={{backgroundImage: product?.image ? `url('${product?.image}')`: '/static/empty_product.svg'}}>
                <div className='tick-img-blur-background'>
                </div>
              </div>
          ) : (
              <div className="text-center">
                <Spin />
              </div>
          )}

          <div className="prod-card">

            {product && !loading ? (
              <div className='prod-img-wrapper'>
                <div className="prod-img-thumb">
                  <div className="prod-img-bg" style={{backgroundImage: product?.image ? `url('${product?.image}')`: '/static/empty_product.svg'}} />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Spin />
              </div>
            )}
            {product && (
              <div className="prod-info">
                <div className='product-header-flexbox'>
                  <p className="prod-name">{product.name || 'N/A'}</p>
                  <p className="prod-price">
                    $
                    {product.price.toFixed(2)}
                  </p>
                </div>

                <div className='prod-badge-wrapper'>
                  <span className='prod-type'>
                    <div className='prod-icon-wrapper'>
                      <FontAwesomeIcon className='prod-icon' icon={faStore} />
                    </div>
                    <span>
                      {product?.type === 'physical' ? 'Physical product' : 'Digital product'}
                    </span>
                  </span>
                </div>

                <div className="add-cart">
                  <p>
                    <div className='prod-stock-wrapper'>
                      <span className={product.stock ? 'prod-stock' : 'prod-no-stock'}>
                        {product.stock ? (
                          <>
                            <FontAwesomeIcon className='faCheck-prod' icon={faCheck} />
                            {product.type === 'digital' && (
                              <span>In stock and ready to buy</span>
                            )}
                            {product.stock && product.type === 'physical' && (
                              <span>In stock and ready to ship</span>
                            )}
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon className='faX-prod' icon={faXmark} />
                            <span>Out of stock</span>
                          </>
                        )}
                      </span>
                    </div>
                </p>
                <div className='prod-description-wrapper'>
                    <span>Event information</span>
                    <p className="prod-desc">
                      {caption ? product?.description : product?.description?.split(' ').splice(0, 15).join(' ')}
                      <span onClick={() => this.fullCaption(true)} style={{ color: 'white', cursor: 'pointer', fontSize: '18px', fontWeight: '500' }}>
                        {(caption || product?.description?.split(' ').filter((word) => word !== '').length < 15) ? ' ' : <div>read more</div>}
                      </span>
                    </p>
                  </div>

                    <div style={{display: 'flex', flexDirection: 'row', gap: 4, marginBottom: '1rem'}}>
                    <Button
                      className="buy-prod-button"
                      disabled={loading}
                      onClick={() => {
                        if (!user?._id) {
                          message.error('Please log in or register!');
                          return;
                        }
                        if (user?.isPerformer) {
                          message.error('Artists cannot purchase their own products!');
                          return;
                        }
                        if (product?.type === 'physical' && !product?.stock) {
                          message.error('Out of stock, please comeback later!');
                          return;
                        }
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

                  {product.type === 'physical' && (
                    <div className='product-options-container'>
                      {options.map((option) => (
                        <div className='product-option-wrapper' key={option.id}>
                          <div
                            onClick={() => this.handleOptionClick(option.id)}
                            className={`product-option ${
                              option.id === selectedOption ? "selected" : ""
                            }`}
                          >
                            <span>{option.title}</span>
                            {option.id === selectedOption ?(
                              <FontAwesomeIcon style={{marginTop: '6px'}} icon={faChevronDown} />
                            ):(
                              <FontAwesomeIcon style={{marginTop: '6px'}} icon={faChevronRight} />
                            )}
                          </div>
                          {option.id === selectedOption && (
                            <div className="product-option-content">{option.content}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                          <div className='prod-artist-profile-container'>
                            <Avatar className='prod-artist-avatar' src={product?.performer?.avatar || '/no-avatar.png'}/>
                            <span className='prod-profile-name'>{product.performer?.name}</span>
                            {/* onClick={() => this.handleFollow()} */}
                            <Link
                              className='prod-profile-link'
                              href={`/artist/profile/?id=${product?.performer?.username || product?.performer?._id}`}
                              as={`/artist/profile/?id=${product?.performer?.username || product?.performer?._id}`}>
                              <Button className={`${isFollowed ? 'prod-profile-following-btn' : 'prod-profile-follow-btn'} `}>Visit profile</Button>
                            </Link>
                        </div>
                </div>
              </div>
            )}
          </div>

        <div className="main-container">
          <div className="related-items" style={{padding: '5px'}}>
            <h4 className="ttl-1">You may also like</h4>
            {!loading && relatedProducts.length > 0 && <PerformerListProduct products={relatedProducts} />}
            {!loading && !relatedProducts.length && <p>No product was found</p>}
            {loading && (
              <div style={{ margin: 10, textAlign: 'center' }}>
                <Spin />
              </div>
            )}
          </div>
        </div>

        <Modal
          key="purchase-product"
          width={700}
          title={null}
          open={openPurchaseModal}
          onOk={() => this.setState({ openPurchaseModal: false })}
          footer={null}
          onCancel={() => this.setState({ openPurchaseModal: false })}
          destroyOnClose
          centered
        >
          <PurchaseProductForm
            countries={countries}
            product={product}
            submiting={submiting}
            user={user}
            performer={product?.performer}
            onFinish={this.purchaseProduct.bind(this)}
          />
        </Modal>



          {openProgressModal && (
            <PaymentProgress stage={progress}  confetti={confetti} />
          )}

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
export default connect(mapStates, mapDispatch)(ProductViewPage);
