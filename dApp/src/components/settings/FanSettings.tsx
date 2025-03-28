import React, { useState } from 'react';
import { Tabs } from 'antd';
import { useRouter } from 'next/router';
import useDeviceSize from '@components/common/useDeviceSize';
import AuthenticationSettings from './shared/AuthenticationSettings';
import CryptoSettings from './shared/CryptoSettings';
import BillingSettings from './fan/BillingSettings';
import ProfileSettings from './shared/ProfileSettings';
import PasswordSettings from './shared/PasswordSettings';
import ReferralSettings from './shared/ReferralSettings';
import { IUser, ISettings } from 'src/interfaces';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface FanSettingsProps {
  user: IUser;
  settings: ISettings;
  updating?: boolean;
  onFinish: (values: any) => void;
  options?: {
    avatarUrl?: string;
    uploadAvatar?: Function;
    uploadHeader?: {
      authorization: string;
    };
  };
}

const FanSettings: React.FC<FanSettingsProps> = ({
  user,
  settings,
  updating,
  onFinish,
  options
}) => {
  const { isMobile, isTablet } = useDeviceSize();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fanSettingsActiveTab') || 'profile';
    }
    return 'profile';
  });

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    localStorage.setItem('fanSettingsActiveTab', key);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab: key },
    }, undefined, { shallow: true });
  };

  const handleBack = () => {
    setActiveTab('');
    localStorage.removeItem('fanSettingsActiveTab');
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab: undefined },
    }, undefined, { shallow: true });
  };

  const settingsOptions = [
    {
      key: 'profile',
      label: 'Profile',
      component: () => {
        return (
          <ProfileSettings
            user={user}
            userType="fan"
            onFinish={onFinish}
            updating={updating}
            options={options}
          />
        );
      }
    },
    {
      key: 'billing',
      label: 'Billing',
      component: () => (
        <BillingSettings
          user={user}
          onFinish={onFinish}
          settings={settings}
        />
      )
    }
  ];

  if (isMobile) {
    if (activeTab && activeTab !== 'basic') {
      const currentSetting = settingsOptions.find(opt => opt.key === activeTab);
      if (!currentSetting) return null;

      return (
        <div className="settings-page-container">
          <div className="absolute">
            <button
              onClick={handleBack}
              className="back-button"
            >
              <ArrowLeft className="back-icon" />

            </button>
          </div>
          <currentSetting.component />
        </div>
      );
    }

    return (
      <div className="settings-page-container">
        <h1 className="profile-page-heading">Settings</h1>
        <div className='px-4 rounded-md bg-slaps-gray/50'>
          {settingsOptions.map((setting) => (
            <button
              key={setting.key}
              onClick={() => handleTabChange(setting.key)}
              className="settings-list-item"
            >
              <span className="settings-label">{setting.label}</span>
              <ChevronRight className="settings-icon" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Desktop view with tabs
  return (
    <div className="settings-page-container">
      {(!isTablet && !isMobile) && (
        <h1 className="content-heading">Settings</h1>
      )}

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        tabPosition="left"
        items={settingsOptions.map(setting => ({
          key: setting.key,
          label: (
            <div className="tab-label">
              <span className="tab-text">{setting.label}</span>
              <ChevronRight className="tab-icon" />
            </div>
          ),
          children: <setting.component />
        }))}
        className="settings-tabs"
      />
    </div>
  );
};

export default FanSettings;
