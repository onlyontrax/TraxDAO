import styles from '@components/messages/Messenger.module.scss';
import { PureComponent } from 'react';
import MessageList from './MessageList';

interface IProps {
  streamId?: string;
}
export default class StreamMessenger extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const { streamId } = this.props;
    return (
      <div className={styles.componentsMessagesMessengerModule}>
        <div className="message-stream">
          {streamId ? <MessageList /> : <p>Let&apos;s start a conversation</p>}
        </div>
      </div>
    );
  }
}

StreamMessenger.defaultProps = {
  streamId: ''
} as Partial<IProps>;
