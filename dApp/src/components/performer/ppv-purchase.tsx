import React, { useState, useEffect } from 'react';
import {
  Button, Avatar, Select, message, InputNumber
} from 'antd';
import { IPerformer, IUser, ISettings, IVideo } from 'src/interfaces';
import { connect } from 'react-redux';
import styles from './performer.module.scss';
import { paymentService } from '@services/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { getResponseError } from '@lib/utils';
import { idlFactory as idlFactoryPPV } from '../../smart-contracts/declarations/ppv/ppv.did.js';
import type { _SERVICE as _SERVICE_PPV, Content } from '../../smart-contracts/declarations/ppv/ppv2.did';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

const { Option } = Select;

interface IProps {
  type: string;
  performer: IPerformer;
  onFinish(ticker: string, paymentOption?: string): Function;
  submiting: boolean;
  settings: ISettings;
  user: IUser;
  video: IVideo;
  contentPriceICP: number;
  contentPriceCKBTC: number;
  contentPriceTRAX: number;
  isPriceICPLoading: boolean;
}

const PPVPurchaseModal: React.FC<IProps> = ({
  performer,
  onFinish,
  submiting,
  settings,
  user,
  video,
  contentPriceICP,
  contentPriceCKBTC,
  contentPriceTRAX
}) => {
  const [price, setPrice] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState(video.selectedCurrency ? video.selectedCurrency : 'USD');
  const [paymentOption, setPaymentOption] = useState('noPayment');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNewContent, setIsNewContent] = useState(false);
  const [canPay, setCanPay] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isContentICP, setIsContentICP] = useState(false);

  useEffect(() => {
    setIsNewContent(!!video.selectedCurrency);
    getData();
    checkContentExistsICP();
  }, []);

  useEffect(() => {
    checkPaymentCapability();
  }, [selectedCurrency, cards, user.balance, user.wallet_icp]);

  const getData = async () => {
    try {
      setLoading(true);
      const resp = await paymentService.getStripeCards();
      const fetchedCards = resp.data.data.map((d) => {
        if (d.card) return { ...d.card, id: d.id };
        if (d.three_d_secure) return { ...d.three_d_secure, id: d.id };
        return d;
      });

      setCards(fetchedCards);

      let initialPaymentOption = 'noPayment';
      let initialCurrency = video.selectedCurrency || 'USD';



      if (isNewContent) {
        initialPaymentOption = getDefaultPaymentOption(initialCurrency);
      } else if (initialCurrency === 'USD' && fetchedCards.length > 0) {
        initialPaymentOption = 'card';
      } else if (initialCurrency === 'USD' && user.balance > Number(video.price.toFixed(2))) {
        initialPaymentOption = 'credit';
      } else if (initialCurrency !== 'USD' && user?.wallet_icp) {
        initialPaymentOption = 'plug';
        initialCurrency = 'ICP';
      }


      setPaymentOption(initialPaymentOption);
      setSelectedCurrency(initialCurrency);
      setPrice(getPriceForCurrency(initialCurrency));
    } catch (error) {
      message.error(getResponseError(await error) || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkContentExistsICP = async () => {
    let identity;
    const authClient = await AuthClient.create();
    const ppvCanID = settings.icPPV;
    const host = settings.icHost;
    let agent;
    let ppvActor;

    if (settings.icNetwork !== true) {
      identity = authClient.getIdentity();
      agent = new HttpAgent({
        identity,
        host
      });

      await agent.fetchRootKey();

      ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
        agent,
        canisterId: ppvCanID
      });

      try {
        //@ts-ignore
        let result: Array<Content> = await ppvActor.getContent(video?._id);
        if (result.length > 0 && result[0].price) {
          setIsContentICP(true);
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      identity = authClient.getIdentity();
      agent = new HttpAgent({
        identity,
        host
      });

      ppvActor = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
        agent,
        canisterId: ppvCanID
      });

      // setIsContentICP(true);

      try {
        //@ts-ignore
        let result: Content = await ppvActor.getContent(video?._id);
        if (result[0].price) {
          setIsContentICP(true);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const getDefaultPaymentOption = (currency) => {
    switch (currency) {
      case 'USD':
        return user.balance > video.price ? 'credit' : 'card';
      case 'ICP':
      case 'ckBTC':
      case 'TRAX':
        return 'plug';
      default:
        return 'noPayment';
    }
  };

  const getPriceForCurrency = (currency) => {
    switch (currency) {
      case 'USD':
        return Number(video.price.toFixed(2));
      case 'ICP':
        return contentPriceICP;
      case 'ckBTC':
        return contentPriceCKBTC;
      case 'TRAX':
        return contentPriceTRAX;
      default:
        return 0;
    }
  };

  const checkPaymentCapability = () => {
    let newCanPay = false;
    let newErrorMessage = '';

    const isCryptoCurrency = ['ICP', 'ckBTC', 'TRAX'].includes(selectedCurrency);

    if (isCryptoCurrency && !isContentICP) {
      newErrorMessage = "This artist has disabled the option to pay in crypto";
    } else if (isNewContent) {
      const currency = video.selectedCurrency;
      if (['ICP', 'ckBTC', 'TRAX'].includes(currency)) {
        newCanPay = (!!user.wallet_icp);
        newErrorMessage = newCanPay ? '' : 'Please connect your crypto wallet in Settings to proceed.';
      } else if (currency === 'USD') {
        if(cards.length !> 0){
          newCanPay = false;
          newErrorMessage = 'Please add your card in Settings and proceed to your wallet to purchase credit in order to purchase this content.'
        }else if(cards.length > 0 && user.balance < video.price){
          newCanPay = false;
          newErrorMessage = 'Please add your card in Settings and proceed to your wallet to purchase credit in order to purchase this content.'
        }else if(cards.length > 0 && user.balance >= video.price){
          newCanPay = true;
        }

        newCanPay = cards.length > 0 || user.balance >= video.price;
        newErrorMessage = newCanPay ? '' : 'Please connect a card or add credit to your account.';
      }
    } else {
      if (['ICP', 'ckBTC', 'TRAX'].includes(selectedCurrency)) {
        newCanPay = !!user.wallet_icp;
        newErrorMessage = newCanPay ? '' : 'Please connect your crypto wallet in Settings to proceed.';
      } else if (selectedCurrency === 'USD') {
        newCanPay = cards.length > 0 || user.balance >= video.price;
        newErrorMessage = newCanPay ? '' : 'Please connect a card or add credit to your account.';
      }
    }

    setCanPay(newCanPay);
    setErrorMessage(newErrorMessage);
  };

  const changeCurrency = (val: string) => {
    if (isNewContent) return;

    setSelectedCurrency(val);
    setPaymentOption(getDefaultPaymentOption(val));
    setPrice(getPriceForCurrency(val));
  };

  const changePaymentOption = (val: string) => {
    setPaymentOption(val);
  };

  const renderPaymentOptions = () => {
    const isCryptoCurrency = ['ICP', 'ckBTC', 'TRAX'].includes(selectedCurrency);

    return (
      <>
      {canPay && (
      <Select
        onChange={changePaymentOption}
        value={paymentOption}
        className="payment-type-select"
      >
        {!isCryptoCurrency && cards.length > 0 && (
          <Option value="card" key="card" className="payment-type-option-content">
            <div className='payment-type-img-wrapper'>
              <img src='/static/visa_logo.png' width={50} height={50}/>
            </div>
            <div className='payment-type-info'>
              <span>Card</span>
              <p>{`**** **** **** ${cards[0].last4}`}</p>
            </div>
          </Option>
        )}
        {!isCryptoCurrency && user.balance > 0 && (
          <Option value="credit" key="credit" className="payment-type-option-content">
            <div className='payment-type-img-wrapper'>
              <img src='/static/LogoAlternateCropped.png' style={{borderRadius: 0, width: '48px', height: '36px'}} width={40} height={30}/>
            </div>
            <div className='payment-type-info'>
              <span>TRAX Credit</span>
              <p className='mt-1'>${user.balance.toFixed(2)}</p>
            </div>
          </Option>
        )}
        {isCryptoCurrency && user.wallet_icp && (
          <Option value="plug" key="plug" className="payment-type-option-content">
            <div className='payment-type-img-wrapper'>
              <img src='/static/plug-favicon.png' width={40} height={40}/>
            </div>
            <div className='payment-type-info'>
              <span>Plug wallet</span>
              <p>{`**** **** **** -a3eio`}</p>
              <p>Internet Computer</p>
            </div>
          </Option>
        )}
        {isCryptoCurrency && user.wallet_icp && (
          <Option value="II" key="II" className="payment-type-option-content">
            <div className='payment-type-img-wrapper'>
              <img src='/static/ii-logo.png' width={40} height={40}/>
            </div>
            <div className='payment-type-info'>
              <span>Internet Identity</span>
              <p>{`**** **** **** -****`}</p>
              <p>Internet Computer</p>
            </div>
          </Option>
        )}
      </Select>
      )}
      </>
    );
  };

  const renderCurrencyPicker = () => {
    if (isNewContent) return null;

    return (
      <div className='currency-picker-btns-container'>
        <div className='currency-picker-btns-wrapper'>
          <div className='currency-picker-btn-wrapper' onClick={() => changeCurrency('USD')}>
            <img src='/static/usd-logo.png' width={40} height={40} style={{border: selectedCurrency === 'USD' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
          </div>
          {(user.wallet_icp) && isContentICP && (
            <>
              <div className='currency-picker-btn-wrapper' onClick={() => changeCurrency('ICP')}>
                <img src='/static/icp-logo.png' width={40} height={40} style={{border: selectedCurrency === 'ICP' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
              <div className='currency-picker-btn-wrapper' onClick={() => changeCurrency('ckBTC')}>
                <img src='/static/ckbtc_nobackground.png' width={40} height={40} style={{border: selectedCurrency === 'ckBTC' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
              <div className='currency-picker-btn-wrapper' onClick={() => changeCurrency('TRAX')}>
                <img src='/static/trax-token.png' width={40} height={40} style={{border: selectedCurrency === 'TRAX' ? '1px solid #c8ff02' : '1px solid transparent'}}/>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.componentsPerformerVerificationFormModule}>
      <div className='send-tip-container'>
        <div className='tip-header-wrapper'>
          <span className='font-heading text-center text-[#F2F2F2] text-2xl uppercase'>Unlock content</span>
        </div>

        <div className='payment-details'>
        <p className='text-[#FFFFFF] mb-2'>Pay to</p>
          <div className='payment-recipient-wrapper'>
            <div className='payment-recipient-avatar-wrapper'>
              <Avatar src={performer?.avatar || '/static/no-avatar.png'} />
            </div>
            <div className='payment-recipient-info'>

              <span>{performer?.name}</span>
              <p style={{color: '#FFFFFF50', marginTop:'-0.125rem'}}>Verified Artist</p>
            </div>
            <a href={`/${performer?.username || performer?._id}`} className='info-icon-wrapper'>
              <FontAwesomeIcon style={{color: 'white'}} icon={faCircleInfo} />
            </a>
          </div>

          {renderPaymentOptions()}
        </div>

        {renderCurrencyPicker()}

        <div className='tip-input-number-container'>
          <span>Total</span>
          <div className='tip-input-number-wrapper'>
            {selectedCurrency === 'USD' && <p>$</p>}
            {selectedCurrency === 'ICP' && <img src='/static/icp-logo.png' width={40} height={40}/>}
            {selectedCurrency === 'ckBTC' && <img src='/static/ckbtc_nobackground.png' width={40} height={40}/>}
            {selectedCurrency === 'TRAX' && <img src='/static/trax-token.png' width={40} height={40}/>}

            <InputNumber
              disabled={true}
              type="number"
              stringMode
              step="0.01"
              value={price}
              placeholder="0.00"
              className='tip-input-number'
            />
          </div>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <Button
          className="tip-button"
          disabled={submiting || !canPay || paymentOption === 'noPayment'}
          loading={submiting}
          onClick={() => onFinish(selectedCurrency, paymentOption)}
        >
          Unlock
        </Button>
      </div>
    </div>
  );
};

const mapStates = (state: any) => ({
  settings: { ...state.settings }
});

export default connect(mapStates)(PPVPurchaseModal);