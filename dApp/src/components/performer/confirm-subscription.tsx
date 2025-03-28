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
import TraxButton from '@components/common/TraxButton';
import TraxToggle from '@components/common/TraxToggleButton';
import AddCard from './add-card';
import StripeExpressSubscription from '../user/stripe-express-checkout/express-checkout-subscriptions';

const ConfirmSubscriptionPerformerForm = ({
  performer,
  onFinish,
  onClose,
  submitting,
  settings,
  user
}) => {
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [price, setPrice] = useState('1');
  const [icpPrice, setIcpPrice] = useState(0);
  const [btcPrice, setBtcPrice] = useState(0);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentOption, setPaymentOption] = useState('noPayment');
  const [showExpress, setShowExpress] = useState(false)

  useEffect(() => {
    getData();
  }, [user]);


  const handlePaymentMethodsAvailable = (methods) => {
    if(methods.applePay || methods.googlePay || methods.link){
      setShowExpress(true)
    }else{
      setShowExpress(false)
    }
  };

  // const setupPrices = async () => {
  //   const authClient = await AuthClient.create();
  //   const ppvCanID = settings.icPPV;
  //   const host = settings.icHost;
  //   const identity = authClient.getIdentity();
  //   const agent = new HttpAgent({ identity, host });

  //   if (settings.icNetwork !== true) {
  //     await agent.fetchRootKey();
  //   }

  //   const ppv = Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
  //     agent,
  //     canisterId: ppvCanID
  //   });

  //   const icp = (await tokenTransctionService.getExchangeRate()).data.rate;
  //   const btc = await ppv.getExchangeRate('BTC');

  //   setIcpPrice(icp);
  //   setBtcPrice(btc);
  //   setIsPriceLoading(false);
  //   showPrice(selectedCurrency, subscriptionType, icp);
  // };

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

  const handleSwitchPeriod = (period) => {
    setSubscriptionType(period);
    showPrice(selectedCurrency, period);
  };

  const handleSubscribe = async () => {
    console.log("in subscribe")
    if (!user._id) {
      message.error('Please log in!');
      return;
    }

    try {
      await onFinish(selectedCurrency, subscriptionType, false);
    } catch (err) {
      message.error(err?.message || 'Subscription failed');
    }
  };

  const afterAddCard = (cards: any, selected: boolean) => {
    setCards(cards);
    setPaymentOption(!selected ? 'noPayment' : 'card');
  }

  const getButtonText = () => {
    if (paymentOption === "noPayment") return "Select payment method";
    if (submitting) return "Processing... please wait";
    return "Subscribe";
  };

  console.log(paymentOption)

  const stripeFeeMonthly = (performer.monthlyPrice * (parseFloat(settings.stripeFeesPercentageAmount) / 100)) + parseFloat(settings.stripeFeesFixedAmount);
  const stripeFeeYearly = (performer.yearlyPrice * (parseFloat(settings.stripeFeesPercentageAmount) / 100)) + parseFloat(settings.stripeFeesFixedAmount);
  const openModal = () => (
    <div className='flex-end rounded-l-lg w-full h-3/4 sm:h-full'>
        <div className='send-tip-container border-none rounded-none gap-8'>
          <div className='tip-header-wrapper pt-4 text-start'>
            <span className='text-trax-white uppercase font-bold font-heading text-4xl'>Subscribe</span>
          </div>
          <TraxToggle
            buttonSize="full"
            leftText="Pay monthly"
            rightText="Pay yearly"
            defaultValue={subscriptionType === 'yearly'}
            onChange={(value) => handleSwitchPeriod(value ? 'yearly' : 'monthly')}
          />
           <div className='sub-preview-container'>
            <div className='sub-preview-wrapper'>
              <span className='sub-price-preview text-font-light-gray font-heading font-bold text-5xl'>
              {selectedCurrency === 'USD' && (
                <span>$</span>
                )}
                {subscriptionType === 'monthly'
                  ? Number(performer.monthlyPrice + stripeFeeMonthly).toFixed(2)
                  : Number(performer.yearlyPrice + stripeFeeYearly).toFixed(2)}
              </span>
              <span className='text-font-light-gray font-heading font-bold text-3xl uppercase align-bottom'>
                /{subscriptionType === 'monthly' ? 'per month': 'per year'}
              </span>
            </div>
            <span className='text-font-gray font-light text-sm mt-1'>
              Fees: ${subscriptionType === 'monthly' ? (stripeFeeMonthly).toFixed(2) : (stripeFeeYearly).toFixed(2)}
            </span>
            {/* <span className='text-font-gray font-light text-sm mt-1'>Cancel at any time</span> */}
          </div>
          {/* {paymentOption === "noPayment" && (
            <div className='text-font-gray text-center font-light text-sm px-8'>
              <span>You must add your card before you can subscribe to this artist. Click
                <a href="/user/account/?tab=subscription"> here</a> to add your card.</span>
            </div>
          )} */}


            <div className={showExpress ? 'block' : 'hidden'}>
              <StripeExpressSubscription
                monthlyPrice={performer.monthlyPrice}
                yearlyPrice={performer.yearlyPrice}
                selectedInterval={subscriptionType}
                settings={settings}
                performerId={performer._id}
                returnUrl={window.location.href}
                onPaymentMethodsAvailable={handlePaymentMethodsAvailable}
                onSuccess={() => {
                  message.success('Payment successful!');
                  onFinish(selectedCurrency, subscriptionType, true);
                }}
                onError={(err) => {
                  message.error(err.message || 'Payment failed');
                }}
              />
              <div className="text-center">
                <div className="flex items-center justify-center gap-0">
                  <hr className="w-full border-t border-trax-gray-500" />
                  <span className="text-trax-gray-300 w-full">{`Or pay with card`}</span>
                  <hr className="w-full border-t border-trax-gray-500" />
                </div>
              </div>
            </div>

          <AddCard
            settings={settings}
            paymentOption={paymentOption}
            user={user}
            onFinish={(cards: any, selected: boolean) => afterAddCard(cards, selected)}
          />




          <TraxButton
            htmlType="button"
            styleType="primary"
            buttonSize="full"
            buttonText={getButtonText()}
            disabled={submitting || paymentOption === "noPayment"}
            loading={submitting}
            onClick={handleSubscribe}
          />
        </div>

      </div>
    );
    return (
      <div className={styles.componentsPerformerVerificationFormModule}>
        <div className='flex min-h-[500px] w-full md:w-[500px]'>
          {openModal()}
        </div>
      </div>
    );
  };

export default ConfirmSubscriptionPerformerForm;