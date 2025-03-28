import { FacebookOutlined } from '@ant-design/icons';
import useFacebookLogin from '@lib/hook/use-facebook-login';
import { Typography } from 'antd';
import { useEffect, useState } from 'react';
import TraxButton from '@components/common/TraxButton';

const { Text } = Typography;

interface IProps {
  appId: string;
  onSuccess: Function;
  onFailure: Function;
}

function FacebookLoginButton({ appId, onSuccess, onFailure }: IProps) {
  const { signIn, loaded, renderButtonSignIn } = useFacebookLogin({
    appId,
    onSuccess,
    onFailure,
  });

  const [clickedOnFacebookLoginButton, setClicked] = useState(false);
  const [showButtonIfNoCookies, setShowButtonIfNoCookies] = useState(false);

  const loginWithFacebook = () => {
    setClicked(true);
    if (loaded) {
      signIn();
    }
  };

  useEffect(() => {
    if (loaded && clickedOnFacebookLoginButton) {
      renderButtonSignIn();
    }
  }, [loaded, clickedOnFacebookLoginButton, renderButtonSignIn]);

  const facebookIcon = (
    <img src="/static/facebook.png" alt="Facebook logo" />
  );

  return (
    <div>
      <TraxButton
        htmlType="button"
        styleType="facebook"
        buttonSize="auth"
        buttonText="Continue with Facebook"
        icon={facebookIcon}
        loading={clickedOnFacebookLoginButton}
        disabled={false}
        onClick={loginWithFacebook}
      />
      {showButtonIfNoCookies && (
        <div className="btn-facebook-login-box">
          <Text type="secondary">
            If no prompt appears, click the button below to start the authentication flow:
          </Text>
          {/* Container where Facebook Sign-In button will be rendered */}
          <div id="facebook-render-container" className="btn-facebook-login" />
        </div>
      )}
    </div>
  );
}

export default FacebookLoginButton;
