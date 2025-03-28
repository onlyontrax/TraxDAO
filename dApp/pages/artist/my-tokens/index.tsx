/* eslint-disable react/no-unused-prop-types */
import { Layout, message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IEarning, IPerformer, IPerformerStats, IUIConfig
} from 'src/interfaces';
import { earningService } from 'src/services';
// import styles from './index.module.scss';
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { Capacitor } from '@capacitor/core';


const initial_1 = { opacity: 0, y: 20 };
const animate_1 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.8,
    delay: 1.2,
    ease: "easeOut",
  },
}
const animate_2 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.8,
    delay: 1.4,
    ease: "easeOut",
  },
}

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
    const resp = await earningService.accountStats({
      type,
      ...dateRange
    });
    resp.data && this.setState({ stats: resp.data });
    resp.data && onGetStats(resp.data);
  }

  render() {
    const { stats } = this.state;

    const { ui, performer } = this.props;

    const activeSubaccount = performer?.account?.activeSubaccount || 'user';
    const isPerformer = activeSubaccount === 'performer';
    return (
      <AnimatePresence mode="wait">
      <Layout className={`${isPerformer ? 'dark:bg-trax-zinc-900' : ''}`}>
        <Head>
          <title>{`${ui?.siteName} | Earnings`}</title>
        </Head>

        <div className="main-container-table">
          <div className="table-responsive">
            <div className='tokens-container'>
              <motion.div initial={initial_1} animate={animate_1} className='tokens-wrapper'>
                <img src='/static/credit.png' alt="TRAX logo" className='tokens-img my-auto rounded-none' />
                <div className='tokens-split'>
                  <div className='tokens-data'>
                    <span className='tokens-symbol'>TRAX credit</span>
                    <span className='tokens-balance'>{performer?.account?.balance?.toFixed(2) || 0.00} USD</span>
                  </div>
                  <div className='tokens-ex-rate'>
                    <span>${performer?.account?.balance?.toFixed(2) || 0.00}</span>
                  </div>
                </div>
              </motion.div>
              
              {!Capacitor.isNativePlatform() && (
                <motion.div initial={initial_1} animate={animate_2} className='tokens-wrapper'>
                  <img src="/static/logo_48x48.png" alt="trax" className='tokens-img rounded-full border border-custom-green border-solid' />
                  <div className='tokens-split'>
                    <div className='tokens-data'>
                      <span className='tokens-symbol'>TRAX</span>
                      <span className='tokens-balance'>{stats?.totalSiteCommissionTRAX.toFixed(2) || 0.00} TRAX <span className='text-[#6b7280]'>&#40;Crypto&#41;</span></span>
                    </div>
                    <div className='tokens-ex-rate'>
                      <span>${stats?.totalNetPriceTRAX.toFixed(2) || 0.00}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

      </Layout>
      </AnimatePresence>
    );
  }
}

const mapStates = (state) => ({
  ui: { ...state.ui },
  performer: { ...state.user.current }
});
export default connect(mapStates)(EarningPage);
