import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { userService, cryptoService, performerService, authService } from '@services/index';
import * as crypto from 'crypto';
import Router from 'next/router';
import { Button, message } from 'antd';
import { loginNfid, loginSuccess } from '@redux/auth/actions';
import AuthButton from './AuthButton';
import AuthPlugWallet from './AuthPlugWallet';
import InternetIdentity from './InternetIdentity';

function Auth({ onSignOut = null, onAuthenticate = null, from}) {
  const dispatch = useDispatch();
  const [isAuthenticatedPlug, setIsAuthenticatedPlug] = useState(false);
  const [isAuthenticatedInternetIdentity, setIsAuthenticatedInternetIdentity] = useState(false);
  const [principalIdPlug, setPrincipalIdPlug] = useState('');
  const [principalId, setPrincipalId] = useState('');

  const verifyPlugWalletConnection = async () => {
    // @ts-ignore
    const isConnected = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug.isConnected() : false;
    setIsAuthenticatedPlug(isConnected);

    // @ts-ignore
    const principalId2 = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug?.agent?.getPrincipal() : '';
    setPrincipalIdPlug(principalId2);
  };

  useEffect(() => {
    verifyPlugWalletConnection();
  }, []);

  const handlePlugWalletConnect = async () => {
    const userKey = crypto.randomBytes(64).toString('hex');
    const fetchedResult = await cryptoService.getCanisterHashTokenwithPlugWallet(userKey);
    const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';
    const payload = {
      principal: fetchedResult[1],
      login: true,
      role: '',
      messageSigned: fetchedResult[0],
      publicKeyRaw: userKey,
      principalWallet: principalIdPlug || 'x',
      referralCode
    };

    if (from === 'sign-up') {
        payload.login = false;
        payload.role = 'user';
      }

    const response = await (await authService.loginNFID(payload)).data;
    if (response.token) {
      message.success('Login successfull. Please wait for redirect.');
      await dispatch(loginNfid({ token: response.token, principal: payload.principal }));
    } else {
      message.success('There is a problem with authenticating your Plugwallet. Please try again.');
    }
  };

  const handleInternetIdentityConnect = async (internetIdentity) => {
    const userKey = crypto.randomBytes(64).toString('hex');
    const fetchedResult = await cryptoService.getCanisterHashToken(internetIdentity, userKey);
    const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';


    const payload = {
      principal: fetchedResult[1],
      login: true,
      role: '',
      messageSigned: fetchedResult[0],
      publicKeyRaw: userKey,
      principalWallet: 'x',
      referralCode
    };


    if (from === 'sign-up') {
      payload.login = false;
      payload.role = 'user';
    }

    const response = await (await authService.loginNFID(payload)).data;
    if (response.token) {
      message.success('Login successfull. Please wait for redirect.');
      await dispatch(loginNfid({ token: response.token, principal: payload.principal }));
    } else {
      message.success('There is a problem with authenticating your Plugwallet. Please try again.');
    }
  };

  const authButtonProps: any = { onSignOut, onAuthenticate, isAuthenticatedPlug };
  return (
    <div>
      <div className={from === 'log-in' ? "auth-section" : "auth-section-sign-in"}>
        <AuthButton from={from} {...authButtonProps} />
        <div className="NFIDAuth">
          <AuthPlugWallet
            {...authButtonProps}
            isAuthenticated={isAuthenticatedPlug}
            handlePlugWalletConnect={handlePlugWalletConnect}
            principalIdPlug={principalIdPlug}
            isLogin
            from={from}
          />
        </div>
        <div className="NFIDAuth">
          <InternetIdentity
            {...authButtonProps}
            isAuthenticated={isAuthenticatedInternetIdentity}
            handleConnect={handleInternetIdentityConnect}
            principalId={principalId}
            isLogin
            from={from}
          />
        </div>
      </div>
    </div>
  );
}

export { Auth };
