import React, { useState } from 'react';
import { Form } from 'antd';
import { CreditCardFilled } from '@ant-design/icons';
import { paymentService, userService } from '@services/index';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { CardElement } from '@stripe/react-stripe-js';
import { useDispatch } from 'react-redux';

import TraxButton from '@components/common/TraxButton';

const NewCardPage = ({ settings, onSuccess, isPPV }) => {
  const [submitting, setSubmitting] = useState(false);
  const stripePromise = loadStripe(settings.stripePublishableKey || '');
  const dispatch = useDispatch();

  const handleSubmit = async (stripe, elements) => {
    if (!stripe || !elements) {
      return;
    }

    try {
      setSubmitting(true);
      const cardElement = elements.getElement(CardElement);
      const { token, error } = await stripe.createToken(cardElement);

      if (error) {
        throw new Error(error.message);
      }

      const addingCard = await paymentService.addStripeCard({ sourceToken: token.id });

      if (addingCard.status === 0) {
        await userService.reloadCurrentUser(dispatch);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding card:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const cardElementOptions = {
    hidePostalCode: true,
    style: {
      base: {
        iconColor: '#B3B3B3',
        color: '#ffffff',
        fontSize: '16px',
        '::placeholder': {
          color: '#B3B3B3',
        },
      },
      invalid: {
        color: '#FF4D4F',
      },
    },
  };

  return (
    <Elements stripe={stripePromise}>
      <ElementsConsumer>
        {({stripe, elements}) => (
          <div className="p-2 rounded-lg bg-custom-black">
            {!isPPV && (
              <>
                <CreditCardFilled className="text-trax-white text-3xl leading-none mb-4 bg-lighter-gray rounded-full py-3 px-4" />
                <h3 className="text-trax-white text-xl font-bold mb-2">Add Card</h3>
                <p className="text-trax-gray-300 text-base mb-4">
                  This information is encrypted and securely stored by Stripe.
                </p>
              </>
            )}
            
            <Form onFinish={() => handleSubmit(stripe, elements)} layout="vertical">
              <Form.Item
                name="cardDetails"
                rules={[{ required: true, message: 'Please input your card details!' }]}
              >
                <CardElement options={cardElementOptions} className='border border-font-disabled p-2 -mt-2 rounded-lg' />
              </Form.Item>
              <Form.Item>
                <TraxButton
                  htmlType="submit"
                  styleType="primary"
                  buttonSize='full'
                  buttonText="Add card"
                  loading={submitting}
                  disabled={!stripe}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </ElementsConsumer>
    </Elements>
  );
};

export default NewCardPage;