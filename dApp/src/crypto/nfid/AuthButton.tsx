/* eslint-disable react/require-default-props */
import { useInternetIdentity } from '@internet-identity-labs/react-ic-ii-auth';
import { attachNfidLogout, logout } from '@redux/auth/actions';
import {
  Button
} from 'antd';
import { connect, useDispatch } from 'react-redux';
import { NFIDIcon } from '../../icons/index';
import React, {useState} from 'react';
import { LoadingOutlined } from '@ant-design/icons';

interface IAuthButton {
  onSignOut?: Function
  onAuthenticate?: Function,
  currentPrincipal?: string;
  state: any,
  from: string
}

function AuthButton({ onSignOut, onAuthenticate, currentPrincipal, from }: IAuthButton) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const {
    signout, authenticate, isAuthenticated
  } = useInternetIdentity();

  const signOut = () => {
    if (typeof onSignOut === 'function') {
      onSignOut();
      logout();
    } else {
      signout();
    }
  };

  const authenticateNow = async () => {
    setLoading(true);
    await dispatch(attachNfidLogout({ nfidLogout: signout }));
    if (typeof onAuthenticate === 'function') {
      onAuthenticate();
    } else {
      authenticate();
    }
    setLoading(false);
  };

  return (
    <>
      {!isAuthenticated ? (
        <Button onClick={authenticateNow} htmlType="button" className={from === 'sign-up' ? "nfid-button-wrapper-sign-up" : "nfid-button-wrapper"}>
          {from === 'sign-up' ? (
            <>
              { loading ? (
                <LoadingOutlined style={{color: '#c8ff00', fontSize: 17, marginRight: '0.5rem'}}/>
              ):(
                <img src="/static/nfid-logo-og.png" alt="" className='nfid-icon-sign'/>
              )}
              <span>NFID</span>
            </>
          )
          :
          (
            <>
              {loading ? (
                <LoadingOutlined style={{color: '#c8ff00', fontSize: 23, marginTop: 2}}/>
              ):(
                <img src="/static/nfid-logo-og.png" alt="" className='nfid-icon-sign'/>
              )}
            </>
          )}
        </Button>
      ) : (
        <div>
          <div>
            <Button onClick={authenticateNow} htmlType="button" type="primary" className={from === 'sign-up' ? "nfid-button-wrapper-sign-up" : "nfid-button-wrapper"}>
              {from === 'sign-up' ? (
                <>
                {loading ? (
                  <LoadingOutlined style={{color: '#c8ff00', fontSize: 17, marginRight: '0.5rem'}}/>
                ):(
                  <img src="/static/nfid-logo-og.png" alt="" className='nfid-icon-sign'/>
                )}
                <span>NFID</span>
              </>
              ):(
                <>
                  {loading ? (
                     <LoadingOutlined style={{color: '#c8ff00', fontSize: 23, marginTop: 2}}/>
                   ):(
                    <img src="/static/nfid-logo-og.png" alt="" className='nfid-icon-sign'/>
                   )}
                </>
                
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

const mapState = (state: any) => ({
  ui: { ...state.ui },
  currentUser: { ...state.user.current },
  settings: { ...state.settings },
  state: { ...state }
});
const mapDispatch = { };
export default connect(mapState, mapDispatch)(AuthButton);
