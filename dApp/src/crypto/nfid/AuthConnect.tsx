import { useEffect, useState } from "react";
import { CopyOutlined } from '@ant-design/icons';
import { useInternetIdentity } from '@internet-identity-labs/react-ic-ii-auth';
import { Button, message } from 'antd';
import { userService, cryptoService, performerService, authService, accountService } from '@services/index';
import * as crypto from 'crypto';
import { NFIDIcon } from '../../icons/index';
import AuthButton from './AuthButton';
import InternetIdentity from './InternetIdentity';
import AuthPlugWallet from './AuthPlugWallet';
import { getPlugWalletIsConnected, getPlugWalletAgent, getPlugWalletProvider, getPrincipalId } from '../mobilePlugWallet';

function AuthConnect({ onNFIDConnect, isPerformer, oldWalletPrincipal }) {
  const {
    signout, authenticate, isAuthenticated, identity
  } = useInternetIdentity();
  const [isAuthenticatedPlug, setIsAuthenticatedPlug] = useState(false);
  const [principalIdPlug, setPrincipalIdPlug] = useState('');
  const [principalId, setPrincipalId] = useState('');
  const [plugLoading, setPlugLoading] = useState(false);
  const [nfidLoading, setNFIDLoading] = useState(false);
  const [iiLoading, setIILoading] = useState(false);
  const [nfidAuthenticateInnitiated, setNfidAuthenticateInnitiated] = useState(false);

  const verifyPlugWalletConnection = async () => {
    const isConnected = await getPlugWalletIsConnected();
    setIsAuthenticatedPlug(isConnected);

    const principalIdPlug2 = await getPrincipalId();
    setPrincipalIdPlug(principalIdPlug2);
    return principalIdPlug2;
  };

  const handleNFIDConnect = async () => {
    const userKey = crypto.randomBytes(64).toString('hex');
    const fetchedResult = await cryptoService.getCanisterHashToken(identity, userKey);
    const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';

    const payload = {
      principal: fetchedResult[1],
      login: true,
      role: '',
      messageSigned: fetchedResult[0],
      publicKeyRaw: userKey,
      principalWallet: identity?.getPrincipal().toText(),
      referralCode,
      walletType: 'nfid'
    };
    if (payload.principal === oldWalletPrincipal) {
      message.success('Wallet Principal you are trying to set is the same.');
      return;
    }

    accountService.setWalletPrincipal(payload).then(val => {
        message.success('Wallet Principal has been set.');
        onNFIDConnect(identity?.getPrincipal().toText());
      }).catch(err => { message.error('There was a problem in updating your wallet principal.'); });
  };

  const handlePlugWalletConnect = async () => {
    setPlugLoading(true);
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
    if (payload.principal === oldWalletPrincipal) {
      message.success('Wallet Principal you are trying to set is the same.');
      return;
    }

    accountService.setWalletPrincipal(payload).then(val => {
      message.success('Wallet Principal has been set.');
      onNFIDConnect(payload.principal);
      setPlugLoading(false);
    }).catch(err => {
      console.log(err)
      setPlugLoading(false);
      message.error('There was a problem in updating your wallet principal.');
    });
  };

  const handleInternetIdentityConnect = async (internetIdentity) => {
    setIILoading(true);
    const userKey = crypto.randomBytes(64).toString('hex');
    const fetchedResult = await cryptoService.getCanisterHashToken(internetIdentity, userKey);
    const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : '';

    const payload = {
      principal: fetchedResult[1],
      login: true,
      role: '',
      messageSigned: fetchedResult[0],
      publicKeyRaw: userKey,
      principalWallet: principalIdPlug || 'x',
      referralCode,
      walletType: 'internetIdentity'
    };
    if (payload.principal === oldWalletPrincipal) {
      message.success('Wallet Principal you are trying to set is the same.');
      return;
    }

    accountService.setWalletPrincipal(payload).then(val => {
      message.success('Wallet Principal has been set.');
      onNFIDConnect(payload.principal);
      setIILoading(false);
    }).catch(err => { message.error('There was a problem in updating your wallet principal.'); setIILoading(false); });
  };

  useEffect(() => {
    // This effect will run whenever isAuthenticated changes
    if (isAuthenticated && nfidAuthenticateInnitiated) {
      handleNFIDConnect();
    }
  }, [isAuthenticated]);

  const handleAuthenticate = () => {
    if (isAuthenticated) {
      handleNFIDConnect();
    } else {
      authenticate();
      setNfidAuthenticateInnitiated(true);
    }
  };

  const handleSignOut = () => {
    signout();
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', marginTop: '0.2rem', gap: '10px'}}>
      {/* <div className="NFIDAuth">
        <AuthButton from="sign-up" onSignOut={handleSignOut} onAuthenticate={handleAuthenticate} />
      </div> */}
      <div className="NFIDAuth">
        <AuthPlugWallet
          isAuthenticated={isAuthenticatedPlug}
          handlePlugWalletConnect={handlePlugWalletConnect}
          currentPrincipal={principalIdPlug}
          plugLoading={plugLoading}
          onSignOut={() => {}}
          onConnect={handlePlugWalletConnect}
          isLogin={false}
          from="sign-up"
        />
      </div>
      <div className="NFIDAuth">
        <InternetIdentity
          isAuthenticated={false}
          handleConnect={handleInternetIdentityConnect}
          principalId={principalId}
          iiLoading={iiLoading}
          onSignOut={() => {}}
          onConnect={() => {}}
          isLogin={false}
          from="sign-up"
        />
      </div>
    </div>
  );
}

export { AuthConnect };
