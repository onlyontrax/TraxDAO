import React, { useState } from 'react';
import { ArtistProfile } from './types/types';
import GeneralTab from './tabs/general';
import ThemeTab from './tabs/themes';
import MusicTab from './tabs/content';
import LinksTab from './tabs/links';
import ProfilePreview from './profile-preview';
import { ScreenShare, TabletSmartphone } from 'lucide-react';
// import '@styles/_profile-editor.scss';

interface ProfileEditorProps {
  initialProfile?: ArtistProfile;
  onSave: (profile: ArtistProfile) => void;
}

const defaultProfile: ArtistProfile = {
  id: 'new-profile',
  name: 'Artist Name',
  bio: '',
  avatarUrl: '/placeholder.jpg',
  selectedTheme: 'default',
  socialLinks: [],
  musicItems: [],
  linkItems: []
};

const ProfileEditor: React.FC<ProfileEditorProps> = ({ 
  initialProfile = defaultProfile, 
  onSave 
}) => {
  const [profile, setProfile] = useState<ArtistProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'music' | 'links'>('general');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const updateProfile = (updates: Partial<ArtistProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  const handleSave = () => {
    onSave(profile);
  };

  return (
    <div className="profile-editor">
      <header className="editor-header">
        <div className="editor-logo">Profile Editor</div>
        <div className="editor-controls">
          <div className="preview-toggle">
            <button
              className={previewMode === 'desktop' ? 'active' : ''}
              onClick={() => setPreviewMode('desktop')}
              title="Desktop Preview"
            >
              <ScreenShare />
            </button>
            <button
              className={previewMode === 'mobile' ? 'active' : ''}
              onClick={() => setPreviewMode('mobile')}
              title="Mobile Preview"
            >
              <TabletSmartphone />
            </button>
          </div>
          <button 
            className="save-button" 
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </header>

      <div className="editor-content">
        <div className="editor-sidebar">
          <div className="editor-tabs">
            <button 
              className={activeTab === 'general' ? 'active' : ''} 
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button 
              className={activeTab === 'theme' ? 'active' : ''} 
              onClick={() => setActiveTab('theme')}
            >
              Theme
            </button>
            <button 
              className={activeTab === 'music' ? 'active' : ''} 
              onClick={() => setActiveTab('music')}
            >
              Music
            </button>
            <button 
              className={activeTab === 'links' ? 'active' : ''} 
              onClick={() => setActiveTab('links')}
            >
              Links
            </button>
          </div>

          <div className="editor-panel">
            {activeTab === 'general' && (
              <GeneralTab 
                profile={profile} 
                updateProfile={updateProfile} 
              />
            )}
            
            {activeTab === 'theme' && (
              <ThemeTab 
                profile={profile} 
                updateProfile={updateProfile} 
              />
            )}
            
            {activeTab === 'music' && (
              <MusicTab 
                profile={profile} 
                updateProfile={updateProfile} 
              />
            )}
            
            {activeTab === 'links' && (
              <LinksTab 
                profile={profile} 
                updateProfile={updateProfile} 
              />
            )}
          </div>
        </div>
        
        <div className={`editor-preview ${previewMode}`}>
          <div className="preview-url">
            <span>trax.so/{profile.name.toLowerCase().replace(/\s+/g, '')}</span>
            <span className="stats">0</span>
          </div>
          <div className="preview-wrapper">
            <ProfilePreview profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;