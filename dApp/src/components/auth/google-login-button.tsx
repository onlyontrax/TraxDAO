import { GoogleOutlined } from '@ant-design/icons';
import useGoogleLogin from '@lib/hook/use-google-login';
import { Typography } from 'antd';
import { useEffect, useState } from 'react';
import styles from './google-login-button.module.scss';

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
    onScriptLoadFailure: onFailure
  });

  const [clickedOnGoogleLoginButton, setClicked] = useState(false);

  const loginWithGoogle = () => {
    setClicked(true);
    signIn();
  };

  useEffect(() => {
    if (clickedOnGoogleLoginButton) {
      renderButtonSignIn();
    }
  }, [clickedOnGoogleLoginButton, renderButtonSignIn]);

  return (
    <div className={styles.componentsAuthGoogleLoginButtonModule}>
      <button type="button" disabled={!clientId || !loaded} onClick={() => loginWithGoogle()} className="google-login-button">
        <GoogleOutlined style={{ fontSize: '20px' }} />

      </button>
      {clickedOnGoogleLoginButton && (
        <div className="btn-google-login-box">
          <Text type="secondary">
            If no prompt appears just click the button bellow to start the authentication flow:
          </Text>
          <div id="btnLoginWithGoogle" className="btn-google-login" />
        </div>
      )}
    </div>
  );
}

export default GoogleLoginButton;
