// components/settings/shared/AuthenticationSettings.tsx
import React, { useState, useEffect } from 'react';
import { Col, Form, Modal, message } from 'antd';
import PhoneInput from 'react-phone-number-input';
import { accountService } from '@services/index';
import { IAccount } from 'src/interfaces';
import TraxButton from '@components/common/TraxButton';
import TraxInputField from '@components/common/layout/TraxInputField';
import { FORM_LAYOUT } from '@interfaces/settings';

interface IAuthSettingsProps {
  account: IAccount;
  onFinish: (values: any) => void;
  updating?: boolean;
}

const AuthenticationSettings: React.FC<IAuthSettingsProps> = ({
  account,
  onFinish,
  updating
}) => {
  const [form] = Form.useForm();
  const [phone, setPhone] = useState(account.phone || '');
  const [openEnable2fa, setOpenEnable2fa] = useState(false);
  const [qrCode, setQrCode] = useState('/static/no-image.jpg');
  const [tokenField, setTokenField] = useState('');
  const [enabled2fa, setEnabled2fa] = useState(account.enabled2fa || false);
  const [openEnableSms, setOpenEnableSms] = useState(false);
  const [tokenSmsField, setTokenSmsField] = useState('');
  const [enabledSms, setEnabledSms] = useState(account.enabledSms || false);

  // Select the appropriate service based on account type
  const service = accountService;

  useEffect(() => {
    form.setFieldsValue({
      phone: account.phone
    });
    setPhone(account.phone || '');
    setEnabledSms(account.enabledSms || false);
  }, [account]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onFinish({
        ...account,
        phone: values.phone,
      });
      message.success('Phone number updated successfully');
    } catch (error) {
      message.error('Failed to update phone number');
      console.error(error);
    }
  };

  const enable2FA = async () => {
    try {
      await service.enable2FA(account._id);
      setOpenEnable2fa(true);
      const qrCodeLink = await service.getQRCode(account._id);
      setQrCode(qrCodeLink.data);
    } catch (error) {
      message.error('Failed to enable 2FA');
    }
  };

  const verify2FA = async () => {
    try {
      const res = await service.verify2FA(account._id, { token: tokenField });
      if (res.data === true) {
        message.success('Two factor authentication enabled');
        setOpenEnable2fa(false);
        setEnabled2fa(true);
      } else {
        message.error('Invalid verification code');
      }
    } catch (error) {
      message.error('Failed to verify 2FA');
    }
  };

  const disable2FA = async () => {
    try {
      const res = await service.disable2FA(account._id);
      if (res.data === true) {
        message.success('Two factor authentication disabled');
        setEnabled2fa(false);
      } else {
        message.error('Failed to disable 2FA');
      }
    } catch (error) {
      message.error('Failed to disable 2FA');
    }
  };

  const enableSms = async () => {
    try {
      await form.validateFields();
      await service.enableSms(account._id, { phone: phone || account.phone });
      setTokenSmsField('');
      setOpenEnableSms(true);
      await service.getSMSCode(account._id);
    } catch (error) {
      message.error('Failed to enable SMS authentication');
    }
  };

  const verifySms = async () => {
    try {
      const res = await service.verifySms(account._id, { token: tokenSmsField });
      if (res.data === true) {
        message.success('SMS authentication enabled');
        setOpenEnableSms(false);
        setEnabledSms(true);
      } else {
        message.error('Invalid SMS code');
      }
    } catch (error) {
      message.error('Failed to verify SMS code');
    }
  };

  const disableSms = async () => {
    try {
      const res = await service.disableSms(account._id);
      if (res.data === true) {
        message.success('SMS authentication disabled');
        setEnabledSms(false);
      } else {
        message.error('Failed to disable SMS authentication');
      }
    } catch (error) {
      message.error('Failed to disable SMS authentication');
    }
  };

  return (
    <Form
      form={form}
      {...FORM_LAYOUT}
      name="auth-settings-form"
      onFinish={handleSave}
      initialValues={account}
      scrollToFirstError
    >
      <div className="account-form-settings">
        <h1 className="profile-page-heading">2FA authentication</h1>
        <span className="profile-page-subtitle text-center sm:text-start">
          Enable Two factor authentication for additional security.
        </span>
        {!enabled2fa ? (
          <TraxButton
            htmlType="button"
            styleType="primary"
            buttonSize="medium"
            buttonText="Enable 2FA"
            onClick={() => enable2FA()}
          />
        ) : (
          <TraxButton
            htmlType="button"
            styleType="secondary"
            buttonSize="medium"
            buttonText="Disable 2FA"
            onClick={() => disable2FA()}
          />
        )}

        <h1 className="profile-page-heading pt-8">SMS authentication</h1>
        <Col className="lg:w-full md:w-full w-full mb-6">
          <Form.Item name="phone" label="Phone Number">
            <PhoneInput
              international
              withCountryCallingCode
              placeholder="Enter phone number"
              value={phone}
              onChange={(value) => {
                setPhone(value);
                form.setFieldsValue({ phone: value });
              }}
            />
          </Form.Item>
        </Col>
        <span className="text-trax-gray-300 mb-6 flex">
          Enable SMS authentication for additional security.
        </span>
        {!enabledSms ? (
          <TraxButton
            htmlType="button"
            styleType="primary"
            buttonSize="medium"
            buttonText="Enable SMS Auth"
            onClick={enableSms}
          />
        ) : (
          <TraxButton
            htmlType="button"
            styleType="secondary"
            buttonSize="medium"
            buttonText="Disable SMS Auth"
            onClick={disableSms}
          />
        )}
      </div>

      {/* 2FA Modal */}
      <Modal
        key="enable2fa"
        className="enable2fa"
        title={null}
        open={openEnable2fa}
        footer={null}
        width={600}
        destroyOnClose
        onCancel={() => setOpenEnable2fa(false)}
      >
        <div className="p-8">
          <div className="mb-4">
            <span className="text-2xl font-semibold text-trax-white">
              Connect your 2FA Authenticator with this QR code
            </span>
            <br />
            <img
              alt="qr_code"
              src={qrCode}
              className="w-fit lg:w-full max-w-md my-4"
            />
            <div className='my-4'>
              <TraxInputField
                type="text"
                name="token"
                label="Authentication Token"
                placeholder="Enter the token from your authenticator app"
                value={tokenField}
                onChange={(e) => setTokenField(e.target.value)}
              />
            </div>
            <TraxButton
              htmlType="button"
              styleType="primary"
              buttonSize="medium"
              buttonText="Verify 2FA"
              onClick={() => verify2FA()}
            />
          </div>
        </div>
      </Modal>

      {/* SMS Modal */}
      <Modal
        key="enableSms"
        className="enableSms"
        title={null}
        open={openEnableSms}
        footer={null}
        width={600}
        destroyOnClose
        onCancel={() => setOpenEnableSms(false)}
      >
        <div className="p-8">
          <div className="mb-4">
            <span className="text-2xl font-semibold text-trax-white">
              Connect your Phone with SMS code
            </span>
            <div className='my-4'>
              <TraxInputField
                type="text"
                name="smsCode"
                label="SMS Code"
                placeholder="Enter the SMS code sent to your phone"
                value={tokenSmsField}
                onChange={(e) => setTokenSmsField(e.target.value)}
              />
            </div>
            <TraxButton
              htmlType="button"
              styleType="primary"
              buttonSize="medium"
              buttonText="Verify SMS"
              onClick={() => verifySms()}
            />
          </div>
        </div>
      </Modal>
    </Form>
  );
};

export default AuthenticationSettings;
