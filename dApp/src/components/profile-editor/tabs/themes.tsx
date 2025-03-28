import React from 'react';
import { ArtistProfile } from '../types/types';
import { themeOptions } from '../templates/templates';
import ThemePreview from '../theme-preview';

interface ThemeTabProps {
  profile: ArtistProfile;
  updateProfile: (updates: Partial<ArtistProfile>) => void;
}

const ThemeTab: React.FC<ThemeTabProps> = ({ profile, updateProfile }) => {
  const handleThemeSelect = (themeId: string) => {
    updateProfile({ selectedTheme: themeId });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateProfile({
      customColors: {
        ...profile.customColors,
        [name]: value
      }
    });
  };

  return (
    <div className="theme-tab">
      <div className="theme-options">
        {themeOptions.map(theme => (
          <div 
            key={theme.id} 
            className={`theme-option ${profile.selectedTheme === theme.id ? 'selected' : ''}`}
            onClick={() => handleThemeSelect(theme.id)}
          >
            <ThemePreview theme={theme} profile={profile} />
            <div className="theme-name">{theme.name}</div>
          </div>
        ))}
      </div>

      {profile.selectedTheme === 'acoustic' && (
        <div className="color-selector">
          <div className="color-options">
            <button className="color-circle black"></button>
            <button className="color-circle red"></button>
            <button className="color-circle orange"></button>
            <button className="color-circle green"></button>
            <button className="color-circle teal"></button>
            <button className="color-circle blue"></button>
            <button className="color-circle purple"></button>
            <button className="color-circle magenta"></button>
            <button className="color-circle pink"></button>
            <button className="color-circle custom">+</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeTab;