import { useEffect, useState } from "react";
import { AnyIfEmpty, useDispatch } from 'react-redux';
import { userService, cryptoService, performerService, authService } from '@services/index';
import * as crypto from 'crypto';
import Router from 'next/router';
import { Button, message } from 'antd';
import { loginNfid, loginSuccess } from '@redux/auth/actions';
import AuthButton from './AuthButton';
import AuthPlugWallet from './AuthPlugWallet';
import InternetIdentity from './InternetIdentity';

interface TestProps {
  onLoggedIn?(loggedIn: boolean): Function;
  from: string
  onSignOut?: Function;
  onAuthenticate?: Function
}

function Auth({ onSignOut = null, onAuthenticate = null, from, onLoggedIn}: TestProps) {
  const dispatch = useDispatch();
  const [isAuthenticatedPlug, setIsAuthenticatedPlug] = useState(false);
  const [isAuthenticatedInternetIdentity, setIsAuthenticatedInternetIdentity] = useState(false);
  const [principalIdPlug, setPrincipalIdPlug] = useState('');
  const [principalId, setPrincipalId] = useState('');
  const [plugLoading, setPlugLoading] = useState(false);
  const [nfidLoading, setNFIDLoading] = useState(false);
  const [iiLoading, setIILoading] = useState(false);

  const verifyPlugWalletConnection = async () => {
    // @ts-ignore
    const isConnected = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug.isConnected() : false;
    setIsAuthenticatedPlug(isConnected);
    // @ts-ignore
    const principalId2 = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug?.agent?.getPrincipal() : '';
    setPrincipalIdPlug(principalId2);
  };

  const handlePlugWalletConnect = async () => {
    setPlugLoading(true);

    try {
      await verifyPlugWalletConnection();
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
        referralCode,
        walletType: 'plugWallet'
      };

      if (from === 'sign-up') {
        payload.login = false;
        payload.role = 'user';
      }

      try {
        const responseService: any = await authService.loginNFID(payload);
        const response = await responseService.data;

        if (response.token) {
          onLoggedIn(true);
          message.success('Login successful. Please wait for redirect.');
          await dispatch(loginNfid({ token: response.token, principal: payload.principal }));
        } else {
          message.error('There is a problem with authenticating your Plugwallet. Please try again.');
          onLoggedIn(false);
        }
        setPlugLoading(false);
      } catch (err) {
        const error = await err;
        if (error?.error === 'ENTITY_NOT_FOUND') {
          message.error('User with this wallet principal was not found. Please register a new account or connect this principal to an existing account.');
        } else {
          message.error(error.message);
        }
        onLoggedIn(false);
        setPlugLoading(false);
      }
    } catch (e) {
      message.success('There is a problem with authenticating your Plug wallet. Please try again.');
      setPlugLoading(false);
    }
  };

  const handleInternetIdentityConnect = async (internetIdentity) => {
    setIILoading(true);
    try {
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
        referralCode,
        walletType: 'internetIdentity'
      };


      if (from === 'sign-up') {
        payload.login = false;
        payload.role = 'user';
      }

      try {
        const responseService: any = await authService.loginNFID(payload);
        const response = await responseService.data;

        if (response.token) {
          onLoggedIn(true);
          message.success('Login successful. Please wait for redirect.');
          await dispatch(loginNfid({ token: response.token, principal: payload.principal }));
        } else {
          message.error('There is a problem with authenticating your Internet Identity. Please try again.');
          onLoggedIn(false);
        }
        setIILoading(false);
      } catch (err) {
        const error = await err;
        if (error?.error === 'ENTITY_NOT_FOUND') {
          message.error('User with this wallet principal was not found. Please register a new account or connect this principal to an existing account.');
        } else {
          message.error(error.message);
        }
        onLoggedIn(false);
        setIILoading(false);
      }
    } catch (e) {
      message.success('There is a problem with authenticating your Internet Identity. Please try again.');
      setIILoading(false);
    }
  };

  const authButtonProps: any = { onSignOut, onAuthenticate, isAuthenticatedPlug };
  return (
    <div>
      <div className={"auth-section"}>
        <div className={"no-auth-button"}>
          <AuthButton from={from} {...authButtonProps} nfidLoading={nfidLoading}/>
        </div>
        <div className="NFIDAuth">
          <AuthPlugWallet
            {...authButtonProps}
            isAuthenticated={isAuthenticatedPlug}
            handlePlugWalletConnect={handlePlugWalletConnect}
            principalIdPlug={principalIdPlug}
            plugLoading={plugLoading}
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
            iiLoading={iiLoading}
            isLogin
            from={from}
          />
        </div>
      </div>
    </div>
  );
}

export { Auth };
