import React from 'react';
import { ThemeOption, ArtistProfile } from './types/types';

interface ThemePreviewProps {
  theme: ThemeOption;
  profile: ArtistProfile;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, profile }) => {
  const renderDefaultTheme = () => (
    <div className="theme-preview default">
      <div className="preview-header">
        <div className="preview-avatar"></div>
        <div className="preview-text-block">
          <div className="preview-title"></div>
          <div className="preview-subtitle"></div>
          <div className="preview-subtitle"></div>
          <div className="preview-subtitle"></div>
        </div>
      </div>
    </div>
  );

  const renderPopTheme = () => (
    <div className="theme-preview pop">
      <div className="preview-circle">
        <div className="preview-avatar-circle"></div>
      </div>
      <div className="preview-title-center"></div>
      <div className="preview-lines">
        <div className="preview-line"></div>
        <div className="preview-line"></div>
        <div className="preview-line"></div>
      </div>
    </div>
  );

  const renderAcousticTheme = () => (
    <div className="theme-preview acoustic">
      <div className="preview-left">
        <div className="preview-avatar-square"></div>
      </div>
      <div className="preview-right">
        <div className="preview-title"></div>
        <div className="preview-subtitle"></div>
        <div className="preview-subtitle"></div>
      </div>
    </div>
  );

  const renderPsychedelicTheme = () => (
    <div className="theme-preview psychedelic">
      <div className="preview-title-large"></div>
      <div className="preview-line"></div>
      <div className="preview-line short"></div>
    </div>
  );

  switch (theme.layout) {
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

export default ThemePreview;