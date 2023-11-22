/* eslint-disable react-hooks/exhaustive-deps */
import { streamService } from '@services/stream.service';
import { ILocalTrack, UID } from 'agora-rtc-sdk-ng';
import { Router } from 'next/router';
import {
  useContext, useEffect, useRef, useState
} from 'react';
import { useAgora } from 'src/agora';
import { createLocalTracks } from 'src/agora/utils';
import { SocketContext } from 'src/socket';
import { PublisherState } from './types';

type Props = {
  uid: UID;
  conversationId: string;
  sessionId: string;
};

type LocalTracks = {
  videoTrack: ILocalTrack;
  audioTrack: ILocalTrack;
};

export default function usePublisher({ uid, conversationId, sessionId }: Props) {
  const [tracks, setTracks] = useState([]);
  const { client, appConfiguration, config } = useAgora();
  const { agoraAppId } = appConfiguration;
  const socket = useContext(SocketContext);
  const localTracks = useRef<LocalTracks>({
    videoTrack: null,
    audioTrack: null
  });
  const [status, setStatus] = useState<PublisherState>();
  const clientRef = useRef<any>();
  const publish = async () => {
    if (!client || !conversationId || !sessionId) return;

    setStatus('publishing');

    // const uid = generateUid(performerId);
    const resp = await streamService.fetchAgoraAppToken({
      channelName: sessionId
    });

    await client.join(agoraAppId, sessionId, resp.data, uid);

    const [microphoneTrack, cameraTrack] = await createLocalTracks({}, { encoderConfig: { bitrateMax: 1000 } });

    if (config.role === 'host') {
      await client.publish([microphoneTrack, cameraTrack]);
      setTracks([microphoneTrack, cameraTrack]);
      localTracks.current = {
        videoTrack: cameraTrack,
        audioTrack: microphoneTrack
      };
    }
    setStatus('published');
    socket
      && conversationId
      // @ts-ignore
      && socket.emit('public-stream/live', { conversationId });
  };

  const leave = async () => {
    Object.keys(localTracks.current).forEach((trackName) => {
      if (localTracks.current[trackName]) {
        localTracks.current[trackName].stop();
        localTracks.current[trackName].close();
      }
    });
    localTracks.current = { videoTrack: null, audioTrack: null };
    setTracks([]);
    setStatus(false);
    if (clientRef.current && clientRef.current.uid) {
      await clientRef.current.leave();
    }
  };

  const onbeforeunload = () => {
    leave();
  };

  useEffect(() => {
    clientRef.current = client;
    if (!client) return;

    client.on('connection-state-change', () => {
    });
    client.on('token-privilege-will-expire', async () => {
      const resp = await streamService.fetchAgoraAppToken({
        channelName: sessionId
      });
      await client.renewToken(resp.data);
    });
    client.on('token-privilege-did-expire', publish);
  }, [client]);

  useEffect(() => {
    Router.events.on('routeChangeStart', onbeforeunload);
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', onbeforeunload);
    }
    // eslint-disable-next-line consistent-return
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
    publish,
    leave
  };
}
