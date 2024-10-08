import { attachNfidLogout, logout } from '@redux/auth/actions';
import {
  Button
} from 'antd';
import { connect, useDispatch } from 'react-redux';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { userService, cryptoService, performerService, authService } from '@services/index';
import { NFIDIcon } from '../../icons/index';
import React, {useState} from 'react';
import { LoadingOutlined } from '@ant-design/icons';
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

  const handleConnectUp = () => connectInternetIdentity();

  return (
    <div>
      {!isAuthenticated ? (
        <Button onClick={authenticateNow} htmlType="button" className="nfid-button-wrapper">
            {from === 'sign-up' || 'log-in' ? (
              <>
                {loading || iiLoading ? (
                  <LoadingOutlined style={{color: '#c8ff00', fontSize: 17, marginRight: '0.5rem'}}/>
                ):(
                  <img src="/static/icp-logo.png" alt="" className='icp-icon-sign'/>
                )}
                <span className='font-medium'>{from === 'sign-up' ? 'Sign up with Internet Identity' : 'Continue with Internet Identity'}</span>
              </>
          )
          :
          (
            <>
              {loading || iiLoading ? (
                <LoadingOutlined style={{color: '#c8ff00', fontSize: 23, marginTop: 2}}/>
              ):(
                <img src="/static/icp-logo.png" alt="" className='icp-icon-sign'/>
              )}
            </>
          )}
        </Button>
      ) : (
        <div>
          <Button onClick={handleConnectUp} htmlType="button" type="primary" className={from === 'sign-up' ? "nfid-button-wrapper-sign-up" : "nfid-button-wrapper"}>
            {from === 'sign-up' || 'log-in' ? (
            <>
              {loading || iiLoading ? (
                <LoadingOutlined style={{color: '#c8ff00', fontSize: 17, marginRight: '0.5rem'}}/>
              ):(
                <img src="/static/icp-logo.png" alt="" className='icp-icon-sign'/>
              )}
              <p className='internet-identity-span'>Internet Identity</p>
            </>
          )
          :
          (
            <>
              {loading || iiLoading ? (
                  <LoadingOutlined style={{color: '#c8ff00', fontSize: 23, marginTop: 2}}/>
                ):(
                  <img src="/static/icp-logo.png" alt="" className='icp-icon-sign'/>
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
export default connect(mapState, mapDispatch)(InternetIdentity);
