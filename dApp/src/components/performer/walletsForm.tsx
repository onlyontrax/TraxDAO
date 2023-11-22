/* eslint-disable react/require-default-props */
import { InternetIdentityProvider } from '@internet-identity-labs/react-ic-ii-auth';
import { cryptoService } from '@services/crypto.service';
import {
  Button,
  Col,
  Form, Input,
  Row,
  Modal
} from 'antd';
import { useState } from 'react';
import { IPerformer } from 'src/interfaces';
import { AuthConnect } from '../../crypto/nfid/AuthConnect';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!'
  }
};

interface IProps {
  onFinish: (values: any) => void;
  user: IPerformer;
  updating?: boolean;
}

export function PerformerWalletForm({ onFinish, user, updating }: IProps) {
  const [form] = Form.useForm();
  const [walletNFID, setWalletNFID] = useState<string>(user.wallet_icp);
  const InternetIdentityProviderProps:any = cryptoService.getNfidInternetIdentityProviderProps();
  const [openConnectModal, setOpenConnectModal] = useState<boolean>(false);

  

  const onNFIDCopy = (value: string) => {
    setWalletNFID(value);
    form.setFieldsValue({ wallet_icp: value });
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
      className="account-form"
      scrollToFirstError
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%' }}>
          <h1 className="profile-page-heading">Connect wallet</h1>
          <p className="profile-page-subtitle">Link your preferred crypto wallet to access web3 features</p>
            <Col xl={24} md={24} xs={24}>
              <p className="account-form-item-tag">Connect wallet</p>
              <Form.Item
                name="wallet_icp"
                label=""
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: false, message: 'Please input your NFID principal address!' }
                ]}
              >
                <Input className="account-form-input" value={walletNFID} onChange={(e) => onNFIDCopy(e.target.value)} readOnly />
              </Form.Item>

              <div style={{marginTop: '10px'}} className='connect-wallet-btn-wrapper'>
                <Button style={{marginLeft: '0px'}} className='connect-wallet-btn' onClick={()=> setOpenConnectModal(true)}>
                  Connect
                </Button>
              </div>

              
            </Col>
        </div>
      </div>
      <div className='sign-in-modal-wrapper'>
      <Modal
        key="purchase_post"
        className="sign-in-modal"
        title={null}
        open={openConnectModal}
        footer={null}
        width={600}
        destroyOnClose
        onCancel={() => setOpenConnectModal(false)}
      >
        <div style={{marginBottom: '15px'}}>
          
          <span style={{fontSize: '23px', fontWeight: '600', color: 'white'}}>Connect </span>
          <br />
          <span style={{ fontSize: '14px', color: 'grey'}}>Select your preferred wallet to connect to TRAX</span>
        </div>
        <InternetIdentityProvider {...InternetIdentityProviderProps}>
                <AuthConnect onNFIDConnect={onNFIDCopy} isPerformer oldWalletPrincipal={user.wallet_icp} />
              </InternetIdentityProvider>
      </Modal>
    </div>
    </Form>
    
  </>
  );
}

export default PerformerWalletForm;
