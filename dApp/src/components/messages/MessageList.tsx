import { PureComponent, createRef } from 'react';
import { Spin, Avatar, Button } from 'antd';
import { TickIcon } from 'src/icons';
import { connect } from 'react-redux';
import moment from 'moment';
import { loadMoreMessages, deactiveConversation } from '@redux/message/actions';
import { LeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Router from 'next/router';
import Compose from './Compose';
import Message from './Message';
import styles from './MessageList.module.scss';

interface IProps {
  deactiveConversation: Function;
  sendMessage: any;
  loadMoreMessages: Function;
  message: any;
  conversation: any;
  currentUser: any;
}

class MessageList extends PureComponent<IProps> {
  private messagesRef = createRef<HTMLDivElement>();

  onScrolling = false;

  state = {
    offset: 0,
    onLoadMore: false
  };

  componentDidUpdate(prevProps) {
    const { conversation, sendMessage } = this.props;
    if (prevProps.conversation && prevProps.conversation._id !== conversation._id) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ offset: 0, onLoadMore: false });
    }
    if (prevProps?.sendMessage?.data?._id !== sendMessage?.data?._id) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ onLoadMore: false });
    }
  }

  async handleScroll(event) {
    const { message, loadMoreMessages: handleLoadMore, conversation } = this.props;
    const { offset } = this.state;
    const { fetching, items, total } = message;
    const canloadmore = total > items.length;
    const ele = event.target;
    if (!canloadmore) return;
    if (ele.scrollTop === 0 && conversation._id && !fetching && canloadmore) {
      this.setState({ offset: offset + 1, onLoadMore: true });
      handleLoadMore({
        conversationId: conversation._id,
        limit: 25,
        offset: (offset + 1) * 25
      });
      setTimeout(() => {
        const getMeTo = document.getElementById(items[0]._id);
        getMeTo && getMeTo.scrollIntoView({ behavior: 'auto', block: 'center' });
      }, 1000);
    }
  }

  renderMessages = () => {
    const { message, currentUser, conversation } = this.props;
    const recipientInfo = conversation && conversation.recipientInfo;
    const messages = message.items;
    let i = 0;
    const messageCount = messages.length;
    const tempMessages = [];
    while (i < messageCount) {
      const previous = messages[i - 1];
      const current = messages[i];
      const next = messages[i + 1];
      const isMine = current.senderId === currentUser._id;
      const currentMoment = moment(current.createdAt);
      let prevBySameAuthor = false;
      let nextBySameAuthor = false;
      let startsSequence = true;
      let endsSequence = true;
      let showTimestamp = true;

      if (previous) {
        const previousMoment = moment(previous.createdAt);
        const previousDuration = moment.duration(
          currentMoment.diff(previousMoment)
        );
        prevBySameAuthor = previous.senderId === current.senderId;

        if (prevBySameAuthor && previousDuration.as('hours') < 1) {
          startsSequence = false;
        }

        if (previousDuration.as('hours') < 1) {
          showTimestamp = false;
        }
      }

      if (next) {
        const nextMoment = moment(next.createdAt);
        const nextDuration = moment.duration(nextMoment.diff(currentMoment));
        nextBySameAuthor = next.senderId === current.senderId;

        if (nextBySameAuthor && nextDuration.as('hours') < 1) {
          endsSequence = false;
        }
      }
      if (current._id) {
        tempMessages.push(
          <Message
            key={i}
            isMine={isMine}
            startsSequence={startsSequence}
            endsSequence={endsSequence}
            showTimestamp={showTimestamp}
            data={current}
            recipient={recipientInfo}
            currentUser={currentUser}
          />
        );
      }
      // Proceed to the next message.
      i += 1;
    }
    this.scrollToBottom();
    return tempMessages;
  };

  scrollToBottom = () => {
    const {
      message: { fetching }
    } = this.props;
    const { onLoadMore } = this.state;
    if (onLoadMore || this.onScrolling || fetching) return;
    const ele = this.messagesRef.current as HTMLDivElement;
    if (ele && ele.scrollTop === ele.scrollHeight) return;
    this.onScrolling = true;
    window.setTimeout(() => {
      this.onScrolling = false;
      ele && ele.scrollTo({ top: ele.scrollHeight, behavior: 'smooth' });
    }, 400);
  };

  onClose = () => {
    const { deactiveConversation: handleDeactive, conversation } = this.props;
    conversation?._id && handleDeactive(conversation._id);
  };

  render() {
    const { conversation, message } = this.props;
    const { fetching } = message;
    return (
      <div className={styles.componentsMessagesMessageListModule}>
        <div className="message-list" onScroll={this.handleScroll.bind(this)}>
          {conversation && conversation._id
            ? (
              <>
                <div aria-hidden className="mess-recipient">
                  <span
                    className="recipient"
                    aria-hidden
                    onClick={() => conversation?.recipientInfo?.isPerformer && Router.push({ pathname: `/${conversation?.recipientInfo?.username || conversation?.recipientInfo?._id}` }, `/${conversation?.recipientInfo?.username || conversation?.recipientInfo?._id}`)}
                  >
                    <Avatar alt="avatar" src={conversation?.recipientInfo?.avatar || '/static/no-avatar.png'} />
                    {' '}
                    {conversation?.recipientInfo?.name || conversation?.recipientInfo?.username || 'N/A'}
                    {' '}
                    {conversation?.recipientInfo?.verifiedAccount && <TickIcon />}
                  </span>
                  <Button type="link" onClick={() => this.onClose()} className="close-btn"><LeftOutlined /></Button>
                </div>
                <div className="message-list-container" ref={this.messagesRef as any}>
                  {fetching && <div className="text-center" style={{ margin: '30px 0' }}><Spin /></div>}
                  {this.renderMessages()}
                  {!fetching && !message.items.length && <p className="text-center" style={{ margin: '30px 0' }}>Let&apos;s talk</p>}
                  {!conversation.isSubscribed && (
                  <Link
                    href={`/${conversation?.recipientInfo?.username || conversation?.recipientInfo?._id}`}
                    as={`/${conversation?.recipientInfo?.username || conversation?.recipientInfo?._id}`}
                    legacyBehavior
                  >
                    <div className="sub-text">Please subscribe to this artist to start the conversation!</div>
                  </Link>
                  )}
                  {conversation.isBlocked && <div className="sub-text">This artist has blocked you!</div>}
                </div>
                <Compose disabled={!conversation.isSubscribed || conversation.isBlocked} conversation={conversation} />
              </>
            )
            : <p className="text-center" style={{ margin: '30px 0' }}>Click on conversation to start</p>}
        </div>
      </div>
    );
  }
}

const mapStates = (state: any) => {
  const { conversationMap, sendMessage } = state.message;
  const { activeConversation } = state.conversation;
  const messages = conversationMap[activeConversation._id]
    ? conversationMap[activeConversation._id].items || []
    : [];
  const totalMessages = conversationMap[activeConversation._id]
    ? conversationMap[activeConversation._id].total || 0
    : 0;
  const fetching = conversationMap[activeConversation._id]
    ? conversationMap[activeConversation._id].fetching || false : false;
  return {
    sendMessage,
    message: {
      items: messages,
      total: totalMessages,
      fetching
    },
    conversation: activeConversation,
    currentUser: state.user.current
  };
};

const mapDispatch = { loadMoreMessages, deactiveConversation };
export default connect(mapStates, mapDispatch)(MessageList);
