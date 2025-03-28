import { useState, useCallback, useContext } from 'react';
import { message } from 'antd';
import { cryptoService } from '@services/crypto.service';
import { idlFactory } from '../../smart-contracts/declarations/ppv/ppv.did.js';
import { getPlugWalletProvider, getPlugWalletAgent, getPlugWalletIsConnected, getPrincipalId } from '../mobilePlugWallet';
import { tokenTransctionService } from '@services/index';
import { Principal } from "@dfinity/principal";
import type { _SERVICE as PPV_SERVICE } from '../../../src/smart-contracts/declarations/ppv/ppv2.did';
import { videoService } from '@services/video.service';

import { idlFactory as idlFactoryICRC1, TransferArg, _SERVICE as ICRC1_SERVICE } from "../../smart-contracts/declarations/icrc1/icrc1.did.js";
import { idlFactory as idlFactoryPPV } from "../../smart-contracts/declarations/ppv/ppv.did.js";
import { Content, Participants } from '../../../src/smart-contracts/declarations/ppv/ppv2.did';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

// import { SettingsContext } from '../contexts/SettingsContext'; // Assume this context exists

  type ProgressUpdate = {
    progress: number;
  };

  export const requestConnectPlug = async (whitelist, icHost)=>{
    const plugWalletProvider = await getPlugWalletProvider();
    const agent = await getPlugWalletAgent();
    const connected = await getPlugWalletIsConnected();

    if (connected) {
      return plugWalletProvider;
    }else{
      message.error("Failed to connected to canister. Please try again later or contact us.");
      return false
    }
  }

  export const purchaseVideoPlug = async (
    amountNo: number,
    ticker: string,
    contentId: string,
    performerId: any,
    settings: any,
    wallet: string,
    onProgress?: (update: ProgressUpdate) => void) => {

    try {
      const whitelist = [settings.icPPV, settings.icTraxToken];
      const host = settings.icHost;
      let ppvActor, tokenLedgerActor;

      if(wallet === "plug"){


        let plugWalletProvider = await requestConnectPlug(whitelist, host);

        if(plugWalletProvider) {

          ppvActor = await plugWalletProvider.createActor({
              canisterId: settings.icPPV,
              interfaceFactory: idlFactoryPPV,
          });

          tokenLedgerActor = await plugWalletProvider.createActor({
              canisterId: settings.icTraxToken,
              interfaceFactory: idlFactoryICRC1,
          });
        }

        onProgress?.({ progress: 20 });

      }else if (wallet === "II"){
        let identity, agent;

        const authClient = await AuthClient.create();

        if (settings.icNetwork !== true) {
          await authClient.login({
            identityProvider: cryptoService.getIdentityProviderLink(),
            onSuccess: async () => {
              if (await authClient.isAuthenticated()) {
                identity = authClient.getIdentity();
                agent = new HttpAgent({ identity,host
                });
                agent.fetchRootKey();

                ppvActor = Actor.createActor<PPV_SERVICE>(idlFactoryPPV, {
                  agent,
                  canisterId: settings.icPPV
                });
                tokenLedgerActor = Actor.createActor<ICRC1_SERVICE>(idlFactoryICRC1, {
                  agent,
                  canisterId: settings.icTraxToken
                });
              }
            }
          });

        } else {
          await authClient.login({
            onSuccess: async () => {
              identity = await authClient.getIdentity();
              agent = new HttpAgent({ identity, host });
              ppvActor = Actor.createActor<PPV_SERVICE>(idlFactoryPPV, {
                agent,
                canisterId: settings.tokenCan
              });
            }
          });
        }


      }else{
        message.error("Wallet not recognised");
        return;
      }


      const content = await ppvActor.getContent(contentId);
      if (!content) {
        throw new Error("Content not found");
      }

        const baseAmount = BigInt(Math.floor(amountNo * 100_000_000));

        console.log("content?.participants?.length ", content[0]?.participants?.length);
        const recipientCount = BigInt(2 + content[0]?.participants?.length ? content[0]?.participants?.length : 0); // platform + publisher + participants

        const feePerTransfer = BigInt(100_000);
        const approvalFee = BigInt(200_000);
        const totalTransferFees = feePerTransfer * recipientCount;
        const totalNeeded = baseAmount + approvalFee + totalTransferFees;

        // Check bal
        const account = {
          owner: Principal.fromText(await getPrincipalId()),
          subaccount: []
        };

        const balance = await tokenLedgerActor.icrc1_balance_of({
          owner: account.owner,
          subaccount: account.subaccount
        });

        if (balance < totalNeeded) {
          throw new Error("Insufficient balance to cover amount");
        }

        onProgress?.({ progress: 50 });


        // Approve spending
        const now = BigInt(Date.now()) * BigInt(1_000_000);
        const approveArgs = {
          amount: totalNeeded,
          spender: {
            owner: Principal.fromText(settings.icPPV),
            subaccount: []
          },
          created_at_time: [now],
          expires_at: [now + BigInt(3600 * 1_000_000_000)],
          expected_allowance: [],
          memo: [],
          fee: [],
          from_subaccount: []
        };

        console.log("@purchaseVideoPlug - pre approveArgs: ", approveArgs);
        
        const approveResult = await tokenLedgerActor.icrc2_approve(approveArgs);

        if (!('Ok' in approveResult)) {
          throw new Error(`Approval failed: ${JSON.stringify(approveResult.Err)}`);
        }

        console.log("@purchaseVideoPlug - approveResult: ", approveResult);
        console.log("@purchaseVideoPlug - Ok in approveResult");
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        onProgress?.({ progress: 75 });
        const ppvResult: any = await ppvActor.purchaseContent(contentId, ticker, baseAmount);

        console.log("ppvResult: ", ppvResult);
        if (ppvResult.ok) {
            // console.log("Payment successful! You can now access this content");
            onProgress?.({  progress: 100 });
            await tokenTransctionService.sendCryptoPpv(performerId, {
              performerId: performerId,
              price: Number(baseAmount),
              tokenSymbol: ticker
            });
            message.success('Payment successful! You can now access this content');
            return true;
        } else {
          if((ppvResult.Err || ppvResult.err) === "Insufficient funds")
            throw new Error(`Payment failed: ${ppvResult.Err || ppvResult.err}`);
        }
        
        

    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
      }, 1000);
    }
  };






  export const addContent = async(id: string, content: Content, settings: any, wallet: string) => {

    try{
      const whitelist = [settings.icPPV];
      const host = settings.icHost;
      let ppvActor;

      if(wallet === 'plug'){

        let plugWalletProvider = await requestConnectPlug(whitelist, host);

        if(plugWalletProvider) {
          ppvActor = await plugWalletProvider.createActor({
            canisterId: settings.icPPV,
            interfaceFactory: idlFactoryPPV,
          });
        }
      }else if(wallet === 'II'){
        let identity, agent, host;

        const authClient = await AuthClient.create();

        if (settings.icNetwork !== true) {
          await authClient.login({
            identityProvider: cryptoService.getIdentityProviderLink(),
            onSuccess: async () => {
              if (await authClient.isAuthenticated()) {
                identity = authClient.getIdentity();
                host = settings.icHost;
                agent = new HttpAgent({ identity,host
                });
                agent.fetchRootKey();

                ppvActor = Actor.createActor<PPV_SERVICE>(idlFactoryPPV, {
                  agent,
                  canisterId: settings.icPPV
                });
              }
            }
          });
        } else {
          host = settings.icHost;
          await authClient.login({
            onSuccess: async () => {
              identity = await authClient.getIdentity();
              agent = new HttpAgent({ identity, host });
              ppvActor = Actor.createActor<PPV_SERVICE>(idlFactoryPPV, {
                agent,
                canisterId: settings.icPPV
              });
            }
          });
        }

      } else {
        console.log("Unrecognised wallet");
      }

        let addContentResult: any = await ppvActor.addPPVContent(id, content);
        return true;

      }catch(error){
        await deleteVideo(id)
      console.log("@addContent: ", error);
      message.error(error.message || 'error occured, please try again later');
    }
  }

  const deleteVideo = async(id: string) => {
      try {
        await videoService.delete(id);
        message.success('Your video has been removed.');
      } catch (e) {
        const err = (await Promise.resolve(e)) || {};
        message.error(err.message || 'An error occurred, please try again!');
      }
      return undefined;
    }



  export const updateContent = async(id: string, content: Content, settings: any, wallet: string) => {

    try{
      const whitelist = [settings.icPPV];
      const host = settings.icHost;
      let ppvActor;

      if(wallet === 'plug'){
        let plugWalletProvider = await requestConnectPlug(whitelist, host);
        if(plugWalletProvider) {

          ppvActor = await plugWalletProvider.createActor({
            canisterId: settings.icPPV,
            interfaceFactory: idlFactoryPPV,
          });
        }
      }else if(wallet === 'II'){
        let identity, agent, host;

        const authClient = await AuthClient.create();

        if (settings.icNetwork !== true) {
          await authClient.login({
            identityProvider: cryptoService.getIdentityProviderLink(),
            onSuccess: async () => {
              if (await authClient.isAuthenticated()) {
                identity = authClient.getIdentity();
                host = settings.icHost;
                agent = new HttpAgent({ identity,host
                });
                agent.fetchRootKey();
                ppvActor = Actor.createActor<PPV_SERVICE>(idlFactoryPPV, {
                  agent,
                  canisterId: settings.icPPV
                });
              }
            }
          });
        } else {
          host = settings.icHost;
          await authClient.login({
            onSuccess: async () => {
              identity = await authClient.getIdentity();
              agent = new HttpAgent({ identity, host });
              ppvActor = Actor.createActor<PPV_SERVICE>(idlFactoryPPV, {
                agent,
                canisterId: settings.icPPV
              });
            }
          });
        }

      }else{
      }

        let updateContentResult: any = await ppvActor.updatePPVContent(id, content);
        return true;

    }catch(error){
      message.error(error.message || 'error occured, please try again later');
    }
  }








  export const removeContent = async(id: string, settings: any) => {

    try{
      const whitelist = [settings.icPPV];
      const host = settings.icHost;

      let plugWalletProvider = await requestConnectPlug(whitelist, host);

      if(plugWalletProvider) {

        const ppvActor = await plugWalletProvider.createActor({
          canisterId: settings.icPPV,
          interfaceFactory: idlFactoryPPV,
        });

        let addContentResult: any = await ppvActor.removeContent(id);
        return true;
      }

    }catch(error){
      message.error(error.message || 'error occured, please try again later');
    }
  }