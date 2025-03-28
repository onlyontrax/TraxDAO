import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { message, Progress } from 'antd';
import { IUser, ISettings, IVideo } from 'src/interfaces';
import { connect } from 'react-redux';
import { paymentService, userService, cryptoService } from '@services/index';
import { idlFactory as idlFactoryPPV } from '../../smart-contracts/declarations/ppv/ppv.did.js';
import type { _SERVICE as _SERVICE_PPV } from '../../smart-contracts/declarations/ppv/ppv2.did';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

import TraxButton from 'src/components/common/TraxButton';
import PaymentOptionsSelect from './common/PaymentOptionsSelect';
import { useRouter } from 'next/router';
import AddCard from './add-card';
import { useDispatch } from 'react-redux';
import { AuthConnect } from 'src/crypto/nfid/AuthConnect';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import StripeExpressCheckout from '../user/stripe-express-checkout/express-checkout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CircleCheck } from 'lucide-react';
import { progress } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import PriceBreakdown from '@components/user/price-breakdown';

const SUPPORTED_CURRENCIES = {
  FIAT: ['USD'],
  CRYPTO: ['TRAX']
};

interface IProps {
  onFinish(ticker: string, paymentOption?: string): void;
  submiting: boolean;
  settings: ISettings;
  user: IUser;
  video: IVideo;
  contentPriceTRAX: number;
  progress: number;
  openProgress: boolean;
}

interface IState {
  price: number;
  selectedCurrency: string;
  paymentOption: string;
  loading: boolean;
  isNewContent: boolean;
  errorMessage: string;
  contentExistsOnChain: boolean;
  canPayCrypto: boolean,
  canPayCredit: boolean,
  canPayCard: boolean,
  showStripe: boolean,
}

const PPVPurchaseModal: React.FC<IProps> = ({
  onFinish,
  submiting,
  settings,
  user,
  video,
  contentPriceTRAX,
  progress,
  openProgress
}) => {


  const stripeFee = (Number(video.price.toFixed(2)) * (parseFloat(settings.stripeFeesPercentageAmount) / 100)) + parseFloat(settings.stripeFeesFixedAmount);

  const getPriceForCurrency = useCallback((currency: string) => {
    if (currency === 'USD') {
      if (user?.account?.balance >= video.price) {
        return Number(video.price.toFixed(2));
      }
      const price = Number(video.price.toFixed(2));
      // const stripeFee = (price * (parseFloat(settings.stripeFeesPercentageAmount) / 100)) + parseFloat(settings.stripeFeesFixedAmount);
      return price + stripeFee;
    }
    return currency === 'TRAX' ? contentPriceTRAX : 0;
  }, [user?.account?.balance, video.price, settings.stripeFeesPercentageAmount, settings.stripeFeesFixedAmount, contentPriceTRAX]);


  const getInitialPaymentOption = (currency: string, user: IUser): string => {
    if (currency === 'USD') {
      return (user?.account?.balance >= state.price || cards.length > 0) ? 'credit' : 'noPayment';
    }else if(currency === 'TRAX'){
      return user.account?.wallet_icp ? 'plug' : 'noPayment';
    }else{
      return 'noPayment';
    }
  };

  const initialState = useMemo(() => ({
    price: getPriceForCurrency(video.selectedCurrency || 'USD'),
    selectedCurrency: video.selectedCurrency || 'USD',
    paymentOption: user.account?.wallet_icp ? 'plug' : 'noPayment',
    loading: false,
    canPayCrypto: false,
    canPayCredit: false,
    canPayCard: false,
    errorMessage: '',
    contentExistsOnChain: false,
    showStripe: false
  }), [video.selectedCurrency, user.account?.wallet_icp, getPriceForCurrency]);

  const [state, setState] = useState(initialState);
  const [cards, setCards] = useState([]);
  const [walletNFID, setWalletNFID] = useState<string>(user.account?.wallet_icp || '');


  const dispatch = useDispatch();
  const router = useRouter();
  const InternetIdentityProviderProps: any = cryptoService.getNfidInternetIdentityProviderProps();

  useEffect(() => {
    video.selectedCurrency === 'USD' && getCards();
    video.selectedCurrency === 'TRAX' && checkContentExistsICP();

    const newPaymentOption = getInitialPaymentOption(state.selectedCurrency, user);
    updateState({ paymentOption: newPaymentOption });
    validatePaymentMethod();

  }, [
    state.selectedCurrency,
    user,
    state.price,
    state.canPayCrypto,
    state.canPayCredit,
    state.canPayCard,
  ]);


  const updateState = (newState: Partial<IState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  const onNFIDCopy = (value: string) => {
    setWalletNFID(value);
    // setOpenConnectModal(false);
  };

  const getCards = async () => {
    try {
      const resp = await paymentService.getStripeCards();
      setCards(resp.data.data.map((d) => {
        if (d.card) return { ...d.card, id: d.id };
        if (d.three_d_secure) return { ...d.three_d_secure, id: d.id };
        return d;
      }));
    } catch (error) {
      message.error('An error occurred while fetching cards. Please try again.');
    } finally {
    }
  };




  const changePaymentOption = (val: string) => {
    updateState({ paymentOption: val });
  };


  const addFund = async ({ amount }) => {
    if (settings.paymentGateway === 'stripe' && !user?.stripeCardIds?.length) {
      message.error('Please add a payment card to complete your purchase');
      router.push('/user/account');
      return;
    };

    try {
      updateState({ loading: true  });

      const resp = await paymentService.addFunds({
        paymentGateway: settings.paymentGateway,
        amount,
        couponCode: null
      });

      if (settings.paymentGateway === '-ccbill') {
        window.location.href = resp?.data?.paymentUrl;
      };

      if (resp?.data?.status === 'success') {
        message.success('Payment successful! Your wallet has been topped up.');
        await userService.reloadCurrentUser(dispatch);
      } else {
        message.success('Payment pending! The transaction is taking longer than usual. Please refresh page after few minutes.', 7);
      }

      onFinish(state.selectedCurrency, state.paymentOption)
    } catch (e) {
      message.error(e.message || 'Error occured, please try again later');

      updateState({ loading: false  });
    } finally {
      updateState({ loading: false  });
    };
  };


  const afterAddCard = (cards: any, selected: boolean) => {

    // console.log("afterAddCard: ", cards);
    setCards(cards);

    updateState({ paymentOption: !selected ? 'noPayment' : 'card'});
  }



  const checkContentExistsICP = async () => {
    if (!video?._id) {
      // console.log('No video ID provided');
      return;
    }

    try {
      const actor = await ppvActor;
      if (!actor) {
        // console.log('PPV actor not initialized');
        updateState({
          contentExistsOnChain: false,
          loading: false
        });
        return;
      }

      if (!settings.icHost || !settings.icPPV) {
        // console.log('Missing IC configuration:', { host: settings.icHost, canister: settings.icPPV });
        updateState({
          contentExistsOnChain: false,
          loading: false
        });
        return;
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const contentPromise = actor.getContent(video._id);
      const result = await Promise.race([contentPromise, timeoutPromise]);

      updateState({
        contentExistsOnChain: Array.isArray(result) && result.length > 0 && !!result[0].price,
        loading: false
      });
    } catch (err) {
      // console.error('Error checking ICP content:', err);
      updateState({
        contentExistsOnChain: false,
        loading: false,
        errorMessage: 'Unable to verify crypto payment availability. Please try again later.'
      });
    }
  };


  const ppvActor = useMemo(() => {
    const createPPVActor = async () => {
      try {
        if (!settings.icHost || !settings.icPPV) {
          console.error('Missing IC configuration:', { host: settings.icHost, canister: settings.icPPV });
          return null;
        }

        // Clean and validate the host URL
        let cleanHost = settings.icHost.trim();
        if (!cleanHost.startsWith('http://') && !cleanHost.startsWith('https://')) {
          cleanHost = `https://${cleanHost}`;
        }

        const authClient = await AuthClient.create();
        if (!authClient) {
          throw new Error('Failed to create auth client');
        }

        const identity = authClient.getIdentity();
        if (!identity) {
          throw new Error('No identity available');
        }

        const agent = new HttpAgent({
          identity,
          host: cleanHost,
          fetchOptions: {
            timeout: 30000,
          }
        });

        // Only fetch root key for local development
        if (cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1')) {
          await agent.fetchRootKey();
        }

        return Actor.createActor<_SERVICE_PPV>(idlFactoryPPV, {
          agent,
          canisterId: settings.icPPV
        });
      } catch (error) {
        // console.error('Error creating PPV actor:', error);
        return null;
      }
    };

    return createPPVActor();
  }, [settings.icHost, settings.icNetwork, settings.icPPV]);





  const validatePaymentMethod = useCallback(() => {
    const { selectedCurrency, price } = state;
    const isCryptoCurrency = SUPPORTED_CURRENCIES.CRYPTO.includes(selectedCurrency);
    const isFiat = SUPPORTED_CURRENCIES.FIAT.includes(selectedCurrency);

    const result = {
      canPayCrypto: false,
      canPayCredit: false,
      canPayCard: false,
      errorMessage: ''
    };

    if(isFiat){
      if(user?.account?.balance >= price) {
        result.canPayCredit = true;
      }
      if(cards?.length > 0){
        result.canPayCard = true;
      }else{
        result.canPayCard = false;
        result.errorMessage = 'Please add a valid payment method';
      }
    }


    if (isCryptoCurrency) {
      if (!state.contentExistsOnChain) {
        result.errorMessage = 'Crypto payment only available for ICP content';
      } else if (!user.account?.wallet_icp) {
        result.canPayCrypto = false;
        result.errorMessage = 'Please connect your preferred ICP wallet';
      } else {
        console.log("canPayCrypto = true;")
        result.canPayCrypto = true;
      }
    }

    setState(prev => ({ ...prev, ...result }));
  }, [state.selectedCurrency, state.price, state.contentExistsOnChain, user?.account?.wallet_icp, user?.account?.balance, cards]);


  const handlePaymentMethodsAvailable = (methods) => {
    // methods will be an object like:
    // {
    //   applePay: true|false,
    //   googlePay: true|false,
    //   link: true|false
    // }
    if(methods.applePay || methods.googlePay || methods.link){
      updateState({showStripe: true})
    }else{
      updateState({showStripe: false})
    }
    // Update your UI based on available methods
  };


  const beforeUnlockContent = () => {
    if(state.selectedCurrency === "USD"){
      if(state.paymentOption === "card"){
        addFund({amount: state.price});
      }else if(state.paymentOption === "credit"){
        onFinish(state.selectedCurrency, state.paymentOption);
      }
    }else if(state.selectedCurrency === "TRAX"){
      onFinish(state.selectedCurrency, state.paymentOption);
    }
  }

  const getButtonText = () => {
    if (state.paymentOption === "noPayment") return "Select payment method";
    if (state.loading) return "Processing... please wait";
    return "Unlock";
  };

  const handleDisabled = () => {
    return state.paymentOption === "noPayment" ||
           submiting ||
           state.loading;

  };



 const thumbUrl = useMemo(() =>
    video?.thumbnail?.url ||
    (video?.teaser?.thumbnails && video?.teaser?.thumbnails[0]) ||
    (video?.video?.thumbnails && video?.video?.thumbnails[0]) ||
    '/static/no-image.jpg',
    [video]
  );


  console.log("canPayCrypto: ", state.canPayCrypto);
  return (
    <div className='send-tip-container p-5 overflow-hidden'>
      <div className='relative '>

        <div className='w-full m-auto flex justify-start mb-2'>
          <span className='font-heading text-4xl font-bold uppercase'>Purchase content</span>
        </div>

      </div>
      {/* {state.paymentOption !== "noPayment" && (
        <PaymentOptionsSelect
          mode="ppv"
          loading={state.loading}
          canPay={state.canPay}
          paymentOption={state.paymentOption}
          selectedCurrency={state.selectedCurrency}
          user={user}
          price={state.price}
          onChangePaymentOption={changePaymentOption}
        />
      )} */}

      {state.selectedCurrency === 'USD' && (
        <div className='flex flex-col gap-4'>

            <div className={state.showStripe ? 'block' : 'hidden'}>
              <StripeExpressCheckout
                amount={video.price + stripeFee}
                onSuccess={() => {
                  message.success('Payment successful!');
                  onFinish(state.selectedCurrency, 'card');
                }}
                settings={settings}
                onError={(err) => {
                  message.error(err.message || 'Payment failed');
                }}
                returnUrl={`${process.env.NEXT_PUBLIC_API_ENDPOINT}/${video?.trackType === 'video' ? video?.trackType : 'track'}/?id=${video?.slug}`}
                onPaymentMethodsAvailable={handlePaymentMethodsAvailable}
              />
              <div className="text-center">
                <div className="flex items-center justify-center gap-0">
                  <hr className="w-full border-t border-trax-gray-500" />
                  <span className="text-trax-gray-300 w-full">{`Or pay with ${state.canPayCredit ? "credit" : "card"}`}</span>
                  <hr className="w-full border-t border-trax-gray-500" />
                </div>
              </div>
            </div>

              {state.canPayCredit ? (
                <div onClick={() => updateState({paymentOption: "credit"})} className={`cursor-pointer  bg-custom-gray rounded-lg py-2 px-2 flex flex-row items-center gap-4 rounded-lg ${state.paymentOption === "credit" && 'border-custom-green border'}`}>
                  <div className='rounded-full border border-[#6b6b6b]'>
                    <img
                      src={'/static/credit.png'}
                      className='w-12 h-12'
                      alt="TRAX logo"
                    />
                  </div>
                  <div className='payment-type-info'>
                    <span className='currency-name'>Credit</span>
                    <p className='currency-amount'>{user?.account?.balance.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <AddCard
                  settings={settings}
                  user={user}
                  initialAmount={video.price}
                  onFinish={(cards: any, selected: boolean) => afterAddCard(cards, selected)}
                />
              )}
        </div>
      )}

      {(Capacitor.isNativePlatform() && state.selectedCurrency === "TRAX") && (
        <div>
          <span>This content is currently unavailable for purchase in the app.</span>
        </div>
      )}

      {(state.selectedCurrency === "TRAX" && !state.canPayCrypto && !Capacitor.isNativePlatform()) && (
        <div className='flex flex-row gap-2 w-full'>
        <div onClick={() => changePaymentOption("plug")} className={`cursor-pointer  bg-custom-gray rounded-lg py-2 px-2 flex flex-row items-center gap-4 rounded-lg w-1/2 ${state.paymentOption === "plug" ? 'border-custom-green border' : 'border-trax-transparent border'}`}>
          <div className='rounded-full border border-[#6b6b6b]'>
            <img src='/static/plug-favicon.png' className='border border-[#6b6b6b] rounded-full w-12 h-12' alt="Plug wallet"/>
          </div>
          <div className='flex flex-col p-0 mt-0 w-fit'>
            <span className='text-sm text-font-light-gray font-medium'>Plug</span>
            <p className='text-xs text-font-gray font-medium my-0'>{`${user.account?.wallet_icp.slice(0, 6)} **** ${user.account?.wallet_icp.slice(-4)}`}</p>
          </div>
        </div>
        <div onClick={() => changePaymentOption("II")} className={`cursor-pointer  bg-custom-gray rounded-lg py-2 px-2 flex flex-row items-center gap-4 rounded-lg w-1/2 ${state.paymentOption === "II" ? 'border-custom-green border' : 'border-trax-transparent border'}`}>
          <div className='rounded-full border border-[#6b6b6b]'>
            <img src='/static/icp-logo.png' className='border border-[#6b6b6b] p-1 rounded-full w-12 h-12' alt="Internet Identity"/>
          </div>
          <div className='flex flex-col p-0 mt-0 w-fit'>
            <span className='text-sm text-font-light-gray font-medium'>Internet Identity</span>
            <p className='text-xs text-font-gray font-medium my-0'>{`${user.account?.wallet_icp.slice(0, 6)} **** ${user.account?.wallet_icp.slice(-4)}`}</p>
          </div>
        </div>
      </div>
      )}

      <div className='payment-number-container'>
        <div className='flex flex-row w-full justify-between'>
          <span>Total:</span>
          <div className='payment-number-wrapper'>
            {state.selectedCurrency === 'USD' && <p>
              {/* <img src="/static/credit.png" alt={`${state.selectedCurrency} logo`} className="w-12 h-12 rounded-full -mt-[0.1rem] mr-1.5" /> */}
              $
            </p>}
            {state.selectedCurrency === 'TRAX' &&
              <p>
                <img src="/static/logo_96x96.png" alt={`${state.selectedCurrency} logo`} className="w-16 h-16 rounded-full -mt-2.5 mr-1.5" />
              </p>
            }
            <p>{state.price.toFixed(2)}</p>
          </div>
        </div>
        {state.selectedCurrency === 'TRAX' && (
          <div className='w-full justify-end flex '>
            <div className='text-sm font-light font-body justify-end w-fit px-2 rounded-full text-custom-green tracking-[0.01rem] border border-custom-green/50 bg-custom-green/20 flex flex-row normal-case gap-x-2'>
              <span className=''>Approximately: </span>
              <span className=''>${video.price}</span>
            </div>
          </div>

        )}
        {state.selectedCurrency === 'USD' && (
          <div className='w-full flex flex-row justify-between font-body text-sm normal-case font-light tracking-normal'>
            <span className=''>Fee </span>
            <span className=''>${stripeFee.toFixed(2)}</span>
          </div>
        )}
      </div>
        

        
      




      {openProgress ? (
        <div className='flex w-full mx-auto mt-4'>
          <Progress percent={Math.round(progress)} />
        </div>
      ) : null }


      <TraxButton
        htmlType="button"
        styleType="primary"
        buttonSize="full"
        buttonText={getButtonText()}
        disabled={handleDisabled()}
        loading={submiting}
        onClick={() => beforeUnlockContent()}
      />
    </div>
  );
};

const mapStates = (state: { settings: ISettings }) => ({
  settings: { ...state.settings }
});

export default connect(mapStates)(PPVPurchaseModal);
