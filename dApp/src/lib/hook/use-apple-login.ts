import { loadScript } from 'public/static/lib/load-script';
import { removeScript } from 'public/static/lib/remove-script';
import { useEffect, useState } from 'react';
//import { SignInWithApple } from '@capacitor-community/apple-sign-in';

interface IProps {
  clientId: string;
  redirectUri: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
  jsSrc?: string;
}

const isMobile = () => {
  return /iPhone|iPad|Android/i.test(navigator.userAgent);
};

const useAppleLogin = ({
  onSuccess,
  onFailure,
  clientId,
  redirectUri,
  jsSrc = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
}: IProps) => {
  const [loaded, setLoaded] = useState(false);
  let SignInWithApple;

  async function signIn() {
    try {
      if (isMobile()) {
        // Dynamically import the module
        if (!SignInWithApple) {
          SignInWithApple = (await import('@capacitor-community/apple-sign-in')).SignInWithApple;
        }

        const response = await SignInWithApple.authorize();
        console.log('Apple Login (Mobile):', response);
        onSuccess(response);
      }
    } catch (error) {
      console.error('Apple Login Failed:', error);
      onFailure(error);
    }
  }

  function renderButtonSignIn() {
    if (!isMobile() && loaded) {
      const { AppleID } = window as any;
      AppleID.auth.renderButton('apple-render-container', {
        type: 'sign-in',
        color: 'black',
        border: false,
        width: 200,
        height: 40,
      });
    }
  }

  useEffect(() => {
    if (!isMobile()) {
      loadScript(
        document,
        'script',
        'apple-login',
        jsSrc,
        () => {
          const { AppleID } = window as any;
          AppleID.auth.init({
            clientId,
            redirectURI: redirectUri,
            scope: 'name email',
            responseType: 'code',
            usePopup: true,
          });
          setLoaded(true);
        },
        (err) => {
          console.error('Failed to load Apple script:', err);
          onFailure(err);
        }
      );

      return () => {
        removeScript(document, 'apple-login');
      };
    } else {
      setLoaded(true);
    }
  }, []);

  return { signIn, loaded, renderButtonSignIn };
};

export default useAppleLogin;
