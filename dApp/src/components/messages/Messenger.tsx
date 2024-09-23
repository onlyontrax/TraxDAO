import { deactiveConversation } from '@redux/message/actions';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IConversation } from 'src/interfaces/message';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import styles from './Messenger.module.scss';

interface IProps {
  toSource?: string;
  toId?: string;
  activeConversation: IConversation;
  deactiveConversation: Function;
}
class Messenger extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  componentDidMount() {
    const { toSource, toId, deactiveConversation: handleDeactive } = this.props;
    if (!toSource && !toId) {
      handleDeactive();
    }
  }

  render() {
    const { toSource, toId, activeConversation } = this.props;
    return (
      <div className={styles.componentsMessagesMessengerModule}>
        <div className="messenger">
          <div className={!activeConversation._id ? 'sidebar' : 'sidebar active'}>
            <ConversationList toSource={toSource} toId={toId} />
          </div>
          <div className={!activeConversation._id ? 'chat-content' : 'chat-content active'}>
            <MessageList />
          </div>
        </div>
      </div>
    );
  }
}

Messenger.defaultProps = {
  toSource: '',
  toId: ''
} as Partial<IProps>;

const mapStates = (state: any) => {
  const { activeConversation } = state.conversation;
  return {
    activeConversation
  };
};

const mapDispatch = { deactiveConversation };
export default connect(mapStates, mapDispatch)(Messenger);
