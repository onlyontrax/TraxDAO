/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/require-default-props */
/* eslint-disable react/sort-comp */
import { PureComponent } from 'react';
// import PlugConnect from '@psychedelic/plug-connect';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
// import { payments_backend } from "../../smart-contracts/payments_backend";
import { BadgeCheckIcon } from '@heroicons/react/solid';
import { IPerformer } from '@interfaces/index';
import { tokenTransctionService, cryptoService } from '@services/index';
import { connect } from 'react-redux';
import { attachNfidLogout, loginNfid } from '@redux/auth/actions';
import {
  InputNumber, Button, Avatar, Select, Image, Input
} from 'antd';
import Link from 'next/link'
import styles from './performer.module.scss';
import { NFIDIcon } from '../../icons/index';
import {BsFillEnvelopeFill} from 'react-icons/bs'
import { Auth } from 'src/crypto/nfid/Auth';

const { Option } = Select;

interface IProps {
  store: any;
  loginNfid: Function;
  onFinish(isOpen: boolean, modal: string): Function;
}

class SignUpModal extends PureComponent<IProps> {
  state = {
    price: null,
    type: 'fiat',
    btnText: 'Send',
    btnTipDisabled: false,
    currencies: [
      { name: 'USD', imgSrc: '/static/usd-logo.png', key: 'USD' },
      { name: 'ICP', imgSrc: '/static/icp-logo.png', key: 'ICP' },
      { name: 'ckBTC', imgSrc: '/static/ckbtc_nobackground.svg', key: 'ckBTC' }
    ],
    selectedCurrency: 'USD',
    icpPrice: 0,
    ckbtcPrice: 0
  };

  async componentDidMount() {
    const icpPrice = (await tokenTransctionService.getExchangeRate()).data.rate;
    const ckbtcPrice = (await tokenTransctionService.getExchangeRateBTC()).data.rate;

    this.setState({icpPrice: icpPrice, ckbtcPrice: ckbtcPrice})
  }

  onNFIDLogin(resp: any) {
    const { loginNfid: loginNfidHandle } = this.props;
    return cryptoService.onNFIDLogin(resp, 'sign-up', loginNfidHandle);
  }

  onChangeValue(price) {
    this.setState({ price });
  }

  changeTicker(val: any) {
    this.setState({ selectedCurrency: val });
  }

  selectAfter = (
    <Select onChange={(v) => this.changeTicker(v)} defaultValue="USD" className="tip-currency-wrapper">
      <Option value="USD" key="USD" label="USD">
        <Image preview={false} alt="currency_flag" className="currency-flag" src="/static/usd-logo.png" width="20px" />
        {' '}
        <span className="currency-symbol">USD</span>
      </Option>
      <Option value="ICP" key="ICP" label="ICP">
        <Image preview={false} alt="currency_flag" className="currency-flag" src="/static/icp-logo.png" width="20px" height="20px" />
        {' '}
        <span className="currency-symbol">ICP</span>
      </Option>
      <Option value="ckBTC" key="ckBTC" label="ckBTC">
        <Image preview={false} alt="currency_flag" className="currency-flag" src="/static/ckbtc_nobackground.svg" height="30" width="30" />
        {' '}
        <span className="currency-symbol">ckBTC</span>
      </Option>
    </Select>
  );

  render() {
    const {
      price, selectedCurrency, btnText, icpPrice, ckbtcPrice
    } = this.state;
    return (
      <div className="sign-in-container">
        <div className='sign-in-logo'>
            <img src="/static/LogoAlternate.png" width="100px" alt="Loading..."/>
        </div>
        <div className='sign-in-header'>
            <span>Create a TRAX account</span>
            <p>Better with web3 options</p>
        </div>

        <div className='sign-in-options-wrapper'>
        <span className='sign-in-options-header'>Sign up with: </span>
            <div className='sign-in-option' onClick={()=> this.props.onFinish(false, 'email')}>
                <BsFillEnvelopeFill className='envelope-icon'/>
                <span>Email</span>
            </div>
          <InternetIdentityProvider
            {...cryptoService.getNfidInternetIdentityProviderProps(this.onNFIDLogin.bind(this))}
          >
            <Auth from="sign-up" />
          </InternetIdentityProvider>
        </div>
        <div className='divider'>
           <div className='hr-line'/> <span>Or</span> <div className='hr-line'/>
        </div>
        <div className='log-in-link'>
            <span className='new-to'>Already have a TRAX account? </span> <span onClick={()=> this.props.onFinish(false, 'login')} className='get-started'>Log in →</span>
        </div>

        <div className='sign-in-tc'>
            <span className='new-to'>By proceeding, you agree to the <Link href="/page?id=terms-of-service" target="_blank" className='get-started'>Terms and Conditions</Link> and <Link href="/page?id=privacy-policy" target="_blank" className='get-started'>Privacy Policy</Link></span> 
        </div>
      </div>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui },
  settings: { ...state.settings },
  loginAuth: { ...state.auth.loginAuth },
  store: { ...state }
});

const mapDispatchToProps = {
  loginNfid
};

export default connect(mapStatesToProps, mapDispatchToProps)(SignUpModal);
