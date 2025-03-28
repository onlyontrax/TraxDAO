/* eslint-disable react/no-unused-prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { Layout, Statistic, Button, Avatar, Tabs, Modal, Image } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IPerformer, IPerformerStats, ISettings, IUIConfig, IUser, IAccount
} from 'src/interfaces';
import ActivityPage from './ActivityPage';
import PayoutRequest from '../../artist/payout-request';
import Tokens from '../../artist/my-tokens';
import FollowersComponent from './FollowersComponent';
import Router from 'next/router';
import { ArrowDownOnSquareStackIcon, } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import TraxButton from '@components/common/TraxButton';
import { CreditCardIcon, ArrowDownCircleIcon, PlusIcon, } from '@heroicons/react/24/solid';
import SlideUpModal from '@components/common/layout/slide-up-modal';
import { DepositICP } from '@components/user/deposit-icp';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { AuthConnect } from '../../../src/crypto/nfid/AuthConnect';
import PurchaseCredit from '@components/user/PurchaseCredit';
import { Principal } from '@dfinity/principal';
import { performerService, tokenTransctionService, authService } from '@services/index';
import { HttpAgent } from '@dfinity/agent';
import { IcrcLedgerCanister } from "@dfinity/ledger";
import { cryptoService } from '@services/index';
import SubscriptionPage from '../../user/my-subscription';
import ActivityHistoryPage from '../../user/ActivityHistoryPage';
import ReferralEarningsPage from './referral-earnings';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

interface IProps {
  account: IAccount;
  currentUser: IUser;
  ui: IUIConfig;
  settings: ISettings;
  user: IUser;
  stats: IPerformerStats;
  performer: IPerformer
}

interface IState {
  stage: number;
  activeTab: string;
  isMobile: boolean;
  isDesktop: boolean;
  isTablet: boolean;
  openConnectModal: boolean;
  walletNFID: string;
  InternetIdentityProviderProps: any;
  stats: {
    totalGrossPrice: number;
    totalSiteCommission: number;
    totalNetPrice: number;
    totalGrossPriceICP: number;
    totalGrossPriceTRAX: number;
    totalGrossPriceCKBTC: number;
    totalSiteCommissionICP: number;
    totalSiteCommissionTRAX: number;
    totalSiteCommissionCKBTC: number;
    totalNetPriceICP: number;
    totalNetPriceTRAX: number;
    totalNetPriceCKBTC: number;
    totalReferralCommission: number;
    totalAgentCommission: number;
  };
  isCopied: boolean;
  data: {
    stage: number;
    isCopied: boolean;
    balanceTRAXUSD: number;
    balanceTRAX: number;
    totalWalletBalance: number;
    isBalanceLoading: boolean;
    openDepositICPSheet: boolean;
    openPurchaseCreditSheet: boolean;
  };
  applePaymentUrl: string;
}
const { TabPane } = Tabs;


const initial_1 = { opacity: 0, y: -30 };
const animate_1 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.6,
    delay: 0.3,
    ease: "easeOut",
    once: true,
  },
}

const initial_3 = { opacity: 0, y: '50%' };
const initial_2 = { opacity: 0, y: 30 };
const animate_2 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.5,
    delay: 0.4,
    ease: "easeOut",
    once: true,
  },
}

const animate_3 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.5,
    delay: 0.6,
    ease: "easeOut",
    once: true,
  },
}

const animate_4 = {
  opacity: 1,
  y: 0,
  transition: {
    duration: 0.5,
    delay: 0.9,
    ease: "easeOut",
    once: true,
  },
}

const slideVariants = {
  hidden: {
    x: '-100%',
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 120,
      mass: 1,
      duration: 0.8,
      delay: 0.6
    }
  }
};

class WalletPage extends PureComponent<IProps, IState> {
  static authenticate = true;

  state = {
    stage: 0,
    activeTab: 'tokens',
    isMobile: false,
    isDesktop: false,
    isTablet: false,
    openConnectModal: false,
    walletNFID: this.props.currentUser.account?.wallet_icp || '',
    InternetIdentityProviderProps: cryptoService.getNfidInternetIdentityProviderProps(),
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
    isCopied: false,
    data: {
      stage: 0,
      isCopied: false,
      balanceTRAXUSD: 0,
      balanceTRAX: 0,
      totalWalletBalance: (this.props.currentUser && this.props.currentUser?.account?.balance) || 0.00,
      isBalanceLoading: true,
      openDepositICPSheet: false,
      openPurchaseCreditSheet: false,
    },
    applePaymentUrl: ''
  };

  setData = (updatedData: Partial<IState['data']>) => {
    this.setState((prevState) => ({
      data: {
        ...prevState.data,
        ...updatedData
      }
    }));
  };

  onNFIDCopy = (value: string) => {
    this.setState({
      walletNFID: value,
      openConnectModal: false
    });
  };

  getPerformerStats(childStats: IState['stats']) {
    this.setState({ stats: childStats });
}

  changeStage(val: number) {
    this.setState({ stage: val });
  }

  async componentDidMount(): Promise<void> {
    const token = authService.getToken();
    const urlParams = new URLSearchParams(window.location.search);
    const currentUrl = window.location.href;
    const newUrl = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}mobileToken=${token}&openPaymentModal=true`;

    const openPaymentModal = urlParams.get('openPaymentModal') === 'true';

    this.setState({ applePaymentUrl: newUrl });
    this.setData({ openPurchaseCreditSheet: openPaymentModal });

    await this.fetchData();
    this.checkWindowInnerWidth();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.data.openPurchaseCreditSheet && this.state.data.openPurchaseCreditSheet) {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios") {
        this.openPaymentPage();
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateMedia);
  }

  fetchData = async () => {
    let ledgerActorTRAX;
    let agent;
    const { settings, currentUser } = this.props;
    const host = settings.icHost;
    const TRAXLedgerCanID = Principal.fromText(settings.icTraxToken);

    const analytics = (await performerService.getAnalytics()).data;
    console.log("analytics", analytics);

    try {
      const traxPrice = (await tokenTransctionService.getExchangeRateTRAX()).data.rate;

      if (!currentUser.account?.wallet_icp) {
        this.setData({
          isBalanceLoading: false,
          totalWalletBalance: currentUser?.account?.balance || 0,
        });
      } else {
        agent = new HttpAgent({ host });
        if (settings.icNetwork !== true) {
          await agent.fetchRootKey();
        }

        ledgerActorTRAX = IcrcLedgerCanister.create({ agent, canisterId: TRAXLedgerCanID });

        const traxBal = await ledgerActorTRAX.balance({
          owner: Principal.fromText(currentUser.account?.wallet_icp),
          certified: false,
        });

        const traxFormattedBalance = Number(traxBal) / 100000000;
        const amountTRAXUSD = traxPrice * traxFormattedBalance;
        const total = amountTRAXUSD + (currentUser?.account?.balance || 0);

        this.setData({
          balanceTRAXUSD: amountTRAXUSD,
          balanceTRAX: traxFormattedBalance,
          totalWalletBalance: total,
          isBalanceLoading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      this.setData({ isBalanceLoading: false });
    }
  };

  checkWindowInnerWidth = () => {

    this.setState({ isMobile: window.innerWidth < 640});
    this.setState({ isTablet: window.innerWidth > 640 && window.innerWidth < 1200});
    window.addEventListener("resize", this.updateMedia);
  };

  updateMedia = () => {
    this.setState({ isMobile: window.innerWidth < 640});
    this.setState({ isDesktop: window.innerWidth > 1200 });
    this.setState({ isTablet: window.innerWidth > 640 && window.innerWidth < 1200});
  };

  formatNumber(number: number | string | undefined) {
    if (number === '' || number === undefined) return '';
    if (number === '0' || number === 0) return '0.00';
    const numStr = number.toString().replace(/,/g, '');
    const isNegative = numStr.startsWith('-');
    const cleanNum = isNegative ? numStr.slice(1) : numStr;
    const floatNum = parseFloat(cleanNum);
    if (isNaN(floatNum)) return '';
    const withDecimals = floatNum?.toFixed(2);
    const [integerPart, decimalPart] = withDecimals.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${isNegative ? '-' : ''}${formattedInteger}.${decimalPart}`;
  };

  handleCopyClick = () => {
    const { currentUser} = this.props;
    const { protocol, hostname, port } = window.location;
    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    const referralLink = `${baseUrl}/auth/register?referralCode=${currentUser?.account?.userReferral}`;

    const textArea = document.createElement('textarea');
    textArea.value = referralLink;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    this.setState({isCopied: true});
    setTimeout(() => this.setState({isCopied: false}), 3000); // Reset copied status after 2 seconds
  };

  async openPaymentPage() {
    let { applePaymentUrl } = this.state;
    if (!applePaymentUrl) return;

    applePaymentUrl = applePaymentUrl.replace(/^capacitor:\/\/localhost/, '').replace(/^\/+/, '');

    const baseDomain = "https://trax.so";

    if (!applePaymentUrl.startsWith("http://") && !applePaymentUrl.startsWith("https://")) {
        applePaymentUrl = `${baseDomain}/${applePaymentUrl}`;
    }

    try {
      //await Browser.open({ url: applePaymentUrl });
      window.open(applePaymentUrl, '_blank');
    } catch (error) {
      console.error("Failed to open browser:", error);
    }
  }

  render() {
    const { stage, stats, isCopied, activeTab, isMobile, data, isTablet } = this.state;
    const { ui, currentUser, performer, settings, account } = this.props;

    if (account === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Image src="/static/trax_loading_optimize.gif" alt="Loading..." className='w-40 m-auto'/></div>;
    }

    const activeSubaccount = currentUser?.account?.activeSubaccount || 'user';
    const isUser = activeSubaccount === 'user';
    const isPerformer = activeSubaccount === 'performer';

    return (
      <Layout className={isPerformer ? "bg-trax-zinc-900" : ""}>
        <Head>
          <title>{`${ui?.siteName} | My Earnings`}</title>
        </Head>

          <div className='bg-[#1F1F1FB2] overflow-hidden'>
            <motion.div initial={initial_3} animate={animate_1} className='m-auto w-full sm:px-8 sm:pr-12 flex mt-12 sm:mt-0 sm:h-[28vh] gap-6 sm:gap-0 items-end justify-end sm:justify-between flex-col sm:flex-row  pb-4 max-w-[1400px]'>
              <motion.span
                  initial={initial_2}
                  animate={animate_2}
                  className=' w-full sm:w-2/5 flex font-heading text-[120px]  leading-[110px] justify-center sm:justify-start  items-end font-extrabold tracking-tighter text-trax-white'
                  >
                    ${this.formatNumber(currentUser?.account?.balance)}
              </motion.span>
              <motion.div initial={initial_2} animate={animate_2} className={`w-full sm:w-3/5 flex ${isTablet || isMobile ? 'flex-col' : 'flex-row'} justify-center items-end sm:justify-end gap-2`}>
              {isUser && (
                  <>
                    <TraxButton
                      htmlType="button"
                      styleType="icon"
                      buttonSize={isMobile ? 'full' : 'large'}
                      buttonText="Add credit"
                      buttonPosition={isTablet ? 'start' : 'center'}
                      icon={<CreditCardIcon />}
                      onClick={() => this.setData({ openPurchaseCreditSheet: true })}
                    />
                    {(!Capacitor.isNativePlatform()) && (
                      <TraxButton
                        htmlType="button"
                        styleType="icon"
                        buttonSize={isMobile ? 'full' : 'large'}
                        buttonText="Deposit crypto"
                        buttonPosition={isTablet ? 'start' : 'center'}
                        icon={<PlusIcon />}
                        onClick={() => this.setState({openConnectModal : true})}
                      />
                    )}
                  </>
                )}
                <TraxButton
                  htmlType="button"
                  styleType="icon"
                  buttonSize={isMobile ? 'full' : 'large'}
                  buttonText="Withdraw"
                  buttonPosition={isTablet ? 'start' : 'center'}
                  icon={<ArrowDownOnSquareStackIcon />}
                  onClick={() => Router.push('/artist/payout-request/create')}
                />
              </motion.div>
            </motion.div>
          </div>
          {/* <motion.div initial="hidden"
                    animate="visible"
                    variants={slideVariants} className='mt-4 relative left-[0rem] flex items-end width-content '>
              <div className="w-[90%] sm:w-[300px] stats-earning-referral">
                <h2 className="stats-earning-referral-h1">
                  Refer to earn 5%
                </h2>
                <h2 className="stats-earning-referral-h2">
                  Invite artists to join trax.so and earn commission on their earnings. 5% for the first year, 1% lifetime.
                </h2>
                <TraxButton
                  htmlType="button"
                  styleType="primary"
                  buttonSize="full"
                  buttonText={isCopied ? 'Link Copied!' : 'Copy link'}
                  onClick={this.handleCopyClick}
                />
              </div>
            </motion.div> */}
        <div className={`main-container px-2 sm:px-[36px] mt-0 ${isPerformer ? 'dark:bg-trax-zinc-900' : ''}`}>
          <div className="main-container" style={{ width: "95% !important", maxWidth: "unset" }}>
          <motion.div initial={initial_2} animate={animate_4} className="artist-content">
            <div className="line-divider"/>
            <Tabs
              defaultActiveKey="tokens"
              className="earnings-tabs sm:gap-10"
              size="large"
              onTabClick={(t: string) => {
                this.setState({ activeTab: t });
              }}
            >
              <TabPane
                key="tokens"
                className="posts-tab-wrapper"
                tab={isMobile ? "Tokens" : (
                  <div className="flex flex-row">
                    <span>Tokens</span>
                    <div className={`absolute right-2 top-[1.25rem] bg-[#414141B2] rounded-lg ${activeTab === "tokens" && 'border border-custom-green'}`}>
                      <ChevronRightIcon className={`w-7 h-7 ${activeTab === "tokens" ? 'text-custom-green' : 'text-trax-white'}`} />
                    </div>
                  </div>
                )}
              >
                <Tokens onGetStats={this.getPerformerStats.bind(this)} />
              </TabPane>

              <TabPane
                key="activity"
                className="posts-tab-wrapper"
                tab={isMobile ? "Activity" : (
                  <div className="flex flex-row">
                    <span>Activity</span>
                    <div className={`absolute right-2 top-[1.25rem] bg-[#414141B2] rounded-lg ${activeTab === "activity" && 'border border-custom-green'}`}>
                      <ChevronRightIcon className={`w-7 h-7 ${activeTab === "activity" ? 'text-custom-green' : 'text-trax-white'}`} />
                    </div>
                  </div>
                )}
              >
                <ActivityPage onGetStats={this.getPerformerStats.bind(this)} />
              </TabPane>

              {isPerformer && (
                <>
                  <TabPane
                    key="withdrawals"
                    className="posts-tab-wrapper"
                    tab={isMobile ? "Withdrawals" : (
                      <div className="flex flex-row">
                        <span>Withdrawals</span>
                        <div className={`absolute right-2 top-[1.25rem] bg-[#414141B2] rounded-lg ${activeTab === "withdrawals" && 'border border-custom-green'}`}>
                          <ChevronRightIcon className={`w-7 h-7 ${activeTab === "withdrawals" ? 'text-custom-green' : 'text-trax-white'}`} />
                        </div>
                      </div>
                    )}
                  >
                    <PayoutRequest />
                  </TabPane>

                  <TabPane
                    key="followers"
                    className="posts-tab-wrapper"
                    tab={isMobile ? "Followers" : (
                      <div className="flex flex-row">
                        <span>Followers</span>
                        <div className={`absolute right-2 top-[1.25rem] bg-[#414141B2] rounded-lg ${activeTab === "followers" && 'border border-custom-green'}`}>
                          <ChevronRightIcon className={`w-7 h-7 ${activeTab === "followers" ? 'text-custom-green' : 'text-trax-white'}`} />
                        </div>
                      </div>
                    )}
                  >
                    <FollowersComponent />
                  </TabPane>
                </>
              )}

              {isUser && (
                <TabPane
                  key="subscriptions"
                  className="posts-tab-wrapper"
                  tab={isMobile ? "Subscriptions" : (
                    <div className="flex flex-row">
                      <span>Subscriptions</span>
                      <div className={`absolute right-2 top-[1.25rem] bg-[#414141B2] rounded-lg ${activeTab === "subscriptions" && 'border border-custom-green'}`}>
                        <ChevronRightIcon className={`w-7 h-7 ${activeTab === "subscriptions" ? 'text-custom-green' : 'text-trax-white'}`} />
                      </div>
                    </div>
                  )}
                >
                  <SubscriptionPage currentUser={currentUser} ui={ui} settings={settings} />
                </TabPane>
              )}

              {/* <TabPane
                key="referrals"
                className="posts-tab-wrapper"
                tab={isMobile ? "Referrals" : (
                  <div className="flex flex-row">
                    <span>Referrals</span>
                    <div className={`absolute right-2 top-[1.25rem] bg-[#414141B2] rounded-lg ${activeTab === "referrals" && 'border border-custom-green'}`}>
                      <ChevronRightIcon className={`w-7 h-7 ${activeTab === "referrals" ? 'text-custom-green' : 'text-trax-white'}`} />
                    </div>
                  </div>
                )}
              >
                <ReferralEarningsPage />
              </TabPane> */}
            </Tabs>
          </motion.div>
          </div>
        </div>

        {/* Deposit Modal */}

        {isMobile ? (
          <SlideUpModal
            isOpen={this.state.openConnectModal}
            onClose={() => this.setData({ openPurchaseCreditSheet: false })}
          >
            {currentUser.account?.wallet_icp ? (
              <DepositICP user={currentUser} />
                ) : (
                  <div className='p-8'>
                    <div style={{ marginBottom: '15px' }} >

                      <span style={{ fontSize: '23px', fontWeight: '600', color: 'white' }}>Connect </span>
                      <br />
                      <span style={{ fontSize: '14px', color: 'grey' }}>Select your preferred wallet to connect to TRAX</span>
                    </div>
                    <InternetIdentityProvider {...this.state.InternetIdentityProviderProps}>
                      <AuthConnect onNFIDConnect={this.onNFIDCopy} isPerformer={false} oldWalletPrincipal={currentUser.account?.wallet_icp} />
                    </InternetIdentityProvider>
                  </div>
              )}
          </SlideUpModal>
        ) : (
          <div className='sign-in-modal-wrapper'>
            <Modal
              key="purchase_post"
              className="purchase-modal ppv-modal"
              title={null}
              open={this.state.openConnectModal}
              footer={null}
              width={600}
              destroyOnClose
              onCancel={() => this.setState({openConnectModal :false})}
            >
              {currentUser.account?.wallet_icp ? (
                  <DepositICP user={currentUser} />
                ) : (
              <div className='p-8'>


                <div style={{ marginBottom: '15px' }} >

                  <span style={{ fontSize: '23px', fontWeight: '600', color: 'white' }}>Connect </span>
                  <br />
                  <span style={{ fontSize: '14px', color: 'grey' }}>Select your preferred wallet to connect to TRAX</span>
                </div>
                <InternetIdentityProvider {...this.state.InternetIdentityProviderProps}>
                  <AuthConnect onNFIDConnect={this.onNFIDCopy} isPerformer={false} oldWalletPrincipal={currentUser.account?.wallet_icp} />
                </InternetIdentityProvider>
              </div>
              )}
            </Modal>
          </div>
        )
        }

        {/* Purchase Credit Modal */}
        {
          /*isMobile ? (
              <SlideUpModal
                    isOpen={this.state.data.openPurchaseCreditSheet}
                    onClose={() => this.setData({ openPurchaseCreditSheet: false })}
                    >
                    <PurchaseCredit user={currentUser} settings={settings} />
                </SlideUpModal>
          ) : (*/
          ((!Capacitor.isNativePlatform() && Capacitor.getPlatform() !== 'ios')) && (
            <Modal
              key="purchase_credit"
              className="border border-0.5 border-slaps-gray rounded"
              title={null}
              open={this.state.data.openPurchaseCreditSheet}
              footer={null}
              width={500}
              destroyOnClose
              onCancel={() => this.setData({ openPurchaseCreditSheet: false })}
            >
              <div className='p-4'>
                {(Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') && (
                  <h3>Redirecting to payment website. Please close this modal after you are done.</h3>
                )}
                {(!Capacitor.isNativePlatform()) && (
                  <PurchaseCredit user={currentUser} settings={settings} />
                )}
              </div>
            </Modal>
          )
          /*)*/
        }
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  ui: { ...state.ui },
  currentUser: { ...state.user.current },
  account: { ...state.user.account },
  settings: { ...state.settings },
  performer: {...state.performer}
});
const mapDispatch = {};
export default connect(mapState, mapDispatch)(WalletPage);
