/* eslint-disable react/require-default-props */
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { performerService, cryptoService, accountService } from '@services/index';
import {
  Col,
  Form, Input,
  Row,
  Modal,
  message
} from 'antd';
import { useState } from 'react';
import { IPerformer } from 'src/interfaces';
import { AuthConnect } from '../../crypto/nfid/AuthConnect';
import { Sheet } from 'react-modal-sheet';
import useDeviceSize from 'src/components/common/useDeviceSize';

import TraxButton from '@components/common/TraxButton';
import SlideUpModal from '@components/common/layout/slide-up-modal';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a valid email!',
    number: 'Not a valid number!'
  }
};

interface IProps {
  onFinish: (values: any) => void;
  user: IPerformer;
  updating?: boolean;
}

export function PerformerWalletForm({ onFinish, user, updating }: IProps) {
  const [form] = Form.useForm();
  const [walletNFID, setWalletNFID] = useState<string>(user.account?.wallet_icp);
  const InternetIdentityProviderProps: any = cryptoService.getNfidInternetIdentityProviderProps();
  const [openConnectModal, setOpenConnectModal] = useState<boolean>(false);

  const { isMobile } = useDeviceSize();

  const onNFIDCopy = (value: string) => {
    setWalletNFID(value);
    form.setFieldsValue({ wallet_icp: value });
    setOpenConnectModal(false);
  };

  const disconnectWallet = (value: string) => {
    accountService.disconnectWalletPrincipal().then(val => {
      message.success('Wallet Principal has been disconnected.');
      setWalletNFID('');
    }).catch(err => { message.error('There was a problem in disconnecting your wallet principal.'); });

    form.setFieldsValue({ wallet_icp: '' });
  };

  const onFinishWrapper = (values: any) => {
    onFinish(values);
  };

  return (
    <>
      <Form
        form={form}
        {...layout}
        name="wallets-form"
        onFinish={onFinishWrapper}
        validateMessages={validateMessages}
        initialValues={user}
        labelAlign="left"
        className="account-form-settings"
        scrollToFirstError
      >
        <div className="account-form-settings" >

          <div style={{ width: '100%' }}>
            <h1 className="profile-page-heading">Crypto</h1>
            <span className='profile-page-subtitle'>Connect a wallet to make use of TRAX's web3 features</span>


            {walletNFID ? (

              <div className='profile-form-box-connected'>
                <span className='text-lg text-trax-white '>Wallet connected</span>
                <span className='text-trax-gray-300'>You have successfully connected a wallet. If you would like to disconnect your wallet, please click 'Disconnect' below.</span>
                <div className='w-full flex justify-end'>
                  <Row >

                    <Form.Item
                      name="wallet_icp"
                      label=""
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: false, message: 'Please input your NFID principal address!' }
                      ]}
                    >
                      <Input className="account-form-input" value={walletNFID} readOnly />
                    </Form.Item>
                  </Row>
                  <div className='cursor-pointer rounded-lg bg-[#f1f5f9] text-trax-black py-2 px-4 mt-4 flex w-24 justify-center' onClick={() => disconnectWallet('')}>
                    <span>Disconnect</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className='profile-form-box-unconnected'>
                <span className='text-lg text-trax-black '>Connect wallet</span>
                <span className='text-trax-gray-700 text-sm'>
                  By clicking 'Connect' you will be redirected to connect your
                  <a href="https://plugwallet.ooo/" target="_blank" rel="noopener noreferrer" className='text-trax-blue-500'> Plug Wallet </a>
                  or
                  <a href="https://identity.ic0.app/" target="_blank" rel="noopener noreferrer" className='text-trax-blue-500'> Internet Identity</a>.
                </span>
                  <Form.Item>
                    <TraxButton
                      htmlType="button"
                      styleType="primary"
                      buttonSize='full'
                      buttonText="Connect"
                      onClick={() => setOpenConnectModal(true)}
                    />
                </Form.Item>
              </div>
            )}

          </div>
        </div>
        {isMobile ? (
          <SlideUpModal
            isOpen={openConnectModal}
            onClose={() => setOpenConnectModal(false)}
          >
          <div className='p-8'>
            <div style={{ marginBottom: '15px' }} >

              <span style={{ fontSize: '23px', fontWeight: '600', color: 'white' }}>Connect </span>
              <br />
              <span style={{ fontSize: '14px', color: 'grey' }}>Select your preferred wallet to connect to TRAX</span>
            </div>
            <InternetIdentityProvider {...InternetIdentityProviderProps}>
              <AuthConnect onNFIDConnect={onNFIDCopy} isPerformer oldWalletPrincipal={user.account?.wallet_icp} />
            </InternetIdentityProvider>
          </div>
          </SlideUpModal>
        ) : (
          <div className='sign-in-modal-wrapper'>
            <Modal
              key="purchase_post"
              className=""
              title={null}
              open={openConnectModal}
              footer={null}
              width={600}
              destroyOnClose
              onCancel={() => setOpenConnectModal(false)}
            >
              <div className='p-8'>


                <div style={{ marginBottom: '15px' }} >

                  <span style={{ fontSize: '23px', fontWeight: '600', color: 'white' }}>Connect </span>
                  <br />
                  <span style={{ fontSize: '14px', color: 'grey' }}>Select your preferred wallet to connect to TRAX</span>
                </div>
                <InternetIdentityProvider {...InternetIdentityProviderProps}>
                  <AuthConnect onNFIDConnect={onNFIDCopy} isPerformer oldWalletPrincipal={user.account?.wallet_icp} />
                </InternetIdentityProvider>
              </div>
            </Modal>
          </div>
        )}
      </Form>

    </>
  );
}