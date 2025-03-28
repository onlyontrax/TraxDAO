import React, { useState } from 'react';
import { Form } from 'antd';
import TraxButton from '@components/common/TraxButton';
import TraxInputField from '@components/common/layout/TraxInputField';
import { IPerformer } from 'src/interfaces';
import isEqual from 'lodash/isEqual';

interface SocialLinksSettingsProps {
  user: IPerformer;
  updating?: boolean;
  onFinish: (values: any) => void;
}

const validateMessages = {
  required: 'This field is required!',
  types: {
    url: 'Not a valid URL!'
  }
};

const SocialLinksSettings: React.FC<SocialLinksSettingsProps> = ({
  user,
  updating = false,
  onFinish
}) => {
  const [form] = Form.useForm();
  const [isFormChanged, setIsFormChanged] = useState(false);

  const socialLinks = [
    {
      id: 'spotify-link',
      name: 'spotify',
      label: 'Spotify',
      placeholder: 'spotify.com/'
    },
    {
      id: 'apple-music-link',
      name: 'appleMusic',
      label: 'Apple Music',
      placeholder: 'applemusic.com/'
    },
    {
      id: 'soundcloud-link',
      name: 'soundcloud',
      label: 'SoundCloud',
      placeholder: 'soundcloud.com/'
    },
    {
      id: 'instagram-link',
      name: 'instagram',
      label: 'Instagram',
      placeholder: 'instagram.com/'
    },
    {
      id: 'twitter-link',
      name: 'twitter',
      label: 'X',
      placeholder: 'x.com/'
    }
  ];

  const initialValues = {
    spotify: user?.spotify || '',
    appleMusic: user?.appleMusic || '',
    soundcloud: user?.soundcloud || '',
    instagram: user?.instagram || '',
    twitter: user?.twitter || '',
    ...user
  };

  return (
    <div className="account-form-settings" key="social-links-settings">
      <h1 className="profile-page-heading">Socials Links</h1>
      <span className="text-sm text-trax-gray-300 mb-8 block">
        Make changes to your profile here.
        Click save changes when you're done.
      </span>

      <Form
        form={form}
        name="socialLinks"
        onFinish={onFinish}
        validateMessages={validateMessages}
        initialValues={initialValues}
        scrollToFirstError
        className="flex flex-col"
        onFieldsChange={() => {
          const currentValues = {
            spotify: form.getFieldValue('spotify') || '',
            appleMusic: form.getFieldValue('appleMusic') || '',
            soundcloud: form.getFieldValue('soundcloud') || '',
            instagram: form.getFieldValue('instagram') || '',
            twitter: form.getFieldValue('twitter') || ''
          };

          setIsFormChanged(!isEqual(currentValues, initialValues));
        }}
      >
        {socialLinks.map((link) => (
          <React.Fragment key={link.id}>
          <div className="form-row">
          <p className="account-form-item">{link.label}</p>
          <Form.Item
            key={link.id}
            name={link.name}
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              {
                pattern: /^(?=.*\S).+$/g,
                message: 'URL can not contain only whitespace'
              }
            ]}
          >
            <TraxInputField
              type="text"
              name={link.name}
              label={link.label}
              placeholder={link.placeholder}
            />
          </Form.Item>
          </div>
          </React.Fragment>
        ))}
        <Form.Item className="mt-4">
          <TraxButton
            htmlType="submit"
            styleType="primary"
            buttonSize="full"
            buttonText="Update"
            loading={updating}
            disabled={updating || !isFormChanged}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default SocialLinksSettings;
