import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import { IUser, IAccount, IPerformer } from 'src/interfaces';
import { FORM_LAYOUT } from '@interfaces/settings';
import TraxInputField from '@components/common/layout/TraxInputField';
import TraxButton from '@components/common/TraxButton';

interface IPasswordSettingsProps {
  account: IAccount;
  onFinish: (values: any) => void;
  updating?: boolean;
}

const PasswordSettings: React.FC<IPasswordSettingsProps> = ({
  account,
  onFinish,
  updating
}) => {
  const [form] = Form.useForm();
  const [isFormChanged, setIsFormChanged] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      await onFinish({
        password: values.password
      });
      form.resetFields();
      setIsFormChanged(false);
    } catch (error) {
      console.error('Password update failed:', error);
    }
  };

  return (
    <div className="account-form-settings">
      <h1 className="profile-page-heading">Change password</h1>
      <span className="profile-page-subtitle">
      Change or reset your account password
      </span>

      <Form
        {...FORM_LAYOUT}
        form={form}
        name="password-settings-form"
        onFinish={handleSubmit}
        scrollToFirstError
        preserve={false}
        initialValues={{
          password: '',
          confirmPassword: ''
        }}
        onValuesChange={() => {
          const values = form.getFieldsValue();
          const hasValues = values.password && values.confirmPassword;
          const passwordsMatch = values.password === values.confirmPassword;
          setIsFormChanged(hasValues && passwordsMatch);
        }}
      >
        <div className="flex flex-col">
          <Form.Item
            name="password"
            validateFirst
            rules={[
              {
                required: true,
                message: 'Please input your new password!'
              },
              {
                pattern: /^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[^\w\d]).*$/g,
                message: 'Password must have minimum 8 characters, at least 1 number, 1 uppercase letter, 1 lowercase letter & 1 special character'
              }
            ]}
          >
            <TraxInputField
              type="password"
              name="password"
              label="New password"
              placeholder="Enter new password"
              required
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            validateFirst
            rules={[
              {
                required: true,
                message: 'Please confirm your password!'
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                }
              })
            ]}
          >
            <TraxInputField
              type="password"
              name="confirmPassword"
              label="Confirm password"
              placeholder="Confirm new password"
              required
            />
          </Form.Item>

          <TraxButton
            htmlType="submit"
            styleType="primary"
            buttonSize="full"
            buttonText="Update password"
            loading={updating}
            disabled={updating || !isFormChanged}
          />
        </div>
      </Form>
    </div>
  );
};

export default PasswordSettings;