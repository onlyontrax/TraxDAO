import { message } from 'antd';
import { useState, useEffect } from 'react';
import { IUser, ISettings } from '@interfaces/index';
import { useRouter } from 'next/router';
import { paymentService, userService } from '@services/index';
import { connect } from 'react-redux';
import { updateBalance } from '@redux/user/actions';
import { useDispatch } from 'react-redux';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TraxButton from '@components/common/TraxButton';
import AddCard from '@components/performer/add-card';
import StripeExpressCheckout from '../user/stripe-express-checkout/express-checkout';
import PriceBreakdown from './price-breakdown';

interface IProps {
  user: IUser;
  settings: ISettings;
  updateBalance?: Function;
  initialAmount?: number;
  isFromPPV?: boolean;
  onFinish?(canPay: boolean): void;
}

const PurchaseCredit: React.FC<IProps> = ({ user, settings, initialAmount = 10, onFinish, isFromPPV, updateBalance: handleUpdateBalance }) => {
  const [amount, setAmount] = useState(initialAmount);
  const [couponCode, setCouponCode] = useState('');
  const [paymentOption, setPaymentOption] = useState('noPayment');
  const [coupon, setCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showStripe, setShowStripe] = useState(false);
  const [cards, setCards] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState(isFromPPV ? "content" : "ten");
  const [custom, setCustom] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchCards();
    const input = document.getElementById('amount');
    adjustInputWidth(input);
  }, []);

  const router = useRouter();

  const fetchCards = async () => {
    try {
      setLoading(true);
      const resp = await paymentService.getStripeCards();
      setCards(resp.data.data.map((d) => {
        if (d.card) return { ...d.card, id: d.id };
        if (d.three_d_secure) return { ...d.three_d_secure, id: d.id };
        return d;
      }));

      // setPaymentOption("card")
    } catch (error) {
      message.error('An error occurred while fetching cards. Please try again.');
    }finally{
      setLoading(false);
    }
  };

  const addFund = async ({ amount }) => {
    if (settings.paymentGateway === 'stripe' && !user?.stripeCardIds?.length) {
      message.error('Please add a payment card to complete your purchase');
      router.push('/user/account');
      return;
    };

    if (!amount || amount < 1) {
      message.error('Minimum amount is $1.00');
      return;
    }


    let success;

    try {
      setSubmitting(true);
      const resp = await paymentService.addFunds({
        paymentGateway: settings.paymentGateway,
        amount,
        couponCode: coupon ? couponCode : ''
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
      isFromPPV && onFinish(true);
    } catch (e) {
      isFromPPV && onFinish(false)

      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
      setSubmitting(false);
    } finally {



      setSubmitting(false);
    };
  };

  const applyCoupon = async () => {
    if (!couponCode) return;

    try {
      const resp = await paymentService.applyCoupon(couponCode);
      setCoupon(resp.data);
      message.success('Coupon is applied');
    } catch (error) {

      const e = await error;
      message.error(e?.message || 'Error occured, please try again later');
    };
  };

  const couponAmount = (amount - (amount * (coupon?.value || 0)));

  const handleRedirectToSettings = () => {
    router.push({
      pathname: '/user/account',
      query: { tab: 'billing' }
    });
  };

  const formatAmount = (amount: number | undefined | null): string => {
    if (!amount && amount !== 0) return '0';
    const num = Number(amount);
    if (isNaN(num)) return '0';
    return num.toString();
  };

  const adjustInputWidth = (input) => {
    if (input) {
      const measurer = document.getElementById('input-width-measurer');
      measurer.textContent = input.value || input.placeholder;
      const width = measurer.offsetWidth;
      input.style.width = width + 'px';
    }
  };

  const stripeFee = (amount * (parseFloat(settings.stripeFeesPercentageAmount) / 100)) + parseFloat(settings.stripeFeesFixedAmount);


  const formatNumber = (number) => {
    if (number === '' || number === undefined || number === null) return '0.00';
    if (number === '0' || number === 0 || number < 1) return '0.00';
    const numStr = number.toString().replace(/,/g, '');
    const isNegative = numStr.startsWith('-');
    const cleanNum = isNegative ? numStr.slice(1) : numStr;
    const floatNum = parseFloat(cleanNum);
    if (isNaN(floatNum)) return '0.00';
    const withDecimals = floatNum.toFixed(2);
    const [integerPart, decimalPart] = withDecimals.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${isNegative ? '-' : ''}${formattedInteger}.${decimalPart}`;
  };


  const changeShortcut = (value: number, option: string, e: any) => {
    e.preventDefault();
    const safeValue = Math.max(1, value);
    setOption(option);
    setAmount(safeValue);
  };

  const handleBlur = () => {
    if (isNaN(amount) || amount < 1) {
      setAmount(1);
    } else {
      // Ensure amount has maximum 2 decimal places
      setAmount(Math.round(amount * 100) / 100);
    }
  };


  const afterAddCard = (cards: any, selected: boolean) => {
    cards.length == 0 && setCards(cards)
    selected ? setPaymentOption('card') : setPaymentOption('noPayment');
  }


  const handlePaymentMethodsAvailable = (methods) => {
    if(methods.applePay || methods.googlePay || methods.link){
      setShowStripe(true)
    }else{
      setShowStripe(false)
    }
  };

  const handleSubmit = () => {
    if(paymentOption === 'card'){
      addFund({ amount });
    }

  };

  const getButtonText = () => {
    if (paymentOption === "noPayment") return "Select payment method";
    if (amount < 1) return "$1 minimum spend";
    if (submitting) return "Processing... please wait";
    return "Top up";
  };

  const handleDisabled = () => {
    return paymentOption === "noPayment" ||
           amount < 1 ||
           submitting;
  };


  return (
    <div className="flex p-4  w-full">
      <div className="rounded shadow-md  w-full max-w-md">
         <h1 className="text-4xl font-heading uppercase text-center sm:text-center text-trax-white mb-6 font-bold">Add credit</h1>
          {isFromPPV && (initialAmount > user?.account?.balance) && (
            <div className='bg-transparent bg-trax-zinc-900 text-trax-amber-500 border border-trax-amber-500 rounded-lg py-2 px-3 mb-4'>
              <span>You don't have enough available credits to purchase this content, please top up your wallet to continue</span>
            </div>
          )}

          {isFromPPV &&  (
            <>
              <div className='w-fit text-sm flex flex-row justify-start gap-2 mb-2 text-custom-green bg-trax-zinc-900 border border-trax-zinc-700 px-3 py-1 rounded-full'>
                <span className='text-custom-green justify-start'>Available balance:</span>
                <div className='flex flex-row justify-end '>
                  <img src="/static/credit.png" className="w-4 h-4 mr-1 mt-[2px]" />
                  <span className=' text-sm text-trax-white'>{formatNumber(user?.account?.balance)}</span>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col items-start ">
            <label htmlFor="amount" className="sr-only ">
              Amount
            </label>
            <div className="flex flex-col items-start gap-y-4 rounded-lg w-full">
              <div className="buy-credit-amount-container">
                <div className={`tip-amount-btn flex-col ${option === "one" ? 'active border-custom-green' : ''}`} onClick={(e) => changeShortcut(1.00, "one", e)}>
                  <span className='flex-col'><img src="/static/credit1.png" className="w-12 h-12 mx-auto my-auto rounded-none mb-2 mt-2" />1 credit</span>
                  <p className='flex-col'>$1.00</p>
                </div>

                <div className={`tip-amount-btn flex-col ${option === "five" ? 'active border-custom-green' : ''}`} onClick={(e) => changeShortcut(5.00, "five", e)}>
                  <span className='flex-col'><img src="/static/credit5.png" className="w-12 h-12 mx-auto my-auto rounded-none mb-2 mt-2" />5 credits</span>
                  <p className='flex-col'>$5.00</p>
                </div>

                <div className={`tip-amount-btn flex-col ${option === "ten" ? 'active border-custom-green' : ''}`} onClick={(e) => changeShortcut(10.00, "ten", e)}>
                  <span className='flex-col'><img src="/static/credit10.png" className="w-12 h-12 mx-auto my-auto rounded-none mb-2 mt-2" />10 credits</span>
                  <p className='flex-col'>$10.00</p>
                </div>

                <div className={`tip-amount-btn ${option === "custom" ? 'active border-custom-green' : ''}`} onClick={(e) => changeShortcut(0, "custom", e)}>
                  <span>Custom</span>
                </div>
              </div>

              {(option === "custom" || option === "content") && (
                <div className="flex flex-row items-start bg-transparent rounded-lg w-full bg-[#161616] border border-[#414141] p-2.5 pb-[0.4rem]">
                  <img src="/static/credit.png" className="w-11 h-11 flex rounded-none mr-2 mt-[3px]" />
                  <input
                    type="number"
                    step="0.01"
                    min={1.00}
                    id="amount"
                    name="amount"
                    className="border-none rounded bg-trax-transparent font-heading font-extrabold text-trax-white text-5xl text-left focus:outline-none w-fit"
                    value={amount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        setAmount(value);
                        adjustInputWidth(e.target);
                        setOption("custom");
                      }
                    }}
                    onBlur={handleBlur}
                    required
                    style={{ width: 'auto' }}
                  />
                  <span
                    id="input-width-measurer"
                    className="absolute invisible whitespace-nowrap text-2xl font-inherit"
                  ></span>
                </div>
              )}


                <div className={showStripe ? 'block w-full' : 'hidden'}>
                  <StripeExpressCheckout
                    amount={Math.round((amount >= 1 ? amount : 1) + stripeFee)}
                    onSuccess={() => {
                      message.success('Payment successful!');
                      onFinish(true);
                    }}
                    settings={settings}
                    onError={(err) => {
                      message.error(err.message || 'Payment failed');
                    }}
                    returnUrl={window.location.href}
                    onPaymentMethodsAvailable={handlePaymentMethodsAvailable}
                  />
                  <div className="text-center w-full">
                    <div className="flex items-center justify-center gap-0">
                      <hr className="w-full border-t border-trax-gray-500" />
                      <span className="text-trax-gray-300 w-full">Or pay with card</span>
                      <hr className="w-full border-t border-trax-gray-500" />
                    </div>
                  </div>
                </div>

              <AddCard
                settings={settings}
                user={user}
                paymentOption={paymentOption}
                initialAmount={amount}
                onFinish={(cards: any, selected: boolean) => afterAddCard(cards, selected)}
              />
              <PriceBreakdown amount={amount} stripeFee={stripeFee} />
            </div>
          </div>

          {coupon && (
            <div className="flex flex-col items-center">
              <p className="text-trax-red-500">
                Discount: {coupon.value * 100}%
              </p>
            </div>
          )}

          <div>
            <TraxButton
              htmlType="button"
              styleType="primary"
              buttonSize='full'
              buttonText={getButtonText()}
              disabled={handleDisabled()}
              onClick={handleSubmit}
            />
          </div>
      </div>
    </div>
  );
};

const mapStates = (state) => ({
});
const mapDispatch = { updateBalance };

export default connect(mapStates, mapDispatch)(PurchaseCredit);
