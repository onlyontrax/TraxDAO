/* eslint-disable dot-notation, react/sort-comp */
import { ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import TipPerformerForm from '@components/performer/tip-form';
import ChatBox from '@components/stream-chat/chat-box';
import { SubscriberProps } from '@components/streaming/agora/subscriber';
import { PurchaseStreamForm } from '@components/streaming/confirm-purchase';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import { getResponseError, videoDuration } from '@lib/index';
import {
  getStreamConversation,
  getStreamConversationSuccess,
  loadStreamMessages,
  resetStreamMessage
} from '@redux/stream-chat/actions';
import { updateBalance } from '@redux/user/actions';
import {
  Avatar, Button, Card, Col, Layout, Modal, Progress, Row, message, Spin
} from 'antd';
import nextCookie from 'next-cookies';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent, createRef, forwardRef } from 'react';
import { connect } from 'react-redux';
import {
  IPerformer, IStream, IUIConfig, IUser, StreamSettings
} from 'src/interfaces';
import {
  authService, messageService, performerService, streamService, tokenTransctionService
} from 'src/services';
import { cryptoService } from '@services/crypto.service';
import { IResponse } from 'src/services/api-request';
import { Event, SocketContext } from 'src/socket';

import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import { idlFactory as idlFactoryLedger } from '../../src/smart-contracts/declarations/ledger/ledger.did.js';
import { idlFactory as idlFactoryTipping } from '../../src/smart-contracts/declarations/tipping/tipping.did.js';
import type { _SERVICE as _SERVICE_LEDGER } from '../../src/smart-contracts/declarations/ledger/ledger2.did';
import type { _SERVICE as _SERVICE_TIPPING, TippingParticipants, Participants } from '../../src/smart-contracts/declarations/tipping/tipping2.did.js';
import { TransferArgs, Tokens, TimeStamp } from '../../src/smart-contracts/declarations/ledger/ledger2.did';
import styles from '../artist/live/index.module.scss';

const AgoraProvider = dynamic(() => import('src/agora/AgoraProvider'), {
  ssr: false
});
const Subscriber = dynamic(() => import('@components/streaming/agora/subscriber'), { ssr: false });
function SubscriberForward(props: SubscriberProps, ref) {
  return <Subscriber {...props} forwardedRef={ref} />;
}
const ForwardedSubscriber = forwardRef(SubscriberForward);

// eslint-disable-next-line no-shadow
enum STREAM_EVENT {
  JOIN_BROADCASTER = 'join-broadcaster',
  ARTIST_LEFT = 'artist-left',
  ROOM_INFORMATIOM_CHANGED = 'public-room-changed',
}

interface IProps {
  updateBalance: Function;
  resetStreamMessage: Function;
  getStreamConversationSuccess: Function;
  loadStreamMessages: Function;
  getStreamConversation: Function;
  activeConversation: any;
  ui: IUIConfig;
  user: IUser;
  performer: IPerformer;
  stream: IStream;
  settings: StreamSettings;
}

class LivePage extends PureComponent<IProps> {
  static layout = 'stream';

  static authenticate = true;

  private subscriberRef = createRef<{ join: any; unsubscribe: any }>();

  private streamDurationTimeOut: any;

  async getData() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    try {
      const resp: IResponse<IPerformer> = await performerService.findOne(id, {
        Authorization: authService.getToken() || ''
      });
      const stream = await streamService.joinPublicChat(resp.data._id, {
        Authorization: authService.getToken() || ''
      });

      return {
        performer: resp?.data,
        stream: stream?.data
      };
    } catch (e) {
      if (process.browser) {
        Router.back();
      }
      return {
        performer: null,
        stream: null
      };
    }
  }

  state = {
    total: 0,
    sessionDuration: 0,
    openPurchaseModal: false,
    submiting: false,
    openTipModal: false,
    initialized: false,
    openTipProgressModal: false,
    tipProgress: 0,
    performer: null,
    stream: null
  };

  async componentDidMount() {
    let { performer } = this.state;
    if (performer === null) {
      const data = await this.getData();
      performer = data?.performer;

      this.setState({ performer: data?.performer, stream: data?.stream }, () => this.updateComponentDidMount());
    } else {
      this.updateComponentDidMount();
    }
  }

  updateComponentDidMount() {
    const { performer } = this.state;
    if (performer === null) return;
    const { user } = this.props;
    if (!performer || user.isPerformer) {
      Router.back();
      return;
    }
    if (!performer.isSubscribed) {
      message.error('Please subscribe to join live chat!', 5);
      Router.push(
        {
          pathname: `/artist/profile?id=${performer?.username || performer?._id}`
        },
        `/artist/profile?id=${performer?.username || performer?._id}`
      );
      return;
    }

    this.joinConversation();

    Router.events.on('routeChangeStart', this.onbeforeunload.bind(this));
    window.addEventListener('beforeunload', this.onbeforeunload.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload.bind(this));
    Router.events.off('routeChangeStart', this.onbeforeunload.bind(this));
  }

  // eslint-disable-next-line react/sort-comp
  handleDuration() {
    const { sessionDuration } = this.state;
    this.streamDurationTimeOut && clearTimeout(this.streamDurationTimeOut);
    this.setState({ sessionDuration: sessionDuration + 1 });
    this.streamDurationTimeOut = setTimeout(this.handleDuration.bind(this), 1000);
  }

  onStreamStatusChange = (streaming: boolean) => {
    if (!streaming) {
      this.streamDurationTimeOut && clearTimeout(this.streamDurationTimeOut);
    } else {
      this.setState({ initialized: true });
      !this.streamDurationTimeOut && this.handleDuration();
    }
  };

  onbeforeunload = () => {
    this.streamDurationTimeOut && clearTimeout(this.streamDurationTimeOut);
    this.leavePublicRoom();
  };

  onChangeMembers({ total, conversationId }) {
    const { activeConversation } = this.props;
    if (activeConversation?.data?._id === conversationId) {
      this.setState({ total });
    }
  }

  async purchaseStream() {
    const { stream: activeStream } = this.state;
    const { user, updateBalance: handleUpdateBalance } = this.props;
    if (activeStream.isFree || !activeStream.sessionId) return;
    if (user.balance < activeStream.price) {
      message.error('You have an insufficient wallet balance. Please top up.', 10);
      Router.push('/wallet');
      return;
    }
    try {
      await this.setState({ submiting: true });
      await tokenTransctionService.purchaseStream(activeStream._id);
      handleUpdateBalance({ token: -activeStream.price });
      await this.joinConversation(true);
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  confirmJoinStream() {
    this.purchaseStream();
    this.setState({ openPurchaseModal: false });
  }

  retryJoin(n: number) {
    if (n === 0) return;

    if (!this.subscriberRef.current) {
      setTimeout(() => this.retryJoin(n - 1), 3000);
      return;
    }

    this.subscriberRef.current.join();
  }

  async subscribeStream({ performerId, conversationId }) {
    const { initialized } = this.state;
    const { activeConversation } = this.props;

    if (activeConversation?.data?._id !== conversationId) return;

    try {
      const resp = await streamService.joinPublicChat(performerId);
      const { streamingTime } = resp.data;
      this.setState({ sessionDuration: streamingTime || 0 });

      !initialized && this.retryJoin(3);
    } catch (err) {
      const error = await Promise.resolve(err);
      message.error(getResponseError(error));
    }
  }

  async joinConversation(purchased = false) {
    const {
      getStreamConversationSuccess: dispatchGetStreamConversationSuccess,
      getStreamConversation: dispatchGetStreamConversation
    } = this.props;
    const { performer, stream } = this.state;
    if (performer === null) return;

    const socket = this.context;

    try {
      if (!purchased) {
        if (!stream.isFree && !stream.hasPurchased) {
          this.setState({ openPurchaseModal: true });
          return;
        }
      }
      const resp = await messageService.findPublicConversationPerformer(performer._id);
      const conversation = resp.data;
      if (conversation && conversation._id) {
        dispatchGetStreamConversationSuccess({ data: conversation });
        dispatchGetStreamConversation({
          conversation
        });
        socket
          // @ts-ignore
          && socket.emit('public-stream/join', {
            conversationId: conversation._id
          });
      } else {
        message.info('No available stream. Try again later');
      }
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    }
  }

  leavePublicRoom() {
    const socket = this.context;
    const { activeConversation, resetStreamMessage: dispatchResetStreamMessage } = this.props;
    dispatchResetStreamMessage();
    if (socket && activeConversation?.data?._id) {
      // @ts-ignore
      socket.emit('public-stream/leave', {
        conversationId: activeConversation?.data?._id
      });
    }
  }

  artistLeftHandler({ conversationId, performerId }) {
    const { activeConversation } = this.props;
    const { performer } = this.state;
    if (performer === null) return;
    if (activeConversation?.data?._id !== conversationId || performer?._id !== performerId) {
      return;
    }

    this.setState({ sessionDuration: 0 });
    this.streamDurationTimeOut && clearTimeout(this.streamDurationTimeOut);
    message.info('Streaming session ended! Redirecting after 10s', 10);
    setTimeout(() => {
      Router.push(
        {
          pathname: `/artist/profile?id=${performer?.username || performer?._id}`
        },
        `/artist/profile?id=${performer?.username || performer?._id}`
      );
    }, 10 * 1000);
  }

  async sendTip(price: number, ticker: string, paymentOption: string ) {
    if(ticker === 'USD'){
      await this.sendTipFiat(price)
    }else{
      if(paymentOption === 'plug'){
        await this.sendTipPlug(price, ticker)
      }else{
        await this.sendTipCrypto(price, ticker);
      } 
    }
  }

  async sendTipFiat(token) {
    const {
      user, updateBalance: handleUpdateBalance, activeConversation
    } = this.props;
    const { performer, stream: activeStream } = this.state;
    if (performer === null) return;
    if (user.balance < token) {
      message.error('You have an insufficient wallet balance. Please top up.');
      Router.push('/wallet');
      return;
    }
    try {
      await this.setState({ submiting: true });
      await tokenTransctionService.sendTip(performer?._id, {
        price: token,
        conversationId: activeConversation?.data?._id,
        sessionId: activeStream?.sessionId,
        streamType: 'stream_public'
      });
      message.success('Thank you for the tip!');
      handleUpdateBalance({ token: -token });
    } catch (e) {
      const err = await e;
      message.error(err.message || 'Error occured, please try again later');
    } finally {
      this.setState({ submiting: false, openTipModal: false });
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
    this.setState({ openTipProgressModal: true, openTipModal: false, tipProgress: 20 });
    const tippingCanisterAI = AccountIdentifier.fromPrincipal({
      principal: tippingCanID
    });

    // @ts-ignore
    const { bytes } = tippingCanisterAI;
    const accountIdBlob = Object.keys(bytes).map((m) => bytes[m]);

    const fanAI = AccountIdentifier.fromPrincipal({
      principal: fanID
    });

    // @ts-ignore
    const fanBytes = fanAI.bytes;

    const txTime: TimeStamp = {
      timestamp_nanos: BigInt(Date.now() * 1000000)
    };
    const uuid = BigInt(Math.floor(Math.random() * 1000));


    const transferArgs: TransferArgs = {
      memo: uuid,
      amount: { e8s: amountToSend },
      fee: { e8s: BigInt(10000) },
      from_subaccount: [],
      to: accountIdBlob,
      created_at_time: [txTime]
    };
    const balArgs: AccountBalanceArgs = {
      account: fanBytes
    };

    const participants = [];

    const obj2: Participants = {
      participantID: Principal.fromText(performer?.wallet_icp),
      participantPercentage: 1
    };
    participants.push(obj2);

    const participantArgs: TippingParticipants = participants;

    const bal: Tokens = await ledgerActor.account_balance(balArgs);
    if (Number(bal.e8s) > Number(amountToSend) + 10000) {
      this.setState({ tipProgress: 30 });
      await ledgerActor
        .transfer(transferArgs)
        .then(async (res) => {
          this.setState({ tipProgress: 50 });
          await tippingActor
            .sendTip(res.Ok, participantArgs, BigInt(amountToSend), 'ICP')
            .then(() => {
              this.setState({ tipProgress: 100 });
              tokenTransctionService
                .sendCryptoTip(performer?._id, {
                  performerId: performer?._id,
                  price: Number(amountToSend),
                  tokenSymbol: ticker
                })
                .then(() => {
                });
              setTimeout(
                () => this.setState({
                  requesting: false,
                  submiting: false,
                  openTipProgressModal: false,
                  tipProgress: 0
                }),
                1000
              );
              message.success(`Payment successful! ${performer?.name} has recieved your tip`);
            })
            .catch((error) => {
              // send failed tx reciept to montior for us to manually send back the funds
              this.setState({
                requesting: false,
                submiting: false,
                openTipProgressModal: false,
                tipProgress: 0
              });
              message.error(error.message || 'error occured, please try again later');
              return error;
            });
          // }
        })
        .catch((error) => {
          this.setState({
            requesting: false,
            submiting: false,
            openTipProgressModal: false,
            tipProgress: 0
          });
          message.error(error.message || 'error occured, please try again later');
          return error;
        });
    } else {
      this.setState({
        requesting: false,
        submiting: false,
        openTipProgressModal: false,
        tipProgress: 0
      });
      message.error('Insufficient balance, please top up your wallet and try again.');
    }
  }




  async sendTipPlug(amount:number, ticker:string) {
    const { performer, settings } = this.props;
    let transfer;
    let amountToSend = BigInt(Math.trunc(Number(amount) * 100000000));
    this.setState({
      requesting: false,
      submiting: false,
      openTipProgressModal: false,
      tipProgress: 0
    });

    const tippingCanID = settings.icTipping;
    const ledgerCanID = settings.icLedger;
    const ckBTCLedgerCanID = settings.icCKBTCMinter;

    const whitelist = [
      tippingCanID,
    ];

    if(typeof window !== 'undefined' && 'ic' in window){
      // @ts-ignore
      const connected = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug?.requestConnect({
        whitelist,
        host: settings.icHost
      }) : false;

      !connected && message.info("Failed to connected to canister. Please try again later or contact us. ")
        
      this.setState({ openTipProgressModal: true, openTipModal: false, tipProgress: 20 });

      // @ts-ignore
      if (!window?.ic?.plug?.agent && connected  ) {
        // @ts-ignore
        await window.ic.plug.createAgent({ 
          whitelist, 
          host: settings.icHost
        });
      }
      
      let tippingActor = Actor.createActor<_SERVICE_TIPPING>(idlFactoryTipping, {
        agent: (window as any).ic.plug.agent,
        canisterId: tippingCanID
      });
      const participants = [];
      
      if(connected){
        //@ts-ignore
        const requestBalanceResponse = await window.ic?.plug?.requestBalance();
        const icp_balance = requestBalanceResponse[0]?.amount;
        const ckBTC_balance = requestBalanceResponse[1]?.amount;

        if(ticker === 'ckBTC'){
          if(ckBTC_balance >= amount){
            this.setState({ tipProgress: 30 });
            const params = {
              to: tippingCanID,
              strAmount: amount,
              token: 'mxzaz-hqaaa-aaaar-qaada-cai'
            };
            //@ts-ignore
            transfer = await window.ic.plug.requestTransferToken(params);
            
          } else {
            this.setState({
              requesting: false,
              submiting: false,
              openTipProgressModal: false,
              tipProgress: 0
            })
            message.error('Insufficient balance, please top up your wallet and try again.');
          }
        }
        
        if (ticker === 'ICP') {
          this.setState({ tipProgress: 30 });
          if(icp_balance >= amount){
            const requestTransferArg = {
              to: tippingCanID,
              amount: Math.trunc(Number(amount) * 100000000)
            }
            //@ts-ignore
            transfer = await window.ic?.plug?.requestTransfer(requestTransferArg);
            
          } else {
            this.setState({
              requesting: false,
              submiting: false,
              openTipProgressModal: false,
              tipProgress: 0
            })
            message.error('Insufficient balance, please top up your wallet and try again.');
          }
        }

        this.setState({ tipProgress: 50 });

        if(transfer.height){
          const obj2: Participants = {
            participantID: Principal.fromText(performer?.wallet_icp),
            participantPercentage: 1
          };
          participants.push(obj2);
          const participantArgs: TippingParticipants = participants;
        
          await tippingActor.sendTip(transfer.height, participantArgs, amountToSend, ticker).then(() => {
            this.setState({ tipProgress: 100 });
            tokenTransctionService.sendCryptoTip(performer?._id, {
                performerId: performer?._id,
                price: Number(amountToSend),
                tokenSymbol: ticker
              }).then(() => {});
            setTimeout(
              () => this.setState({
                requesting: false,
                submiting: false,
                openTipProgressModal: false,
                tipProgress: 0
              }),1000);
            message.success(`Payment successful! ${performer?.name} has recieved your tip`);
            this.setState({ requesting: false, submiting: false });
          }).catch((error) => {
            this.setState({
              requesting: false,
              submiting: false,
              openTipProgressModal: false,
              tipProgress: 0
            });
            message.error(error.message || 'error occured, please try again later');
            return error;
          });
        }else{
          message.error('Transaction failed. Please try again later.');
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
        tipProgress: 0
      });
      message.info('This artist is not a web3 user and therefore cannot recieve tips in crypto at this time.');
      return;
    }

    let amountToSend: any = 0;
    if (ticker === 'ICP') {
      amountToSend = BigInt(amount * 100000000);
    }

    try {
      this.setState({ requesting: true, submitting: true });

      let identity;
      let ledgerActor;
      const authClient = await AuthClient.create();
      let sender;
      let tippingActor;
      let agent;

      const tippingCanID = settings.icTipping;
      const ledgerCanID = settings.icLedger;

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

            ledgerActor = Actor.createActor<_SERVICE_LEDGER>(idlFactoryLedger, {
              agent,
              canisterId: ledgerCanID
            });

            tippingActor = Actor.createActor<_SERVICE_TIPPING>(idlFactoryTipping, {
              agent,
              canisterId: tippingCanID
            });

            await this.handleSendTipCrypto(
              Principal.fromText(tippingCanID),
              sender,
              amountToSend,
              ledgerActor,
              tippingActor,
              ticker
            );
          }
        });
      } else {
        const host = settings.icHost;

        await authClient.login({
          onSuccess: async () => {
            identity = await authClient.getIdentity();

            agent = new HttpAgent({ identity, host });
            sender = await agent.getPrincipal();

            ledgerActor = Actor.createActor<_SERVICE_LEDGER>(idlFactoryLedger, {
              agent,
              canisterId: ledgerCanID
            });

            tippingActor = Actor.createActor<_SERVICE_TIPPING>(idlFactoryTipping, {
              agent,
              canisterId: tippingCanID
            });

            await this.handleSendTipCrypto(
              Principal.fromText(tippingCanID),
              sender,
              amountToSend,
              ledgerActor,
              tippingActor,
              ticker
            );
          }
        });
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    }
  }

  render() {
    const {
      user, ui
    } = this.props;
    const {
      total, openPurchaseModal, sessionDuration, submiting, openTipModal, tipProgress, openTipProgressModal, performer, stream: activeStream
    } = this.state;
    if (performer === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    const agoraProps: any = { config: { mode: 'live', codec: 'h264', role: 'audience' } };
    return (
      <Layout className={styles.pagesArtistLiveModule}>
        <Head>
          <title>{`${ui?.siteName || ''} | ${performer?.name || performer?.username} Broadcast`}</title>
        </Head>
        <Event event={STREAM_EVENT.JOIN_BROADCASTER} handler={this.subscribeStream.bind(this)} />
        <Event event={STREAM_EVENT.ARTIST_LEFT} handler={this.artistLeftHandler.bind(this)} />
        <Event event={STREAM_EVENT.ROOM_INFORMATIOM_CHANGED} handler={this.onChangeMembers.bind(this)} />

        <AgoraProvider {...agoraProps}>
          <div>
            <Row className="main-container">
              <Col md={16} xs={24}>
                <div className="stream-video">
                  <ForwardedSubscriber
                    localUId={user?._id}
                    remoteUId={performer?._id}
                    ref={this.subscriberRef}
                    sessionId={activeStream?.sessionId}
                    onStreamStatusChange={(val) => this.onStreamStatusChange(val)}
                  />
                </div>
                <div className="stream-duration">
                  <span style={{ marginRight: 5 }}>
                    <ClockCircleOutlined />
                    {' '}
                    {videoDuration(sessionDuration)}
                  </span>
                  <span>
                    $
                    {(user?.balance || 0).toFixed(2)}
                  </span>
                  <span>
                    <EyeOutlined />
                    {' '}
                    {total}
                  </span>
                </div>
                <Row>
                  <Col lg={16} xs={24}>
                    <Card bordered={false} bodyStyle={{ padding: 0 }}>
                      <Card.Meta
                        title={activeStream?.title || `${performer?.name || performer?.username} Live`}
                        description={activeStream?.description || 'No description'}
                      />
                    </Card>
                  </Col>
                  <Col lg={8} xs={24}>
                    <div>
                      <Button
                        block
                        className="primary"
                        onClick={() => Router.push(
                          {
                            pathname: `/artist/profile?id=${performer?.username || performer?._id}`
                          },
                          `/artist/profile?id=${performer?.username || performer?._id}`
                        )}
                      >
                        Leave Chat
                      </Button>
                      <Button
                        block
                        className="secondary"
                        disabled={submiting}
                        onClick={() => this.setState({ openTipModal: true })}
                      >
                        Send Tip
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col md={8} xs={24}>
                <ChatBox {...this.props} />
              </Col>
            </Row>

            <Modal
              key="tip_progress"
              className="tip-progress"
              open={openTipProgressModal}
              centered
              onOk={() => this.setState({ openTipProgressModal: false })}
              footer={null}
              width={600}
              title={null}
              onCancel={() => this.setState({ openTipProgressModal: false })}
            >
              <div className="confirm-purchase-form">
                <div className="left-col">
                  <Avatar src={performer?.avatar || '/static/no-avatar.png'} />
                  <div className="p-name">
                    Tipping
                    {' '}
                    {performer?.name || 'N/A'}
                    {' '}
                    {performer?.verifiedAccount && (
                      <BadgeCheckIcon style={{ height: '1.5rem' }} className="primary-color" />
                    )}
                  </div>
                  <p className="p-subtitle">Transaction progress</p>
                </div>
                <Progress percent={Math.round(tipProgress)} />
              </div>
            </Modal>

            <Modal
              key="tip"
              centered
              title={null}
              open={openTipModal}
              onOk={() => this.setState({ openTipModal: false })}
              footer={null}
              onCancel={() => this.setState({ openTipModal: false })}
              width={420}
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
              centered
              key="confirm_join_stream"
              title={`Join ${performer?.name || performer?.username || 'N/A'} live chat`}
              open={openPurchaseModal}
              footer={null}
              destroyOnClose
              closable={false}
              maskClosable={false}
              onCancel={() => Router.back()}
            >
              <PurchaseStreamForm
                submiting={submiting}
                performer={performer}
                activeStream={activeStream}
                onFinish={this.confirmJoinStream.bind(this)}
              />
            </Modal>
          </div>
        </AgoraProvider>
      </Layout>
    );
  }
}

LivePage.contextType = SocketContext;

const mapStateToProps = (state) => ({
  ui: { ...state.ui },
  ...state.streaming,
  user: { ...state.user.current },
  activeConversation: { ...state.streamMessage.activeConversation },
  settings: { ...state.settings }
});
const mapDispatch = {
  updateBalance,
  loadStreamMessages,
  getStreamConversationSuccess,
  resetStreamMessage,
  getStreamConversation
};
export default connect(mapStateToProps, mapDispatch)(LivePage);
