import React, { useState } from 'react';
import { Tabs } from 'antd';
import { useRouter } from 'next/router';
import useDeviceSize from '@components/common/useDeviceSize';
import AuthenticationSettings from './shared/AuthenticationSettings';
import AccountProfileSettings from './account/AccountProfileSettings';
import CryptoSettings from './shared/CryptoSettings';
import PasswordSettings from './shared/PasswordSettings';
import ReferralSettings from './shared/ReferralSettings';
import BankingSettings from './account/BankingSettings';
import PrivacySettings from './account/PrivacySettings';
import { IAccount, ISettings } from 'src/interfaces';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface AccountSettingsProps {
  account: IAccount;
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

const AccountSettings: React.FC<AccountSettingsProps> = ({
  account,
  settings,
  updating,
  onFinish,
  options
}) => {
  const { isMobile, isTablet } = useDeviceSize();
  const router = useRouter();

  // Changed initial state to 'Email' to match settingsOptions
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accountSettingsActiveTab') || 'Email';
    }
    return 'Email';
  });

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    localStorage.setItem('accountSettingsActiveTab', key);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab: key },
    }, undefined, { shallow: true });
  };

  const handleBack = () => {
    setActiveTab('') // Reset to default tab instead of empty string
    localStorage.setItem('accountSettingsActiveTab', '');
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab: 'Email' },
    }, undefined, { shallow: true });
  };

  const settingsOptions = [
    {
      key: 'Email',
      label: 'Email',
      component: () => (
        <AccountProfileSettings
          account={account}
          onFinish={onFinish}
          updating={updating}
        />
      )
    },
    {
      key: 'password',
      label: 'Password',
      component: () => (
        <PasswordSettings
          account={account}
          onFinish={onFinish}
          updating={updating}
        />
      )
    },
    ...((!Capacitor.isNativePlatform()) ? [{
      key: 'crypto',
      label: 'Crypto',
      component: () => (
        <CryptoSettings
          account={account}
          onFinish={onFinish}
          updating={updating}
        />
      )
    }] : []),
    {
      key: 'authentication',
      label: 'Authentication',
      component: () => (
        <AuthenticationSettings
          account={account}
          onFinish={onFinish}
          updating={updating}
        />
      )
    },
    {
      key: 'referrals',
      label: 'Referrals',
      component: () => (
        <ReferralSettings
          account={account}
        />
      )
    },
    {
      key: 'banking',
      label: 'Cash Out',
      component: () => (
        <BankingSettings
          account={account}
          settings={settings}
        />
      )
    },
    {
      key: 'privacy',
      label: 'Privacy',
      component: () => (
        <PrivacySettings
          account={account}
          settings={settings}
        />
      )
    }
  ];

  if (isMobile) {
    // Removed the 'basic' check since we don't have a 'basic' tab
    if (activeTab) {
      const currentSetting = settingsOptions.find(opt => opt.key === activeTab);
      if (!currentSetting) {
        // If we can't find the tab, default to first tab instead of returning null
        const defaultSetting = settingsOptions[0];
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
            <defaultSetting.component />
          </div>
        );
      }

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
        <h1 className="profile-page-heading">Account Settings</h1>
        <div className="px-4 rounded-md bg-slaps-gray/50">
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
        <h1 className="content-heading">Account Settings</h1>
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

export default AccountSettings;