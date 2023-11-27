/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/interactive-supports-focus */
import { Principal } from '@dfinity/principal';
import { IUser } from '@interfaces/index';
import {
  Avatar, Divider, message, InputNumber, Select, Image, Input, Button, Progress, Modal
} from 'antd';
import { PureComponent } from 'react';
import { TickIcon } from 'src/icons';
import { principalToAccountIdentifier } from '../../crypto/account_identifier';
import { SelectorIcon } from '@heroicons/react/solid';

import { AccountIdentifier } from '@dfinity/nns';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

import { idlFactory as idlFactoryPPV } from '../../../src/smart-contracts/declarations/ppv';
import type { _SERVICE as _SERVICE_PPV} from '../../../src/smart-contracts/declarations/ppv/ppv.did';

import { idlFactory as idlFactoryLedger } from '../../../src/smart-contracts/declarations/ledger';
import type { _SERVICE as _SERVICE_LEDGER } from '../../../src/smart-contracts/declarations/ledger/ledger.did';
import {
  TransferArgs, Tokens, TimeStamp, AccountBalanceArgs
} from '../../../src/smart-contracts/declarations/ledger/ledger.did';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faBullhorn, faImage, faVideo, faSquarePollHorizontal, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

import { IcrcLedgerCanister, TransferParams } from "@dfinity/ledger";
const { Option } = Select;

interface IProps {
  user: IUser;
  icpBalance: number;
  icpPrice: number;
  ckbtcBalance: number;
  ckbtcPrice: number;
}

export class SendCrypto extends PureComponent<IProps> {
  state = {
    balanceICP: 0,
    amountToSend: null,
    selectedCurrency: 'ICP',
    destinationAddress: '',
    addressType: '',
    isAddressValid: false,
    isAmountValid: false,
    progress: 0,
    revealProgressBar: false,
    openConnectModal: false,
    walletOption: null
  }

  componentDidMount() {}

  getAccountIdentity(principal: Principal){
    const AI = AccountIdentifier.fromPrincipal({
      principal: principal
    });
    // @ts-ignore
    const { bytes } = AI;
    const accountIdBlob = Object.keys(bytes).map((m) => bytes[m]);
    return accountIdBlob;
  }

  async handleSendCrypto(ticker: string, actor: any){
    const { destinationAddress, addressType, amountToSend } = this.state
    let transferArgs: TransferArgs;
    let transferParams: TransferParams;
    let recipientAccountIdBlob;
    let recipientPrincipal: Principal;

    if(addressType === 'principal'){
        recipientPrincipal = Principal.fromText(destinationAddress)
        recipientAccountIdBlob = this.getAccountIdentity(recipientPrincipal)
    }else{
        // @ts-ignore
        const { bytes } = destinationAddress;
        const accountIdBlob = Object.keys(bytes).map((m) => bytes[m]);
        recipientAccountIdBlob = accountIdBlob;
    }

    let amount = BigInt(amountToSend * 100000000);
    const txTime: TimeStamp = {
        timestamp_nanos: BigInt(Date.now() * 1000000)
    };
    const uuid = BigInt(Math.floor(Math.random() * 1000));

    if(ticker == "ICP"){
        transferArgs = {
          memo: uuid,
          amount: { e8s: amount },
          fee: { e8s: BigInt(10000) },
          from_subaccount: [],
          to: recipientAccountIdBlob,
          created_at_time: [txTime]
        };
      }else if(ticker ==="ckBTC"){
        transferParams = {
          amount: amount,
          fee: BigInt(10),
          from_subaccount: null,
          to: {
            owner: recipientPrincipal,
            subaccount: [],
          },
          created_at_time: BigInt(Date.now() * 1000000)
        };
      }else{
        message.error('Invalid ticker, please select a different token!');
        return;
      }
      this.setState({ progress: 70 });
      await actor.transfer(ticker === "ICP" ? transferArgs : transferParams).then(async (res) => {
        this.setState({ progress: 100 });
        this.setState({
            submiting: false,
            openProgressModal: false,
            openPurchaseModal: false,
            progress: 100,
          });
          message.success("Payment successful!");
      }).catch((error) => {
        this.setState({
          submiting: false,
          openProgressModal: false,
          progress: 0
        });
        message.error(error.message || 'error occured, please try again later');
        return error;
      });
  };


  async beforeSendCrypto(){
    const { walletOption} = this.state;
    this.setState({openConnectModal: false})

    walletOption === 'plug' ? this.sendCryptoPlug() : this.sendCrypto()
  }


  async sendCryptoPlug(){
    const { selectedCurrency, addressType, destinationAddress, amountToSend, walletOption} = this.state;
    let transfer;
    this.setState({progress: 10});

    if(typeof window !== 'undefined' && 'ic' in window){
      // @ts-ignore
      const connected = typeof window !== 'undefined' && 'ic' in window ? await window?.ic?.plug?.requestConnect() : false;

      !connected && message.error("Failed to connected to canister. Please try again later or contact us. ")
        
      this.setState({ progress: 20 });

      // @ts-ignore
      console.log(window.ic.plug.principalId); console.log(window.ic.plug.accountId); console.log("plug agent: ", window?.ic?.plug?.agent)
      
      if(connected){
        //@ts-ignore
        const requestBalanceResponse = await window.ic?.plug?.requestBalance();
        const icp_balance = requestBalanceResponse[0]?.amount;
        const ckBTC_balance = requestBalanceResponse[1]?.amount;

        console.log("icp balance: ", icp_balance);
        console.log("ckbtc balance: ", ckBTC_balance);

        if(selectedCurrency === 'ckBTC'){
          if(ckBTC_balance >= Number(amountToSend)){
            this.setState({ ppvProgress: 30 });
            const params = {
              to: destinationAddress,
              strAmount: amountToSend,
              token: 'mxzaz-hqaaa-aaaar-qaada-cai'
            };
            //@ts-ignore
            transfer = await window.ic.plug.requestTransferToken(params).catch((error) =>{
              message.error('Transaction failed. Please try again later.');
              this.setState({progress: 0})
            });
            
          } else {
            this.setState({ progress: 0 })
            message.error('Insufficient balance, please top up your wallet and try again.');
          }
        }
        
        if (selectedCurrency === 'ICP') {
          this.setState({ progress: 30 });
          if(icp_balance >= Number(amountToSend)){
            const requestTransferArg = {
              to: destinationAddress,
              amount: Math.trunc(Number(amountToSend) * 100000000)
            }
            //@ts-ignore
            transfer = await window.ic?.plug?.requestTransfer(requestTransferArg).catch((error) =>{
              message.error('Transaction failed. Please try again later.');
              this.setState({progress: 0})
            })
            
          } else {
            this.setState({progress: 0})
            message.error('Insufficient balance, please top up your wallet and try again.');
          }
        }

        console.log(transfer)

        this.setState({ progress: 50 });

        if(transfer){
          this.setState({ progress: 100 });
          message.success('Payment successful! You can now access this content');
        }else{
          setTimeout(() => this.setState({
            progress: 0
          }), 1000);
          message.error('Transaction failed. Please try again later.');
        }
    }
    }
  }





  async sendCrypto(){
    const { selectedCurrency, addressType, destinationAddress, amountToSend} = this.state;
    const { icpBalance, ckbtcBalance} = this.props;
    this.setState({ requesting: true, submiting: true });
    try {
      let ledgerCanID;
      let ledgerActor;
      let sender;
      let identity;
      let agent;
      let ckBTCLedgerCanID;
      const authClient = await AuthClient.create();
      let amount = BigInt(amountToSend * 100000000);

      if ((process.env.NEXT_PUBLIC_DFX_NETWORK as string) !== 'ic') {
        await authClient.login({
          identityProvider: process.env.NEXT_PUBLIC_IDENTITY_PROVIDER as string,
          onSuccess: async () => {
            if (await authClient.isAuthenticated()) {
              identity = authClient.getIdentity();
              ledgerCanID = process.env.NEXT_PUBLIC_LEDGER_CANISTER_ID_LOCAL as string;
              ckBTCLedgerCanID = process.env.NEXT_PUBLIC_CKBTC_MINTER_CANISTER_ID_LOCAL as string;
              const host = process.env.NEXT_PUBLIC_HOST_LOCAL as string;
              agent = new HttpAgent({   identity, host  });

              agent.fetchRootKey();
              sender = await agent.getPrincipal();

              const senderAI = AccountIdentifier.fromPrincipal({
                principal: sender
              });
              // @ts-ignore
              const senderBytes = senderAI.bytes;

              if(selectedCurrency == "ICP"){
                ledgerActor = Actor.createActor<_SERVICE_LEDGER>(idlFactoryLedger, {
                  agent,
                  canisterId: ledgerCanID
                });

                const balArgs: AccountBalanceArgs = {   account: senderBytes    };
                let balICP = await ledgerActor.account_balance(balArgs);
                if(Number(balICP.e8s) < (Number(amount) + 10000)){
                  this.setState({
                    openPurchaseModal: false,
                    revealProgressBar: false,
                    progress: 0
                  });
                  message.error('Insufficient balance, please top up your wallet and try again.');
                  return;
                }
              }else if(selectedCurrency === "ckBTC"){
                ledgerActor = IcrcLedgerCanister.create({
                  agent,
                  canisterId: ckBTCLedgerCanID
                });
                let balICRC1 = await ledgerActor.balance({
                    owner: sender,
                    certified: false,
                  }); 
                  if(Number(balICRC1) < (Number(amount) + 10)){
                    this.setState({
                      revealProgressBar: false,
                      progress: 0
                    });
                    message.error('Insufficient balance, please top up your wallet and try again.');
                    return;
                  }
              }else{
                message.error('Invalid ticker, please select a different token!');
              }
              this.setState({ progress: 30 });
              this.handleSendCrypto(selectedCurrency, ledgerActor)
            }
          }
        });
      } else {
        await authClient.login({
          onSuccess: async () => {
            const host = process.env.NEXT_PUBLIC_HOST as string;
            ledgerCanID = process.env.NEXT_PUBLIC_LEDGER_CANISTER_ID as string;
            ckBTCLedgerCanID = process.env.NEXT_PUBLIC_CKBTC_MINTER_CANISTER_ID as string;
            identity = authClient.getIdentity();
            agent = new HttpAgent({ identity, host });
            sender = await agent.getPrincipal();
            const senderAI = AccountIdentifier.fromPrincipal({
                principal: sender
            });
            // @ts-ignore
            const senderBytes = senderAI.bytes;

            if(selectedCurrency == "ICP"){
              ledgerActor = Actor.createActor<_SERVICE_LEDGER>(idlFactoryLedger, {
                agent,
                canisterId: ledgerCanID
              });

              const balArgs: AccountBalanceArgs = {   account: senderBytes    };
              let balICP = await ledgerActor.account_balance(balArgs);
              if(Number(balICP.e8s) < (Number(amount) + 10000)){
                this.setState({
                  revealProgressBar: false,
                  progress: 0
                });
                message.error('Insufficient balance, please top up your wallet and try again.');
                return;
              }

            }else if(selectedCurrency === "ckBTC"){
              ledgerActor = IcrcLedgerCanister.create({
                agent,
                canisterId: ckBTCLedgerCanID
              });

              let balICRC1 = await ledgerActor.balance({
                owner: sender,
                certified: false,
              }); 

              if(Number(balICRC1) < (Number(amount)+10)){
                this.setState({
                  revealProgressBar: false,
                  progress: 0
                });
                message.error('Insufficient balance, please top up your wallet and try again.');
                return;
              }
            }else{
              message.error('Invalid ticker, please select a different token!');
            }
            this.handleSendCrypto(selectedCurrency, ledgerActor)
          }
        });
      }
    } catch (err) {
      message.error(err || 'Error occured, please try again later');
    }
  }

  onChangeValue(amountToSend:number) {
    const { selectedCurrency } = this.state;
    const { icpBalance, ckbtcBalance} = this.props;
    if(selectedCurrency === 'ICP' && ((amountToSend * 100000000) + 10000) < icpBalance){
        this.setState({ isAmountValid: true });
    }else if(selectedCurrency === 'ckBTC' && ((amountToSend * 100000000) + 10) < ckbtcBalance){
        this.setState({ isAmountValid: true });
    }
    this.setState({ amountToSend: amountToSend });
  }

  changeTicker(val: any) {
    this.setState({ selectedCurrency: val });
  }

  containsDash(alphanumericString) {
    const regex = /-/;
    return regex.test(alphanumericString);
  }

  onChangeDestination(address: string){
    const { selectedCurrency } = this.state;

    if(this.containsDash(address.toString())){
        if(address.length === 63){
            this.setState({ 
                isAddressValid: true, 
                addressType: "principal", 
                destinationAddress: address 
            })
        }
    }else{
        if(selectedCurrency === 'ckBTC'){
            this.setState({isAddressValid: false})
            message.error("Invalid principal. You must enter a valid principal to send ckBTC.")
        }else{
            if(address.length === 64){
                this.setState({
                    isAddressValid: true, 
                    destinationAddress: address, 
                    addressType: "account identifier"
                })
            }
        }
    }
  }

  copy = async (text: any) => {
    await navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  }

  selectAfter = (
    <Select onChange={(v) => this.changeTicker(v)} defaultValue="ICP" className="tip-currency-wrapper">
      <Option value="ICP" key="ICP" label="ICP">
        <Image preview={false} alt="currency_flag" className="currency-flag" src="/static/icp-logo.png" width="20px" height="20px" />
        {' '}
        <span className="currency-symbol">ICP</span>
      </Option>
      <Option value="ckBTC" key="ckBTC" label="ckBTC">
        <Image preview={false} alt="currency_flag" className="currency-flag" src="/static/ckbtc_nobackground.svg" height="30" width="30" />
        {' '}
        <span className="currency-symbol">ckBTC</span>
      </Option>
    </Select>
  );

  render() {
    const {
      user, icpBalance, ckbtcBalance, icpPrice, ckbtcPrice
    } = this.props;
    const { amountToSend, selectedCurrency, isAddressValid, isAmountValid, progress, openConnectModal, walletOption } = this.state;

    return (
        <div className='confirm-purchase-form'>
            <div className='send-crypto-header'>
                <span>Send {selectedCurrency}</span>
            </div>
            <div className='right-col'>
                <div className="currency-type-tip" style={{flexDirection: 'column'}}>
                    <div className="tip-input">
                        <div className='send-crypto-asset'>
                            <span>Asset:</span>
                        </div>
                          <InputNumber
                            type="number"
                            min={0.000001}
                            addonAfter={this.selectAfter}
                            onChange={this.onChangeValue.bind(this)}
                            value={amountToSend}
                            placeholder="0.00"
                            className="tip-input-value"
                          />
                          <div className='max-wrapper'>
                            <span>Max: {selectedCurrency === 'ICP' ? icpBalance : ckbtcBalance} {selectedCurrency}</span>
                          </div>
                    </div>
                    <div className='convert-usd-wrapper'>
                        {selectedCurrency === 'ICP' && (
                           <span>~${(amountToSend * icpPrice).toFixed(2)}</span>
                        )}
                        {selectedCurrency === 'ckBTC' && (
                           <span>~${(amountToSend * ckbtcPrice).toFixed(2)}</span>
                        )}
                        
                    </div>
                    <div className='destination-address-wrapper'>
                        <div className='send-crypto-to'>
                          <span>To:</span>
                        </div>
                          <Input 
                          className='destination-address-input' 
                          type="text"
                          onChange={(e)=>this.onChangeDestination(e.target.value)}
                          placeholder={selectedCurrency ==="ICP" ? "Enter Principal ID or Account ID" : "Enter Principal ID"}
                          />
                    </div>
                </div>

                <Progress percent={Math.round(progress)} />
                <div className='send-container'>
                <div className='send-wrapper'>
                    <Button className='withdraw-button' disabled={(!isAddressValid && !isAmountValid) || progress > 0 && progress < 100} onClick={()=> this.setState({openConnectModal: true})}>
                      Send
                    </Button>
                </div>
            </div>
            </div>
            <Modal 
            className='selected-wallet-upload-modal'
            style={{backgroundColor: '#000000 !important'}}
            key="purchase_post"    
            title={null}
            open={openConnectModal}
            footer={null}
            width={420}
            destroyOnClose
            onCancel={() => this.setState({openConnectModal: false})}
          >
            <div className='selected-wallet-upload-container'>
              <div className='selected-wallet-upload'>
                  <span style={{fontSize: '23px', fontWeight: '600', color: 'white'}}>Connect</span>
                  <span style={{ fontSize: '14px', color: 'grey'}}>Select your preferred wallet and click Continue</span>
              </div>
              <div className='connect-wallets-wrapper'>
                    <div className='wallet-wrapper' onClick={()=> this.setState({walletOption: 'nfid'})}>
                      <img src="/static/nfid-logo-og.png" alt="" className='nfid-icon-sign'/>
                      <span>NFID</span>
                      {walletOption === 'nfid' && (
                        <FontAwesomeIcon width={25} height={25} className="tick-icon-wallet" icon={faCircleCheck} />
                      )}
                    </div>
                    <div className='wallet-wrapper' onClick={()=> this.setState({walletOption: 'plug'})}>
                      <img src="/static/plug-favicon.png" alt="" className='plug-icon-sign'/>
                      <span>Plug Wallet</span>
                      {walletOption === 'plug' && (
                        <FontAwesomeIcon width={25} height={25} icon={faCircleCheck} className="tick-icon-wallet"/>
                      )}
                    </div>
                    <div className='wallet-wrapper' onClick={()=> this.setState({walletOption: 'ii'})}>
                      <img src="/static/icp-logo.png" alt="" className='icp-icon-sign'/>
                      <span>Internet Identity</span>
                      {walletOption === 'ii' && (
                        <FontAwesomeIcon width={25} height={25} icon={faCircleCheck} className="tick-icon-wallet"/>
                      )}
                    </div>
              </div>
              <div>
              <Button
                className="upload-with-wallet-btn"
                onClick={()=> this.beforeSendCrypto()}
              >
                Continue
              </Button>
              </div>

            </div>
          </Modal>
        </div>
    );
  }
}
