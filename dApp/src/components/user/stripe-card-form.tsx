import { CardElement } from '@stripe/react-stripe-js';
import { Button, message } from 'antd';
import { PureComponent } from 'react';

interface IProps {
  submit: Function;
  submiting: boolean;
  stripe: any;
  elements: any;
}

export class CardForm extends PureComponent<IProps> {
  async handleSubmit(event) {
    event.preventDefault();
    const {
      submit, submiting, stripe, elements
    } = this.props;
    if (!stripe || !elements || submiting) {
      return;
    }
    const cardElement = elements.getElement(CardElement);
    // Use your card Element with other Stripe.js APIs
    const { error, source } = await stripe.createSource(cardElement, {
      type: 'card',
      redirect: {
        return_url: `${window.location.origin}/user/payment-history`
      }
    });
    if (error) {
      // eslint-disable-next-line no-console
      message.error(error?.message || 'Invalid card information, please check then try again');
      return;
    }
    submit(source);
  }

  render() {
    const { submiting, stripe } = this.props;
    return (
      <div>
        <div className="stripe-card-form">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: '1.5rem',
                  color: '#FFFFFF',
                  '::placeholder': {
                    color: '#aab7c4'
                  }
                },
                invalid: {
                  color: '#9e2146'
                }
              }
            }}
          />
        </div>
        <Button className="profile-following-btn-card" onClick={this.handleSubmit.bind(this)} disabled={!stripe || submiting}>
          Save card
        </Button>
      </div>
    );
  }
}
