import { DeleteOutlined } from '@ant-design/icons';
import { CardForm as StripeCardForm } from '@components/user/stripe-card-form';
import { getResponseError } from '@lib/utils';
import { getCurrentUser } from '@redux/auth/actions';
import { paymentService } from '@services/index';
import { Elements, ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Button, Layout, Spin, message
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ISettings, IUIConfig } from 'src/interfaces';
import styles from './index.module.scss';

interface IProps {
  ui: IUIConfig;
  settings: ISettings;
  getCurrentUser: Function;
}

class NewCardPage extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    cards: [],
    loading: false,
    submiting: false
  };

  componentDidMount() {
    this.getData();
  }

  async handleAddCard(source: any) {
    const { getCurrentUser: handleUpdateCurrentUser } = this.props;
    try {
      await this.setState({ submiting: true });
      await paymentService.addStripeCard({ sourceToken: source.id });
      handleUpdateCurrentUser();
      this.getData();
      message.success('Payment card added successfully');
      this.setState({ submiting: false });
    } catch (error) {
      const e = await error;
      message.error(e?.message || 'An error occured. Please try again.');
      this.setState({ submiting: false });
    }
  }

  async handleRemoveCard(cardId: string) {
    if (!window.confirm('Are you sure to remove this payment card?')) return;
    try {
      this.setState({ submiting: true });
      await paymentService.removeStripeCard(cardId);
      this.getData();
      this.setState({ submiting: false });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  async getData() {
    try {
      this.setState({ loading: true });
      const resp = await paymentService.getStripeCards();
      this.setState({
        cards: resp.data.data.map((d) => {
          if (d.card) return { ...d.card, id: d.id };
          if (d.three_d_secure) return { ...d.three_d_secure, id: d.id };
          return d;
        })
      });
    } catch (error) {
      message.error(getResponseError(await error) || 'An error occured. Please try again.');
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { ui, settings } = this.props;
    const { cards, loading, submiting } = this.state;
    return (
      <Layout className={styles.pagesUserCardsModule} style={{background: 'transparent'}}>
        <Head>
          <title>{`${ui?.siteName} | Add New Card`}</title>
        </Head>
        <div  >
          <div className="card-form">
            {!loading && !cards.length && (
              <Elements stripe={loadStripe(settings.stripePublishableKey || '')}>
                <ElementsConsumer>
                  {({ stripe, elements }) => (
                    <StripeCardForm
                      submit={this.handleAddCard.bind(this)}
                      stripe={stripe}
                      elements={elements}
                      submiting={submiting}
                    />
                  )}
                </ElementsConsumer>
              </Elements>
            )}
            {!loading
              && cards.length > 0
              && cards.map((card) => (
                <div className="card-item" key={card.id}>
                  <div className='card-background'/>
                  <Button
                    className="remove-btn"
                    type="link"
                    disabled={submiting}
                    onClick={() => this.handleRemoveCard(card.id)}
                  >
                    <DeleteOutlined />
                    {' '}
                    Remove
                  </Button>
                  <div className="card-info">
                    <span className="card-last-number">{`**** **** **** ${card.last4}`}</span>
                    <span className="card-brand">{card.brand}</span>
                  </div>
                  <div className="card-holder-name">{card.name || ''}</div>
                </div>
              ))}
            {loading && (
              <div className="text-center">
                <Spin />
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  ui: { ...state.ui },
  settings: { ...state.settings }
});
const mapDispatch = { getCurrentUser };
export default connect(mapState, mapDispatch)(NewCardPage);
