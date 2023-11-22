import { IStream } from '@interfaces/stream';
import { IUser } from '@interfaces/user';
import { showSubscribePerformerModal } from '@redux/subscription/actions';
import { message } from 'antd';
import Image from 'next/image';
import Router from 'next/router';
import { useDispatch } from 'react-redux';

type Props = {
  stream: IStream;
  user: IUser;
}

export default function StreamListItem({ stream, user }: Props) {
  const dispatch = useDispatch();
  const handleClick = () => {
    if (!user._id) {
      message.error('Please log in or register!', 5);
      Router.push('/login');
      return;
    }
    if (user.isPerformer) return;
    if (!stream?.isSubscribed) {
      message.error('Please subscribe to join live chat!', 5);
      dispatch(showSubscribePerformerModal(stream.performerId));
      return;
    }
    Router.push(
      {
        pathname: `/streaming/details?id=${
          stream?.performerInfo?.username || stream?.performerInfo?._id
        }`
      },
      `/streaming/details?id=${
        stream?.performerInfo?.username || stream?.performerInfo?._id
      }`
    );
  };

  return (
    <div
      aria-hidden
      onClick={handleClick}
      key={stream?._id}
      className="story-per-card"
      title={stream?.performerInfo?.name || stream?.performerInfo?.username || 'N/A'}
    >
      <div className="blink-border" />
      <Image className="per-avatar" alt="avatar" src={stream?.performerInfo?.avatar || '/static/no-avatar.png'} layout="fill" objectFit="cover" />
      <div className="live-tag">LIVE</div>
    </div>
  );
}
