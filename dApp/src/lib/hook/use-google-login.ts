/* eslint-disable react-hooks/exhaustive-deps */
import { loadScript } from 'public/static/lib/load-script';
import { removeScript } from 'public/static/lib/remove-script';
import { useEffect, useState } from 'react';

interface IProps {
  clientId: string;
  onSuccess: Function;
  onFailure: Function;
  onScriptLoadFailure?: Function;
  autoLoad?: boolean;
  jsSrc?: string;
}

const useGoogleLogin = ({
  onSuccess = Function,
  onFailure = Function,
  onScriptLoadFailure,
  clientId,
  autoLoad,
  jsSrc = 'https://accounts.google.com/gsi/client'
}: IProps) => {
  const [loaded, setLoaded] = useState(false);

  function handleSigninSuccess(res) {
    onSuccess(res);
  }

  function signIn(e = null) {
    if (e) {
      e.preventDefault();
    }
    if (loaded) {
      const { google } = window as any;
      google.accounts.id.prompt();
    }
  }

  function renderButtonSignIn(e = null) {
    if (e) {
      e.preventDefault();
    }
    if (loaded) {
      const { google } = window as any;
      google.accounts.id.renderButton(
        document.getElementById('google-render-container'), // Ensure the element exist and it is a div to display correcctly
        { theme: 'outline', size: 'large' } // Customization attributes
      );
    }
  }

  useEffect(() => {
    let unmounted = false;
    const onLoadFailure = onScriptLoadFailure || onFailure;
    loadScript(
      document,
      'script',
      'google-login',
      jsSrc,
      () => {
        const { google } = window as any;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (data) => {
            handleSigninSuccess(data);
          },
          ux_mode: 'popup'
        });
        if (!unmounted) {
          setLoaded(true);
        }
      },
      (err) => {
        onLoadFailure(err);
        console.log("error", err);
      }
    );

    return () => {
      unmounted = true;
      removeScript(document, 'google-login');
    };
  }, []);

  useEffect(() => {
    if (autoLoad) {
      signIn();
    }
  }, [loaded]);

  return { signIn, loaded, renderButtonSignIn };
};

export default useGoogleLogin;
