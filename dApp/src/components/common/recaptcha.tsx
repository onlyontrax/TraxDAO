import { PureComponent, createRef } from 'react';
import { ISettings } from 'src/interfaces';
import ReCAPTCHA from 'react-google-recaptcha';
import { utilsService } from '@services/index';

interface IProps {
  settings: ISettings;
  handleVerify: Function;
}

export class GoogleReCaptcha extends PureComponent<IProps> {
  recaptchaRef: any;

  componentDidMount() {
    if (!this.recaptchaRef) {
      this.recaptchaRef = createRef();
    }
  }

  async handleVerifyCapcha(token: string) {
    const { handleVerify } = this.props;
    if (token) {
      const resp = await utilsService.verifyRecaptcha(token);
      handleVerify(resp);
    } else {
      handleVerify({ success: false });
    }
  }

  render() {
    const { settings } = this.props;
    if (!this.recaptchaRef) {
      this.recaptchaRef = createRef();
    }
    return (
      <div className="recaptcha-box">
        {settings?.enableGoogleReCaptcha && (
        <ReCAPTCHA
          ref={this.recaptchaRef}
          sitekey={settings?.googleReCaptchaSiteKey}
          onChange={this.handleVerifyCapcha.bind(this)}
        />
        )}
      </div>
    );
  }
}
