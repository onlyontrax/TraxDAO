import React from 'react';
import { ArtistProfile } from '../types/types';
import MediaUploader from '../media-uploader';

interface GeneralTabProps {
  profile: ArtistProfile;
  updateProfile: (updates: Partial<ArtistProfile>) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ profile, updateProfile }) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateProfile({ [name]: value });
  };

  const handleAvatarUpload = (imageUrl: string) => {
    updateProfile({ avatarUrl: imageUrl });
  };

  const handleCoverUpload = (imageUrl: string) => {
    updateProfile({ coverUrl: imageUrl });
  };

  return (
    <div className="general-tab">
      <div className="section">
        <h3>Avatar</h3>
        <MediaUploader
          currentImage={profile.avatarUrl}
          onUpload={handleAvatarUpload}
          aspectRatio="1:1"
        />
      </div>

      <div className="section">
        <h3>Cover</h3>
        <MediaUploader
          currentImage={profile.coverUrl || ''}
          onUpload={handleCoverUpload}
          aspectRatio="3:1"
        />
        {!profile.coverUrl && (
          <p className="help-text">Didn't find a cover on your Spotify profile!</p>
        )}
      </div>

      <div className="section">
        <h3>Name</h3>
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleTextChange}
          placeholder="Your artist name"
        />
      </div>

      <div className="section">
        <h3>Bio</h3>
        <textarea
          name="bio"
          value={profile.bio || ''}
          onChange={handleTextChange}
          placeholder="A bit about yourself!"
          maxLength={280}
        />
        <div className="character-count">
          {profile.bio ? profile.bio.length : 0}/280
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;