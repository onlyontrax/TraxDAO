import { connect } from 'react-redux';
import { ISettings } from "src/interfaces";
import React, {useState} from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { getPlugWalletAgent, getPlugWalletProvider } from '../mobilePlugWallet';
import TraxButton from '@components/common/TraxButton';
interface IAuthButton {
  onSignOut: Function
  onConnect: Function,
  handlePlugWalletConnect: Function,
  plugLoading: boolean;
  isAuthenticated: boolean,
  isLogin: boolean,
  currentPrincipal?: string,
  state: any,
  from: string,
  settings: ISettings
}

function AuthPlugWallet({ onSignOut, onConnect, isAuthenticated, handlePlugWalletConnect, isLogin, currentPrincipal, from, plugLoading, settings }: IAuthButton) {
  const [loading, setLoading] = useState(false);

  const authenticateNow = async () => {
    setLoading(true);
    await getPlugWalletProvider();
    await getPlugWalletAgent();

    setLoading(false);
    return isLogin ? handlePlugWalletConnect(from) : onConnect();
  };

  const handlePlugWalletConnectUp = () => handlePlugWalletConnect(from);



  const icon = (
    loading || plugLoading ?
    <LoadingOutlined style={{color: '#c8ff00', fontSize: 17}} /> :
    <img src="/static/plug-favicon-2.png" alt="Plug logo" />
  );

  return (
    <div>
      <TraxButton
        htmlType="button"
        styleType="picture"
        buttonSize="auth"
        buttonText="Continue with Plug Wallet"
        icon={icon}
        onClick={isAuthenticated ? handlePlugWalletConnectUp : authenticateNow}
        disabled={loading || plugLoading}
      />
    </div>
  );
}

const mapState = (state: any) => ({
  ui: { ...state.ui },
  currentUser: { ...state.user.current },
  settings: { ...state.settings },
  state: { ...state }
});

const mapDispatch = { };

export default connect(mapState, mapDispatch)(AuthPlugWallet);
