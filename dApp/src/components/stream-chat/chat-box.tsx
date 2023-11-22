import { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import Tabs from 'src/components/common/base/tabs';
import StreamMessenger from '@components/stream-chat/Messenger';
import { getResponseError } from '@lib/utils';
import { messageService } from 'src/services';
import styles from './chat-box.module.scss';

interface IProps {
  resetAllStreamMessage?: Function;
  user?: any;
  activeConversation?: any;
}

const checkPermission = (user, conversation) => {
  if (user?._id === conversation?.data?.performerId || user?.roles?.includes('admin')) {
    return true;
  }
  return false;
};

function ChatBox({
  resetAllStreamMessage,
  user,
  activeConversation
}: IProps) {
  const [removing, setRemoving] = useState(false);
  const [canReset, setCanReset] = useState(false);

  useEffect(() => {
    setCanReset(checkPermission(user, activeConversation));
  }, [user, activeConversation]);

  const removeAllMessage = async () => {
    if (!canReset) {
      message.error('You don\'t have permission!');
      return;
    }

    try {
      setRemoving(true);
      if (!window.confirm('Are you sure you want to clear all chat history?')) {
        return;
      }
      await messageService.deleteAllMessageInConversation(
        activeConversation.data._id
      );
      resetAllStreamMessage && resetAllStreamMessage({ conversationId: activeConversation.data._id });
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    } finally {
      setRemoving(false);
    }
  };
  const tabsProps:any = { defaultActiveKey: 'chat_content' };

  return (
    <div className={styles.componentsChatBoxModule}>
      <div className="conversation-stream">
        <Tabs {...tabsProps}>
          <Tabs.TabPane tab="CHAT" key="chat_content">
            {activeConversation
            && activeConversation.data
            && activeConversation.data.streamId ? (
              <StreamMessenger streamId={activeConversation.data.streamId} />
              ) : <p className="text-center">Let start a converstion</p>}
          </Tabs.TabPane>
        </Tabs>
      </div>
      {canReset && (
      <div style={{ margin: '10px' }}>
        <Button
          type="primary"
          loading={removing}
          onClick={() => removeAllMessage()}
        >
          Clear chat history
        </Button>
      </div>
      )}
    </div>
  );
}

ChatBox.defaultProps = {
  activeConversation: null,
  user: null,
  resetAllStreamMessage: null
};

export default ChatBox;
