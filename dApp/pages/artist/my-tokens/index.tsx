/* eslint-disable react/no-unused-prop-types */
import { Layout, message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
// import { TokenListEarning } from '@components/performer/tokens';
import { getResponseError } from '@lib/utils';
import { SearchFilter } from 'src/components/common/search-filter';
import {
  IEarning, IPerformer, IPerformerStats, IUIConfig
} from 'src/interfaces';
import { earningService } from 'src/services';
// import styles from './index.module.scss';

interface IProps {
  performer: IPerformer;
  ui: IUIConfig;
  onGetStats: Function;
}
interface IStates {
  stats: IPerformerStats;
  type: string;
  dateRange: any;
}

const initialState = {
  stats: {
    totalGrossPrice: 0,
    totalSiteCommission: 0,
    totalNetPrice: 0,
    totalGrossPriceICP: 0,
    totalGrossPriceTRAX: 0,
    totalGrossPriceCKBTC: 0,
    totalSiteCommissionICP: 0,
    totalSiteCommissionTRAX: 0,
    totalSiteCommissionCKBTC: 0,
    totalNetPriceICP: 0,
    totalNetPriceTRAX: 0,
    totalNetPriceCKBTC: 0,
    totalReferralCommission: 0,
    totalAgentCommission: 0
  },
  type: '',
  dateRange: null
};

const currencies = [
    { name: 'USD', imgSrc: '/static/usd-logo.png', symbol: 'USD' },
    { name: 'ICP', imgSrc: '/static/icp-logo.png', symbol: 'ICP' },
    { name: 'ckBTC', imgSrc: '/static/ckbtc_nobackground.svg', symbol: 'ckBTC' }
  ]

class EarningPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  constructor(props: IProps) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    this.getPerformerStats();
  }

  async getPerformerStats() {
    const { dateRange, type } = this.state;
    const { onGetStats } = this.props;
    const resp = await earningService.performerStarts({
      type,
      ...dateRange
    });
    resp.data && this.setState({ stats: resp.data });
    resp.data && onGetStats(resp.data);
  }

  render() {
    const { stats } = this.state;

    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Earnings`}</title>
        </Head>

        <div className="main-container-table">
          <div className="table-responsive">
            <div className='tokens-container'>
                <div className='tokens-wrapper'>
                    <img src="/static/usd-logo.png" alt="dollars" className='tokens-img'/>
                    <div className='tokens-split'>
                        <div className='tokens-data'>
                            <span className='tokens-symbol'>US Dollars</span>
                            <span className='tokens-balance'>{stats?.totalNetPrice.toFixed(2) || 0} USD</span>
                        </div>
                        <div className='tokens-ex-rate'>
                            <span>${stats?.totalNetPrice.toFixed(2) || 0}</span>
                        </div>
                    </div>
                </div>
                <div className='tokens-wrapper'>
                    <img src="/static/icp-logo.png" alt="icp" className='tokens-img' />
                    <div className='tokens-split'>
                        <div className='tokens-data'>
                            <span className='tokens-symbol'>ICP</span>
                            <span className='tokens-balance'>{stats?.totalSiteCommissionICP.toFixed(3) || 0} ICP</span>
                        </div>
                        <div className='tokens-ex-rate'>
                            <span>${stats?.totalNetPriceICP.toFixed(2) || 0}</span>
                        </div>
                    </div>
                </div>
                <div className='tokens-wrapper'>
                    <img src="/static/ckbtc_nobackground.svg" alt="ckbtc" className='tokens-img' />
                    <div className='tokens-split'>
                        <div className='tokens-data'>
                            <span className='tokens-symbol'>ckBTC</span>
                            <span className='tokens-balance'>{stats?.totalSiteCommissionCKBTC.toFixed(3) || 0} ckBTC</span>
                        </div>
                        <div className='tokens-ex-rate'>
                            <span>${stats?.totalNetPriceCKBTC.toFixed(2) || 0}</span>
                        </div>
                    </div>
                </div>
                <div className='tokens-wrapper'>
                    <img src="/static/trax-token.png" alt="trax" className='tokens-img' />
                    <div className='tokens-split'>
                        <div className='tokens-data'>
                            <span className='tokens-symbol'>TRAX</span>
                            <span className='tokens-balance'>{stats?.totalSiteCommissionTRAX.toFixed(3) || 0} TRAX</span>
                        </div>
                        <div className='tokens-ex-rate'>
                            <span>${stats?.totalNetPriceTRAX.toFixed(2) || 0}</span>
                        </div>
                    </div>

                </div>
                <div>

                </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state) => ({
  ui: { ...state.ui },
  performer: { ...state.user.current }
});
export default connect(mapStates)(EarningPage);
