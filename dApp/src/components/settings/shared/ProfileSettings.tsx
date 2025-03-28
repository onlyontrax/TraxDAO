import React, { useState, useEffect } from 'react';
import { Form, Input } from 'antd';
import { IUser, IMusic, IPerformer } from 'src/interfaces';
import { FORM_LAYOUT } from '@interfaces/settings';
import { AvatarUpload } from '@components/user/avatar-upload';
import { CoverUpload } from '@components/user/cover-upload';
import TraxInputField from '@components/common/layout/TraxInputField';
import TraxButton from '@components/common/TraxButton';
import TraxToggle from '@components/common/TraxToggleButton';
import { SHORT_GENRES, GENRES, PICK_GENRES } from 'src/constants';
import { HexColorPicker } from "react-colorful";

interface IProfileSettingsProps {
  user: IUser | IPerformer;
  userType: 'fan' | 'artist';
  onFinish: (values: any) => void;
  updating?: boolean;
  options?: {
    uploadHeader?: any;
    avatarUrl?: string;
    uploadAvatar?: Function;
    coverUploadUrl?: string;
    onCoverUploaded?: Function;
  };
}

const ProfileSettings: React.FC<IProfileSettingsProps> = ({
  user,
  userType,
  updating,
  onFinish,
  options,

}) => {
  const [form] = Form.useForm();
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [color, setColor] = useState(user.themeColor || '');
  const [inputColorValue, setInputColorValue] = useState(user.themeColor || '');
  const [backgroundColor, setBackgroundColor] = useState(user.backgroundColor || '');
  const [inputBackgroundColorValue, setInputBackgroundColorValue] = useState(user.backgroundColor || '');

  const handleToggleChange = (isEnabled: boolean) => {
    form.setFieldsValue({ unsubscribed: !isEnabled });
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setInputColorValue(newColor);
    form.setFieldsValue({ themeColor: newColor });
    setIsFormChanged(true);
  };

  // Handle manual input changes to theme color
  const handleInputColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputColorValue(value);

    // Validate and update if it's a valid hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      setColor(value);
      form.setFieldsValue({ themeColor: value });
      setIsFormChanged(true);
    }
  };

  // Add background color picker
  const handleBackgroundColorChange = (newColor: string) => {
    setBackgroundColor(newColor);
    setInputBackgroundColorValue(newColor);
    form.setFieldsValue({ backgroundColor: newColor });
    setIsFormChanged(true);
  };

  // Handle manual input changes to background color
  const handleInputBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputBackgroundColorValue(value);

    // Validate and update if it's a valid hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      setBackgroundColor(value);
      form.setFieldsValue({ backgroundColor: value });
      setIsFormChanged(true);
    }
  };

  return (
    <div className="account-form-settings">
      <h1 className="profile-page-heading">Edit profile</h1>
      <span className="profile-page-subtitle opacity-75">
      Update your personal information and preferences
      </span>

      <Form
        {...FORM_LAYOUT}
        form={form}
        name="profile-settings-form"
        onFinish={onFinish}
        initialValues={user}
        onValuesChange={() => {
          const hasChanges = form.isFieldsTouched([
            'avatar',
            'cover',
            'username',
            'name',
            'firstName',
            'lastName',
            'gender',
            'bio',
            'genreOne',
            'genreTwo',
            'themeColor',
            'backgroundColor'
          ]);
          setIsFormChanged(hasChanges);
        }}
        scrollToFirstError
      >
        <div className="flex flex-col">
          <div className="avatar-upload">
            <p className="account-form-item">Avatar</p>
            <AvatarUpload
              image={user.avatar}
              uploadUrl={options?.avatarUrl}
              headers={options?.uploadHeader}
              onUploaded={options?.uploadAvatar}
            />
          </div>

          {userType === 'artist' && (
            <div className="form-row">
              <p className="account-form-item">Cover photo</p>
              <div className="cover-wrapper">
                <div className="cover-upload">
                  <CoverUpload
                    headers={options?.uploadHeader}
                    uploadUrl={options?.coverUploadUrl}
                    onUploaded={options?.onCoverUploaded}
                    image={user.cover}
                    isForMobile={false}
                    options={{ fieldName: 'cover' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-row">
            <p className="account-form-item">Username</p>
            <Form.Item
              name="username"
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please input your username!' },
                {
                  pattern: /^[a-z0-9]+$/g,
                  message: 'Username must contain lowercase alphanumerics only'
                },
                { min: 3, message: 'Username must contain at least 3 characters' }
              ]}
              hasFeedback
            >
              <TraxInputField
                type="text"
                name="username"
                label="Username"
                placeholder="mirana, invoker123, etc..."
                required
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <p className="account-form-item">Display name</p>
            <Form.Item
              name="name"
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please input your display name!' },
                {
                  pattern: /^(?=.*\S).+$/g,
                  message: 'Display name cannot contain only whitespace'
                },
                { min: 3, message: 'Display name must contain at least 3 characters' }
              ]}
              hasFeedback
            >
              <TraxInputField
                type="text"
                name="name"
                label="Display name"
                placeholder="Display Name"
                required
              />
            </Form.Item>
          </div>

          {userType === 'fan' ? (
            <>
              <div className="form-row">
                <p className="account-form-item">First name</p>
                <Form.Item
                  name="firstName"
                  hasFeedback
                  validateTrigger={['onChange', 'onBlur']}
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
                    placeholder="First Name"
                    required
                  />
                </Form.Item>
              </div>

              <div className="form-row">
                <p className="account-form-item">Last name</p>
                <Form.Item
                  name="lastName"
                  hasFeedback
                  validateTrigger={['onChange', 'onBlur']}
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
                    placeholder="Last Name"
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
                    placeholder="Select gender"
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'transgender', label: 'Other' }
                    ]}
                  />
                </Form.Item>
              </div>
            </>
          ) : (
            <>
              <div className="form-row">
                <p className="account-form-item">About you</p>
                <Form.Item
                  name="bio"
                  rules={[{ required: true, message: 'Bio is required' }]}
                >
                  <TraxInputField
                    type="textarea"
                    name="bio"
                    label="About you"
                    placeholder="Tell people something about you..."
                    required
                    rows={4}
                  />
                </Form.Item>
              </div>

              <div className="form-row">
                <p className="account-form-item">Primary genre</p>
                <Form.Item name="genreOne">
                  <TraxInputField
                    type="select"
                    name="genreOne"
                    label="Primary genre"
                    placeholder="Select primary genre"
                    options={PICK_GENRES.map(g => ({ value: g.value, label: g.text }))}
                  />
                </Form.Item>
              </div>

              <div className="form-row">
                <p className="account-form-item">Secondary genre</p>
                <Form.Item name="genreTwo">
                  <TraxInputField
                    type="select"
                    name="genreTwo"
                    label="Secondary genre"
                    placeholder="Select secondary genre"
                    options={PICK_GENRES.map(g => ({ value: g.value, label: g.text }))}
                  />
                </Form.Item>
              </div>

              <div className="form-row">
                <p className="account-form-item">Theme color</p>
                <Form.Item name="backgroundColor">
                  <div className="color-picker-container">
                    <HexColorPicker color={backgroundColor} onChange={handleBackgroundColorChange} />
                    <Input
                      value={inputBackgroundColorValue}
                      onChange={handleInputBackgroundColorChange}
                      placeholder="Enter hex color (e.g., #ff5733)"
                      maxLength={7}
                      style={{
                        marginTop: '10px',
                        padding: '10px',
                        borderRadius: '4px',
                        color: '#ffffff'
                      }}
                    />
                    <div className="color-preview" style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: backgroundColor,
                      color: '#ffffff',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      {backgroundColor}
                    </div>
                  </div>
                </Form.Item>
              </div>

              <div className="form-row">
                <p className="account-form-item">Accent color</p>
                <Form.Item name="themeColor">
                  <div className="color-picker-container">
                    <HexColorPicker color={color} onChange={handleColorChange} />
                    <Input
                      value={inputColorValue}
                      onChange={handleInputColorChange}
                      placeholder="Enter hex color (e.g., #ff5733)"
                      maxLength={7}
                      style={{
                        marginTop: '10px',
                        padding: '10px',
                        borderRadius: '4px',
                        color: '#ffffff'
                      }}
                    />
                    <div className="color-preview" style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: color,
                      color: '#ffffff',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      {color}
                    </div>
                  </div>
                </Form.Item>
              </div>

              
            </>
          )}

          <TraxButton
            htmlType="submit"
            styleType="primary"
            buttonSize="full"
            buttonText="Save changes"
            loading={updating}
            disabled={updating || !isFormChanged}
          />
        </div>
      </Form>
    </div>
  );
};

export default ProfileSettings;