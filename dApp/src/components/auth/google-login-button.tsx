import { GoogleOutlined } from '@ant-design/icons';
import useGoogleLogin from '@lib/hook/use-google-login';
import { Typography } from 'antd';
import { useEffect, useState } from 'react';
import styles from './google-login-button.module.scss';
import TraxButton from '@components/common/TraxButton';

const { Text } = Typography;

interface IProps {
  clientId: string;
  onSuccess: Function;
  onFailure: Function;
}

function GoogleLoginButton({ clientId, onSuccess, onFailure }: IProps) {
  const { signIn, loaded, renderButtonSignIn } = useGoogleLogin({
    clientId,
    onSuccess,
    onFailure,
    onScriptLoadFailure: onFailure,
  });

  const [clickedOnGoogleLoginButton, setClicked] = useState(false);
  const [showButtonIfNoCookies, setShowButtonIfNoCookies] = useState(false);
  const isLocalhost = process.env.NODE_ENV !== 'production';

  const loginWithGoogle = () => {
    setClicked(true);

    if (loaded) {
      const { google } = window as any;
      // Trigger the Google sign-in prompt directly
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // clear g_state cookie if the pop-up has already been closed
          document.cookie =  `g_state=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
          setShowButtonIfNoCookies(true);
          google.accounts.id.prompt()
        }
      });
    }
  };

  useEffect(() => {
    // Only render the Google button if loaded and clicked
    if (loaded && clickedOnGoogleLoginButton) {
      renderButtonSignIn(); // Render Google button only when needed
    }
  }, [loaded, clickedOnGoogleLoginButton, renderButtonSignIn]);

  const googleIcon = (
    <img src='/static/google.png' alt="Google logo" />
  );

  return (
    <div className={styles.componentsAuthGoogleLoginButtonModule}>
      <TraxButton
        htmlType="button"
        styleType="picture"
        buttonSize="auth"
        buttonText="Continue with Google"
        icon={googleIcon}
        loading={clickedOnGoogleLoginButton}
        disabled={false}
        onClick={() => loginWithGoogle()} // Call loginWithGoogle when clicked
      />
      {showButtonIfNoCookies && (
        <div className="btn-google-login-box">
          <Text type="secondary">
            If no prompt appears, just click the button below to start the authentication flow:
          </Text>
          {/* Container where Google Sign-In button will be rendered */}
          <div id="google-render-container" className="btn-google-login" />
        </div>
      )}
    </div>
  );
}

export default GoogleLoginButton;
