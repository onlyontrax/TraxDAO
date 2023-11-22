import {
  SendOutlined, SmileOutlined
} from '@ant-design/icons';
import { Emotions } from '@components/messages/emotions';
import { IPerformer } from '@interfaces/performer';
import { sendStreamMessage } from '@redux/stream-chat/actions';
import { Input, Popover, message } from 'antd';
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import styles from '@components/messages/Compose.module.scss';

const { TextArea } = Input;
interface IProps {
  user: IPerformer;
  sendStreamMessage: Function;
  sendMessageStatus: any;
  conversation: any;
}

class StreamChatCompose extends PureComponent<IProps> {
  _input: any;

  state = { text: '' };

  componentDidMount() {
    if (!this._input) this._input = createRef();
  }

  componentDidUpdate(previousProps: IProps) {
    const { sendMessageStatus } = this.props;
    if (sendMessageStatus.success && previousProps.sendMessageStatus.success !== sendMessageStatus.success) {
      this.updateMessage();
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
    this.setState({ text: `${text} ${emoji}` });
  }

  updateMessage() {
    this.setState({ text: '' });
  }

  send() {
    const { sendStreamMessage: _sendStreamMessage, conversation, user } = this.props;
    const { text } = this.state;
    if (!user._id) {
      message.error('Please login');
      return;
    }
    if (!text) {
      return;
    }

    _sendStreamMessage({
      conversationId: conversation._id,
      data: {
        text
      },
      type: conversation.type
    });
  }

  render() {
    const { text } = this.state;
    const { sendMessageStatus: status } = this.props;
    if (!this._input) this._input = createRef();
    return (
      <div className={styles.componentsMessagesComposeModule}>
        <div className="compose stream">
          <TextArea
            value={text}
            className="compose-input"
            placeholder="Enter message here."
            onKeyDown={this.onKeyDown}
            onChange={this.onChange}
            disabled={status.sending}
          // eslint-disable-next-line no-return-assign
            ref={(ref) => (this._input = ref)}
            rows={1}
          />
          <div className="grp-icons">
            <Popover className="emotion-popover" content={<Emotions onEmojiClick={this.onEmojiClick.bind(this)} />} title={null} trigger="click">
              <div className="grp-emotions">
                <SmileOutlined />
              </div>
            </Popover>
          </div>
          <div className="grp-icons" style={{ paddingRight: 0 }}>
            <div aria-hidden className="grp-send" onClick={this.send.bind(this)}>
              <SendOutlined />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStates = (state: any) => ({
  user: state.user.current,
  sendMessageStatus: state.streamMessage.sendMessage
});

const mapDispatch = { sendStreamMessage };
export default connect(mapStates, mapDispatch)(StreamChatCompose);
