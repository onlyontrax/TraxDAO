import { useState, useCallback } from 'react';
import { message } from 'antd';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/nns';
import { IcrcLedgerCanister } from "@dfinity/ledger";
// import { idlFactoryLedger, idlFactoryPPV } from '../../smart-contracts/declarations';

import { idlFactory as idlFactoryLedger } from '../../smart-contracts/declarations/ledger/ledger.did.js';
import { idlFactory as idlFactoryPPV } from '../../smart-contracts/declarations/ppv/ppv.did.js';

import { cryptoService, tokenTransctionService } from '@services/index';

export const usePurchaseVideoCrypto = (video, settings) => {
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBought, setIsBought] = useState(false);

  const updateProgress = useCallback((newProgress) => {
    setProgress(newProgress);
    setIsModalOpen(true);
  }, []);

  const handleError = useCallback((errorMessage) => {
    setIsRequesting(false);
    setIsSubmitting(false);
    setIsModalOpen(false);
    setProgress(0);
    message.error(errorMessage);
  }, []);

  const handlePurchaseVideoCrypto = useCallback(async (ppvCanID, fanID, ledgerActor, ppvActor, ticker, amounts) => {
    updateProgress(20);

    try {
      const content = await ppvActor.getContent(video._id);
      if (!content[0].contentType) {
        throw new Error('This content has not been registered on-chain. Crypto purchases for this content are not available. Purchase with USD instead.');
      }

      const ppvCanister = AccountIdentifier.fromPrincipal({ principal: ppvCanID });
      //@ts-ignore
      const accountIdBlob = Object.keys(ppvCanister.bytes).map((m) => ppvCanister.bytes[m]);

      const fanAI = AccountIdentifier.fromPrincipal({ principal: fanID });

      const txTime = { timestamp_nanos: BigInt(Date.now() * 1000000) };
      const uuid = BigInt(Math.floor(Math.random() * 1000));

      const getAmount = (t) => BigInt(Math.trunc(Number(amounts[t]) * 100000000));
      const amountToSend = getAmount(ticker);

      let transferArgs;
      let balanceCheck;

      if (ticker === "ICP") {
        transferArgs = {
          memo: uuid,
          amount: { e8s: amountToSend },
          fee: { e8s: BigInt(10000) },
          from_subaccount: [],
          to: accountIdBlob,
          created_at_time: [txTime]
        };
        balanceCheck = async () => {
          //@ts-ignore
          const balance = await ledgerActor.account_balance({ account: fanAI.bytes });
          return Number(balance.e8s) >= Number(amountToSend) + 10000;
        };
      } else {
        transferArgs = {
          amount: amountToSend,
          fee: ticker === "ckBTC" ? BigInt(10) : BigInt(100000),
          from_subaccount: null,
          to: { owner: ppvCanID, subaccount: [] },
          created_at_time: BigInt(Date.now() * 1000000)
        };
        balanceCheck = async () => {
          const balance = await ledgerActor.balance({ owner: fanID, certified: false });
          return Number(balance) >= Number(amountToSend) + (ticker === "ckBTC" ? 10 : 100000);
        };
      }

      if (!(await balanceCheck())) {
        throw new Error('Insufficient balance, please top up your wallet and try again.');
      }

      updateProgress(50);

      const transferResult = await ledgerActor.transfer(transferArgs);
      
      updateProgress(75);

      await ppvActor.purchaseContent(
        ticker === "ICP" ? transferResult.Ok : transferResult,
        video._id,
        ticker,
        amountToSend
      );

      await tokenTransctionService.sendCryptoPpv(video?.performer?._id, {
        performerId: video?.performer?._id,
        price: Number(amountToSend),
        tokenSymbol: ticker
      });

      updateProgress(100);
      setIsBought(true);
      setIsRequesting(false);
      setIsSubmitting(false);
      message.success('Payment successful! You can now access this content');

    } catch (error) {
      console.error(error);
      handleError(error.message || 'Error occurred, please try again later');
    } finally {
      setTimeout(() => {
        setIsRequesting(false);
        setIsSubmitting(false);
        setIsModalOpen(false);
        setProgress(0);
      }, 1000);
    }
  }, [video, updateProgress, handleError]);

  const purchaseVideoCrypto = useCallback(async (ticker, amounts) => {
    setIsRequesting(true);
    setIsSubmitting(true);

    try {
      const authClient = await AuthClient.create();
      const ledgerCanID = settings.icLedger;
      const ckBTCLedgerCanID = Principal.fromText(settings.icCKBTCMinter);
      const ppvCanID = Principal.fromText(settings.icPPV);
      const traxLedgerCanID = Principal.fromText(settings.icTraxToken);

      const loginAndPurchase = async () => {
        const identity = authClient.getIdentity();
        const host = settings.icHost;
        const agent = new HttpAgent({ identity, host });
        await agent.fetchRootKey();
        const sender = await agent.getPrincipal();

        let ledgerActor;
        if (ticker === "ICP") {
          ledgerActor = Actor.createActor(idlFactoryLedger, { agent, canisterId: ledgerCanID });
        } else if (ticker === "ckBTC" || ticker === "TRAX") {
          ledgerActor = IcrcLedgerCanister.create({
            agent,
            canisterId: ticker === "ckBTC" ? ckBTCLedgerCanID : traxLedgerCanID
          });
        } else {
          throw new Error('Invalid ticker, please select a different token!');
        }

        const ppvActor = Actor.createActor(idlFactoryPPV, { agent, canisterId: ppvCanID });
        await handlePurchaseVideoCrypto(ppvCanID, sender, ledgerActor, ppvActor, ticker, amounts);
      };

      if (settings.icNetwork !== true) {
        await authClient.login({
          identityProvider: cryptoService.getIdentityProviderLink(),
          onSuccess: loginAndPurchase
        });
      } else {
        await authClient.login({ onSuccess: loginAndPurchase });
      }
    } catch (err) {
      handleError(err.message || 'Error occurred, please try again later');
    }
  }, [settings, handlePurchaseVideoCrypto, handleError]);

  return {
    purchaseVideoCrypto,
    progress,
    isModalOpen,
    isRequesting,
    isSubmitting,
    isBought
  };
};