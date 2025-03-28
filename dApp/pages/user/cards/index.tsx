import { PureComponent } from 'react';
import {
  message, Layout, Spin, Button
} from 'antd';
import { DeleteOutlined, CreditCardOutlined } from '@ant-design/icons';
import Head from 'next/head';
import {
  IUIConfig
} from 'src/interfaces';
import { paymentService } from '@services/index';
import { getResponseError } from '@lib/utils';
import { connect } from 'react-redux';
import Link from 'next/link';
import PageHeading from '@components/common/page-heading';
import styles from './index.module.scss';

interface IProps {
  ui: IUIConfig;
}

class CardsPage extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    cards: [],
    loading: false,
    submiting: false
  };

  componentDidMount() {
    this.getData();
  }

  async handleRemoveCard(cardId: string) {
    if (!window.confirm('Are you sure to remove this payment card?')) return;
    try {
      this.setState({ submiting: true });
      await paymentService.removeStripeCard(cardId);
      this.getData();
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
    const {
      cards, loading, submiting
    } = this.state;
    const { ui } = this.props;
    return (
      <Layout className={styles.pagesUserCardsModule}>
        <Head>
          <title>{`${ui?.siteName} | My Payment Card`}</title>
        </Head>
        <div className="main-container">
          <PageHeading title="My Payment Card" icon={<CreditCardOutlined />} />
          <div className="card-list">
            {!loading && !cards.length && (
              <p>
                No payment card found,
                {' '}
                <Link href="/user/cards/add-card">

                  click here to add a payment card

                </Link>
              </p>
            )}
            {!loading && cards.length > 0 && cards.map((card) => (
              <div className="card-item" key={card.id}>
                <Button className="remove-btn" type="link" disabled={submiting} onClick={() => this.handleRemoveCard(card.id)}>
                  <DeleteOutlined />
                  {' '}
                  Remove
                </Button>
                <div className="card-info">
                  <span className="card-last-number">
                    {`**** **** **** ${card.last4}`}
                  </span>
                  <span className="card-brand">{card.brand}</span>
                </div>
                <div className="card-holder-name">
                  {card.name || ''}
                </div>
              </div>
            ))}
            {loading && <div className="text-center"><img src="/static/trax_loading_optimize.gif" alt="Loading..." className='w-28 m-auto'/></div>}
          </div>
        </div>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  ui: { ...state.ui }
});
const mapDispatch = { };
export default connect(mapState, mapDispatch)(CardsPage);
