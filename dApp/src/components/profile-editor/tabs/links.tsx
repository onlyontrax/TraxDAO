import React, { useState } from 'react';
import { ArtistProfile, LinkItem, SocialLink } from '../types/types';

interface LinksTabProps {
  profile: ArtistProfile;
  updateProfile: (updates: Partial<ArtistProfile>) => void;
}

const LinksTab: React.FC<LinksTabProps> = ({ profile, updateProfile }) => {
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');

  const handleAddSocialLink = () => {
    if (!selectedPlatform || !newLinkUrl) return;
    
    const newLink: SocialLink = {
      platform: selectedPlatform,
      url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
      title: newLinkTitle || platformToDefaultTitle(selectedPlatform),
    };
    
    updateProfile({
      socialLinks: [...profile.socialLinks, newLink]
    });
    
    // Reset form
    setNewLinkTitle('');
    setNewLinkUrl('');
    setSelectedPlatform('');
  };

  const handleAddCustomLink = () => {
    if (!newLinkTitle || !newLinkUrl) return;
    
    const newItem: LinkItem = {
      id: `link-${Date.now()}`,
      title: newLinkTitle,
      url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
      type: 'custom'
    };
    
    updateProfile({
      linkItems: [...profile.linkItems, newItem]
    });
    
    // Reset form
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveSocialLink = (index: number) => {
    updateProfile({
      socialLinks: profile.socialLinks.filter((_, i) => i !== index)
    });
  };

  const handleRemoveCustomLink = (id: string) => {
    updateProfile({
      linkItems: profile.linkItems.filter(item => item.id !== id)
    });
  };

  const platformToDefaultTitle = (platform: string): string => {
    // Capitalize first letter
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const getPlatformIcon = (platform: string): string => {
    switch (platform.toLowerCase()) {
      case 'instagram': return '📷';
      case 'facebook': return '👤';
      case 'twitter': return '🐦';
      case 'spotify': return '🎵';
      case 'youtube': return '📹';
      case 'soundcloud': return '☁️';
      case 'bandcamp': return '🎵';
      case 'discord': return '💬';
      default: return '🔗';
    }
  };

  return (
    <div className="links-tab">
      <div className="section">
        <h3>Social Links</h3>
        
        {profile.socialLinks.map((link, index) => (
          <div key={index} className="social-link-item">
            <div className="link-platform">
              <span className="link-icon">{getPlatformIcon(link.platform)}</span>
              <span className="link-name">{link.title || platformToDefaultTitle(link.platform)}</span>
            </div>
            <div className="link-url">{link.url}</div>
            <button 
              className="remove-button" 
              onClick={() => handleRemoveSocialLink(index)}
            >
              Remove
            </button>
          </div>
        ))}
        
        <div className="add-link-form">
          <div className="form-row">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="platform-select"
            >
              <option value="">Select Platform</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="spotify">Spotify</option>
              <option value="youtube">YouTube</option>
              <option value="soundcloud">SoundCloud</option>
              <option value="bandcamp">Bandcamp</option>
              <option value="discord">Discord</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-row">
            <input
              type="text"
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              placeholder="Title (optional)"
              className="link-title-input"
            />
          </div>
          
          <div className="form-row">
            <input
              type="text"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="Type or paste your link here..."
              className="link-url-input"
            />
          </div>
          
          <button onClick={handleAddSocialLink} className="add-button">
            Add
          </button>
        </div>
      </div>
      
      <div className="section">
        <h3>Custom Links</h3>
        
        {profile.linkItems.filter(link => link.type === 'custom').map(item => (
          <div key={item.id} className="custom-link-item">
            <div className="link-title">{item.title}</div>
            <div className="link-url">{item.url}</div>
            <button 
              className="remove-button" 
              onClick={() => handleRemoveCustomLink(item.id)}
            >
              Remove
            </button>
          </div>
        ))}
        
        <div className="add-link-form">
          <div className="form-row">
            <input
              type="text"
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              placeholder="Title"
              className="link-title-input"
            />
          </div>
          
          <div className="form-row">
            <input
              type="text"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="URL"
              className="link-url-input"
            />
          </div>
          
          <button onClick={handleAddCustomLink} className="add-button">
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinksTab;