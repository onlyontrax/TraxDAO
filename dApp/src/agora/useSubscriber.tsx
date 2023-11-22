/* eslint-disable react-hooks/exhaustive-deps */
import { streamService } from '@services/stream.service';
import { IAgoraRTCRemoteUser, UID } from 'agora-rtc-sdk-ng';
import { Router } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useAgora } from 'src/agora';
import { SubscriberState } from './types';

type Props = {
  localUId: UID;
  remoteUId: UID;
  sessionId: string;
};

export default function useSubscriber({ localUId, remoteUId, sessionId }: Props) {
  const [tracks, setTracks] = useState([]);
  const { client, appConfiguration } = useAgora();
  const { agoraAppId } = appConfiguration;
  const [status, setStatus] = useState<SubscriberState>();
  const clientRef = useRef<any>();

  const join = async () => {
    if (!client || !sessionId) return;

    const resp = await streamService.fetchAgoraAppToken({
      channelName: sessionId
    });
    await client.join(agoraAppId, sessionId, resp.data, localUId);
  };

  const leave = () => {
    clientRef.current?.uid && clientRef.current.leave();
    setTracks([]);
    if (clientRef.current?.remoteUsers) {
      clientRef.current.remoteUsers.forEach((remoteUser) => {
        remoteUser.audioTrack.stop();
      });
    }
  };

  const onbeforeunload = () => {
    client?.uid && client.leave();
    setTracks([]);
    if (client?.remoteUsers) {
      client.remoteUsers.forEach((remoteUser) => {
        remoteUser.audioTrack.stop();
      });
    }
  };

  const subscribe = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    if (!client) return;

    await client.subscribe(user, mediaType);
    // const __uid = generateUid(uid);
    const remoteUser = client.remoteUsers.find(({ uid }) => uid === remoteUId);
    if (remoteUser) {
      if (mediaType === 'audio') remoteUser.audioTrack.play();
      if (mediaType === 'video') setTracks([remoteUser.videoTrack]);
      setStatus('playing');
    }
  };

  const unsubscribe = (user: IAgoraRTCRemoteUser) => {
    const remoteUser = user.uid === remoteUId;
    if (remoteUser) {
      setTracks([]);
      setStatus(false);
    }
  };

  useEffect(() => {
    if (!client) return;

    client.on('connection-state-change', () => {
      // eslint-disable-next-line no-console
    });

    client.on('user-published', subscribe);
    client.on('user-unpublished', unsubscribe);
    client.on('token-privilege-will-expire', async () => {
      const resp = await streamService.fetchAgoraAppToken({
        channelName: sessionId
      });
      await client.renewToken(resp.data);
    });
    client.on('token-privilege-did-expire', join);
  }, [client]);

  useEffect(() => {
    Router.events.on('routeChangeStart', onbeforeunload);
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', onbeforeunload);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', onbeforeunload);
      }
      Router.events.off('routeChangeStart', onbeforeunload);
    };
  }, []);

  return {
    tracks,
    client,
    status,
    join,
    leave
  };
}
