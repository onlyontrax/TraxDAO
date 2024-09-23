import { message } from 'antd';
import { useState, useEffect } from 'react';
import { IUser, ISettings } from '@interfaces/index';
import { useRouter } from 'next/router';
import { paymentService } from '@services/index';

interface IProps {
  user: IUser,
  settings: ISettings,
}

const PurchaseCredit: React.FC<IProps> = ({ user, settings }) => {
  const [amount, setAmount] = useState(10);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
      if (resp.data.data.length > 0) {
        const cardData = resp.data.data[0].card ? resp.data.data[0].card : resp.data.data[0];
        setCard({
          brand: cardData.brand,
          last4: cardData.last4,
        });
      }
      setLoading(false);
    } catch (error) {
      message.error('Failed to load card information');
      setLoading(false);
    }
  };

  const addFund = async ({ amount }) => {
    if (settings.paymentGateway === 'stripe' && !user?.stripeCardIds?.length) {
      message.error('Please add a payment card to complete your purchase');
      router.push('/user/account');
      return;
    };

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

      message.success('Payment successful! Your wallet has been topped up.');
    } catch (e) {

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
      query: { tab: 'subscription' }
    });
  };

  const adjustInputWidth = (input) => {
    if (input) {
      const measurer = document.getElementById('input-width-measurer');
      measurer.textContent = input.value || input.placeholder;
      const width = measurer.offsetWidth;
      input.style.width = width + 'px';
    }
  };

  return (
    <div className="flex p-4 md:p-8  ">
      <div className="rounded shadow-md  w-full max-w-md">
        <h1 className="text-3xl font-heading text-left mb-6">Add credit</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addFund({ amount });
          }}
          className="space-y-4"
        >
          <div className="flex flex-col items-center">
            <label htmlFor="amount" className="sr-only">
              Amount
            </label>
            <div className="flex flex-col items-center border-1 border border-trax-white/10 rounded-lg p-6 w-full">
              <div className="flex items-center bg-trax-white/10 p-3 rounded-lg mx-auto">
                <span className="text-trax-white pr-1 text-2xl text-center">$</span>
                <input
                  type="number"
                  step="0.10"
                  id="amount"
                  name="amount"
                  className="border-none rounded bg-trax-transparent text-trax-white text-2xl text-left focus:outline-none"
                  min="1.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(parseFloat(e.target.value));
                    adjustInputWidth(e.target);
                  }}
                  required
                  style={{ width: 'auto' }} // Set initial width to auto
                />
                <span
                  id="input-width-measurer"
                  className="absolute invisible whitespace-nowrap text-2xl font-inherit"
                ></span>
              </div>
              <div className="flex items-center justify-center pt-6 space-x-2 text-center text-trax-gray-400 text-sm">
                <p className='text-trax-lime-500'>Fee $0.30</p>
                <span>•</span>
                <p>You’ll pay ${amount > 0.30 ? (amount + 0.30).toFixed(2) : '0.00'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <label htmlFor="coupon" className="sr-only">
              Coupon Code
            </label>
            <div className="flex space-x-2 py-4 text-trax-white">
              <input
                type="text"
                id="coupon"
                name="coupon"
                placeholder="Enter coupon code here"
                className="px-4 bg-trax-transparent rounded focus:outline-none"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!coupon}
              />
              {!coupon ? (
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-4 py-1 bg-trax-lime-500 text-trax-white rounded"
                  disabled={!couponCode}
                >
                  Apply!
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCouponCode('');
                    setCoupon(null);
                  }}
                  className="px-4 bg-trax-lime-500 text-trax-white rounded"
                >
                  Use Later!
                </button>
              )}
            </div>
          </div>

          {coupon && (
            <div className="flex flex-col items-center">
              <p className="text-trax-red-500">
                Discount: {coupon.value * 100}%
              </p>
            </div>
          )}

          {/* <div className="flex flex-col items-center">
            <p className="text-lg text-trax-white">
              Total: ${couponAmount.toFixed(2)}
            </p>
          </div> */}

          <div className="flex flex-col pb-4 md:pb-10">
            <h2 className="text-base font-medium text-[#B3B3B3] text-left">
              Payment method
            </h2>
            <div className="flex flex-col items-left rounded-md px-0 w-full">
              {card ? (
                <div className="flex flex-row items-center gap-4">
                  <div className="size-8">
                    {card.brand === 'Visa' && <img src="/static/visa_logo.png" alt="Visa" />}
                    {card.brand === 'MasterCard' && <img src="/static/mastercard_logo.png" alt="MasterCard" />}
                    {card.brand === 'American Express' && <img src="/static/amex_logo.png" alt="American Express" />}
                  </div>
                  <div className="text-trax-gray-300">
                    <span>{`**** **** **** ${card.last4}`}</span>
                  </div>
                </div>
              ) : (
                <div className='flex justify-between gap-1'>

                  <button
                    onClick={handleRedirectToSettings}
                    className="px-4 py-1 bg-[#A8FF00] text-xl font-semibold uppercase text-black font-heading rounded"
                  >
                    Add card
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 bg-trax-lime-500 text-trax-white font-heading uppercase text-2xl rounded-lg w-full disabled:cursor-not-allowed disabled:bg-custom-gray"
              disabled={submitting || !card}
            >
              {submitting ? 'Processing...' : 'Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseCredit;
