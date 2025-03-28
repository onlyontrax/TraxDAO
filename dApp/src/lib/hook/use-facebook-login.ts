/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';

interface IProps {
  appId: string;
  onSuccess: Function;
  onFailure: Function;
}

const useFacebookLogin = ({ appId, onSuccess, onFailure }: IProps) => {
  const [loaded, setLoaded] = useState(false);

  const loadFacebookSDK = (callback: Function) => {
    if (document.getElementById('facebook-jssdk')) {
      if ((window as any)?.FB) {
        callback();
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.onload = () => {
      //if (callback) callback();
      (window as any).fbAsyncInit = () => {
        initializeFacebookSDK();
        callback();
      };
    };
    document.body.appendChild(script);
  };

  const initializeFacebookSDK = () => {
    (window as any)?.FB?.init({
      appId,
      autoLogAppEvents: true,
      xfbml: true,
      version: 'v15.0',
    });
    setLoaded(true);
  };

  const signIn = () => {
    if (window.location.hostname === 'localhost') {
      console.warn("Facebook login is disabled on localhost.");
      onFailure(new Error("Facebook login is disabled on localhost."));
      return;
    }

    if (!loaded || !(window as any)?.FB) {
      console.error("Facebook SDK is not loaded yet.");
      onFailure(new Error("Facebook SDK is not loaded or unavailable."));
      return;
    }

    try {
      (window as any)?.FB?.login(
        (response: any) => {
          if (response.authResponse) {
            onSuccess(response.authResponse);
          } else {
            onFailure(new Error('User cancelled login or did not fully authorize.'));
          }
        },
        { scope: 'public_profile,email' }
      );
    } catch (error) {
      console.error("Facebook login failed:", error);
      onFailure(error);
    }
  };


  const renderButtonSignIn = () => {
    // Custom logic for a rendered button (optional)
    if (loaded) {
      const container = document.getElementById('facebook-render-container');
      if (container) {
        container.innerHTML = ''; // Clear container
        (window as any)?.FB?.XFBML.parse(container);
      }
    }
  };

  useEffect(() => {
    loadFacebookSDK(() => {
      if (document.getElementById('facebook-jssdk')) {
        if ((window as any)?.FB) {
          initializeFacebookSDK();
        }
      }
    });

    return () => {
      const script = document.getElementById('facebook-jssdk');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return { signIn, loaded, renderButtonSignIn };
};

export default useFacebookLogin;
