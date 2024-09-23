import { PureComponent } from 'react';
import { Layout, Button, Result } from 'antd';
import { HomeIcon } from 'src/icons';
import { HistoryOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import Head from 'next/head';
import { clearCart } from '@redux/cart/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { authService } from '@services/auth.service';
import { userService } from '@services/user.service';
import { IUser, IUIConfig } from 'src/interfaces';
import Router from 'next/router';

interface IProps {
  user: IUser;
  clearCart: Function;
  updateCurrentUser: Function;
  ui: IUIConfig;
}

class PaymentSuccess extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  componentDidMount() {
    const { clearCart: clearCartHandler } = this.props;
    this.updateCurrentUser();
    setTimeout(() => { clearCartHandler(); }, 1000);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify([]));
    }
  }

  async updateCurrentUser() {
    const { updateCurrentUser: handleUpdateUser } = this.props;
    const token = authService.getToken() || '';
    if (token) {
      const user = await userService.me({
        Authorization: token
      });
      if (!user.data._id) {
        return;
      }
      handleUpdateUser(user.data);
    }
  }

  render() {
    const { ui, user } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Payment successful`}</title>
        </Head>
        <div className="main-container">
          <Result
            status="success"
            title="Payment Successful"
            subTitle={`Hi ${user?.name || user?.username || 'there'}, your payment has been successfully processed`}
            extra={[
              <Button className="secondary" key="console" onClick={() => Router.push('/')}>
                <HomeIcon />
                BACK HOME
              </Button>,
              <Button key="buy" className="primary" onClick={() => Router.push('/user/payment-history')}>
                <HistoryOutlined />
                PAYMENT HISTORY
              </Button>
            ]}
          />
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  user: state.user.current,
  ui: state.ui
});

const mapDispatch = { clearCart, updateCurrentUser };
export default connect(mapStates, mapDispatch)(PaymentSuccess);
