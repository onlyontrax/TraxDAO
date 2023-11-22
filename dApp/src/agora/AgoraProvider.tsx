/* eslint-disable react-hooks/exhaustive-deps */
import AgoraRTC, { ClientConfig, IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import Router from 'next/router';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useSelector } from 'react-redux';

type Props = {
  config: ClientConfig;
};

type AgoraRTCProviderState = {
  client: IAgoraRTCClient;
  appConfiguration: AppConfiguration;
  config: ClientConfig;
};

type AppConfiguration = {
  agoraAppId: string;
  agoraEnable: boolean;
};

const AgoraContext = createContext<AgoraRTCProviderState>(null);

export function AgoraProvider({
  config,
  children
}: React.PropsWithChildren<Props>) {
  const [client, setClient] = useState<IAgoraRTCClient>();
  const [appConfiguration, setAppConfiguration] = useState<AppConfiguration>(
    {} as any
  );
  const settings = useSelector((state: any) => state.streaming.settings);

  const onbeforeunload = () => {
    if (client) {
      client.removeAllListeners();
    }
  };

  useEffect(() => {
    if (!process.browser) return;

    Router.events.on('routeChangeStart', onbeforeunload);
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', onbeforeunload);
    }

    const _client = AgoraRTC.createClient(config);
    if (_client) {
      setClient(_client);
    }

    // eslint-disable-next-line consistent-return
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', onbeforeunload);
      }
      Router.events.off('routeChangeStart', onbeforeunload);
    };
  }, []);

  useEffect(() => {
    if (settings) setAppConfiguration(settings);
  }, [settings]);

  const value = useMemo(
    () => ({ client, appConfiguration, config }),
    [client, appConfiguration, config]
  );

  return React.createElement(AgoraContext.Provider, { value }, children);
}

AgoraProvider.displayName = 'AgoraProvider';

export const useAgora = () => useContext(AgoraContext);

export default AgoraProvider;
