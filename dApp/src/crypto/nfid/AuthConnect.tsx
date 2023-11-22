import { useEffect, useState } from "react";
import { CopyOutlined } from '@ant-design/icons';
import { useInternetIdentity } from '@internet-identity-labs/react-ic-ii-auth';
import { Button, message } from 'antd';
import { userService, cryptoService, performerService, authService } from '@services/index';
import * as crypto from 'crypto';
import { NFIDIcon } from '../../icons/index';
import AuthButton from './AuthButton';
import InternetIdentity from './InternetIdentity';
import AuthPlugWallet from './AuthPlugWallet';

function AuthConnect({ onNFIDConnect, isPerformer, oldWalletPrincipal }) {
  const {
    signout, authenticate, isAuthenticated, identity
  } = useInternetIdentity();
  const [isAuthenticatedPlug, setIsAuthenticatedPlug] = useState(false);
  const [principalIdPlug, setPrincipalIdPlug] = useState('');
  const [principalId, setPrincipalId] = useState('');

  const verifyPlugWalletConnection = async () => {
    // @ts-ignore
    const isConnected = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug.isConnected() : false;
    setIsAuthenticatedPlug(isConnected);

    // @ts-ignore
    const principalIdPlug2 = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug?.agent?.getPrincipal() : '';
    setPrincipalIdPlug(principalIdPlug2);
  };

  useEffect(() => {
    verifyPlugWalletConnection();
  }, []);

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
      referralCode
    };
    if (payload.principal === oldWalletPrincipal) {
      message.success('Wallet Principal you are trying to set is the same.');
      return;
    }

    if (isPerformer) {
      performerService.setWalletPrincipal(payload).then(val => {
        message.success('Wallet Principal has been set.');
        onNFIDConnect(identity?.getPrincipal().toText());
      }).catch(err => { message.error('There was a problem in updating your wallet principal.'); });
    } else {
      userService.setWalletPrincipal(payload).then(val => {
        message.success('Wallet Principal has been set.');
        onNFIDConnect(identity?.getPrincipal().toText());
      }).catch(err => { message.error('There was a problem in updating your wallet principal.'); });
    }
  };

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
    if (payload.principal === oldWalletPrincipal) {
      message.success('Wallet Principal you are trying to set is the same.');
      return;
    }

    if (isPerformer) {
      performerService.setWalletPrincipal(payload).then(val => {
        message.success('Wallet Principal has been set.');
        onNFIDConnect(payload.principal);
      }).catch(err => { message.error('There was a problem in updating your wallet principal.'); });
    } else {
      userService.setWalletPrincipal(payload).then(val => {
        message.success('Wallet Principal has been set.');
        onNFIDConnect(payload.principal);
      }).catch(err => { message.error('There was a problem in updating your wallet principal.'); });
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
      principalWallet: principalIdPlug || 'x',
      referralCode
    };
    if (payload.principal === oldWalletPrincipal) {
      message.success('Wallet Principal you are trying to set is the same.');
      return;
    }

    if (isPerformer) {
      performerService.setWalletPrincipal(payload).then(val => {
        message.success('Wallet Principal has been set.');
        onNFIDConnect(payload.principal);
      }).catch(err => { message.error('There was a problem in updating your wallet principal.'); });
    } else {
      userService.setWalletPrincipal(payload).then(val => {
        message.success('Wallet Principal has been set.');
        onNFIDConnect(payload.principal);
      }).catch(err => { message.error('There was a problem in updating your wallet principal.'); });
    }
  };

  const handleAuthenticate = () => {
    authenticate();
  };

  const handleSignOut = () => {
    signout();
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', marginTop: '0.2rem', gap: '10px'}}>
      {isAuthenticated && (
      <div>
        <div className="NFIDConnect">
          <Button onClick={handleNFIDConnect} htmlType="button" type="primary" className="nfid-connect-button">
            <span>Set NFID Principal</span>
&nbsp;
            <CopyOutlined className="nfid-icon" />
          </Button>
        </div>
      </div>
      )}
      {!isAuthenticated && (
        <div className="NFIDAuth">
          <AuthButton from={"sign-up"} onSignOut={handleSignOut} onAuthenticate={handleAuthenticate} />
        </div>
      )}
      <div className="NFIDAuth">
        <AuthPlugWallet
          isAuthenticated={isAuthenticatedPlug}
          handlePlugWalletConnect={handlePlugWalletConnect}
          currentPrincipal={principalIdPlug}
          onSignOut={() => {}}
          onConnect={() => {}}
          isLogin={false}
          from={"sign-up"}
        />
      </div>
      <div className="NFIDAuth">
        <InternetIdentity
          isAuthenticated={false}
          handleConnect={handleInternetIdentityConnect}
          principalId={principalId}
          onSignOut={() => {}}
          onConnect={() => {}}
          isLogin={false}
          from={"sign-up"}
        />
      </div>
    </div>
  );
}

export { AuthConnect };
