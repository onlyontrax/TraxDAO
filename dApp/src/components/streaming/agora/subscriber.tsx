/* eslint-disable react/require-default-props, react-hooks/exhaustive-deps */
import { streamService } from '@services/stream.service';
import { IAgoraRTCRemoteUser, UID } from 'agora-rtc-sdk-ng';
import { Router } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { Player, useAgora } from 'src/agora';

export type SubscriberProps = {
  localUId: UID;
  remoteUId: UID;
  forwardedRef?: any;
  onStreamStatusChange: Function;
  sessionId: string;
};

export default function Subscriber({
  localUId,
  remoteUId,
  forwardedRef,
  onStreamStatusChange,
  sessionId
}: SubscriberProps) {
  const [tracks, setTracks] = useState([]);
  const { client, appConfiguration } = useAgora();
  const { agoraAppId } = appConfiguration;
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
    leave();
  };

  const subscribe = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    if (!client) return;

    await client.subscribe(user, mediaType);
    // const __uid = generateUid(uid);
    const remoteUser = client.remoteUsers.find(({ uid }) => uid === remoteUId);
    if (remoteUser) {
      if (mediaType === 'audio') remoteUser.audioTrack.play();
      if (mediaType === 'video') setTracks([remoteUser.videoTrack]);
      onStreamStatusChange && onStreamStatusChange(true);
    }
  };

  const unsubscribe = (user: IAgoraRTCRemoteUser) => {
    const remoteUser = user.uid === remoteUId;
    if (remoteUser) {
      setTracks([]);
      onStreamStatusChange && onStreamStatusChange(false);
    }
  };

  useEffect(() => {
    clientRef.current = client;
    if (!client) return;

    client.on('connection-state-change', (state) => {
      // eslint-disable-next-line no-console
    });

    client.on('user-published', subscribe);
    client.on('user-unpublished', unsubscribe);
    client.on('token-privilege-will-expire', async () => {
      const resp = await streamService.fetchAgoraAppToken({
        channelName: 'stream1'
      });
      await client.renewToken(resp.data);
    });
    client.on('token-privilege-did-expire', join);
  }, [client]);

  useEffect(() => {
    Router.events.on('routeChangeStart', onbeforeunload);
    window.addEventListener('beforeunload', onbeforeunload);
    return () => {
      window.removeEventListener('beforeunload', onbeforeunload);
      Router.events.off('routeChangeStart', onbeforeunload);
    };
  }, []);

  React.useImperativeHandle(forwardedRef, () => ({
    join,
    leave
  }));

  return <Player tracks={tracks} />;
}
