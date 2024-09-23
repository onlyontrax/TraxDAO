import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, InputNumber, message } from 'antd';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { tokenTransctionService, paymentService } from '@services/index';
import { getResponseError } from '@lib/utils';
import { idlFactory as idlFactoryPPV } from '../../smart-contracts/declarations/ppv/ppv.did.js';
import type { _SERVICE as _SERVICE_PPV } from '../../smart-contracts/declarations/ppv/ppv2.did';
import styles from './performer.module.scss';

const ConfirmSubscriptionPerformerForm = ({
  performer,
  onFinish,
  onClose,
  submitting,
  settings,
  user
}) => {
  const [stage, setStage] = useState('1');
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [price, setPrice] = useState('1');
  const [icpPrice, setIcpPrice] = useState(0);
  const [btcPrice, setBtcPrice] = useState(0);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentOption, setPaymentOption] = useState('noPayment');

  useEffect(() => {
    const initializeComponent = async () => {
      await getData();
      setPrice((performer?.monthlyPrice || 0).toFixed(2));
      await setupPrices();
    };

    initializeComponent();
  }, []);

  const setupPrices = async () => {
    const authClient = await AuthClient.create();
    const ppvCanID = settings.icPPV;
    const host = settings.icHost;
    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity, host });

    if (settings.icNetwork !== true) {
      await agent.fetchRootKey();
    }

    const ppv = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
      agent,
      canisterId: ppvCanID
    });

    const icp = (await tokenTransctionService.getExchangeRate()).data.rate;
    const btc = await ppv.getExchangeRate('BTC');

    setIcpPrice(icp);
    setBtcPrice(btc);
    setIsPriceLoading(false);
    showPrice(selectedCurrency, subscriptionType, icp);
  };

  const getData = async () => {
    try {
      setLoading(true);
      const resp = await paymentService.getStripeCards();
      if (resp.data.data.length > 0) {
        setPaymentOption('card');
      }
      setCards(resp.data.data.map((d) => ({
        ...(d.card || d.three_d_secure || d),
        id: d.id
      })));
    } catch (error) {
      message.error(getResponseError(await error) || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showPrice = (currency, subType, icp = icpPrice) => {
    const priceOfSub = subType === 'monthly' ? performer.monthlyPrice : performer.yearlyPrice;
    let newPrice;

    switch (currency) {
      case 'USD':
        newPrice = priceOfSub.toFixed(2);
        break;
      case 'ICP':
        newPrice = (priceOfSub / icp).toFixed(2);
        break;
      case 'ckBTC':
        newPrice = (priceOfSub / btcPrice).toFixed(2);
        break;
      default:
        newPrice = priceOfSub.toFixed(2);
    }

    setPrice(newPrice);
  };

  const handleSwitchPeriod = (value) => {
    setSubscriptionType(value);
    showPrice(selectedCurrency, value);
  };

  const renderStage1 = () => (
    <div className='flex flex-col gap-3 rounded-l-lg w-full h-3/5 sm:w-[55%] sm:h-full p-10'>
      <div className='flex'>
        <span className='flex-start flex text-trax-white text-xl font-extrabold'>Join the {performer.name} fan club</span>
      </div>
      <div className='flex-start flex text-trax-neutral-300 font-light mb-2'>
        {performer.subBenefits || 'Subscribe to get access to members only content'}
      </div>
      <div className='flex flex-row gap-4'>
        <Button
          className="tip-button w-[120px] bg-[#F0F0F0] text-trax-black"
          onClick={() => onClose(false)}
        >
          Maybe later
        </Button>
        <Button
          className="tip-button w-[120px] bg-[#b527d7] text-trax-white"
          onClick={() => setStage('2')}
        >
          Subscribe
        </Button>
      </div>
    </div>
  );

  const renderStage2 = () => (
    <div className='flex-end rounded-l-lg w-full h-3/4 sm:w-[55%] sm:h-full'>
      <div className='send-tip-container border-none rounded-none gap-6'>
        <div className='tip-header-wrapper pt-6'>
          <span>Subscribe</span>
        </div>

        <div className='sub-type-togal-container'>
          {['monthly', 'yearly'].map((type) => (
            <div
              key={type}
              className='sub-type-togal-wrapper'
              style={{background: subscriptionType === type ? '#FFFFFF10' : '#0E0E0E25'}}
              onClick={() => handleSwitchPeriod(type)}
            >
              <span>Pay {type}</span>
            </div>
          ))}
        </div>

              <div className='sub-preview-container'>
                <div className='sub-preview-wrapper'>
                  <span className='sub-price-preview'>
                    ${subscriptionType === 'monthly' ? Number(performer.monthlyPrice).toFixed(2) : Number(performer.yearlyPrice).toFixed(2)}
                  </span>
                  <span className='sub-per-type'>{subscriptionType === 'monthly' ? 'per month': 'per year'}</span>
                </div>
                <span className='sub-cancel-note'>Cancel at any time</span>
              </div>

              <div className='tip-input-number-container'>
                <span className='content-center text-lg'>Total:</span>
                <div className='tip-input-number-wrapper'>
                  {selectedCurrency === 'USD' && (
                    <p>$</p>
                  )}

                  <InputNumber
                    disabled={true}
                    value={subscriptionType === 'monthly' ? performer.monthlyPrice : performer.yearlyPrice}
                    stringMode
                    step="0.01"
                    placeholder="0.00"
                    className='tip-input-number'
                  />
                </div>
              </div>

              {paymentOption === "noPayment" && (
                <div className='bg-custom-gray text-trax-white rounded-md p-2'>
                  <span>You must add your card before you can subscribe to this artist. Click
                    <a href="/user/account/?tab=subscription"> here</a> to add your card.</span>
                </div>
              )}

              <Button
                  className="tip-button"
                  disabled={submitting || paymentOption === "noPayment"}
                  loading={submitting}
                  onClick={() => onFinish(selectedCurrency, subscriptionType)}
                >
                  Subscribe
                </Button>
            </div>
          </div>
    );
    return (
      <div className={styles.componentsPerformerVerificationFormModule}>
        <div className='flex flex-col sm:flex-row gap-0 min-h-[500px]'>
          <div className='flex flex-start rounded-l-lg w-full h-[200px] sm:h-full sm:w-[45%]' >
            <div
              style={{backgroundImage: `url("${performer.avatar}")`}}
              className='bg-center inset-0 absolute w-full h-[200px] sm:h-full sm:w-[45%] bg-no-repeat bg-cover'
            />
          </div>
          {stage === '1' ? renderStage1() : renderStage2()}
        </div>
      </div>
    );
  };

export default ConfirmSubscriptionPerformerForm;