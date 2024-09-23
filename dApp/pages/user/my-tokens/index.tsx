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
interface IProps {
  user: IUser;
  balanceICPUSD: number;
  balanceCKBTCUSD: number;
  balanceICP: number;
  balanceCKBTC: number;
  balanceTRAX: number;
  balanceTRAXUSD: number;
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
    const { user, balanceICPUSD, balanceCKBTCUSD, balanceTRAXUSD, balanceTRAX, balanceICP, balanceCKBTC } = this.props;
    const { icpPrice, ckbtcPrice } = this.state;

    return (
      <Layout>
        <div className="main-container-table">
            <div className='tokens-container'>
              <div className='tokens-wrapper'>
                <img src="/static/usd-logo.png" alt="dollars" className='tokens-img' />
                <div className='tokens-split'>
                  <div className='tokens-data'>
                    <span className='tokens-symbol'>US Dollars</span>
                    <span className='tokens-balance'>{(user && user?.balance && user?.balance.toFixed(2)) || 0} USD</span>
                  </div>
                  <div className='tokens-ex-rate'>
                    <span>${(user && user?.balance && user?.balance.toFixed(2)) || 0}</span>
                  </div>
                </div>
              </div>
              <div className='tokens-wrapper'>
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
              </div>
              <div className='tokens-wrapper'>
                <img src="/static/trax-token.png" alt="trax" className='tokens-img' />
                <div className='tokens-split'>
                  <div className='tokens-data'>
                    <span className='tokens-symbol'>TRAX</span>
                    <span className='tokens-balance'>{balanceTRAX.toFixed(2) || 0} TRAX</span>
                  </div>
                  <div className='tokens-ex-rate'>
                    <span>${(balanceTRAXUSD && balanceTRAXUSD.toFixed(2)) || 0}</span>
                  </div>
                </div>
              </div>
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
