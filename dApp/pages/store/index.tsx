import { HeartOutlined } from '@ant-design/icons';
import { PurchaseProductForm } from '@components/product/confirm-purchase';
import { PerformerListProduct } from '@components/product/performer-list-product';
import { updateBalance } from '@redux/user/actions';
import {
  authService, productService, reactionService, tokenTransctionService, performerService, utilsService
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
  ICountry, IError, IPerformer, IProduct, IUIConfig, IUser
} from 'src/interfaces';
import styles from './store.module.scss';

import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory as idlFactoryLedger } from '../../src/smart-contracts/declarations/ledger';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import type { _SERVICE as _SERVICE_LEDGER } from '../../src/smart-contracts/declarations/ledger/ledger.did';
import { TransferArgs, Tokens, TimeStamp } from '../../src/smart-contracts/declarations/ledger/ledger.did';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import { Principal } from '@dfinity/principal';
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons'
interface IProps {
  user: IUser;
  ui: IUIConfig;
  error: IError;
  updateBalance: Function;
  product: IProduct;
  countries: ICountry[];
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
      countries: null
    };
  }

  async componentDidMount() {
    const { product } = this.state;
    if (product === null) {
      const data = await this.getData();
      this.setState({ product: data.product, countries: data.countries }, () => this.updateProductShallowRoute());
    } else {
      this.updateProductShallowRoute();
    }
  }

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
    if (user.balance < product.price + fee) {
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
        Router.push('/user/my-payments');
      }else if(payload.currencyOption === "ICP"){
        await this.purchaseProductCrypto(payload.currencyOption, payload.amountToSendICP)
      }else{
        await this.purchaseProductCrypto(payload.currencyOption, payload.amountToSendCKBTC)
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

  async purchaseProductCrypto(ticker: string, amount: number){
    this.setState({
        openProgressModal: true,
        progress: 10
      });

    const { user } = this.props;
    const { product } = this.state;
    if (product === null) return;
    let amountToSend = BigInt(Math.trunc((amount * 100000000) / 0.9));
    let amountToSendPlatform = BigInt(Math.trunc((amount * 100000000) / 0.1));

    let identity;
    let ledgerActor;
    const authClient = await AuthClient.create();
    let sender;
    let agent;
    let ledgerCanID;
    let ckBTCLedgerCanID;
    let transferArgs: TransferArgs;
    let transferParams: TransferParams;
    let transferArgsPlatform: TransferArgs;
    let transferParamsPlatform: TransferParams;
    const uuid = BigInt(Math.floor(Math.random() * 1000));

    const recipientAccountIdBlob = this.getRecipientAccountIdentity(Principal.fromText(product?.performer?.wallet_icp))
    const platformAccountIdBlob = this.getPlatformAccountIdentity(Principal.fromText(process.env.NEXT_PUBLIC_TRAX_ACCOUNT as string))
    
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
          owner: Principal.fromText(product?.performer?.wallet_icp),
          subaccount: [],
        },
        created_at_time: BigInt(Date.now() * 1000000)
      };
      transferParamsPlatform = {
        amount: amountToSendPlatform,
        fee: BigInt(10),
        from_subaccount: null,
        to: {
          owner: Principal.fromText(process.env.NEXT_PUBLIC_TRAX_ACCOUNT as string),
          subaccount: [],
        },
        created_at_time: BigInt(Date.now() * 1000000)
      };
    }else{
      message.error('Invalid ticker, please select a different token!');
      return;
    }

    if ((process.env.NEXT_PUBLIC_DFX_NETWORK as string) !== 'ic') {
      await authClient.login({
        identityProvider: process.env.NEXT_PUBLIC_IDENTITY_PROVIDER as string,
        onSuccess: async () => {

          identity = authClient.getIdentity();
          ledgerCanID = process.env.NEXT_PUBLIC_LEDGER_CANISTER_ID_LOCAL as string;
          ckBTCLedgerCanID = process.env.NEXT_PUBLIC_CKBTC_MINTER_CANISTER_ID_LOCAL as string;
          const host = process.env.NEXT_PUBLIC_HOST_LOCAL as string;
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
      ledgerCanID = process.env.NEXT_PUBLIC_LEDGER_CANISTER_ID as string;
      ckBTCLedgerCanID = process.env.NEXT_PUBLIC_CKBTC_MINTER_CANISTER_ID as string;
      const host = process.env.NEXT_PUBLIC_HOST as string;

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

  render() {
    const {
      ui, error, user
    } = this.props;
    const {
      selectedOption, product, countries, relatedProducts, isBookmarked, loading, openPurchaseModal, submiting, progress, openProgressModal
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
          <div className="prod-card">
            {product && !loading ? (
              <div className="prod-img" style={{backgroundImage: product?.image ? `url('${product?.image}')`: '/static/empty_product.svg'}}>
                
                <div className='prod-img-blur'>

                </div>
                <Image alt="product-img" src={product?.image || '/static/empty_product.svg'} />
                
              </div>
            ) : (
              <div className="text-center">
                <Spin />
              </div>
            )}
            {product && (
              <div className="prod-info">
                <p className="prod-name">{product.name || 'N/A'}</p>
                <div className="add-cart">
                  <p className="prod-price">
                    $
                    {product.price.toFixed(2)}
                  </p>
                  <p>
                  {product.stock && product.type === 'physical' ? (
                    <div className='prod-stock-wrapper'>
                      <span className="prod-stock">
                        <FontAwesomeIcon className='faCheck-prod' icon={faCheck} />
                        In stock and ready to ship
                      </span>
                    </div>
                    
                  ) : null}
                  {product.stock && product.type === 'digital' ? (
                    <div className='prod-stock-wrapper'>
                      <span className="prod-stock">
                        <FontAwesomeIcon className='faCheck-prod' icon={faCheck} />
                        In stock and ready to buy
                      </span>
                    </div>
                    
                  ) : null}
                  {product.stock === 0 && (
                  <span style={{color: 'red'}}>Sold out!</span>
                )}
                  {!product.stock && product.type === 'physical' && <span className="prod-stock">Out of stock!</span>}
                  {product.type === 'digital' && <div className='prod-digital-wrapper'><span className="prod-digital">Digital</span></div>}
                </p>

                  <p className="prod-desc">{product?.description || 'No description yet'}</p>
                    <div style={{display: 'flex', flexDirection: 'row', gap: 4}}>
                    <Button
                      className="buy-button"
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
          width={660}
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
        <Modal
          key="ppv_progress"
          className="tip-progress"
          open={openProgressModal}
          centered
          onOk={() => this.setState({ openProgressModal: false })}
          footer={null}
          width={600}
          title={null}
          onCancel={() => this.setState({ openProgressModal: false })}
        >
          <div className="confirm-purchase-form">
            <div className="left-col">
              <Avatar src={product?.performer?.avatar || '/static/no-avatar.png'} />
              <div className="p-name">
                Purchase product from
                {' '}
                {product?.performer?.name || 'N/A'}
                {' '}
                {product?.performer?.verifiedAccount && <BadgeCheckIcon style={{ height: '1.5rem' }} className="primary-color" />}
              </div>
              <p className="p-subtitle">Transaction progress</p>

            </div>
            <Progress percent={Math.round(progress)} />
          </div>

        </Modal>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  user: state.user.current,
  ui: { ...state.ui }
});

const mapDispatch = { updateBalance };
export default connect(mapStates, mapDispatch)(ProductViewPage);
