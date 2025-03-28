import React, { useState } from 'react';

interface MediaUploaderProps {
  currentImage: string;
  onUpload: (imageUrl: string) => void;
  aspectRatio?: string;
  size?: 'small' | 'medium' | 'large';
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  currentImage,
  onUpload,
  aspectRatio = '1:1',
  size = 'medium'
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage);
  
  // In a real app, this would handle file uploads to a server
  // Here we'll just create a data URL for demonstration
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const result = event.target.result as string;
          setPreviewUrl(result);
          onUpload(result);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // For demo purposes, let's add a way to use placeholder images
  const usePlaceholder = () => {
    const placeholders = [
      '/api/placeholder/400/400',
      '/api/placeholder/400/300',
      '/api/placeholder/400/600'
    ];
    const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
    setPreviewUrl(randomPlaceholder);
    onUpload(randomPlaceholder);
  };
  
  return (
    <div className={`media-uploader size-${size}`}>
      {previewUrl && (
        <div 
          className="preview-container"
          style={{aspectRatio: aspectRatio.replace(':', '/')}}
        >
          <img 
            src={previewUrl} 
            alt="Preview" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%',
              objectFit: 'cover'
            }} 
          />
        </div>
      )}
      
      <div className="upload-controls">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          id={`file-upload-${Math.random().toString(36).substring(7)}`}
          style={{ display: 'none' }}
        />
        <label 
          htmlFor={`file-upload-${Math.random().toString(36).substring(7)}`} 
          className="file-upload-label"
        >
          Choose File
        </label>
        <button type="button" onClick={usePlaceholder} className="placeholder-button">
          Use Placeholder
        </button>
      </div>
    </div>
  );
};

export default MediaUploader;