import { attachNfidLogout, logout } from '@redux/auth/actions';
import {
  Button
} from 'antd';
import { connect, useDispatch } from 'react-redux';
import { NFIDIcon } from '../../icons/index';
import React, {useState} from 'react';
import { LoadingOutlined } from '@ant-design/icons';
interface IAuthButton {
  onSignOut: Function
  onConnect: Function,
  handlePlugWalletConnect: Function,
  isAuthenticated: boolean,
  isLogin: boolean,
  currentPrincipal?: string,
  state: any,
  from: string
}

function AuthPlugWallet({ onSignOut, onConnect, isAuthenticated, handlePlugWalletConnect, isLogin, currentPrincipal, from }: IAuthButton) {
  const [loading, setLoading] = useState(false);

  const authenticateNow = async () => {
    setLoading(true)
    const identityCanisterId = (process.env.NEXT_PUBLIC_DFX_NETWORK as string) === 'ic' ? (process.env.NEXT_PUBLIC_IDENTITY_CANISTER as string) : (process.env.NEXT_PUBLIC_IDENTITY_CANISTER_LOCAL as string);
      const whitelist = [identityCanisterId];
      // @ts-ignore
      const res = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug?.requestConnect({
        whitelist
      }) : false;
      setLoading(false);
    return isLogin ? handlePlugWalletConnect(from) : onConnect();
  };

  const handlePlugWalletConnectUp = () => handlePlugWalletConnect(from);

  return (
    <div>
      {!isAuthenticated ? (
        <Button onClick={authenticateNow} htmlType="button" className={from === 'sign-up' ? "nfid-button-wrapper-sign-up" : "nfid-button-wrapper"}>
            {from === 'sign-up' ? (
            <>
            {loading ? (
                <LoadingOutlined style={{color: '#c8ff00', fontSize: 17, marginRight: '0.5rem'}}/>
              ):(
                <img src="/static/plug-favicon.png" alt="" className='plug-icon-sign'/>
              )}
              <span>Plug Wallet</span>
            </>
          )
          :
          (
            <>
              {loading ? (
                <LoadingOutlined style={{color: '#c8ff00', fontSize: 23, marginTop: 2}}/>
              ):(
                <img src="/static/plug-favicon.png" alt="" className='plug-icon-sign'/>
              )}
            </>
          )}
        </Button>
      ) : (
        <div>
          <Button onClick={handlePlugWalletConnectUp} htmlType="button" className={from === 'sign-up' ? "nfid-button-wrapper-sign-up" : "nfid-button-wrapper"}>
            {from === 'sign-up' ? (
            <>
              {loading ? (
                <LoadingOutlined style={{color: '#c8ff00', fontSize: 17, marginRight: '0.5rem'}}/>
              ):(
                <img src="/static/plug-favicon.png" alt="" className='plug-icon-sign'/>
              )}
              <span>Plug Wallet</span>
            </>
          )
          :
          (
            <>
             {loading ? (
                <LoadingOutlined style={{color: '#c8ff00', fontSize: 23, marginTop: 2}}/>
              ):(
                <img src="/static/plug-favicon.png" alt="" className='plug-icon-sign'/>
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
