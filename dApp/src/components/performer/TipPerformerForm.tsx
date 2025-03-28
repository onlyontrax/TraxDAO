import React, { useState, useEffect, useCallback } from 'react';
import { InputNumber, message, Progress } from 'antd';
import { IPerformer, IUser, ISettings, IAccount } from 'src/interfaces';
import { connect } from 'react-redux';
import { tokenTransctionService, userService } from '@services/index';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { idlFactory } from "../../smart-contracts/declarations/tipping/tipping.did.js";
import type { _SERVICE } from "../../smart-contracts/declarations/tipping/tipping2.did.js";
import TraxButton from '@components/common/TraxButton';
import PaymentOptionsSelect from './common/PaymentOptionsSelect';
import AddCard from './add-card';
import { paymentService } from '@services/index';
import { updateBalance } from '@redux/user/actions.js';
import StripeExpressCheckout from '../user/stripe-express-checkout/express-checkout';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { Capacitor } from '@capacitor/core';
import { ApplePayButton } from '../user/apple-pay/apple-pay-button';



interface IProps {
  performer: IPerformer;
  onFinish: (price: number, ticker: string, paymentOption: string) => void;
  submiting: boolean;
  user?: IUser;
  account: IAccount;
  settings: ISettings;
  progress: number;
  openProgress: boolean;
}

interface IState {
  price: number | null;
  selectedCurrency: string;
  paymentOption: string;
  loading: boolean;
  custom: boolean;
  priceBtn: number;
  traxPrice: number;
  traxBalance: number;
  errorMessage: string;
  cards: any;
  canPayCrypto: boolean;
  canPayCredit: boolean;
  canPayCard: boolean;
  showStripe: boolean;
}

const TipPerformerForm: React.FC<IProps> = ({
  performer,
  onFinish,
  submiting = false,
  user,
  account,
  settings,
  progress,
  openProgress
}) => {
  const getInitialState = (): IState => ({
    price: 1.00,
    selectedCurrency: 'USD',
    paymentOption: 'noPayment',
    loading: true,
    custom: false,
    priceBtn: 1.00,
    traxPrice: 0,
    // icpBalance: 0,
    traxBalance: 0,
    // ckbtcBalance: 0,
    canPayCrypto: false,
    canPayCredit: false,
    canPayCard: false,
    errorMessage: '',
    cards: [],
    showStripe: false
  });

  const [state, setState] = useState<IState>(getInitialState());

  const dispatch = useDispatch();
  const router = useRouter();

  const updateState = (newState: Partial<IState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  useEffect(() => {
    getCards();

    const init = async () => {
      const [traxPriceData] = await Promise.all([
        tokenTransctionService.getExchangeRateTRAX()
      ]);

      updateState({
        traxPrice: traxPriceData.data.rate,
        loading: false
      });
    };

    init();
    validatePaymentMethod();
  }, [user]);


  useEffect(() => {
    const newPaymentOption = getInitialPaymentOption(
      state.selectedCurrency,
      user,
      state.paymentOption
    );

    if (newPaymentOption !== state.paymentOption) {
      updateState({ paymentOption: newPaymentOption });
    }
  }, [state.selectedCurrency, state.cards.length]);


  const getInitialPaymentOption = (currency: string, user: IUser, currentOption: string): string => {
    if (currency === 'USD') {
      if (user?.account?.balance >= state.price) {
        return 'credit';
      } else if (state.cards.length > 0) {
        return 'card';
      }
      return 'noPayment';
    } else if (currency === 'TRAX') {
      if (['plug', 'II'].includes(currentOption) && user.account?.wallet_icp) {
        return currentOption;
      }
      return user.account?.wallet_icp ? 'plug' : 'noPayment';
    }
    return 'noPayment';
  };



  const handlePaymentMethodsAvailable = (methods) => {
    if(methods.applePay || methods.googlePay || methods.link){
      updateState({showStripe: true})
    }else{
      updateState({showStripe: false})
    }
  };

  const fetchUserBalance = async () => {
    if (!user.account?.wallet_icp) return;

    try {
      if(state.paymentOption === 'plug'){

      }else{
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({
          identity,
          host: settings.icHost
        });

        if (settings.icNetwork !== true) {
          await agent.fetchRootKey();
        }

        const tippingActor = Actor.createActor<_SERVICE>(idlFactory, {
          agent,
          canisterId: settings.icTipping
        });

        // const [traxBalanceResult] = await Promise.all([
        //   tippingActor.traxBalance(Principal.fromText(user.account?.wallet_icp)),
        // ]);

        // updateState({
        //   traxBalance: Number(traxBalanceResult) / 100000000,
        // });
      }

    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };



  const correctInput = (val: number, currency: string) => {
    let price = val;
    updateState({ price });

    if (currency === "USD" &&
        state.paymentOption === "credit" &&
        price > user?.account?.balance) {
      const newOption = state.cards.length > 0 ? "card" : "noPayment";
      updateState({ paymentOption: newOption });
    }
  };



  const validatePaymentMethod = useCallback(() => {
    const result = {
      canPayCrypto: false,
      canPayCredit: false,
      canPayCard: false,
      errorMessage: ''
    };

    if (user?.account?.balance >= state.price) {
      result.canPayCredit = true;
    }

    if (state.cards?.length > 0) {
      result.canPayCard = true;
    }

    if (state.selectedCurrency === 'USD') {
      if (state.paymentOption === 'credit' && !result.canPayCredit) {
        updateState({
          paymentOption: result.canPayCard ? 'card' : 'noPayment'
        });
      }
    }

    if (user.account?.wallet_icp && performer.account?.wallet_icp) {
      result.canPayCrypto = true;
    } else {
      if (!user.account?.wallet_icp && performer.account?.wallet_icp) {
        result.canPayCrypto = false;
        result.errorMessage = 'To send crypto, please connect your preferred ICP wallet in settings';
      }
      if (user.account?.wallet_icp && !performer.account?.wallet_icp || !user.account?.wallet_icp && !performer.account?.wallet_icp) {
        result.canPayCrypto = false;
      }
    }

    setState(prev => ({ ...prev, ...result }));
  }, [
      user?.account?.wallet_icp,
      user?.account?.balance,
      state.cards.length,
      performer?.account?.wallet_icp,
      state.price,
      state.selectedCurrency,
      state.paymentOption
    ]);



  const changePaymentOption = (val: string) => {
    const newCurrency = (val === 'credit' || val === 'card') ? 'USD' : 'TRAX';

    updateState({
      paymentOption: val,
      selectedCurrency: newCurrency
    });

    correctInput(state.priceBtn, newCurrency);
  };

  const changeShortcut = (val: number | null, isCustom: boolean, e?: React.MouseEvent) => {
    e?.preventDefault();

    const safeValue = !isCustom ? Math.max(1.00, val || 1.00) : null;

    const finalPrice = safeValue !== null
      ? state.selectedCurrency === "TRAX"
        ? safeValue
        : safeValue
      : null;

    setState(prevState => {
      const newState = {
        ...prevState,
        priceBtn: safeValue || 0,
        custom: isCustom,
        price: finalPrice,
      };

      // If in USD mode, immediately check if we need to change payment option
      if (prevState.selectedCurrency === 'USD' && finalPrice !== null) {
        if (finalPrice > user?.account?.balance) {
          newState.paymentOption = state.cards.length > 0 ? 'card' : 'noPayment';
          newState.canPayCredit = false;
          newState.canPayCard = state.cards.length > 0;
        } else {
          newState.paymentOption = 'credit';
          newState.canPayCredit = true;
        }
      }

      return newState;
    });
  };

  const getCards = async () => {
    try {
      const resp = await paymentService.getStripeCards();
      updateState({cards: resp.data.data.map((d) => {
        if (d.card) return { ...d.card, id: d.id };
        if (d.three_d_secure) return { ...d.three_d_secure, id: d.id };
        return d;
      })});
    } catch (error) {
      message.error('An error occurred while fetching cards. Please try again.');
    }
  };

  const beforeSendTip = () => {
    if(state.selectedCurrency === "USD"){
      if(state.paymentOption === "card"){
        addFund({amount: state.price});
      }else if(state.paymentOption === "credit"){
        onFinish(state.price, state.selectedCurrency, state.paymentOption)
      }
    }else if(state.selectedCurrency === "TRAX"){
      onFinish(state.price, state.selectedCurrency, state.paymentOption)
    }
  }

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

      onFinish(state.price, state.selectedCurrency, state.paymentOption)
    } catch (e) {
      message.error(e.message || 'Error occured, please try again later');

      updateState({ loading: false  });
    } finally {
      updateState({ loading: false  });
    };
  };



  const afterAddCard = (cards: any, selected: boolean) => {
    if(cards.length == 0){
      updateState({cards: cards})
    }

    if(selected){
      updateState({selectedCurrency: "USD", paymentOption: 'card'})
    }else{
      updateState({paymentOption: 'noPayment'})
    }
  }


  const getCreditImgShortcut = (amount) => {
    if(amount === 1){
      return "/static/credit1.png"
    }else if(amount === 5){
      return "/static/credit5.png"
    }else if(amount === 10){
      return "/static/credit10.png"
    }
  }
  const getCreditImgTotal = (amount) => {
    if(amount <= 1){
      return "/static/credit1.png"
    }else if(amount > 1 && amount < 10){
      return "/static/credit5.png"
    }else if(amount >= 10){
      return "/static/credit10.png"
    }
  }

  const walletMessage = !user.account?.wallet_icp && (
    <p className="text-font-gray text-xs md:text-sm mb-0 md:mb-4 rounded-lg px-3 py-1 bg-slaps-gray border border-[#454545]">
      You do not have a wallet connected. If you would like to pay with crypto please navigate to settings and connect your preferred wallet.
    </p>
  );

  const getButtonText = () => {
    if (state.paymentOption === "noPayment") return "Select payment method";
    if (state.price < 1) return "$1 minimum spend";
    if (state.loading) return "Processing... please wait";
    return "Support";
  };

  const handleDisabled = () => {
    return state.paymentOption === "noPayment" ||
           state.price < 1 ||
           state.loading;
  };


  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = parseFloat(e.target.value);

  const safeValue = !isNaN(value) ? Math.max(1.00, value) : 1.00;

  setState(prevState => {
    const newState = {
      ...prevState,
      price: safeValue
    };

    if (prevState.selectedCurrency === 'USD') {
      if (safeValue > user?.account?.balance) {
        newState.paymentOption = state.cards.length > 0 ? 'card' : 'noPayment';
        newState.canPayCredit = false;
        newState.canPayCard = state.cards.length > 0;
      } else {
        newState.paymentOption = 'credit';
        newState.canPayCredit = true;
      }
    }

    return newState;
  });
};

  const stripeFee = (state.price * (parseFloat(settings.stripeFeesPercentageAmount) / 100)) + parseFloat(settings.stripeFeesFixedAmount);


  console.log("paymentOption: ", state.paymentOption)
  console.log("canPayCredit: ", state.canPayCredit)
  console.log("user?.account?.balance ", user?.account?.balance);


  return (
    <div className="send-tip-container">
        {/* <img
          className="payment-thumbnail"
          src={performer?.avatar || '/static/no-avatar.png'}
          alt="Artist avatar"
        /> */}
        <div className='w-full m-auto flex justify-start'>
          <span className='font-heading text-4xl font-bold uppercase'>Send tip</span>
        </div>

        <div className="tip-amount-container">

        {[1, 5, 10].map(amount => (
          <div
            key={amount}
            className={`tip-amount-btn ${state.priceBtn === amount ? 'active border-custom-green' : ''}`}
            onClick={(e) => {
              // Calculate the TRAX amount once, using the current traxPrice
              const finalAmount = state.selectedCurrency === "TRAX"
                ? amount / state.traxPrice
                : amount;
              changeShortcut(finalAmount, false, e);
            }}
          >
            {state.selectedCurrency === "TRAX" ? (
              <span className='flex flex-row'>
                <img
                  src="/static/logo_48x48.png"
                  alt="trax"
                  className='rounded-full w-5 h-5 border mt-[5px] border-[#6b6b6b] border-solid mr-1'
                />
                {(amount / state.traxPrice).toFixed(2)}
              </span>
            ) : (
              <span className='flex flex-row'>
                <img
                  src={getCreditImgShortcut(amount)}
                  alt="trax"
                  className='w-6 h-6 border mt-[3px] mr-1'
                />
                {amount}
              </span>
            )}
          </div>
        ))}

          <div
            className={`tip-amount-btn ${state.custom ? 'active border-custom-green' : ''}`}
            onClick={(e) => changeShortcut(null, true, e)}
          >
            <span>Custom</span>
          </div>
        </div>

        {state.custom && (
          <div className="pb-2 relative">
            <input
            type="number"
            min={1.00}
            step="0.01"
            onChange={handleCustomAmountChange}
            value={state.price || ''}
            placeholder={state.selectedCurrency === 'USD' ? "Enter amount (min. $1.00)" : "Enter amount"}
            className="tip-custom-input"
            onWheel={(e) => e.currentTarget.blur()}
          />
            {state.selectedCurrency !== 'USD' && state.price > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-font-gray font-medium my-0 pl-5">
               ~${((state.price) * state[`${state.selectedCurrency.toLowerCase()}Price`]).toFixed(2)}
              </span>
            )}
          </div>
        )}

        {!Capacitor.isNativePlatform() && (
          <div className={state.showStripe ? 'block' : 'hidden'}>
            <StripeExpressCheckout
              amount={(state.price > 0 ? state.price : 1) + stripeFee}
              onSuccess={() => {
                message.success('Payment successful!');
                onFinish(state.price, 'USD', 'card');
              }}
              settings={settings}
              onError={(err) => {
                message.error(err.message || 'Payment failed');
              }}
              returnUrl={window.location.href}
              onPaymentMethodsAvailable={handlePaymentMethodsAvailable}
            />
            <div className="text-center">
              <div className="flex items-center justify-center gap-0">
                <hr className="w-full border-t border-trax-gray-500" />
                <span className="text-trax-gray-300 w-full">{`Or tip with ${state.canPayCredit ? "credit" : "card"}`}</span>
                <hr className="w-full border-t border-trax-gray-500" />
              </div>
            </div>
          </div>
        )}

        {state.canPayCredit ? (
          <div onClick={() => changePaymentOption("credit")} className={`cursor-pointer  bg-custom-gray rounded-lg py-2 px-2 flex flex-row items-center gap-4 rounded-lg ${state.paymentOption === "credit" ? 'border-custom-green border' : 'border-trax-transparent border'}`}>
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
            paymentOption={state.paymentOption}
            initialAmount={state.price}
            onFinish={(cards: any, selected: boolean) => afterAddCard(cards, selected)}
          />
        )}



        {state.canPayCrypto && (
          <>
            <div className="text-center">
              <div className="flex items-center justify-center gap-0">
                <hr className="w-full border-t border-trax-gray-500" />
                <span className="text-trax-gray-300 w-full">{`Or tip in crypto`}</span>
                <hr className="w-full border-t border-trax-gray-500" />
              </div>
            </div>
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
          </>
        )}


        <div className="payment-number-container">
          <div className='flex flex-row w-full justify-between'>
          <span>Total:</span>
          <div className="payment-number-wrapper">
            {state.selectedCurrency === 'USD' && <img src={getCreditImgTotal(state.price)} className="w-12 h-12 mt-[-5px] mr-1.5" />}
            {state.selectedCurrency === 'TRAX' && (
              <img src="/static/logo_48x48.png" alt="trax" className='tokens-img rounded-full w-10 h-10 border mt-[2px] border-[#6b6b6b] border-solid mr-1.5' />
            )}
            <p>{(state.price || 0).toFixed(2)}</p>
          </div>
          </div>

          {state.selectedCurrency === 'TRAX' && (
          <div className='w-full justify-end flex mt-2'>
            <div className='text-sm font-light font-body justify-end w-fit px-2 rounded-full text-custom-green tracking-[0.01rem] border border-custom-green/50 bg-custom-green/20 flex flex-row normal-case gap-x-2'>
              <span className=''>Approximately: </span>
              <span className=''>${state.price * state.traxPrice}</span>
            </div>
          </div>

        )}
        </div>

        {state.errorMessage && (
          <p className="error-message">{state.errorMessage}</p>
        )}


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
          onClick={beforeSendTip}
        />
    </div>

  );
};

const mapStates = (state: { settings: ISettings }) => ({
  settings: { ...state.settings }
});

export default connect(mapStates)(TipPerformerForm);
