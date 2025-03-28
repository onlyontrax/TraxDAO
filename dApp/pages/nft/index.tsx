import { HeartOutlined } from '@ant-design/icons';
import { updateBalance } from '@redux/user/actions';
import {
  reactionService, nftService
} from '@services/index';
import { cryptoService } from '@services/crypto.service';
import {
  Avatar, Button, Image, Layout, Modal, Spin, Tooltip, message, Progress
} from 'antd';
import Error from 'next/error';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IError, INft, IUIConfig, IUser, ISettings
} from 'src/interfaces';

import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory as idlFactoryLedger } from '../../src/smart-contracts/declarations/ledger/ledger.did.js';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import type { _SERVICE as _SERVICE_LEDGER } from '../../src/smart-contracts/declarations/ledger/ledger2.did';
import { TransferArgs, Tokens, TimeStamp } from '../../src/smart-contracts/declarations/ledger/ledger2.did';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import { Principal } from '@dfinity/principal';

interface IProps {
  user: IUser;
  ui: IUIConfig;
  error: IError;
  updateBalance: Function;
  nft: INft;
  image: string;
  settings: ISettings;
}

interface IStates {
  isBookmarked: boolean;
  loading: boolean;
  submiting: boolean;
  openPurchaseModal: boolean;
  openProgressModal: boolean;
  progress: number;
  nft: INft;
  image: string;
}

class NftViewPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static noredirect = true;

  async getData() {
    const { settings } = this.props;
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    try {
      const nft: any = await nftService.getNft(id, settings);
      return {
        nft,
        image: nft?.logo ? URL.createObjectURL(new Blob([nft.logo], { type: 'image/png' })) : ''
      };
    } catch (e) {
      return {
        nft: null,
        image: ''
      };
    }
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: false,
      submiting: false,
      isBookmarked: false,
      openPurchaseModal: false,
      openProgressModal: false,
      progress: 0,
      nft: null,
      image: ''
    };
  }

  async componentDidMount() {
    const { nft } = this.state;
    if (nft === null) {
      const data = await this.getData();

      this.setState({ nft: data.nft, image: data.image }, () => this.updateNftShallowRoute());
    } else {
      this.updateNftShallowRoute();
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    const { nft } = this.state;
    if (nft === null) return;
    if (prevState?.nft?._id && prevState?.nft?._id !== nft?.id) {
      this.updateNftShallowRoute();
    }
  }

  async handleBookmark() {
    const { isBookmarked } = this.state;
    const { nft } = this.state;
    if (nft === null) return;
    try {
      this.setState({ submiting: true });
      if (!isBookmarked) {
        await reactionService.create({
          objectId: nft.id,
          action: 'book_mark',
          objectType: 'nft'
        });
        this.setState({ isBookmarked: true });
      } else {
        await reactionService.delete({
          objectId: nft.id,
          action: 'book_mark',
          objectType: 'nft'
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

  async updateNftShallowRoute() {
    const { nft } = this.state;
    if (nft === null) return;
    try {
      this.setState({
        isBookmarked: false,
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
    const { nft } = this.state;
    if (nft === null) return;
    if (user?.isPerformer) return;
    const fee = payload.shippingFee ? payload.shippingFee : 0;
    if (user?.account?.balance < Number(nft.price) + fee) {
      message.error('You have an insufficient token balance. Please top up.');
      return;
    }
    try {
      this.setState({ submiting: true });

      if(payload.currencyOption === "ICP"){
        await this.purchaseProductCrypto(payload.currencyOption, payload.amountToSendICP)
      }else if(payload.currencyOption === "ckBTC"){
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

    const { user, settings } = this.props;
    const { nft } = this.state;
    if (nft === null) return;
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

    const ledgerCanID = settings.icLedger;
    const ckBTCLedgerCanID = Principal.fromText(settings.icCKBTCMinter);

    const recipientAccountIdBlob = this.getRecipientAccountIdentity(nft?.owner)
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
          owner: nft.owner,
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

  async handlePurchase() {
    this.setState({ submiting: false, openPurchaseModal: false });
  }

  render() {
    const {
      ui, error, user
    } = this.props;
    const { nft, image } = this.state;
    if (nft === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    if (error) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || 'NFT was not found'} />;
    }
    const {
      isBookmarked, loading, openPurchaseModal, submiting, progress, openProgressModal
    } = this.state;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | ${nft?.name || 'NFT'}`}</title>
          <meta name="keywords" content={nft?.description} />
          <meta name="description" content={nft?.description} />
          {/* OG tags */}
          <meta property="og:title" content={`${ui?.siteName} | ${nft?.name || 'Product'}`} key="title" />
          <meta property="og:image" content={'/static/empty_product.svg'} />
          <meta property="og:description" content={nft?.description} />
          {/* Twitter tags */}
          <meta name="twitter:title" content={`${ui.siteName} | ${nft.name || 'Product'}`} />
          <meta name="twitter:image" content={'/static/empty_product.svg'} />
          <meta name="twitter:description" content={nft.description} />
        </Head>
        <div className="main-container">
          <div className="prod-card">
            {nft && !loading ? (
              <div className="prod-img">
                <Image alt="product-img" src={image || '/static/empty_product.svg'} />
              </div>
            ) : (
              <div className="text-center">
                <Spin />
              </div>
            )}
            {nft && (
              <div className="prod-info">
                <p className="prod-name">{nft?.name || 'N/A'}</p>

                <div className="add-cart">
                  <p className="prod-price">
                    {Number(nft.price)} ICP
                  </p>
                  <p>
                    <span className="prod-digital">{ nft?.type }</span>
                  </p>
                  <p className="prod-desc">{nft?.description || 'No description yet'}</p>

                  <div className="flex-wrap-btn">
                    <Button
                      className="buy-button"
                      disabled={loading}
                      onClick={() => {
                        this.setState({ openPurchaseModal: true });
                      }}
                    >
                      Buy for &nbsp;
                      {Number(nft.price)} ICP
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
                </div>
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
          <p style={{color: 'white'}}>Would you like to pay {Number(nft.price)} ICP to purchase {nft.name}?</p>
          <Button className='primary tip-button' type='primary' htmlType='button' onClick={this.handlePurchase.bind(this)}>Purchase</Button>
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
        </Modal>
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
export default connect(mapStates, mapDispatch)(NftViewPage);
