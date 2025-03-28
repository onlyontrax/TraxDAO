/* eslint-disable react/sort-comp */
import { SendOutlined, SmileOutlined } from '@ant-design/icons';
import { ImageMessageUpload } from '@components/messages/uploadPhoto';
import TipPerformerForm from '@components/performer/TipPerformerForm';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { sendMessage, sentFileSuccess } from '@redux/message/actions';
import { updateBalance } from '@redux/user/actions';
import { authService, messageService, tokenTransctionService } from '@services/index';
import { cryptoService } from '@services/crypto.service';
import {
  Avatar, Modal, Popover, Progress, message
} from 'antd';
import Router from 'next/router';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import { IUIConfig, ISettings } from 'src/interfaces';
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import type { _SERVICE as _SERVICE_LEDGER } from '../../smart-contracts/declarations/ledger/ledger2.did';
import type { _SERVICE as _SERVICE_TIPPING, TippingParticipants, Participants } from '../../smart-contracts/declarations/tipping/tipping2.did';
import { TransferArgs, Tokens, TimeStamp } from '../../smart-contracts/declarations/ledger/ledger2.did';
import { idlFactory as idlFactoryLedger } from '../../smart-contracts/declarations/ledger/ledger.did.js';
import { idlFactory as idlFactoryTipping } from '../../smart-contracts/declarations/tipping/tipping.did.js';
import styles from './Compose.module.scss';
import { Emotions } from './emotions';
import { getPlugWalletIsConnected, getPlugWalletAgent, getPlugWalletProvider } from '../../crypto/mobilePlugWallet';

interface IProps {
  ui: IUIConfig;
  updateBalance: Function;
  sendMessage: Function;
  sentFileSuccess: Function;
  sendMessageStatus: any;
  conversation: any;
  currentUser: any;
  disabled?: boolean;
  settings: ISettings;
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
      
    }
  }

  async sendTipFiat(price) {
    const { currentUser, conversation, updateBalance: handleUpdateBalance } = this.props;
    if (currentUser?.account?.balance < price) {
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
      participantID: Principal.fromText(conversation?.recipientInfo.account?.wallet_icp),
      participantPercentage: 1
    };
    participants.push(obj2);

    const participantArgs: TippingParticipants = participants;

    const bal: Tokens = await ledgerActor.account_balance(balArgs);
    if (Number(bal.e8s) > (Number(amountToSend) + 10000)) {
      this.setState({ tipProgress: 30 });
      await ledgerActor.transfer(transferArgs).then(async (res) => {
        this.setState({ tipProgress: 50 });
        await tippingActor.sendTip(res.Ok, Principal.fromText(conversation?.recipientInfo.account?.wallet_icp), BigInt(amountToSend), 'ICP').then(() => {
          this.setState({ tipProgress: 100 });
          tokenTransctionService.sendCryptoTip(conversation?.recipientInfo.account?.wallet_icp, { performerId: conversation?.recipientInfo.account?.wallet_icp, price: Number(amountToSend), tokenSymbol: ticker }).then(() => {
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

          {/* <Modal
            key="tip_performer"
            className="subscription-modal"
            title={null}
            width={420}
            open={openTipModal}
            onOk={() => this.setState({ openTipModal: false })}
            footer={null}
            onCancel={() => this.setState({ openTipModal: false })}
          >
            <TipPerformerForm performer={conversation.recipientInfo} submiting={submiting} onFinish={this.sendTip.bind(this)} />
          </Modal> */}
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
                  <CheckBadgeIcon style={{ height: '1.5rem' }} className="primary-color" />
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
  ui: state.ui,
  settings: { ...state.settings }
});

const mapDispatch = { sendMessage, sentFileSuccess, updateBalance };
export default connect(mapStates, mapDispatch)(Compose);
