/* eslint-disable react/no-unused-prop-types */
import { Layout, Button } from 'antd';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IEarning, IUser, IPerformerStats, IUIConfig, ISearch, ISettings
} from 'src/interfaces';
import Image from 'next/image';
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import { createLedgerActor } from '../../../src/crypto/ledgerActor';
import { Tokens } from '../../../src/smart-contracts/declarations/ledger/ledger2.did';
import styles from './index.module.scss';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import { AnimatePresence, motion } from "framer-motion";
import { Capacitor } from '@capacitor/core';
interface IProps {
  user: IUser;
  balanceTRAX: number;
  balanceTRAXUSD: number;
}


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

class MyTokens extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    totalWalletBalance: 0,
    isBalanceLoading: true,
    icpPrice: 0,
    ckbtcPrice: 0,
    traxPrice: 0,
  };

  async componentDidMount() {
  }

  render() {
    const { user, balanceTRAXUSD, balanceTRAX,} = this.props;
    const { icpPrice, ckbtcPrice } = this.state;

    return (
      <Layout>
        <div className="main-container-table">
            <div className='tokens-container'>
              <motion.div initial={initial_1} animate={animate_1} className='tokens-wrapper'>
                <img src='/static/credit.png' alt="TRAX logo" className='tokens-img my-auto rounded-none' />
                <div className='tokens-split'>
                  <div className='tokens-data'>
                    <span className='tokens-symbol'>Credit</span>
                    <span className='tokens-balance'>{(user && user?.account?.balance?.toFixed(2)) || 0.00}</span>
                  </div>
                  <div className='tokens-ex-rate'>
                    <span>${(user && user?.account?.balance?.toFixed(2)) || 0.00}</span>
                  </div>
                </div>
              </motion.div>
              {/* <div className='tokens-wrapper'>
                <img src="/static/icp-logo.png" alt="icp" className='tokens-img' />
                <div className='tokens-split'>
                  <div className='tokens-data'>
                    <span className='tokens-symbol'>ICP</span>
                    <span className='tokens-balance'>{(balanceICP && balanceICP.toFixed(3)) || 0} ICP</span>
                  </div>
                  <div className='tokens-ex-rate'>
                    <span>${(balanceICP && balanceICPUSD.toFixed(2)) || 0}</span>
                  </div>
                </div>
              </div>
              <div className='tokens-wrapper'>
                <img src="/static/ckbtc_nobackground.svg" alt="ckbtc" className='tokens-img' />
                <div className='tokens-split'>
                  <div className='tokens-data'>
                    <span className='tokens-symbol'>ckBTC</span>
                    <span className='tokens-balance'>{balanceCKBTC || 0} ckBTC</span>
                  </div>
                  <div className='tokens-ex-rate'>
                    <span>${(balanceCKBTCUSD && balanceCKBTCUSD.toFixed(2)) || 0}</span>
                  </div>
                </div>
              </div> */}
              {!Capacitor.isNativePlatform() && (
                <motion.div initial={initial_1} animate={animate_2} className='tokens-wrapper'>
                  <img src="/static/logo_48x48.png" alt="trax" className='tokens-img rounded-full border border-custom-green border-solid' />
                  <div className='tokens-split'>
                    <div className='tokens-data'>
                      <span className='tokens-symbol'>TRAX  <span className='text-[#6b7280]'>&#40;Crypto&#41;</span></span>
                      <span className='tokens-balance'>{balanceTRAX?.toFixed(2) || 0.00} TRAX</span>
                    </div>
                    <div className='tokens-ex-rate'>
                      <span>${balanceTRAXUSD?.toFixed(2) || 0.00}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state) => ({
  performer: { ...state.user.current },
});
export default connect(mapStates)(MyTokens);
