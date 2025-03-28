import React, { useState } from 'react';
import { Elements, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { paymentService } from '@services/index';

const ExpressCheckoutForm = ({
  monthlyPrice,
  yearlyPrice,
  selectedInterval,
  onSuccess,
  onError,
  returnUrl,
  onPaymentMethodsAvailable,
  performerId
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const amount = selectedInterval === 'month' ? monthlyPrice : yearlyPrice;

  const handleReady = (event) => {
    if (event?.availablePaymentMethods) {
      const availablePaymentMethods = {
        applePay: event.availablePaymentMethods.applePay || false,
        googlePay: event.availablePaymentMethods.googlePay || false,
        link: event.availablePaymentMethods.link || false
      };
      onPaymentMethodsAvailable?.(availablePaymentMethods);
    } else {
      console.log('No payment methods available');
      onPaymentMethodsAvailable?.({
        applePay: false,
        googlePay: false,
        link: false
      });
    }

    setLoading(false);
  };

  const handleClick = async ({ resolve, expressPaymentType }) => {
    try {
      const baseOptions = {
        emailRequired: true,
        lineItems: [
          {
            amount: Math.round(amount * 100),
            label: selectedInterval === 'month' ? 'Monthly Subscription' : 'Yearly Subscription',
            name: 'Creator Subscription',
            description: `Subscribe for $${amount}/${selectedInterval}`
          }
        ],
      };

      switch (expressPaymentType) {
        case 'apple_pay':
          resolve({
            ...baseOptions,
            shippingAddressRequired: false,
            billingAddressRequired: true,
            paymentRequest: {
              total: {
                label: 'Subscription',
                amount: Math.round(amount * 100)
              },
              requiredBillingContactFields: ['email'],
              requiredShippingContactFields: []
            }
          });
          break;
        case 'google_pay':
          resolve({
            ...baseOptions,
            shippingAddressRequired: false,
            billingAddressRequired: true,
            buttonTheme: 'black',
            buttonType: 'subscribe'
          });
          break;
        case 'link':
          resolve({
            ...baseOptions,
            phoneNumberRequired: false,
            billingAddressRequired: true,
            defaultValues: {
              billingDetails: {
                name: '',
                email: '',
              }
            }
          });
          break;
      }
    } catch (err) {
      console.error('Click handler error:', err);
      onError?.(err);
    }
  };

  const handleConfirm = async (event) => {
    if (!stripe || !elements) {
      console.error("Stripe or elements not initialized");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        onError?.(submitError);
        return;
      }

      const { expressPaymentType } = event;
      if (!expressPaymentType) {
        throw new Error('No payment method provided');
      }

      const successResp = await paymentService.activateSubscription({
        performerId,
        type: selectedInterval,
      });

      // Extract client secret from payment intent
      const clientSecret = successResp?.data?.data?.clientSecret;
      if (!clientSecret) {
        console.error('Response structure:', successResp);
        throw new Error('No client secret received from server');
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {  // Add this
            billing_details: event.billingDetails || {}
          }
        }
      });

      if (confirmError) {
        console.error('Confirm payment error:', confirmError);
        throw confirmError;
      }

      onSuccess?.();
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        type: err.type,
        code: err.code,
        complete_error: err
      });
      setErrorMessage(err.message || 'An error occurred');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full space-y-4">
      {errorMessage && (
        <div className="text-red-500">
          {errorMessage}
        </div>
      )}
      <ExpressCheckoutElement
        onConfirm={handleConfirm}
        onReady={handleReady}
        onClick={handleClick}
        options={{
          buttonHeight: 45,
          buttonType: {
            applePay: 'plain',
            googlePay: 'subscribe',
          },
          buttonTheme: {
            applePay: 'black',
            googlePay: 'black',
          },
        }}
      />
      {loading && (
        <div className="text-center text-sm text-trax-gray-500">
          Processing subscription...
        </div>
      )}
    </div>
  );
};

const StripeExpressSubscription = ({
  monthlyPrice,
  yearlyPrice,
  selectedInterval = 'monthly',
  onSuccess,
  onError,
  returnUrl,
  settings,
  performerId,
  onPaymentMethodsAvailable
}) => {
  const [stripeError, setStripeError] = useState(null);

  const stripePromise = loadStripe(settings.stripePublishableKey || '').catch(err => {
    console.error('Stripe initialization error:', err);
    setStripeError(err.message);
    return null;
  });

  if (stripeError) {
    return <div>Error initializing payment system: {stripeError}</div>;
  }

  // Add logging for debugging


  const amount = selectedInterval === 'monthly' ? monthlyPrice : yearlyPrice;

  const options: StripeElementsOptions = {
    mode: "subscription",
    currency: 'usd',
    amount: Math.round(amount * 100),
    setup_future_usage: 'off_session',
    appearance: {
      variables: {
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <ExpressCheckoutForm
        monthlyPrice={monthlyPrice}
        yearlyPrice={yearlyPrice}
        selectedInterval={selectedInterval}
        onSuccess={onSuccess}
        onError={onError}
        returnUrl={returnUrl}
        performerId={performerId}
        onPaymentMethodsAvailable={onPaymentMethodsAvailable}
      />
    </Elements>
  );
};

export default StripeExpressSubscription;