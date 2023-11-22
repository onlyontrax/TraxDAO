import {
  ILocalAudioTrack, ILocalVideoTrack, IRemoteAudioTrack, IRemoteVideoTrack
} from 'agora-rtc-sdk-ng';
import { useEffect, useRef } from 'react';
// import videojs from 'video.js';
import * as videojs from 'video.js/dist/video';
import styles from './index.module.scss';

interface Props {
  tracks: Array<ILocalVideoTrack | IRemoteVideoTrack | ILocalAudioTrack | IRemoteAudioTrack | undefined>;
}

export function Player({ tracks }: Props) {
  const player = useRef<HTMLVideoElement>(null);

  const ref = useRef<videojs.Player>();

  useEffect(() => {
    ref.current = videojs(player.current, {
      bigPlayButton: false,
      controls: true,
      muted: true,
      controlBar: {
        playToggle: false,
        pictureInPictureToggle: false,
        volumePanel: false
      }
    });
  }, []);

  useEffect(() => {
    if (ref.current) {
      if (tracks.length) {
        const mediaStreamTracks = tracks.map((track) => track.getMediaStreamTrack());
        const mediaStream = new MediaStream(mediaStreamTracks);
        (ref.current.tech().el() as HTMLVideoElement).srcObject = mediaStream;
      } else {
        (ref.current.tech().el() as HTMLVideoElement).srcObject = null;
        (ref.current.tech().el() as HTMLVideoElement).poster = '/static/processed.jpeg';
      }
    }
  }, [ref, tracks]);

  return (
    <div className={styles.agoraPlayerModule}>
      <div className="publisher-player">
        <video ref={player} className="video-js vjs-16-9" controls autoPlay muted playsInline />
      </div>
    </div>
  );
}

Player.defaultProps = {};
Player.displayName = 'AgoraPlayer';
