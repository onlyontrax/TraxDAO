import React, { useState, useEffect } from 'react';
import { Elements, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { paymentService } from '@services/index';


const ExpressCheckoutForm = ({ amount, onSuccess, onError, returnUrl, onPaymentMethodsAvailable  }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReady = (event) => {
    if (event?.availablePaymentMethods) {
      const availablePaymentMethods = {
        applePay: event.availablePaymentMethods.applePay || false,
        googlePay: event.availablePaymentMethods.googlePay || false,
        link: event.availablePaymentMethods.link || false
      };
      onPaymentMethodsAvailable?.(availablePaymentMethods);
    } else {
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
            label: 'Total',
            name: 'Add Funds',
            description: `Add $${amount} to wallet`
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
                label: 'Add Funds',
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
            buttonType: 'pay',
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
    if (!stripe || !elements) return;

    try {
      setLoading(true);
      setErrorMessage('');

      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message);
        onError?.(submitError);
        return;
      }

      const resp = await paymentService.addFundsExpress({
        paymentGateway: 'stripe',
        amount,
        couponCode: null
      });

      if (!resp?.data?.clientSecret) {
        throw new Error('Failed to initialize payment');
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: resp.data.clientSecret,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {
              email: ''
            }
          }
        },
        redirect: "if_required"
      });

      if (error) {
        console.log('Confirmation Error:', error);
      // console.log('Error Response:', error.response);
        setErrorMessage(error.message);
        onError?.(error);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        const successResp = await paymentService.handleSuccessExpress({
          paymentIntentId: paymentIntent.id
        });

        if (successResp?.data?.success) {
          onSuccess?.();
        } else {
          throw new Error('Failed to process payment');
        }
      } else if (paymentIntent.status === 'requires_action') {
        console.log("requires_action");
        // Payment requires additional action (like 3D Secure)
        // Stripe will handle the redirect automatically
        return;
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      console.log(err)
      setErrorMessage(err.message || 'An error occurred');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {errorMessage && (
        <div>
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
              googlePay: 'pay',
            },
            buttonTheme: {
              applePay: 'black',
              googlePay: 'black',
            },
          }}
      />
      {loading && (
        <div className="text-center text-sm text-trax-gray-500">
          Processing payment...
        </div>
      )}
    </div>
  );
};

const StripeExpressCheckout = ({ amount, onSuccess, onError, returnUrl, settings, onPaymentMethodsAvailable  }) => {
  const [stripeError, setStripeError] = useState<string | null>(null);
  const stripePromise = loadStripe(settings.stripePublishableKey || '').catch(err => {
    console.error('Stripe initialization error:', err);
    setStripeError(err.message);
    return null;
  });

  if (stripeError) {
    return <div>Error initializing payment system: {stripeError}</div>;
  }

  // console.log(amount, onSuccess, onError, returnUrl, settings.stripePublishableKey)

  const options: StripeElementsOptions = {
    mode: "payment",
    amount: Math.round(amount * 100),
    currency: 'usd',
    appearance: {
      variables: {
        borderRadius: '8px',
      },
    },
    // payment_method_configuration: 'pmc_1Q2930Ju0zc7SNEWDxBJWJaN'
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <ExpressCheckoutForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        returnUrl={returnUrl}
        onPaymentMethodsAvailable={onPaymentMethodsAvailable}
      />
    </Elements>
  );
};

export default StripeExpressCheckout;