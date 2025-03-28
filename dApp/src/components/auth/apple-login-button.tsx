import { AppleOutlined } from '@ant-design/icons';
import useAppleLogin from '@lib/hook/use-apple-login';
import { Typography } from 'antd';
import { useEffect, useState } from 'react';
import TraxButton from '@components/common/TraxButton';

const { Text } = Typography;

interface IProps {
  clientId: string;
  redirectUri: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

function AppleLoginButton({ clientId, redirectUri, onSuccess, onFailure }: IProps) {
  const { signIn, loaded, renderButtonSignIn } = useAppleLogin({
    clientId,
    redirectUri,
    onSuccess,
    onFailure,
  });

  const [clickedOnAppleLoginButton, setClicked] = useState(false);
  const [showButtonIfNoCookies, setShowButtonIfNoCookies] = useState(false);

  const loginWithApple = () => {
    setClicked(true);
    signIn();
  };

  useEffect(() => {
    if (loaded && clickedOnAppleLoginButton) {
      renderButtonSignIn();
    }
  }, [loaded, clickedOnAppleLoginButton, renderButtonSignIn]);

  return (
    <div>
      <TraxButton
        htmlType="button"
        styleType="picture"
        buttonSize="auth"
        buttonText="Continue with Apple"
        icon={<img src="/static/apple_black_logo.png" />}
        loading={clickedOnAppleLoginButton}
        disabled={false}
        onClick={loginWithApple}
      />
      {showButtonIfNoCookies && (
        <div className="btn-apple-login-box">
          <Text type="secondary">
            If no prompt appears, click below to authenticate:
          </Text>
          <div id="apple-render-container" className="btn-apple-login" />
        </div>
      )}
    </div>
  );
}

export default AppleLoginButton;
