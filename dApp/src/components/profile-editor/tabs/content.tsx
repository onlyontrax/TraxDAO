import React, { useState } from 'react';
import { ArtistProfile, MusicItem } from '../types/types';
import MediaUploader from '../media-uploader';

interface MusicTabProps {
  profile: ArtistProfile;
  updateProfile: (updates: Partial<ArtistProfile>) => void;
}

const MusicTab: React.FC<MusicTabProps> = ({ profile, updateProfile }) => {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<MusicItem['type']>('single');
  const [newItemYear, setNewItemYear] = useState('');

  const handleAddMusicItem = () => {
    if (!newItemTitle) return;
    
    const newItem: MusicItem = {
      id: `music-${Date.now()}`,
      title: newItemTitle,
      type: newItemType,
      releaseYear: newItemYear,
      imageUrl: '/placeholder-album.jpg',
      visible: true
    };
    
    updateProfile({
      musicItems: [...profile.musicItems, newItem]
    });
    
    // Reset form
    setNewItemTitle('');
    setNewItemYear('');
  };

  const handleToggleVisibility = (id: string) => {
    updateProfile({
      musicItems: profile.musicItems.map(item => 
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    });
  };

  const handleRemoveMusicItem = (id: string) => {
    updateProfile({
      musicItems: profile.musicItems.filter(item => item.id !== id)
    });
  };

  const handleUpdateMusicImage = (id: string, imageUrl: string) => {
    updateProfile({
      musicItems: profile.musicItems.map(item => 
        item.id === id ? { ...item, imageUrl } : item
      )
    });
  };

  return (
    <div className="music-tab">
      {profile.musicItems.map(item => (
        <div key={item.id} className="music-item">
          <div className="music-item-image">
            <MediaUploader
              currentImage={item.imageUrl || ''}
              onUpload={(url) => handleUpdateMusicImage(item.id, url)}
              aspectRatio="1:1"
              size="small"
            />
          </div>
          <div className="music-item-details">
            <div className="music-item-title">{item.title}</div>
            <div className="music-item-meta">{item.type} • {item.releaseYear}</div>
          </div>
          <div className="music-item-actions">
            <button 
              className={`visibility-toggle ${item.visible ? 'visible' : 'hidden'}`}
              onClick={() => handleToggleVisibility(item.id)}
              title={item.visible ? 'Hide' : 'Show'}
            >
              {item.visible ? '👁️' : '👁️‍🗨️'}
            </button>
            <button 
              className="remove-button"
              onClick={() => handleRemoveMusicItem(item.id)}
              title="Remove"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}

      <div className="add-music-item">
        <h3>Add Music</h3>
        <div className="add-music-form">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="Title"
            className="music-title-input"
          />
          <select
            value={newItemType}
            onChange={(e) => setNewItemType(e.target.value as MusicItem['type'])}
            className="music-type-select"
          >
            <option value="single">Single</option>
            <option value="ep">EP</option>
            <option value="album">Album</option>
          </select>
          <input
            type="text"
            value={newItemYear}
            onChange={(e) => setNewItemYear(e.target.value)}
            placeholder="Year"
            className="music-year-input"
          />
          <button onClick={handleAddMusicItem} className="add-button">
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicTab;