/* eslint-disable react/no-unused-prop-types, react/no-unused-state */
import { Layout, Row, message, Spin } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { PerformerPaypalForm } from '@components/performer';
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
  }

  state = {
    loading: false,
    submiting: false,
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
      this.setState({ submiting: true });
      const payload = { key: 'paypal', value: data, performerId: user._id };
      const resp = await performerService.updatePaymentGateway(user._id, payload);
      onUpdateSuccess({ ...user, paypalSetting: resp.data });
      this.setState({ submiting: false });
      message.success('Paypal account was updated successfully!');
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try againl later');
      this.setState({ submiting: false });
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

  render() {
    const { ui, user } = this.props;
    const { submiting } = this.state;
    return (
      <Layout className={styles.pagesUserBookmarksModule}>
        <Head>
          <title>{`${ui?.siteName} | Banking (to earn)`}</title>
        </Head>
        <div className="account-form">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '100%' }}>
              <h1 className="profile-page-heading">Connect PayPal</h1>
              <p className="profile-page-subtitle">
                PayPal is the best way to withdraw US Dollars from your TRAX account
              </p>
                <PerformerPaypalForm onFinish={this.handleUpdatePaypal.bind(this)} updating={submiting} user={user} />
            </div>
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
