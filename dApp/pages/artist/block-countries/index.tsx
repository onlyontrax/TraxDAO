import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { message, Layout, Spin } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import {
  IPerformer, IUIConfig, ICountry, IBlockCountries
} from 'src/interfaces';
import {
  blockService, utilsService
} from '@services/index';
import {
  PerformerBlockCountriesForm
} from '@components/performer';
import { updateUserSuccess } from '@redux/user/actions';
import PageHeading from '@components/common/page-heading';
import styles from '../../user/index.module.scss';

interface IProps {
  performer: IPerformer;
  ui: IUIConfig;
  countries: ICountry[];
  updateUserSuccess: Function;
}

class BlockCountries extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  async getData() {
    try {
      const [countries] = await Promise.all([utilsService.countriesList()]);
      return {
        countries: countries && countries.data ? countries.data : []
      };
    } catch (e) {
      return {
        countries: []
      };
    }
  }

  state = {
    submiting: false,
    countries: null
  }

  async componentDidMount() {
    const { countries } = this.state;
    if (countries === null) {
      const data = await this.getData();

      this.setState({ countries: data.countries }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
    }
  }

  updateDataDependencies() {}

  async handleUpdateBlockCountries(data: IBlockCountries) {
    const { performer, updateUserSuccess: onUpdateSuccess } = this.props;
    try {
      this.setState({ submiting: true });
      const resp = await blockService.blockCountries(data);
      onUpdateSuccess({ ...performer, blockCountries: resp.data });
      this.setState({ submiting: false });
      message.success('Changes saved');
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try againl later');
      this.setState({ submiting: false });
    }
  }

  render() {
    const {
      performer, ui
    } = this.props;
    const { submiting, countries } = this.state;

    if (countries === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    return (
      <Layout className={styles.pagesUserBookmarksModule}>
        <Head>
          <title>{`${ui?.siteName} | Block Countries`}</title>
        </Head>
        <div className="main-container user-account">
          <PageHeading title="Block Countries" icon={<StopOutlined />} />
          <PerformerBlockCountriesForm
            onFinish={this.handleUpdateBlockCountries.bind(this)}
            updating={submiting}
            blockCountries={performer?.blockCountries || { countryCodes: [] }}
            countries={countries}
          />
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  currentUser: state.user.current,
  ui: { ...state.ui }
});
const mapDispatch = {
  updateUserSuccess
};
export default connect(mapStates, mapDispatch)(BlockCountries);
