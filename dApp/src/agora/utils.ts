import AgoraRTC, {
  MicrophoneAudioTrackInitConfig,
  CameraVideoTrackInitConfig,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
  UID
} from 'agora-rtc-sdk-ng';

export async function createLocalTracks(
  audioConfig?: MicrophoneAudioTrackInitConfig,
  videoConfig?: CameraVideoTrackInitConfig
): Promise<[IMicrophoneAudioTrack, ICameraVideoTrack]> {
  const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(audioConfig, videoConfig);
  return [microphoneTrack, cameraTrack];
}

export function generateUid(id: string):UID {
  return id;
}
