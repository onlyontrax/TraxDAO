import React, { useState } from 'react';
import ProfileEditor from '@components/profile-editor/profile-editor';
import { ArtistProfile } from '@components/profile-editor';
// import './App.css';

const ProfileEditorPage: React.FC = () => {
  const [savedProfiles, setSavedProfiles] = useState<ArtistProfile[]>([]);
  
  const handleSaveProfile = (profile: ArtistProfile) => {
    // In a real app, this would save to a database
    // Here we just update our local state
    setSavedProfiles(prev => {
      const profileIndex = prev.findIndex(p => p.id === profile.id);
      
      if (profileIndex >= 0) {
        // Update existing profile
        const updatedProfiles = [...prev];
        updatedProfiles[profileIndex] = profile;
        return updatedProfiles;
      } else {
        // Add new profile
        return [...prev, profile];
      }
    });
    
    alert('Profile saved successfully!');
  };
  
  return (
    <div className="app">
      <ProfileEditor onSave={handleSaveProfile} />
    </div>
  );
};

export default ProfileEditorPage;
