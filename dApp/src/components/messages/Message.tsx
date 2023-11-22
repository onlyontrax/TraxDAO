import React from 'react';
import moment from 'moment';
import { Image, Avatar } from 'antd';
import { IUser } from '@interfaces/index';
import styles from './Message.module.scss';

interface IProps {
  data: any;
  isMine: boolean;
  startsSequence: boolean;
  endsSequence: boolean;
  showTimestamp: boolean;
  currentUser: IUser;
  recipient: IUser;
}

export default function Message(props: IProps) {
  const {
    data, isMine, startsSequence, endsSequence, showTimestamp, currentUser, recipient
  } = props;

  const friendlyTimestamp = moment(data.createdAt).format('LLLL');
  return (
    <div className={styles.componentsMessagesMessageModule}>
      <div
        id={data._id}
        className={[
          'message',
          `${isMine ? 'mine' : ''}`,
          `${startsSequence ? 'start' : ''}`,
          `${endsSequence ? 'end' : ''}`
        ].join(' ')}
      >

        {data.text && (
        <div className="bubble-container">
          {!isMine && <Avatar alt="" className="avatar" src={recipient?.avatar || '/static/no-avatar.png'} />}
          <div className="bubble" title={friendlyTimestamp}>
            {!data.imageUrl && data.text}
            {' '}
            {data.imageUrl && <Image alt="" src={data.imageUrl} preview />}
          </div>
          {isMine && <Avatar alt="" src={currentUser?.avatar || '/static/no-avatar.png'} className="avatar" />}
        </div>
        )}
        {showTimestamp && <div className="timestamp">{friendlyTimestamp}</div>}
      </div>
    </div>
  );
}
