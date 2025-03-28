import { message } from "antd";
import { Principal } from "@dfinity/principal";
import { Actor } from "@dfinity/agent";
import {
    tokenTransctionService,
  } from "src/services";
import { idlFactory as idlFactoryTipping } from "../../smart-contracts/declarations/tipping/tipping.did.js";
import { idlFactory as idlFactoryICRC1, TransferArg } from "../../smart-contracts/declarations/icrc1/icrc1.did.js";
import type {
    _SERVICE as _SERVICE_TIPPING,
    TippingParticipants,
    Participants,
  } from "../../smart-contracts/declarations/tipping/tipping2.did.js";
  import { getPlugWalletIsConnected, getPlugWalletAgent, getPlugWalletProvider, getPrincipalId } from '../../crypto/mobilePlugWallet';




  import { IcrcLedgerCanister} from "@dfinity/ledger";



  export const requestPlugBalance = async () => {
    const plugWalletProvider = await getPlugWalletProvider();
    const agent = await getPlugWalletAgent();

    // @ts-ignore
    const principal = await getPrincipalId();
    // @ts-ignore
    const requestBalanceResponse = await plugWalletProvider.requestBalance();
    // let icp_balance;
    // let ckbtc_balance;
    let trax_balance;
    for(let i = 0; i < requestBalanceResponse.length; i++){
      // if(requestBalanceResponse[i]?.symbol === 'ICP'){
      //   icp_balance = requestBalanceResponse[i]?.amount;
      // }
      // if(requestBalanceResponse[i]?.symbol === 'ckBTC'){
      //   ckbtc_balance = requestBalanceResponse[i]?.amount;
      // }
      if(requestBalanceResponse[i]?.symbol === 'TRAX'){
        trax_balance = requestBalanceResponse[i]?.amount;
      }
    };
    return {trax_balance}
  }


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



  type ProgressUpdate = {
    progress: number;
  };

  export const tipCrypto = async (
    to: [{participantID: Principal, participantPercentage: number}], 
    amountNo: number, 
    ticker: string, 
    settings: any,
    performer: any,
    onProgress?: (update: ProgressUpdate) => void) => {

      try {
        const whitelist = [settings.icTipping, settings.icTraxToken];
        const host = settings.icHost;

        let plugWalletProvider = await requestConnectPlug(whitelist, host);

        if (!plugWalletProvider) {
          throw new Error('Failed to connect to Plug wallet');
        }

        onProgress?.({ progress: 10 });
          
        const tippingActor = await plugWalletProvider.createActor({
            canisterId: settings.icTipping,
            interfaceFactory: idlFactoryTipping,
        });  

        onProgress?.({ progress: 20 });

        const tokenLedgerActor = await plugWalletProvider.createActor({
            canisterId: settings.icTraxToken,
            interfaceFactory: idlFactoryICRC1,
        });

        onProgress?.({ progress: 30 });

        const baseAmount = BigInt(Math.floor(amountNo * 100_000_000));
        const transferFee = BigInt(100000);
        const totalNeeded = baseAmount + transferFee;
        const now = BigInt(Date.now()) * BigInt(1_000_000);

        const approveArgs = {
            amount: totalNeeded,
            spender: {
                owner: Principal.fromText(settings.icTipping),
                subaccount: []
            },
            created_at_time: [now],
            expires_at: [now + BigInt(3600 * 1_000_000_000)],
            expected_allowance: [],
            memo: [],
            fee: [],
            from_subaccount: []
        };  

        onProgress?.({ progress: 40 });

        const approveResult = await tokenLedgerActor.icrc2_approve(approveArgs);

        onProgress?.({ progress: 60 });
        
        console.log("approveResult: ", approveResult);
        if (!('Ok' in approveResult)) {
          throw new Error(`Approval failed: ${JSON.stringify(approveResult.Err)}`);
        }
        onProgress?.({ progress: 80 });
            
        const tipResult = await tippingActor.sendTip(
            to,
            baseAmount,
            ticker
        );

        console.log("tipResult: ", tipResult);

        if ('ok' in tipResult) {
          await tokenTransctionService.sendCryptoTip(performer?._id, {
              performerId: performer?._id,
              price: Number(baseAmount),
              tokenSymbol: ticker,
            });
            onProgress?.({ progress: 100 });
            return true;

        } else {
          if((tipResult.Err || tipResult.err) === "Insufficient funds")
            throw new Error(`Tip failed: ${tipResult.Err || tipResult.err}`);
        }
        
      } catch (error) {
        onProgress?.({
            progress: 0,
        });
        console.error("Full error details:", error);
        throw error;
      } finally {
        setTimeout(() => {
        }, 1000);
      }
  };