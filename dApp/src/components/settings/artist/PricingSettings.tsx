import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import TraxInputField from '@components/common/layout/TraxInputField';
import TraxButton from '@components/common/TraxButton';
import TraxToggle from '@components/common/TraxToggleButton';
import { IPerformer } from 'src/interfaces';

interface PricingSettingsProps {
  user: IPerformer;
  updating?: boolean;
  onFinish: (values: any) => void;
}

const PricingSettings: React.FC<PricingSettingsProps> = ({
  user,
  updating = false,
  onFinish
}) => {
  const [form] = Form.useForm();
  const [isFreeSubscription, setIsFreeSubscription] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    setIsFreeSubscription(!!user?.isFreeSubscription);
  }, [user]);

  const formatPrice = (value: string): string => {
    // Remove any non-numeric characters except decimal
    const numericValue = value.replace(/[^\d.]/g, '');
    const parts = numericValue.split('.');
    if (parts[1]?.length > 2) parts[1] = parts[1].substring(0, 2);
    const cleanValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : numericValue;
    return cleanValue ? `$${cleanValue}` : '';
  };

  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!value) return;

    const formattedValue = formatPrice(value);
    form.setFieldsValue({
      [name]: formattedValue
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Remove any non-numeric characters except decimal
    const numericValue = value.replace(/[^\d.]/g, '');

    if (numericValue || numericValue === '') {
      form.setFieldsValue({
        [name]: numericValue
      });
    }
  };

  const handleSubmit = async (values: any) => {
    const formattedValues = {
      ...values,
      monthlyPrice: parseFloat(values.monthlyPrice?.replace('$', '') || '0'),
      yearlyPrice: parseFloat(values.yearlyPrice?.replace('$', '') || '0'),
      durationFreeSubscriptionDays: values.durationFreeSubscriptionDays ?
        parseInt(values.durationFreeSubscriptionDays) : undefined
    };

    if (!formattedValues.isFreeSubscription) {
      delete formattedValues.durationFreeSubscriptionDays;
    }

    try {
      await onFinish(formattedValues);
      setIsFormChanged(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleFreeTrialToggle = (value: boolean) => {
    setIsFreeSubscription(value);
    form.setFieldsValue({
      isFreeSubscription: value,
      durationFreeSubscriptionDays: value ? form.getFieldValue('durationFreeSubscriptionDays') : undefined
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, '');

    form.setFieldsValue({
      [name]: numericValue
    });
  };

  return (
    <div className="account-form-settings">
      <h1 className="profile-page-heading">Pricing</h1>
      <span className="profile-page-subtitle">
        Set your pricing for monthly and yearly subscription plans, and outline the benefits and content your subscribers can expect to see.
      </span>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          ...user,
          monthlyPrice: user?.monthlyPrice ? `$${user.monthlyPrice}` : '',
          yearlyPrice: user?.yearlyPrice ? `$${user.yearlyPrice}` : '',
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
        <div className="form-row">
          <p className="account-form-item">Subscription Benefits</p>
          <Form.Item
            name="subBenefits"
            rules={[{ required: true, message: 'Please describe your subscription benefits' }]}
          >
            <TraxInputField
              type="textarea"
              name="subBenefits"
              label="Subscription Benefits"
              placeholder="e.g., Exclusive content, Behind-the-scenes access, Direct messaging..."
              rows={5}
            />
          </Form.Item>
        </div>

        <div className="form-row">
          <p className="account-form-item">Monthly Price ($)</p>
          <Form.Item
            name="monthlyPrice"
            rules={[
              { required: true, message: 'Please enter monthly price' },
              {
                validator: (_, value) => {
                  const price = parseFloat(value?.replace('$', '') || '0');
                  if (isNaN(price) || price < 1) {
                    return Promise.reject('Price must be at least $1');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <TraxInputField
              type="text"
              name="monthlyPrice"
              label="Monthly Price"
              placeholder="$4.99"
              required
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
            />
          </Form.Item>
        </div>

        <div className="form-row">
          <p className="account-form-item">Annual Price ($)</p>
          <Form.Item
            name="yearlyPrice"
            rules={[
              { required: true, message: 'Please enter yearly price' },
              {
                validator: (_, value) => {
                  const price = parseFloat(value?.replace('$', '') || '0');
                  if (isNaN(price) || price < 1) {
                    return Promise.reject('Price must be at least $1');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <TraxInputField
              type="text"
              name="yearlyPrice"
              label="Annual Price"
              placeholder="$49.99"
              required
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
            />
          </Form.Item>
        </div>

        <div className="form-row">
          <p className="account-form-item">Thank You Message</p>
          <Form.Item name="tipThankYouMessage">
            <TraxInputField
              type="textarea"
              name="tipThankYouMessage"
              label="Personalized Thank You Message"
              placeholder="e.g., Thank you so much for your generous tip! Your support means the world to me..."
              rows={4}
            />
          </Form.Item>
        </div>

        <div className="form-row">
          <h1 className="profile-page-heading">Offer a Free Trial</h1>
          <span className="profile-page-subtitle">
            Give fans free access to your subscriber-only content for a limited time
          </span>
        </div>

        <div className="form-row mb-8">
          <Form.Item name="isFreeSubscription" className="mb-0">
            <TraxToggle
              leftText="No"
              rightText="Yes"
              defaultValue={isFreeSubscription}
              onChange={handleFreeTrialToggle}
            />
          </Form.Item>
        </div>

        {isFreeSubscription && (
          <div className="form-row">
            <p className="account-form-item">Duration (days)</p>
            <Form.Item
              name="durationFreeSubscriptionDays"
              rules={[
                { required: true, message: 'Please enter trial duration' },
                {
                  validator: (_, value) => {
                    const duration = parseInt(value || '0');
                    if (isNaN(duration) || duration < 1) {
                      return Promise.reject('Duration must be at least 1 day');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <TraxInputField
                type="text"
                name="durationFreeSubscriptionDays"
                label="Duration (days)"
                placeholder="7"
                required
                onChange={handleDurationChange}
              />
            </Form.Item>
          </div>
        )}

        <div className="mt-12">
          <TraxButton
            htmlType="submit"
            styleType="primary"
            buttonSize="full"
            buttonText="Save Changes"
            loading={updating}
            disabled={updating || !isFormChanged}
          />
        </div>
      </Form>
    </div>
  );
};

export default PricingSettings;
