import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { IPerformer, ICountry } from 'src/interfaces';
import { FORM_LAYOUT } from '@interfaces/settings';
import TraxInputField from '@components/common/layout/TraxInputField';
import TraxButton from '@components/common/TraxButton';
import TraxToggle from '@components/common/TraxToggleButton';
import { DatePicker } from '@components/common/datePicker';
import moment from 'moment';
import { utilsService } from 'src/services';

interface IAccountSettingsProps {
  user: IPerformer;
  updating?: boolean;
  onFinish: (values: any) => void;
  onVerifyEmail?: () => void;
  countTime?: number;
}

const AccountSettings: React.FC<IAccountSettingsProps> = ({
  user,
  updating,
  onFinish,
}) => {
  const [form] = Form.useForm();
  const [countries, setCountries] = useState<ICountry[]>([]);
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
        setCountries(countriesData);
        setMusicInfo(musicInfoResp?.data);
      } catch (e) {
        setCountries([]);
        setMusicInfo(null);
      }
    };

    getData();
  }, []);

  const handleToggleChange = (isEnabled: boolean) => {
    form.setFieldsValue({ unsubscribed: !isEnabled });
  };

  const handleSubmit = async (values: any) => {
    try {
      await onFinish(values);
      setIsFormChanged(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="account-form-settings">
      <h1 className="profile-page-heading">Personal details</h1>
      <span className="profile-page-subtitle">
        View and make changes to your personal details profile here.
        Click save changes when you're done.
      </span>

      <Form
        {...FORM_LAYOUT}
        form={form}
        name="account-settings-form"
        onFinish={handleSubmit}
        initialValues={{
          ...user,
          dateOfBirth: user.dateOfBirth || null
        }}
        onValuesChange={() => {
          const currentValues = form.getFieldsValue();
          const formChanged = Object.keys(currentValues).some(key =>
            currentValues[key] !== user[key]
          );
          setIsFormChanged(formChanged);
        }}
        scrollToFirstError
      >
        <div className="flex flex-col space-y-6">
          <div className="form-row">
            <p className="account-form-item">First name</p>
            <Form.Item
              name="firstName"
              rules={[
                { required: true, message: 'Please input your first name!' },
                {
                  pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                  message: 'First name cannot contain number and special character'
                }
              ]}
            >
              <TraxInputField
                type="text"
                name="firstName"
                label="First name"
                required
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <p className="account-form-item">Last name</p>
            <Form.Item
              name="lastName"
              rules={[
                { required: true, message: 'Please input your last name!' },
                {
                  pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                  message: 'Last name cannot contain number and special character'
                }
              ]}
            >
              <TraxInputField
                type="text"
                name="lastName"
                label="Last name"
                required
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <p className="account-form-item">Gender</p>
            <Form.Item
              name="gender"
              rules={[{ required: true, message: 'Please select gender!' }]}
            >
              <TraxInputField
                type="select"
                name="gender"
                label="Gender"
                options={musicInfo?.genders?.map(g => ({ value: g.value, label: g.text })) || [
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }
                ]}
                required
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <p className="account-form-item">Country</p>
            <Form.Item
              name="country"
              rules={[{ required: true, message: 'Please select country!' }]}
            >
              <TraxInputField
                type="select"
                name="country"
                label="Country"
                options={countries.map(c => ({ value: c.code, label: c.name }))}
                required
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <p className="account-form-item">Date of birth</p>
            <Form.Item
              name="dateOfBirth"
              rules={[{ required: true, message: 'Please select date of birth!' }]}
              getValueProps={(value) => ({
                value: value ? moment(value) : null
              })}
              getValueFromEvent={(date) => date ? date.format('YYYY-MM-DD') : null}
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder=""
                className={`trax-input-wrapper ${form.getFieldValue('dateOfBirth') ? 'dirty' : ''}`}
                disabledDate={(currentDate) => currentDate && currentDate > moment().subtract(18, 'year').endOf('day')}
                suffixIcon={<div className="input-icon" />}
                allowClear={false}
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <p className="account-form-item">Address</p>
            <Form.Item name="address">
              <TraxInputField
                type="text"
                name="address"
                label="Address"
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <p className="account-form-item">State</p>
            <Form.Item name="state">
              <TraxInputField
                type="text"
                name="state"
                label="State"
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <p className="account-form-item">City</p>
            <Form.Item name="city">
              <TraxInputField
                type="text"
                name="city"
                label="City"
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <p className="account-form-item">Zipcode</p>
            <Form.Item name="zipcode">
              <TraxInputField
                type="text"
                name="zipcode"
                label="Zipcode"
              />
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

export default AccountSettings;
