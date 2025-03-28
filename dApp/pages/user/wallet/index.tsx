/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react';
import { Layout, Button, message, Statistic, Modal, Tabs } from 'antd';
import { useSelector, RootStateOrAny } from 'react-redux';
import SubscriptionPage from '../my-subscription';
import ActivityHistoryPage from '../ActivityHistoryPage';
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/nns';
import { AccountBalanceArgs } from '@dfinity/nns/dist/candid/ledger';
import { createLedgerActor } from '../../../src/crypto/ledgerActor';
import { Tokens } from '../../../src/smart-contracts/declarations/ledger/ledger2.did';
import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
import { tokenTransctionService } from '@services/index';
import MyTokens from '../my-tokens';
import { CreditCardIcon, ArrowDownCircleIcon, PlusIcon, } from '@heroicons/react/24/solid';
import { DepositICP } from '@components/user/deposit-icp';
import PurchaseCredit from '@components/user/PurchaseCredit';
import { Sheet } from 'react-modal-sheet';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { performerService, cryptoService } from '@services/index';
import { AuthConnect } from '../../../src/crypto/nfid/AuthConnect'
import useDeviceSize from 'src/components/common/useDeviceSize';
import TraxButton from '@components/common/TraxButton';
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import SlideUpModal from '@components/common/layout/slide-up-modal';


const initial_1 = { opacity: 0, y: '30%' };
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
const { TabPane } = Tabs;

export default function MyPaymentsPage() {
  const { currentUser, ui, settings } = useSelector((data: RootStateOrAny) => ({
    ui: data.ui,
    currentUser: data.user.current,
    settings: data.settings,
  }));

  const onNFIDCopy = (value: string) => {
    setWalletNFID(value);
    setOpenConnectModal(false);
  };

  const [data, setData] = useState({
    stage: 0,
    isCopied: false,
    balanceTRAXUSD: 0,
    balanceTRAX: 0,
    totalWalletBalance: (currentUser && currentUser?.account?.balance) || 0.00,
    isBalanceLoading: true,
    openDepositICPSheet: false,
    openPurchaseCreditSheet: false,
  });

  const {
    stage,
    isCopied,
    balanceTRAXUSD,
    balanceTRAX,
    totalWalletBalance,
    openDepositICPSheet,
    openPurchaseCreditSheet,
  } = data;

  const [walletNFID, setWalletNFID] = useState<string>(currentUser.account?.wallet_icp);
  const InternetIdentityProviderProps: any = cryptoService.getNfidInternetIdentityProviderProps();
  const [openConnectModal, setOpenConnectModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('tokens')

  const { isMobile } = useDeviceSize();

  useEffect(() => {
    setData(prevData => ({
      ...prevData,
      totalWalletBalance: (currentUser && currentUser?.account?.balance) || 0.00,
    }));
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      let ledgerActorTRAX;
      let agent;

      const host = settings.icHost;
      const TRAXLedgerCanID = Principal.fromText(settings.icTraxToken);

      const traxPrice = (await tokenTransctionService.getExchangeRateTRAX()).data.rate;

      setData(prevData => ({
        ...prevData,
      }));

      if (!currentUser.account?.wallet_icp) {
        setData(prevData => ({
          ...prevData,
          isBalanceLoading: false,
          totalWalletBalance: (currentUser && currentUser?.account?.balance) || 0,
        }));
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
        const total = amountTRAXUSD + ((currentUser && currentUser?.account?.balance) || 0);

        setData(prevData => ({
          ...prevData,
          balanceTRAXUSD: amountTRAXUSD,
          balanceTRAX: traxFormattedBalance,
          totalWalletBalance: total,
          isBalanceLoading: false,
        }));
      }
    };

    fetchData();

  }, [currentUser, settings]); // currentUser, settings

  const handleCopyClick = async () => {
    const { protocol, hostname, port } = window.location;
    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    const referralLink = `${baseUrl}/register?referralCode=${currentUser?.account?.userReferral}`;

    try {
      await navigator.clipboard.writeText(referralLink);
      message.success('Referral link copied to clipboard'); // Optional: Display a success message

      setData(prevData => ({
        ...prevData,
        isCopied: true,
      }));

      setTimeout(() => {
        setData(prevData => ({
          ...prevData,
          isCopied: false,
        }));
      }, 3000); // Reset copied status after 3 seconds
    } catch (err) {
      message.error('Could not copy referral link'); // Optional: Display an error message
    }
  };

  const formatNumber = (number) => {
    if (number === '' || number === undefined) return '';
    if (number === '0' || number === 0) return '0.00';
    const numStr = number.toString().replace(/,/g, '');
    const isNegative = numStr.startsWith('-');
    const cleanNum = isNegative ? numStr.slice(1) : numStr;
    const floatNum = parseFloat(cleanNum);
    if (isNaN(floatNum)) return '';
    const withDecimals = floatNum.toFixed(2);
    const [integerPart, decimalPart] = withDecimals.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${isNegative ? '-' : ''}${formattedInteger}.${decimalPart}`;
  };

  const changeStage = val => {
    setData(prevData => ({
      ...prevData,
      stage: val,
    }));
  };

  return (
    <Layout>
      <div className='bg-[#1F1F1FB2] overflow-hidden'>
      <motion.div initial={initial_1} animate={animate_1} className='m-auto w-full sm:px-8 sm:pr-12 flex h-[32vh] sm:h-[23vh] gap-6 sm:gap-0 items-end justify-end sm:justify-between flex-col sm:flex-row  pb-4 max-w-[1400px]'>

      <motion.span
            initial={initial_2}
            animate={animate_2}
            className='w-full sm:w-3/5 flex font-body justify-center sm:justify-start block sm:hidden text-[14px] items-end font-medium tracking-normal -mb-8 text-trax-white/50'
          >
            Your balance
          </motion.span>
          <motion.span
            initial={initial_2}
            animate={animate_2}
            className='w-full sm:w-3/5 flex font-body text-[120px]  leading-[110px] justify-center sm:justify-start items-end font-regular tracking-tighter mt-4 text-trax-white'
          >
            ${formatNumber(totalWalletBalance) || 0.00}
          </motion.span>
          <motion.div initial={initial_2} animate={animate_2} className='w-full sm:w-2/5 flex flex-row justify-center items-end sm:justify-end gap-2 px-8 sm:px-0'>
          <TraxButton
            htmlType="button"
            styleType="icon"
            buttonSize={isMobile ? "large" : 'full'}
            buttonText="Add credit"
            icon={<CreditCardIcon />}
            onClick={() => setData(prevData => ({ ...prevData, openPurchaseCreditSheet: true }))}
          />
          <TraxButton
            htmlType="button"
            styleType="icon"
            buttonSize={isMobile ? "large" : 'full'}
            buttonText="Deposit crypto"
            icon={<PlusIcon />}
            onClick={() => setOpenConnectModal(true)}
          />
        </motion.div>

        </motion.div>
        </div>
      <div className="main-container px-2 sm:px-[36px]">
        <div className="main-container" style={{ width: "95% !important", maxWidth: "unset" }}>
          <motion.div initial={initial_2} animate={animate_4} className="artist-content">
            <div className="line-divider"/>
            <Tabs
              defaultActiveKey="tokens"
              className="earnings-tabs sm:gap-10"
              size="large"
              onTabClick={(t: string) => {
                setActiveTab(t)
              }}
            >
              <TabPane
                key="tokens"
                className="posts-tab-wrapper"
                tab={ isMobile ? "Tokens" :
                  <div className="flex flex-row">
                    <span>Tokens</span>
                    <div className={`absolute right-2 top-[1.25rem] bg-[#414141B2] rounded-lg ${activeTab === "tokens" && 'border border-custom-green'}`}>
                      <ChevronRightIcon className={`w-7 h-7 ${activeTab === "tokens" ? 'text-custom-green' : 'text-trax-white'}`} />
                    </div>
                  </div>
                }>
                <MyTokens user={currentUser} balanceTRAXUSD={balanceTRAXUSD} balanceTRAX={balanceTRAX} />
              </TabPane>

              <TabPane
                key="activity"
                className="posts-tab-wrapper"
                tab={ isMobile ? "Activity" :
                  <div className="flex flex-row">
                    <span>Activity</span>
                    <div className={`absolute right-2 top-[1.25rem] bg-[#414141B2] rounded-lg ${activeTab === "activity" && 'border border-custom-green'}`}>
                      <ChevronRightIcon className={`w-7 h-7 ${activeTab === "activity" ? 'text-custom-green' : 'text-trax-white'}`} />
                    </div>
                  </div>
                }>
                  <ActivityHistoryPage />
              </TabPane>

              <TabPane
              tab={ isMobile ? "Subscriptions" :
                  <div className="flex flex-row">
                    <span>Subscriptions</span>
                    <div className={`absolute right-2 top-[1.25rem] bg-[#414141B2] rounded-lg ${activeTab === "subscriptions" && 'border border-custom-green'}`}>
                      <ChevronRightIcon className={`w-7 h-7 ${activeTab === "subscriptions" ? 'text-custom-green' : 'text-trax-white'}`} />
                    </div>
                  </div>
                } key="subscriptions" className="posts-tab-wrapper">
                <SubscriptionPage currentUser={currentUser} ui={ui} settings={settings} />
              </TabPane>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Deposit Modal */}

      {isMobile ? (
        <SlideUpModal
          isOpen={openConnectModal}
          onClose={() => setData(prevData => ({ ...prevData, openPurchaseCreditSheet: false }))}
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
                  <InternetIdentityProvider {...InternetIdentityProviderProps}>
                    <AuthConnect onNFIDConnect={onNFIDCopy} isPerformer={false} oldWalletPrincipal={currentUser.account?.wallet_icp} />
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
            open={openConnectModal}
            footer={null}
            width={600}
            destroyOnClose
            onCancel={() => setOpenConnectModal(false)}
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
              <InternetIdentityProvider {...InternetIdentityProviderProps}>
                <AuthConnect onNFIDConnect={onNFIDCopy} isPerformer={false} oldWalletPrincipal={currentUser.account?.wallet_icp} />
              </InternetIdentityProvider>
            </div>
            )}
          </Modal>
        </div>
      )
      }

      {/* Purchase Credit Modal */}
      {
        isMobile ? (
            <SlideUpModal
                  isOpen={openPurchaseCreditSheet}
                  onClose={() => setData(prevData => ({ ...prevData, openPurchaseCreditSheet: false }))}
                  >
                  <PurchaseCredit user={currentUser} settings={settings} />
              </SlideUpModal>
        ) : (
          <Modal
            key="purchase_credit"
            className="border border-0.5 border-slaps-gray rounded"
            title={null}
            open={openPurchaseCreditSheet}
            footer={null}
            width={500}
            destroyOnClose
            onCancel={() => setData(prevData => ({ ...prevData, openPurchaseCreditSheet: false }))}
          >
            <div className='p-4'>
              <PurchaseCredit user={currentUser} settings={settings} />
            </div>
          </Modal>
        )
      }

    </Layout >
  );
};

MyPaymentsPage.authenticate = true;