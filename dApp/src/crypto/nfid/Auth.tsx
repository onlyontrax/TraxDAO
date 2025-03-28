import { useEffect, useState } from "react";
import { AnyIfEmpty, useDispatch } from 'react-redux';
import { userService, cryptoService, performerService, authService, accountService } from '@services/index';
import * as crypto from 'crypto';
import Router from 'next/router';
import { Button, message, Modal, Input } from 'antd';
import { loginNfid, loginSuccess } from '@redux/auth/actions';
import AuthButton from './AuthButton';
import AuthPlugWallet from './AuthPlugWallet';
import InternetIdentity from './InternetIdentity';
import TwoFactorModal from '@components/log-in/two-factor-modal';
import SmsModal from '@components/log-in/sms-modal';
import { getPlugWalletIsConnected, getPlugWalletAgent, getPlugWalletProvider, getPrincipalId } from '../mobilePlugWallet';

interface AuthProps {
  onLoggedIn?(loggedIn: boolean): Function;
  from: string
  onSignOut?: Function;
  onAuthenticate?: Function
}

function Auth({ onSignOut = null, onAuthenticate = null, from, onLoggedIn}: AuthProps) {
  const dispatch = useDispatch();
  const [isAuthenticatedPlug, setIsAuthenticatedPlug] = useState(false);
  const [isAuthenticatedInternetIdentity, setIsAuthenticatedInternetIdentity] = useState(false);
  const [principalIdPlug, setPrincipalIdPlug] = useState('');
  const [principalId, setPrincipalId] = useState('');
  const [plugLoading, setPlugLoading] = useState(false);
  const [nfidLoading, setNFIDLoading] = useState(false);
  const [iiLoading, setIILoading] = useState(false);

  // 2FA
  const [is2FAModalVisible, setIs2FAModalVisible] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [walletPayload, setWalletPayload] = useState({});
  const [enabled2fa, setEnabled2fa] = useState(false);

  const [isSmsModalVisible, setIsSmsModalVisible] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [smsError, setSmsError] = useState('');
  const [enabledSms, setEnabledSms] = useState(false);

  const handle2FAInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTwoFACode(e.target.value);
  };

  const handle2FASubmit = () => {
    handleSubmit2FA(twoFACode);
  };

  const handleSubmit2FA = async (pin: string) => {
    let payload: any = { ...walletPayload, twoFactorKey: twoFACode, smsKey: pin }
    try {
      const responseService: any = await authService.loginNFID(payload);
      const response = await responseService.data;

      if (response.token) {
        onLoggedIn(true);
        message.success('Login successful. Please wait for redirect.');
        await dispatch(loginNfid({ token: response.token, principal: payload.principal }));
      } else {
        message.error('There is a problem with authenticating your wallet. Please try again.');
        setTwoFactorError('Invalid 2FA code. Please try again.');
        setSmsError('Invalid SMS code. Please try again.');
        onLoggedIn(false);
      }
      setPlugLoading(false);
      setIILoading(false);
    } catch (err) {
      setTwoFactorError('Invalid 2FA code. Please try again.');
      setSmsError('Invalid SMS code. Please try again.');
      const error = await err;
      if (error?.error === 'ENTITY_NOT_FOUND') {
        message.error('User with this wallet principal was not found. Please register a new account or connect this principal to an existing account.');
      } else {
        message.error(error.message);
      }
      onLoggedIn(false);
      setPlugLoading(false);
      setIILoading(false);
    }
  };

  const onGetSmsCode = async () => {
    let payload: any = { ...walletPayload }
    try {
      const responseService: any = await authService.getSmsCode(payload);
      const response = await responseService.data;

      if (!response) {
        message.error('There is a problem with sending SMS to your phone. Please try again.');
      }
      setPlugLoading(false);
      setIILoading(false);
    } catch (err) {
      setPlugLoading(false);
      setIILoading(false);
    }
  };

  const verifyPlugWalletConnection = async () => {
    const isConnected = await getPlugWalletIsConnected();
    setIsAuthenticatedPlug(isConnected);

    let principalIdPlug2 = await getPrincipalId();

    /*const delegatedIdentity = await plugWalletProvider.getDelegatedIdentity();

    if (delegatedIdentity) {
      const principal = delegatedIdentity.getPrincipal();
      console.log('Principal ID:', principal.toText()); // `toText()` converts it to a human-readable string
      principalIdPlug2 = principal.toText();
    } else {
      console.error('No delegated identity found.');
    }*/

    setPrincipalIdPlug(principalIdPlug2);
    return principalIdPlug2;
  };

  const handlePlugWalletConnect = async () => {
    setPlugLoading(true);

    try {
      const principal = await verifyPlugWalletConnection();
      const userKey = crypto.randomBytes(64).toString('hex');
      const fetchedResult = await cryptoService.getCanisterHashTokenwithPlugWallet(userKey);
      const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';
      const payload = {
        principal: fetchedResult[1],
        login: true,
        role: '',
        messageSigned: fetchedResult[0],
        publicKeyRaw: userKey,
        principalWallet: principal || principalIdPlug || 'x',
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

        if (response.message === 'SMS or 2FA key is empty') {
          setWalletPayload(payload);
          setEnabled2fa(response.required.enabled2fa);
          setEnabledSms(response.required.enabledSms);

          response.required.enabled2fa ? setIs2FAModalVisible(true) : setIsSmsModalVisible(true);
          return;
        }

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

  const handleSwitchSms2FAChange = async () => {
    setSmsCode('');
    setTwoFACode('');
    if (is2FAModalVisible) {
      setIs2FAModalVisible(false);
      setIsSmsModalVisible(true);
    } else {
      setIsSmsModalVisible(false);
      setIs2FAModalVisible(true);
    }
  }

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

        if (response.message === 'SMS or 2FA key is empty') {
          setWalletPayload(payload);
          setEnabled2fa(response.required.enabled2fa);
          setEnabledSms(response.required.enabledSms);

          response.required.enabled2fa ? setIs2FAModalVisible(true) : setIsSmsModalVisible(true);
          return;
        }

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
  const isMobile = window.innerWidth <= 768;
  return (
    <div>
      <div className={"auth-section"}>
        <div className={"no-auth-button"}>
          <AuthButton from={from} {...authButtonProps} nfidLoading={nfidLoading}/>
        </div>
        <div className="NFIDAuth mb-1">
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
        <TwoFactorModal
          visible={is2FAModalVisible}
          onOk={handle2FASubmit}
          onCancel={() => setIs2FAModalVisible(false)}
          onInputChange={handle2FAInputChange}
          twoFactorError={twoFactorError}
          twoFactorKey={twoFACode}
          showSms2faButton={enabledSms}
          onShowSms2faButtonPress={handleSwitchSms2FAChange}
          isMobile={isMobile}
        />
        <SmsModal
          visible={isSmsModalVisible}
          onOk={handleSubmit2FA}
          onCancel={() => setIsSmsModalVisible(false)}
          smsError={smsError}
          showSms2faButton={enabled2fa}
          onShowSms2faButtonPress={handleSwitchSms2FAChange}
          onGetSmsCode={onGetSmsCode}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}

export { Auth };
