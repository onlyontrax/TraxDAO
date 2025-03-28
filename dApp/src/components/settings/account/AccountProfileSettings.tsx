import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { IAccount, ICountry } from 'src/interfaces';
import { FORM_LAYOUT } from '@interfaces/settings';
import TraxInputField from '@components/common/layout/TraxInputField';
import TraxButton from '@components/common/TraxButton';
import TraxToggle from '@components/common/TraxToggleButton';
import { DatePicker } from '@components/common/datePicker';
import moment from 'moment';
import { utilsService } from 'src/services';
import { CircleCheck } from 'lucide-react';

interface IAccountSettingsProps {
  account: IAccount;
  updating?: boolean;
  onFinish: (values: any) => void;
  onVerifyEmail?: () => void;
  countTime?: number;
}

const AccountProfileSettings: React.FC<IAccountSettingsProps> = ({
  account,
  updating,
  onFinish,
}) => {
  const [form] = Form.useForm();
  const [musicInfo, setMusicInfo] = useState(null);
  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const [countriesResp, musicInfoResp] = await Promise.all([
          utilsService.countriesList(),
          utilsService.musicInfo()
        ]);
        const countriesData = Array.isArray(countriesResp?.data) ? countriesResp.data : [];
        setMusicInfo(musicInfoResp?.data);
      } catch (e) {
        setMusicInfo(null);
      }
    };

    getData();
  }, []);

  const handleToggleChange = (isEnabled: boolean) => {
    form.setFieldsValue({ unsubscribed: !isEnabled });
    setIsFormChanged(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      await onFinish(values);
      setIsFormChanged(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const isEmailVerified = !account._id || account?.verifiedEmail ? true : false;

  return (
    <div className="account-form-settings">
      <h1 className="profile-page-heading">Personal details</h1>
      <span className="profile-page-subtitle text-center sm:text-start">
        View and make changes to your personal details profile here.
        Click save changes when you're done.
      </span>

      <Form
        {...FORM_LAYOUT}
        form={form}
        name="account-settings-form"
        onFinish={handleSubmit}
        initialValues={{
          ...account
        }}
        onValuesChange={() => {
          const currentValues = form.getFieldsValue();
          const formChanged = Object.keys(currentValues).some(key =>
            currentValues[key] !== account[key]
          );
          setIsFormChanged(formChanged);
        }}
        scrollToFirstError
      >
        <div className="flex flex-col space-y-6">
          <div className="form-row">
            <p className="account-form-item flex flex-row">
              Email address 
              {isEmailVerified && (
              <span className='text-[0.9rem] ml-2 text-custom-green flex flex-row items-center gap-1 border border-custom-green rounded-full px-2  bg-custom-green/20'> 
                <CircleCheck className='w-4 h-4 items-center'/> Verified
              </span>
              )}
            </p>
            
            <Form.Item
              name="email"
              rules={[
                { type: 'email', message: 'Please enter a valid email' },
                { required: true, message: 'Email is required' }
              ]}
            >
              <TraxInputField
                type="email"
                name="email"
                label="Email address"
                disabled={account.googleConnected || account.appleConnected || account.facebookConnected}
                required
              />
            </Form.Item>
          </div>

          <div className="notification-toggle">
            <span className="toggle-label">Email notifications</span>
            <TraxToggle
              leftText="ON"
              rightText="OFF"
              buttonSize="large"
              defaultValue={!account.unsubscribed}
              onChange={handleToggleChange}
            />
            <Form.Item name="unsubscribed" hidden>
              <input type="hidden" />
            </Form.Item>
          </div>

          <TraxButton
            htmlType="submit"
            styleType="primary"
            buttonSize="full"
            buttonText="UPDATE"
            loading={updating}
            disabled={updating || !isFormChanged}
          />
        </div>
      </Form>
    </div>
  );
};

export default AccountProfileSettings;
