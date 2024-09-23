import { PureComponent } from 'react';
import { Layout, Result, Button } from 'antd';
import { connect } from 'react-redux';
import Head from 'next/head';
import { IUser, IUIConfig } from 'src/interfaces';
import { HomeOutlined, PhoneOutlined } from '@ant-design/icons';
import Router from 'next/router';

interface IProps {
  user: IUser;
  ui: IUIConfig;
}

class PaymentCancel extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  render() {
    const { user, ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Payment fail`}</title>
        </Head>
        <div className="main-container">
          <Result
            status="error"
            title="Payment Fail"
            subTitle={`Hi ${user?.name || user?.username || 'there'}, your payment has been fail. Please contact us for more information.`}
            extra={[
              <Button className="secondary" key="console" onClick={() => Router.push('/')}>
                <HomeOutlined />
                BACK HOME
              </Button>,
              <Button key="buy" className="primary" onClick={() => Router.push('/contact')}>
                <PhoneOutlined />
                CONTACT US
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

const mapDispatch = {};
export default connect(mapStates, mapDispatch)(PaymentCancel);
