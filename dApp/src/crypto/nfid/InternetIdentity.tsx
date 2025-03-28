import React, { useState } from 'react';
import { connect } from 'react-redux';
import { AuthClient } from "@dfinity/auth-client";
import { userService, cryptoService, performerService, authService } from '@services/index';
import { LoadingOutlined } from '@ant-design/icons';
import TraxButton from '@components/common/TraxButton';
interface IAuthButton {
  onSignOut: Function
  onConnect: Function,
  handleConnect: Function,
  isAuthenticated: boolean,
  isLogin: boolean,
  principalId?: string,
  state: any,
  from: string,
  iiLoading: boolean
}

function InternetIdentity({ onSignOut, onConnect, isAuthenticated, handleConnect, isLogin, principalId, from, iiLoading }: IAuthButton) {
  let authClient = null;
  const [loading, setLoading] = useState(false);

  const connectInternetIdentity = () => {
    setLoading(true);
    const identity = authClient.getIdentity();
    handleConnect(identity);

    //setLoading(false);
  };

  const authenticateNow = async () => {
    setLoading(true);
    authClient = await AuthClient.create();
    await new Promise(() => {
      authClient.login({
        identityProvider: cryptoService.getIdentityProvider(),
        onSuccess: () => {
          connectInternetIdentity();
          //setLoading(false);
        }
      });
    });
  };

  const handleClick = isAuthenticated ? connectInternetIdentity : authenticateNow;


  const icon = (
    loading || iiLoading ?
    <LoadingOutlined style={{color: '#c8ff00', fontSize: 17}} /> :
    <img src="/static/icp-logo.png" alt="Icp logo" />
  );

  return (
    <TraxButton
      htmlType="button"
      styleType="picture"
      buttonSize="auth"
      buttonText="Continue with Internet Identity"
      icon={icon}
      onClick={handleClick}
      disabled={loading || iiLoading}
    />
  );
}

const mapState = (state: any) => ({
  ui: { ...state.ui },
  currentUser: { ...state.user.current },
  settings: { ...state.settings },
  state: { ...state }
});
const mapDispatch = { };

export default connect(mapState, mapDispatch)(InternetIdentity);
