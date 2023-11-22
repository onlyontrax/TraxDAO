import Script from 'next/script';
import { PureComponent } from 'react';

export default class LoadScripts extends PureComponent<any> {
  render() {
    return (
      <>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/webrtc-adapter/7.4.0/adapter.min.js" />
        <Script src="https://vjs.zencdn.net/7.10.2/video.min.js" />
        <Script src="https://cdn.jsdelivr.net/npm/@videojs/http-streaming@2.6.2/dist/videojs-http-streaming.min.js" />
      </>
    );
  }
}
