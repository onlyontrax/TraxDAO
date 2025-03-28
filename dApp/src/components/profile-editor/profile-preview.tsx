import React from 'react';
import { ArtistProfile } from './types/types';
import { themeOptions } from './templates/templates';

interface ProfilePreviewProps {
  profile: ArtistProfile;
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ profile }) => {
  const selectedTheme = themeOptions.find(theme => theme.id === profile.selectedTheme) || themeOptions[0];
  
  // Helper to get icon for social platform
  const getSocialIcon = (platform: string) => {
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

  const renderDefaultTheme = () => (
    <div className="profile-preview default">
      <div className="profile-header">
        <h1 className="artist-name">{profile.name}</h1>
      </div>
      
      {profile.musicItems.filter(item => item.visible).map(music => (
        <div key={music.id} className="music-card">
          <img 
            src={music.imageUrl || '/placeholder-album.jpg'} 
            alt={music.title} 
            className="music-image" 
          />
          <div className="music-details">
            <h3 className="music-title">{music.title}</h3>
            <p className="music-meta">{music.type} • {music.releaseYear}</p>
          </div>
        </div>
      ))}
      
      {profile.socialLinks.length > 0 && (
        <div className="social-links">
          {profile.socialLinks.map((link, index) => (
            <a 
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <span className="icon">{getSocialIcon(link.platform)}</span>
              <span>{link.platform}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const renderPopTheme = () => (
    <div className="profile-preview pop">
      <div className="avatar-container">
        <img 
          src={profile.avatarUrl} 
          alt={profile.name} 
          className="circular-avatar"
        />
      </div>
      
      <h1 className="artist-name">{profile.name}</h1>
      
      {profile.bio && (
        <p className="artist-bio">{profile.bio}</p>
      )}
      
      {profile.musicItems.filter(item => item.visible).map(music => (
        <div key={music.id} className="music-card">
          <img 
            src={music.imageUrl || '/placeholder-album.jpg'} 
            alt={music.title} 
            className="music-image" 
          />
          <div className="music-details">
            <h3 className="music-title">{music.title}</h3>
            <p className="music-meta">{music.type} • {music.releaseYear}</p>
          </div>
        </div>
      ))}
      
      {profile.socialLinks.length > 0 && (
        <div className="social-links-grid">
          {profile.socialLinks.map((link, index) => (
            <a 
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-button"
            >
              <span className="icon">{getSocialIcon(link.platform)}</span>
              <span className="platform-name">{link.title || link.platform}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const renderAcousticTheme = () => (
    <div className="profile-preview acoustic">
      <div className="profile-header-split">
        <div className="left-section">
          <img src={profile.avatarUrl} alt={profile.name} className="square-avatar" />
        </div>
        <div className="right-section">
          <h1 className="artist-name">{profile.name}</h1>
          {profile.bio && <p className="artist-bio">{profile.bio}</p>}
        </div>
      </div>
      
      {profile.musicItems.filter(item => item.visible).map(music => (
        <div key={music.id} className="music-item-row">
          <img 
            src={music.imageUrl || '/placeholder-album.jpg'} 
            alt={music.title} 
            className="music-thumbnail" 
          />
          <div className="music-info">
            <h3 className="music-title">{music.title}</h3>
            <p className="music-meta">{music.type} • {music.releaseYear}</p>
          </div>
        </div>
      ))}
      
      {profile.socialLinks.length > 0 && (
        <div className="social-icons-row">
          {profile.socialLinks.map((link, index) => (
            <a 
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-button"
            >
              {getSocialIcon(link.platform)}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const renderPsychedelicTheme = () => (
    <div className="profile-preview psychedelic">
      <div className="psychedelic-header">
        <h1 className="large-artist-name">{profile.name}</h1>
      </div>
      
      {profile.musicItems.filter(item => item.visible).map(music => (
        <div key={music.id} className="music-card-horizontal">
          <img 
            src={music.imageUrl || '/placeholder-album.jpg'} 
            alt={music.title} 
            className="music-cover" 
          />
          <div className="music-text">
            <h3 className="music-title">{music.title}</h3>
            <p className="music-type">{music.type} • {music.releaseYear}</p>
          </div>
        </div>
      ))}
      
      {profile.socialLinks.length > 0 && (
        <div className="social-links-bar">
          {profile.socialLinks.map((link, index) => (
            <a 
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link-icon"
            >
              {getSocialIcon(link.platform)}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  // Render different layout based on selected theme
  switch (selectedTheme.layout) {
    case 'pop':
      return renderPopTheme();
    case 'acoustic':
      return renderAcousticTheme();
    case 'psychedelic':
      return renderPsychedelicTheme();
    case 'default':
    default:
      return renderDefaultTheme();
  }
};

export default ProfilePreview;