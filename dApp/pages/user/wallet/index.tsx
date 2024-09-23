/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react';
import { Layout, Button, message, Statistic, Modal } from 'antd';
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
    balanceICPUSD: 0,
    balanceCKBTCUSD: 0,
    balanceTRAXUSD: 0,
    balanceICP: 0,
    balanceTRAX: 0,
    balanceCKBTC: 0,
    totalWalletBalance: 0,
    isBalanceLoading: true,
    icpPrice: 0,
    ckbtcPrice: 0,
    openDepositICPSheet: false,
    openPurchaseCreditSheet: false,
  });

  const {
    stage,
    isCopied,
    balanceICPUSD,
    balanceTRAXUSD,
    balanceCKBTCUSD,
    balanceICP,
    balanceTRAX,
    balanceCKBTC,
    totalWalletBalance,
    openDepositICPSheet,
    openPurchaseCreditSheet,
  } = data;

  const [walletNFID, setWalletNFID] = useState<string>(currentUser.wallet_icp);
  const InternetIdentityProviderProps: any = cryptoService.getNfidInternetIdentityProviderProps();
  const [openConnectModal, setOpenConnectModal] = useState<boolean>(false);

  const { isMobile } = useDeviceSize();

  useEffect(() => {
    const fetchData = async () => {
      let ledgerActor;
      let ledgerActorCKBTC;
      let ledgerActorTRAX;
      let agent;

      const host = settings.icHost;
      const ledgerCanID = settings.icLedger;
      const ckBTCLedgerCanID = Principal.fromText(settings.icCKBTCMinter);
      const TRAXLedgerCanID = Principal.fromText(settings.icTraxToken);

      const icpPrice = (await tokenTransctionService.getExchangeRate()).data.rate;
      const ckbtcPrice = (await tokenTransctionService.getExchangeRateBTC()).data.rate;
      const traxPrice = (await tokenTransctionService.getExchangeRateTRAX()).data.rate;

      setData(prevData => ({
        ...prevData,
        icpPrice,
        ckbtcPrice,
      }));

      if (!currentUser.wallet_icp) {
        setData(prevData => ({
          ...prevData,
          balanceICP: 0,
          isBalanceLoading: false,
          balanceICPUSD: 0,
          totalWalletBalance: (currentUser && currentUser.balance) || 0,
          balanceCKBTC: 0,
          balanceCKBTCUSD: 0,
        }));
      } else {
        agent = new HttpAgent({ host });
        if (settings.icNetwork !== true) {
          await agent.fetchRootKey();
        }

        ledgerActor = await createLedgerActor(agent, ledgerCanID);
        ledgerActorCKBTC = IcrcLedgerCanister.create({ agent, canisterId: ckBTCLedgerCanID });
        ledgerActorTRAX = IcrcLedgerCanister.create({ agent, canisterId: TRAXLedgerCanID });

        const fanAI = AccountIdentifier.fromPrincipal({
          principal: Principal.fromText(currentUser.wallet_icp),
        });

        // @ts-ignore
        const fanBytes = fanAI.bytes;

        const balArgs: AccountBalanceArgs = {
          account: fanBytes,
        };

        const bal: Tokens = await ledgerActor.account_balance(balArgs);
        const ckbtcBal = await ledgerActorCKBTC.balance({
          owner: Principal.fromText(currentUser.wallet_icp),
          certified: false,
        });
        const traxBal = await ledgerActorTRAX.balance({
          owner: Principal.fromText(currentUser.wallet_icp),
          certified: false,
        });

        const formattedBalance = Number(bal.e8s) / 100000000;
        const ckbtcFormattedBalance = Number(ckbtcBal) / 100000000;
        const traxFormattedBalance = Number(traxBal) / 100000000;

        const amountICPUSD = icpPrice * formattedBalance;
        const amountCKBTCUSD = ckbtcPrice * ckbtcFormattedBalance;
        const amountTRAXUSD = traxPrice * traxFormattedBalance;
        const total = amountTRAXUSD + amountCKBTCUSD + amountICPUSD + ((currentUser && currentUser.balance) || 0);

        setData(prevData => ({
          ...prevData,
          balanceICPUSD: amountICPUSD,
          balanceCKBTCUSD: amountCKBTCUSD,
          balanceTRAXUSD: amountTRAXUSD,
          balanceICP: formattedBalance,
          balanceCKBTC: ckbtcFormattedBalance,
          balanceTRAX: traxFormattedBalance,
          totalWalletBalance: total,
          isBalanceLoading: false,
        }));
      }
    };

    fetchData();

  }, [settings]); // currentUser, settings

  const handleCopyClick = async () => {
    const { protocol, hostname, port } = window.location;
    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    const referralLink = `${baseUrl}/register?referralCode=${currentUser.userReferral}`;

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

  const changeStage = val => {
    setData(prevData => ({
      ...prevData,
      stage: val,
    }));
  };

  return (
    <Layout>
      <div className="main-container px-2 sm:px-[36px]">
        <div className='earnings-heading-user'>
          {/* <span className='performer-name-earnings'>{currentUser?.username}&apos;s Wallet</span> */}
          <span className='performer-name-earnings text-trax-gray-500'>{currentUser?.wallet_icp && `${currentUser?.wallet_icp?.slice(0, 5)}...${currentUser?.wallet_icp?.slice(-3)}`}</span>

        </div>
        <div className='wallet-earnings-wrapper'>
          <Statistic prefix="$" value={(totalWalletBalance || 0)} precision={2} />
        </div>
        <div className='wallet-module-buttons'>
          <Button
            className="wallet-module-button hover:bg-trax-white/10 hover:text-trax-white"
            onClick={() => setData(prevData => ({ ...prevData, openPurchaseCreditSheet: true }))}
          >
            <div className='module-icon-container'>
              <CreditCardIcon className='module-icon' />
            </div>
            <p className='module-text'>
              Add credit
            </p>
          </Button>
          <Button
            className="wallet-module-button hover:bg-trax-white/10 hover:text-trax-white"
            onClick={() => setOpenConnectModal(true)}
          >
            <div className='module-icon-container'>
              <PlusIcon className='module-icon' />
            </div>
            <p className='module-text '>
              Deposit crypto
            </p>
          </Button>
        </div>
        {/*  <div className='stats-earning-wrapper'>
          <div className="stats-earning-referral">
            <h2 className="stats-earning-referral-h1">
              Refer a friend, earn 5%
            </h2>
            <h2 className="stats-earning-referral-h2">
              Invite artists to join trax.so and earn commission on their earnings. 5% for the first year, 1% lifetime.
            </h2>
            <Button
              className="referral-link-btn"
              onClick={handleCopyClick}
            >
              {isCopied ? 'Link Copied!' : 'Invite friends'}
            </Button>
          </div>
          <div className="stats-earning-referral">
            <h2 className="stats-earning-referral-h1">
              Connect a wallet, get $TRAX
            </h2>
            <h2 className="stats-earning-referral-h2">
              Invite artists to join trax.so and earn commission on their earnings. 5% for the first year, 1% lifetime.
            </h2>
            <Button
              className="referral-link-btn"
              onClick={handleCopyClick}
            >
              {isCopied ? 'Link Copied!' : 'Invite friends'}
            </Button>
          </div>
        </div> */}

        <div className="tab-bar">
          <div onClick={() => changeStage(0)} className="tab-btn-wrapper">
            <h1 className={`${stage === 0 ? 'selected-btn' : ''}`}>Tokens</h1>
            <div className={`${stage === 0 ? 'active' : ''} tab-btn`} />
          </div>

          <div onClick={() => changeStage(1)} className="tab-btn-wrapper">
            <h1 className={`${stage === 1 ? 'selected-btn' : ''}`}>Activity</h1>
            <div className={`${stage === 1 ? 'active' : ''} tab-btn`} />
          </div>

          <div onClick={() => changeStage(2)} className="tab-btn-wrapper">
            <h1 className={`${stage === 2 ? 'selected-btn' : ''}`}>{isMobile ? "Subs" : "Subscriptions"}</h1>
            <div className={`${stage === 2 ? 'active' : ''} tab-btn`} />
          </div>
        </div>

        {stage === 0 && <MyTokens user={currentUser} balanceICPUSD={balanceICPUSD} balanceCKBTCUSD={balanceCKBTCUSD} balanceTRAXUSD={balanceTRAXUSD} balanceICP={balanceICP} balanceTRAX={balanceTRAX} balanceCKBTC={balanceCKBTC} />}
        {stage === 1 && <ActivityHistoryPage />}
        {stage === 2 && <SubscriptionPage currentUser={currentUser} ui={ui} settings={settings} />}
      </div>

      {/* Deposit Modal */}

      {isMobile ? (
        <Sheet
          isOpen={openConnectModal}
          onOpenStart={() => setData(prevData => ({ ...prevData, openPurchaseCreditSheet: false }))}
          onClose={() => setOpenConnectModal(false)}
          detent='content-height'
        >
          <Sheet.Container className='bg-trax-black'>
            <Sheet.Header />
            <Sheet.Content>
              {currentUser?.wallet_icp ? (
                <DepositICP user={currentUser} />
              ) : (
                <div className='p-8'>
                  <div style={{ marginBottom: '15px' }} >

                    <span style={{ fontSize: '23px', fontWeight: '600', color: 'white' }}>Connect </span>
                    <br />
                    <span style={{ fontSize: '14px', color: 'grey' }}>Select your preferred wallet to connect to TRAX</span>
                  </div>
                  <InternetIdentityProvider {...InternetIdentityProviderProps}>
                    <AuthConnect onNFIDConnect={onNFIDCopy} isPerformer oldWalletPrincipal={currentUser.wallet_icp} />
                  </InternetIdentityProvider>
                </div>
              )}
            </Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop />
        </Sheet>
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
            {currentUser?.wallet_icp ? (
                <DepositICP user={currentUser} />
              ) : (
            <div className='p-8'>


              <div style={{ marginBottom: '15px' }} >

                <span style={{ fontSize: '23px', fontWeight: '600', color: 'white' }}>Connect </span>
                <br />
                <span style={{ fontSize: '14px', color: 'grey' }}>Select your preferred wallet to connect to TRAX</span>
              </div>
              <InternetIdentityProvider {...InternetIdentityProviderProps}>
                <AuthConnect onNFIDConnect={onNFIDCopy} isPerformer oldWalletPrincipal={currentUser.wallet_icp} />
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
          <Sheet
            isOpen={openPurchaseCreditSheet}
            onOpenStart={() => setOpenConnectModal(false)}
            onClose={() => setData(prevData => ({ ...prevData, openPurchaseCreditSheet: false }))}
            detent='content-height'
          >
            <Sheet.Container className='bg-trax-black '>
              <Sheet.Header />
              <Sheet.Content>
                <PurchaseCredit user={currentUser} settings={settings} />
              </Sheet.Content>
            </Sheet.Container>
            <Sheet.Backdrop />
          </Sheet>
        ) : (
          <Modal
            key="purchase_credit"
            className=""
            title={null}
            open={openPurchaseCreditSheet}
            footer={null}
            width={500}
            destroyOnClose
            onCancel={() => setData(prevData => ({ ...prevData, openPurchaseCreditSheet: false }))}
          >
            <PurchaseCredit user={currentUser} settings={settings} />
          </Modal>
        )
      }

    </Layout >
  );
};

MyPaymentsPage.authenticate = true;