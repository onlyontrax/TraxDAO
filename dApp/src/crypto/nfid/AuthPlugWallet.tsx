import { attachNfidLogout, logout } from '@redux/auth/actions';
import {
  Button
} from 'antd';
import { connect, useDispatch } from 'react-redux';
import { NFIDIcon } from '../../icons/index';
import { ISettings } from "src/interfaces";
import React, {useState} from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { getPlugWalletIsConnected, getPlugWalletAgent, getPlugWalletProvider } from '../mobilePlugWallet';

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

  return (
    <div>
      {!isAuthenticated ? (
        <Button onClick={authenticateNow} htmlType="button" className="nfid-button-wrapper">
            {from === 'sign-up' || 'log-in' ? (
            <>
            {loading || plugLoading? (
                <LoadingOutlined style={{color: '#c8ff00', fontSize: 17, marginRight: '0.5rem'}}/>
              ):(
                <img src="/static/plug-favicon-2.png" alt="" className='plug-icon-sign'/>
              )}
              <span className='font-medium'>{from === 'sign-up' ? 'Sign up with Plug' : 'Continue with Plug'}</span>
            </>
          )
          :
          (
            <>
              {loading || plugLoading ? (
                <LoadingOutlined style={{color: '#c8ff00', fontSize: 23, marginTop: 2}}/>
              ):(
                <img src="/static/plug-favicon-2.png" alt="" className='plug-icon-sign'/>
              )}
            </>
          )}
        </Button>
      ) : (
        <div>
          <Button onClick={handlePlugWalletConnectUp} htmlType="button" className={from === 'sign-up' ? "nfid-button-wrapper-sign-up" : "nfid-button-wrapper"}>
            {from === 'sign-up' || 'log-in' ? (
            <>
              {loading || plugLoading ? (
                <LoadingOutlined style={{color: '#c8ff00', fontSize: 17, marginRight: '0.5rem'}}/>
              ):(
                <img src="/static/plug-favicon-2.png" alt="" className='plug-icon-sign'/>
              )}
              <span>Plug Wallet</span>
            </>
          )
          :
          (
            <>
             {loading || plugLoading ? (
                <LoadingOutlined style={{color: '#c8ff00', fontSize: 23, marginTop: 2}}/>
              ):(
                <img src="/static/plug-favicon-2.png" alt="" className='plug-icon-sign'/>
              )}

            </>
          )}
          </Button>
        </div>
      )}
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
