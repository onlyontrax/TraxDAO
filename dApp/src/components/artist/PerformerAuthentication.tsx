import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Input, Modal, message } from 'antd';
import PhoneInput from 'react-phone-number-input';
import { performerService, accountService } from '@services/index';
import { IPerformer } from 'src/interfaces';

import TraxButton from '@components/common/TraxButton';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a valid email!',
    number: 'Not a valid number!'
  },
  number: {
    range: 'Must be between ${min} and ${max}'
  }
};

interface IProps {
  onFinish: (values: any) => void;
  user: IPerformer;
  updating: boolean;
}

const PerformerAuthentication: React.FC<IProps> = ({ onFinish, user, updating }) => {
  const [form] = Form.useForm();
  const [phone, setPhone] = useState(user.phone || '');
  const [username, setUsername] = useState(user.username || '');
  const [openEnable2fa, setOpenEnable2fa] = useState(false);
  const [qrCode, setQrCode] = useState('/static/no-image.jpg');
  const [tokenField, setTokenField] = useState('');
  const [enabled2fa, setEnabled2fa] = useState(user.enabled2fa || false);
  const [openEnableSms, setOpenEnableSms] = useState(false);
  const [tokenSmsField, setTokenSmsField] = useState('');
  const [enabledSms, setEnabledSms] = useState(user.enabledSms || false);

  useEffect(() => {
    // Update form fields when user prop changes
    form.setFieldsValue({
      phone: user.phone,
      username: user.username
    });
    setPhone(user.phone || '');
    setUsername(user.username || '');
    setEnabledSms(user.enabledSms || false);
  }, [user]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onFinish({
        ...user,
        phone: values.phone,
        username: values.username
      });
      message.success('Phone number is updated successfully');
    } catch (error) {
      message.error('Failed to update phone number');
      console.error(error);
    }
  };


  const enable2FA = async () => {
    await accountService.enable2FA(user._id);
    setOpenEnable2fa(true);
    const qrCodeLink = await accountService.getQRCode(user._id);
    setQrCode(qrCodeLink.data);
  };

  const verify2FA = async () => {
    const res = await accountService.verify2FA(user._id, { token: tokenField });
    if (res.data === true) {
      message.success('Two factor authentication enabled.');
      setOpenEnable2fa(false);
      setEnabled2fa(true);
    } else {
      message.error('There is a problem with the provided code, please try again.');
    }
  };

  const disable2FA = async () => {
    const res = await accountService.disable2FA(user._id);
    if (res.data === true) {
      message.success('Two factor authentication disabled.');
      setEnabled2fa(false);
    } else {
      message.error('There is a problem with disabling 2FA. Please try again.');
    }
  };

  const enableSms = async () => {
    const res = await form.validateFields();
    form.submit();

    await accountService.enableSms(user._id, {});
    setOpenEnableSms(true);
    await accountService.getSMSCode(user._id);
    setTokenSmsField('');
  };

  const verifySms = async () => {
    const res = await accountService.verifySms(user._id, { token: tokenSmsField });
    if (res.data === true) {
      message.success('SMS authentication enabled.');
      setOpenEnableSms(false);
      setEnabledSms(true);
    } else {
      message.error('There is a problem with the provided SMS code, please try again.');
    }
  };

  const disableSms = async () => {
    const res = await accountService.disableSms(user._id);
    if (res.data === true) {
      message.success('SMS authentication disabled.');
      setEnabledSms(false);
    } else {
      message.error('There is a problem with disabling SMS Auth. Please try again.');
    }
  };

  return (
    <Form
      form={form}
      {...layout}
      name="nest-messages"
      onFinish={handleSave}
      validateMessages={validateMessages}
      initialValues={user}
      scrollToFirstError
    >
      <div className="account-form-settings">
        <h1 className="profile-page-heading">QR code authentication</h1>
        <span className='profile-page-subtitle'>Enable Two factor authentication for additional security.</span>
        <Col className="lg:w-full md:w-full w-full mb-6">
          <div className='flex flex-row gap-4 w-full'>
            {!enabled2fa ?
              <TraxButton
                htmlType="button"
                styleType="primary"
                buttonSize='full'
                buttonText="Enable 2FA"
                onClick={enable2FA}
              /> :
              <TraxButton
                htmlType="button"
                styleType="primary"
                buttonSize='full'
                buttonText="Disable 2FA"
                onClick={disable2FA}
              />
            }
          </div>
        </Col>

        <h1 className="profile-page-heading pt-8">SMS Authentication</h1>
        <Col className="lg:w-full md:w-full w-full mb-6">
          <Form.Item
            name="phone"
            label="Phone Number"
          >
            <PhoneInput
              placeholder="Enter phone number"
              value={phone}
              onChange={(value) => setPhone(value || '')}
            />
          </Form.Item>
        </Col>
        {!enabledSms ?
          <TraxButton
            htmlType="button"
            styleType="primary"
            buttonSize='full'
            buttonText="Enable SMS Auth"
            onClick={enableSms}
          /> :
          <TraxButton
            htmlType="button"
            styleType="primary"
            buttonSize='full'
            buttonText="Disable SMS Auth"
            onClick={disableSms}
          />
        }
      </div>
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
        <div className='p-8'>
          <div className="mb-4">
            <span className="text-2xl font-semibold text-trax-white">Connect your 2FA Authenticator with this QR code</span>
            <br />
            <img alt="qr_code" src={qrCode} className="w-fit lg:w-full max-w-md my-4" />
            <br />
            <Input
              placeholder="Enter the token from your authenticator app"
              value={tokenField} onChange={(e) => setTokenField(e.target.value)}
              className="mb-4 rounded-lg"
            />
            <TraxButton
              htmlType="button"
              styleType="primary"
              buttonSize='full'
              buttonText="Verify 2FA"
              onClick={verify2FA}
            />
          </div>
        </div>
      </Modal>
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
        <div className='p-8'>
          <div className="mb-4">
            <span className="text-2xl font-semibold text-trax-white">Connect your Phone with SMS code</span>
            <br />
            <Input
              placeholder="Enter the SMS code sent on your phone"
              value={tokenSmsField} onChange={(e) => setTokenSmsField(e.target.value)}
              className="my-4 rounded-lg"
            />
            <TraxButton
              htmlType="button"
              styleType="primary"
              buttonSize='full'
              buttonText="Verify SMS"
              onClick={verifySms}
            />
          </div>
        </div>
      </Modal>
    </Form>
  );
};

export default PerformerAuthentication;