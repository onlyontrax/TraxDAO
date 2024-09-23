/* eslint-disable react/no-unused-prop-types, react/no-unused-state */
import { Layout, Row, message, Spin } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { PerformerPaypalForm, StripeConnectForm } from '@components/performer';
import { paymentService, performerService, utilsService } from '@services/index';
import {
  ICountry, IPerformer, ISettings, IUIConfig
} from 'src/interfaces';
import { updatePerformer, updateUserSuccess } from 'src/redux/user/actions';
import styles from '../../user/index.module.scss';

interface IProps {
  user: IPerformer;
  ui: IUIConfig;
  updatePerformer: Function;
  settings: ISettings;
  countries: ICountry[];
  updateUserSuccess: Function;
}
class BankingSettings extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  async getData() {
    try {
      const [countries] = await Promise.all([utilsService.countriesList()]);
      return {
        countries: countries?.data || []
      };
    } catch (e) {
      return {
        countries: []
      };
    }
  }//business name, icon, brand color in order to create an account link

  state = {
    loading: false,
    submitingPP: false,
    submitingStripe: false,
    loginUrl: '',
    stripeAccount: null,
    countries: null
  };

  async componentDidMount() {
    const { countries } = this.state;
    if (countries === null) {
      const data = await this.getData();

      this.setState({ countries: data.countries }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
    }
  }

  updateDataDependencies() {
    const { settings } = this.props;
    settings.paymentGateway === 'stripe' && this.getAccount();
  }

  async handleUpdatePaypal(data) {
    const { user, updateUserSuccess: onUpdateSuccess } = this.props;
    try {
      this.setState({ submitingPP: true });
      const payload = { key: 'paypal', value: data, performerId: user._id };
      const resp = await performerService.updatePaymentGateway(user._id, payload);
      onUpdateSuccess({ ...user, paypalSetting: resp.data });
      this.setState({ submitingPP: false });
      message.success('Paypal account was updated successfully!');
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try againl later');
      this.setState({ submitingPP: false });
    }
  }

  async getAccount() {
    try {
      const { user, updatePerformer: handleUpdateStripe } = this.props;
      await this.setState((state) => ({ ...state, loading: true }));
      const [loginLink, account] = await Promise.all([
        paymentService.loginLink(),
        paymentService.retrieveStripeAccount()
      ]);
      this.setState({
        loginUrl: loginLink.data.url,
        stripeAccount: account.data,
        loading: false
      });
      handleUpdateStripe({ ...user, stripeAccount: account.data });
    } catch {
      this.setState({ loading: false });
    }
  }

  async connectAccount() {
    try {
      await this.setState({ submitingStripe: true });
      const resp = (await paymentService.connectStripeAccount()).data;
      if (resp.url) {
        window.location.href = resp.url;
      }
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    } finally {
      this.setState({ submitingStripe: false });
    }
  }

  render() {
    const { ui, user } = this.props;
    const { loading, submitingPP, submitingStripe, loginUrl, stripeAccount } = this.state;
    return (
      <Layout className={styles.pagesUserBookmarksModule}>
        <Head>
          <title>{`${ui?.siteName} | Banking (to earn)`}</title>
        </Head>

        <div className="account-form-settings">
          <div style={{ width: '100%' }}>
            <h1 className="profile-page-heading">Cash out</h1>
            <span className='profile-page-subtitle'>Connect to Stripe or PayPal to withdraw your earnings from TRAX</span>

            <StripeConnectForm stripeAccount={stripeAccount} loading={loading || submitingStripe} loginUrl={loginUrl} onConnectAccount={this.connectAccount.bind(this)} />

            {user?.paypalSetting?.value?.email ? (
              <div className='profile-form-box-connected'>
                <span className='text-lg'>Paypal connected</span>
                <span className='text-trax-gray-300'>You have successfully connected a PayPal account. To change this account, please enter new email and press submit.</span>
                <div className='w-full flex '>
                  <PerformerPaypalForm onFinish={this.handleUpdatePaypal.bind(this)} updating={submitingPP} user={user} />
                </div>
              </div>
            ) : (
              <div className='profile-form-box-unconnected'>
                <span className='text-lg text-trax-black '>Connect to PayPal</span>
                <span className='text-trax-gray-700'>Enter your email and by clicking ‘Connect’ you will be redirected to connect your PayPal account.</span>
                <div className='w-full flex '>
                  <PerformerPaypalForm onFinish={this.handleUpdatePaypal.bind(this)} updating={submitingPP} user={user} />
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui,
  user: state.user.current,
  settings: state.settings
});
const mapDispatch = { updatePerformer, updateUserSuccess };
export default connect(mapStates, mapDispatch)(BankingSettings);
