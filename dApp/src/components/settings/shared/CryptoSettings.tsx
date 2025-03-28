import React, { useState } from 'react';
import { Form, Modal, message } from 'antd';
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { performerService, userService, cryptoService, accountService } from '@services/index';
import { Sheet } from 'react-modal-sheet';
import useDeviceSize from '@components/common/useDeviceSize';
import { AuthConnect } from 'src/crypto/nfid/AuthConnect';
import TraxButton from '@components/common/TraxButton';
import { FORM_LAYOUT } from '@interfaces/settings';
import { IAccount, IUser, IPerformer } from 'src/interfaces';
import SlideUpModal from '@components/common/layout/slide-up-modal';

interface ICryptoSettingsProps {
  account: IAccount;
  onFinish: (values: any) => void;
  updating?: boolean;
}

const CryptoSettings: React.FC<ICryptoSettingsProps> = ({
  account,
  onFinish,
  updating
}) => {
  const [form] = Form.useForm();
  const [walletNFID, setWalletNFID] = useState<string>(account.wallet_icp || '');
  const [openConnectModal, setOpenConnectModal] = useState<boolean>(false);
  const { isMobile } = useDeviceSize();

  const service = accountService;
  const InternetIdentityProviderProps: any = cryptoService.getNfidInternetIdentityProviderProps();

  const onNFIDCopy = (value: string) => {
    setWalletNFID(value);
    form.setFieldsValue({ wallet_icp: value });
    setOpenConnectModal(false);
  };

  const disconnectWallet = async () => {
    try {
      await service.disconnectWalletPrincipal();
      message.success('Wallet Principal has been disconnected.');
      setWalletNFID('');
      form.setFieldsValue({ wallet_icp: '' });
      onFinish({ ...account, wallet_icp: '' });
    } catch (err) {
      message.error('There was a problem in disconnecting your wallet principal.');
    }
  };

  const renderWalletModal = () => {
    const modalContent = (
    <div className="p-8">
      <div className="mb-4">
        <span className="text-2xl font-semibold text-trax-white block">Connect</span>
        <span className="text-sm text-trax-gray-400">
          Select your preferred wallet to connect to TRAX
        </span>
      </div>
      <InternetIdentityProvider {...InternetIdentityProviderProps}>
        <AuthConnect
          onNFIDConnect={onNFIDCopy}
          isPerformer={true}
          oldWalletPrincipal={account.wallet_icp}
        />
      </InternetIdentityProvider>
    </div>
  );

    if (isMobile) {
      return (
        <SlideUpModal
          isOpen={openConnectModal}
          onClose={() => setOpenConnectModal(false)}
        >
        {modalContent}
        </SlideUpModal>
      );
    }

    return (
      <div className='sign-in-modal-wrapper'>
        <Modal
          key="purchase_post"
          title={null}
          open={openConnectModal}
          footer={null}
          width={600}
          destroyOnClose
          onCancel={() => setOpenConnectModal(false)}
        >
          {modalContent}
        </Modal>
      </div>
    );
  };

  return (
    <Form
      form={form}
      {...FORM_LAYOUT}
      name="crypto-settings-form"
      initialValues={account}
      scrollToFirstError
    >
      <div className="account-form-settings">
        <div className="w-full">
          <h1 className="profile-page-heading">CONNECT A WALLET</h1>
          <span className='profile-page-subtitle'>
            Link your crypto wallet to access web3 features
          </span>

          {walletNFID ? (
            <div className='profile-form-box-connected'>
              <span className='profile-box-heading'>Wallet connected</span>
              <span className='profile-box-text'>
                You have successfully connected a wallet. If you would like to disconnect your wallet,
                please click 'Disconnect' below.
              </span>
              <div className='w-full flex justify-end gap-2'>
                <div className='text-trax-white break-all mb-4'>{walletNFID}</div>
                <Form.Item>
                  <TraxButton
                    htmlType="button"
                    styleType="secondary"
                    buttonSize='full'
                    buttonText="Disconnect"
                    onClick={() => disconnectWallet()}
                  />
                </Form.Item>
              </div>
            </div>
          ) : (
            <div className='profile-form-box-unconnected'>

              <div className='w-full flex justify-end'>
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

              <span className='profile-box-text'>
                By clicking 'Connect' you will be redirected to connect your
                <a href="https://plugwallet.ooo/" target="_blank" rel="noopener noreferrer" className='text-custom-green'> Plug Wallet </a>
                or
                <a href="https://identity.ic0.app/" target="_blank" rel="noopener noreferrer" className='text-custom-green'> Internet Identity</a>.
              </span>
            </div>
          )}

          {renderWalletModal()}
        </div>
      </div>
    </Form>
  );
};

export default CryptoSettings;
