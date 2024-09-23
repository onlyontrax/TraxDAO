/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/interactive-supports-focus */
import { Principal } from '@dfinity/principal';
import { IUser } from '@interfaces/index';
import {
  Avatar,
  Divider, message
} from 'antd';
import { PureComponent } from 'react';
import { TickIcon } from 'src/icons';
import { principalToAccountIdentifier } from '../../crypto/account_identifier';

interface IProps {
  user: IUser
}

export class DepositICP extends PureComponent<IProps> {
  state = {
    AI: ''
  }

  componentDidMount() {
    const { user } = this.props;
    if (user) {
      const fanIdentifier = principalToAccountIdentifier(Principal.fromText(user?.wallet_icp));
      this.setState({
        AI: fanIdentifier
      });
    }
  }

  copy = async (text: any) => {
    await navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  }

  render() {
    const {
      user
    } = this.props;
    const { AI } = this.state;

    return (
      <div>
        <div className="confirm-purchase-form bg-trax-black md:p-8">
          <div className="left-col">
            {/* <Avatar src={user?.avatar || '/static/no-avatar.png'} />
            <div className="p-name" />
            <div className="p-username">
              {user?.name || 'N/A'}
              {' '}
              {user?.verifiedAccount && <TickIcon className="primary-color" />}
            </div> */}
            <div className="deposit-icp-info">
              <div className="deposit-icp-header">
                Deposit
              </div>
              <div className="border-2 border-trax-gray-900 rounded-lg p-4">
                <div className="deposit-icp-body-1">
                  <h3 className="deposit-icp-">From another ICP Wallet </h3>
                  <h4 className="deposit-icp-body-1">Use when receiving from Plug, Stoic, Infinity etc accounts or other apps that support sending directly to Principal ID&apos;s.</h4>
                </div>
                <div className="deposit-icp-body-2">
                  <span className="deposit-icp-value">{`${user?.wallet_icp.slice(0, 5)}...${user?.wallet_icp.slice(-3)}`}</span>
                  <div className="deposit-icp-wrapper">
                    <span className="principal-id-tag">Principal ID</span>
                    <div className="copy-clipboard" onClick={() => this.copy(user?.wallet_icp)}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#999999">
                        <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                        <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Divider>Or</Divider>
            <div className="deposit-icp-info border-2 border-trax-gray-900 rounded-lg p-4">
              <div className="deposit-icp-body-1">
                <h3 className="deposit-icp-">From Exchange, DFX, or Account ID</h3>
                <h4 className="deposit-icp-body-1">Use when receiving from exchanges or other apps that only support sending to Account ID&apos;s.</h4>
              </div>
              <div className="deposit-icp-body-2">
                <span className="deposit-icp-value">{`${AI.slice(0, 4)}...${AI.slice(-4)}`}</span>
                <div className="deposit-icp-wrapper">
                  <span className="account-id-tag">Account ID</span>
                  <div role="button" aria-label="clipboard" className="copy-clipboard" onClick={() => this.copy(AI)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#999999">
                      <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                      <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
