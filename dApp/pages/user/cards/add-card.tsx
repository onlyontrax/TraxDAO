import React, { useState } from 'react';
import { Button, Form } from 'antd';
import { CreditCardFilled } from '@ant-design/icons';
import { paymentService } from '@services/index';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { CardElement } from '@stripe/react-stripe-js';

const NewCardPage = ({ settings, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const stripePromise = loadStripe(settings.stripePublishableKey || '');

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

      await paymentService.addStripeCard({ sourceToken: token.id });
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
          <div className="bg-custom-gray p-6 rounded-lg">
            <CreditCardFilled className="text-trax-white text-3xl leading-none mb-4 bg-lighter-gray rounded-full py-3 px-4" />
            <h3 className="text-trax-white text-xl font-bold mb-2">Add Card</h3>
            <p className="text-trax-gray-300 text-base mb-4">
              This information is encrypted and securely stored by Stripe.
            </p>
            <Form onFinish={() => handleSubmit(stripe, elements)} layout="vertical">
              <Form.Item
                name="cardDetails"
                rules={[{ required: true, message: 'Please input your card details!' }]}
              >
                <CardElement options={cardElementOptions} />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  disabled={!stripe}
                  className="w-full bg-trax-white hover:overlay-200 text-custom-gray"
                >
                  Add Card
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </ElementsConsumer>
    </Elements>
  );
};

export default NewCardPage;