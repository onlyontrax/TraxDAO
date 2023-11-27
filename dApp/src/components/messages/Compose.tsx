/* eslint-disable react/sort-comp */
import { SendOutlined, SmileOutlined } from '@ant-design/icons';
import { ImageMessageUpload } from '@components/messages/uploadPhoto';
import { TipPerformerForm } from '@components/performer/tip-form';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import { sendMessage, sentFileSuccess } from '@redux/message/actions';
import { updateBalance } from '@redux/user/actions';
import { authService, messageService, tokenTransctionService } from '@services/index';
import {
  Avatar, Modal, Popover, Progress, message
} from 'antd';
import Router from 'next/router';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces';
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import type { _SERVICE as _SERVICE_LEDGER } from '../../smart-contracts/declarations/ledger/ledger.did';
import type { _SERVICE as _SERVICE_TIPPING, TippingParticipants, Participants } from '../../smart-contracts/declarations/tipping/tipping.did';
import { TransferArgs, Tokens, TimeStamp } from '../../smart-contracts/declarations/ledger/ledger.did';
import { idlFactory as idlFactoryLedger } from '../../smart-contracts/declarations/ledger';
import { idlFactory as idlFactoryTipping } from '../../smart-contracts/declarations/tipping';
import styles from './Compose.module.scss';
import { Emotions } from './emotions';

interface IProps {
  ui: IUIConfig;
  updateBalance: Function;
  sendMessage: Function;
  sentFileSuccess: Function;
  sendMessageStatus: any;
  conversation: any;
  currentUser: any;
  disabled?: boolean;
}

class Compose extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  _input: any;

  state = {
    text: '',
    openTipModal: false,
    submiting: false,
    openTipProgressModal: false,
    tipProgress: 0
  };

  componentDidMount() {
    if (!this._input) this._input = createRef();
  }

  componentDidUpdate(previousProps) {
    const { sendMessageStatus } = this.props;
    if (previousProps?.sendMessageStatus?.success !== sendMessageStatus?.success && sendMessageStatus?.success) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ text: '' });
      this._input && this._input.focus();
    }
  }

  onKeyDown = (evt) => {
    if (evt.keyCode === 13) {
      this.send();
    }
  };

  onChange = (evt) => {
    this.setState({ text: evt.target.value });
  };

  onEmojiClick = (emoji) => {
    const { text } = this.state;
    const { disabled } = this.props;
    if (disabled) return;
    this.setState({ text: `${text} ${emoji} ` });
  };

  onPhotoUploaded = (data: any) => {
    const { sentFileSuccess: handleSendFile } = this.props;
    if (!data || !data.response) {
      return;
    }
    const imageUrl = data.response.data && data.response.data.imageUrl;
    handleSendFile({ ...data.response.data, ...{ imageUrl } });
  };

  send() {
    const { text } = this.state;
    const { disabled, sendMessage: handleSendMessage } = this.props;
    if (!text || disabled) return;
    const { conversation } = this.props;
    handleSendMessage({
      conversationId: conversation._id,
      data: { text }
    });
  }

  async sendTip(price: number, ticker: string, paymentOption: string ) {
    if(ticker === 'USD'){
      await this.sendTipFiat(price)
    }else{
      if(paymentOption === 'plug'){
        console.log('plug payment option')
        await this.sendTipPlug(price, ticker)
      }else{
        await this.sendTipCrypto(price, ticker);
      } 
    }
  }

  async sendTipFiat(price) {
    const { currentUser, conversation, updateBalance: handleUpdateBalance } = this.props;
    if (currentUser.balance < price) {
      message.error('Your wallet balance is not enough');
      Router.push('/wallet');
      return;
    }
    try {
      await this.setState({ submiting: true });
      await tokenTransctionService.sendTip(conversation?.recipientInfo?._id, {
        conversationId: conversation?._id,
        price
      });
      message.success('Thank you for the tip');
      handleUpdateBalance({ token: -price });
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
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
    const { conversation } = this.props;
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
      participantID: Principal.fromText(conversation?.recipientInfo?.wallet_icp),
      participantPercentage: 1
    };
    participants.push(obj2);

    const participantArgs: TippingParticipants = participants;

    const bal: Tokens = await ledgerActor.account_balance(balArgs);
    if (Number(bal.e8s) > (Number(amountToSend) + 10000)) {
      this.setState({ tipProgress: 30 });
      await ledgerActor.transfer(transferArgs).then(async (res) => {
        this.setState({ tipProgress: 50 });
        await tippingActor.sendTip(res.Ok, Principal.fromText(conversation?.recipientInfo?.wallet_icp), BigInt(amountToSend), 'ICP').then(() => {
          this.setState({ tipProgress: 100 });
          tokenTransctionService.sendCryptoTip(conversation?.recipientInfo?.wallet_icp, { performerId: conversation?.recipientInfo?.wallet_icp, price: Number(amountToSend), tokenSymbol: ticker }).then(() => {
          });
        });
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




  async sendTipPlug(amount:number, ticker:string){
    const { conversation } = this.props;
    let tippingCanID, ledgerCanID, ckBTCLedgerCanID, transfer;
    let amountToSend = BigInt(Math.trunc(Number(amount) * 100000000));
    this.setState({
      requesting: false,
      submiting: false,
      openTipProgressModal: false,
      tipProgress: 0
    });

    if((process.env.NEXT_PUBLIC_DFX_NETWORK as string) !== 'ic'){
      tippingCanID = process.env.NEXT_PUBLIC_TIPPING_CANISTER_ID_LOCAL as string;
      ledgerCanID = process.env.NEXT_PUBLIC_LEDGER_CANISTER_ID_LOCAL as string;
      ckBTCLedgerCanID = process.env.NEXT_PUBLIC_CKBTC_MINTER_CANISTER_ID_LOCAL as string;
    }else{
      tippingCanID = process.env.NEXT_PUBLIC_TIPPING_CANISTER_ID as string;
      ledgerCanID = process.env.NEXT_PUBLIC_LEDGER_CANISTER_ID as string;
      ckBTCLedgerCanID = process.env.NEXT_PUBLIC_CKBTC_MINTER_CANISTER_ID as string;
    }

    // const identityCanisterId = (process.env.NEXT_PUBLIC_DFX_NETWORK as string) === 'ic' ? (process.env.NEXT_PUBLIC_IDENTITY_CANISTER as string) : (process.env.NEXT_PUBLIC_IDENTITY_CANISTER_LOCAL as string);
    const whitelist = [
      // (process.env.NEXT_PUBLIC_DFX_NETWORK as string) !== 'ic' && ledgerCanID, 
      // (process.env.NEXT_PUBLIC_DFX_NETWORK as string) !== 'ic' &&  ckBTCLedgerCanID, 
      tippingCanID, 
    ];
    console.log('whitelist: ', whitelist)

    if(typeof window !== 'undefined' && 'ic' in window){
      // @ts-ignore
      const connected = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug?.requestConnect({
        whitelist,
        host: (process.env.NEXT_PUBLIC_DFX_NETWORK as string !== 'ic') 
        ? (process.env.NEXT_PUBLIC_HOST_LOCAL as string) 
        : (process.env.NEXT_PUBLIC_HOST as string)
      }) : false;

      !connected && message.info("Failed to connected to canister. Please try again later or contact us. ")
        
      this.setState({ openTipProgressModal: true, openTipModal: false, tipProgress: 20 });

      // @ts-ignore
      if (!window?.ic?.plug?.agent && connected  ) {
        console.log('creating agent')
        // @ts-ignore
        await window.ic.plug.createAgent({ 
          whitelist, 
          host: (process.env.NEXT_PUBLIC_DFX_NETWORK as string !== 'ic') ? (process.env.NEXT_PUBLIC_HOST_LOCAL as string) : (process.env.NEXT_PUBLIC_HOST as string) 
        });
      }
      
      let tippingActor = Actor.createActor<_SERVICE_TIPPING>(idlFactoryTipping, {
        agent: (window as any).ic.plug.agent,
        canisterId: tippingCanID
      });

      // @ts-ignore
      console.log(window.ic.plug.principalId); console.log(window.ic.plug.accountId); console.log("plug agent: ", window?.ic?.plug?.agent)
      const participants = [];
      
      if(connected){
        //@ts-ignore
        const requestBalanceResponse = await window.ic?.plug?.requestBalance();
        const icp_balance = requestBalanceResponse[0]?.amount;
        const ckBTC_balance = requestBalanceResponse[1]?.amount;

        console.log("icp balance: ", icp_balance);
        console.log("ckbtc balance: ", ckBTC_balance);

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
            participantID: Principal.fromText(conversation?.recipientInfo?.wallet_icp),
            participantPercentage: 1
          };
          participants.push(obj2);
          const participantArgs: TippingParticipants = participants;
        
          await tippingActor.sendTip(transfer.height, participantArgs, amountToSend, ticker).then(() => {
            this.setState({ tipProgress: 100 });
            tokenTransctionService.sendCryptoTip(conversation?.recipientInfo?._id, {
                performerId: conversation?.recipientInfo?._id,
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
            message.success(`Payment successful! ${conversation?.recipientInfo?.name} has recieved your tip`);
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
    const { conversation } = this.props;

    if (!conversation?.recipientInfo?.wallet_icp) {
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
      let tippingCanID;
      let ledgerCanID;
      if ((process.env.NEXT_PUBLIC_DFX_NETWORK as string) !== 'ic') {
        await authClient.login({
          identityProvider: process.env.NEXT_PUBLIC_IDENTITY_PROVIDER as string,
          onSuccess: async () => {
            identity = authClient.getIdentity();

            tippingCanID = process.env.NEXT_PUBLIC_TIPPING_CANISTER_ID_LOCAL as string;
            ledgerCanID = process.env.NEXT_PUBLIC_LEDGER_CANISTER_ID_LOCAL as string;

            const host = process.env.NEXT_PUBLIC_HOST_LOCAL as string;

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
        tippingCanID = process.env.NEXT_PUBLIC_TIPPING_CANISTER_ID as string;
        ledgerCanID = process.env.NEXT_PUBLIC_LEDGER_CANISTER_ID as string;

        const host = process.env.NEXT_PUBLIC_HOST as string;

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
      disabled, sendMessageStatus: status, conversation, currentUser, ui
    } = this.props;
    const {
      text, openTipModal, submiting, tipProgress, openTipProgressModal
    } = this.state;
    const uploadHeaders = {
      authorization: authService.getToken() || ''
    };
    if (!this._input) this._input = createRef();
    return (
      <div className={styles.componentsMessagesComposeModule}>
        <div className="compose">
          <textarea
            value={text}
            className="compose-input"
            placeholder="Write your message..."
            onKeyDown={this.onKeyDown}
            onChange={this.onChange}
            disabled={disabled || status.sending || !conversation._id}
            ref={(c) => {
              this._input = c;
            }}
          />
          <Popover
            className="emotion-popover"
            content={<Emotions onEmojiClick={this.onEmojiClick.bind(this)} siteName={ui?.siteName} />}
            trigger="click"
          >
            <div className="grp-icons">
              <SmileOutlined />
            </div>
          </Popover>
          <div className="grp-icons">
            <div className="grp-file-icon">
              <ImageMessageUpload
                disabled={disabled}
                headers={uploadHeaders}
                uploadUrl={messageService.getMessageUploadUrl()}
                onUploaded={this.onPhotoUploaded}
                options={{ fieldName: 'message-photo' }}
                messageData={{
                  text: 'sent a photo',
                  conversationId: conversation && conversation._id,
                  recipientId: conversation && conversation.recipientInfo && conversation.recipientInfo._id,
                  recipientType: currentUser && currentUser.isPerformer ? 'user' : 'performer'
                }}
              />
            </div>
          </div>
          <div className="grp-icons" style={{ paddingRight: 0 }}>
            <div aria-hidden className="grp-send" onClick={this.send.bind(this)}>
              <SendOutlined />
            </div>
          </div>

          <Modal
            key="tip_performer"
            className="subscription-modal"
            title={null}
            width={420}
            open={openTipModal}
            onOk={() => this.setState({ openTipModal: false })}
            footer={null}
            onCancel={() => this.setState({ openTipModal: false })}
          >
            <TipPerformerForm performer={conversation.recipientInfo} submiting={submiting} onFinish={this.sendTip.bind(this)} isProfile />
          </Modal>
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
                <Avatar src={conversation?.recipientInfo?.avatar || '/static/no-avatar.png'} />
                <div className="p-name">
                  Tipping
                  {' '}
                  {conversation?.recipientInfo?.name || 'N/A'}
                  {' '}
                  {conversation?.recipientInfo?.verifiedAccount && (
                  <BadgeCheckIcon style={{ height: '1.5rem' }} className="primary-color" />
                  )}
                </div>
                <p className="p-subtitle">Transaction progress</p>
              </div>
              <Progress percent={Math.round(tipProgress)} />
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}

Compose.defaultProps = {
  disabled: false
} as Partial<IProps>;

const mapStates = (state: any) => ({
  sendMessageStatus: state.message.sendMessage,
  currentUser: state.user.current,
  ui: state.ui
});

const mapDispatch = { sendMessage, sentFileSuccess, updateBalance };
export default connect(mapStates, mapDispatch)(Compose);
