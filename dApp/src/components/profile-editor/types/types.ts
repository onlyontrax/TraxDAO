
export interface SocialLink {
    platform: string;
    title?: string;
    url: string;
  }
  
  export interface MusicItem {
    id: string;
    title: string;
    type: 'album' | 'single' | 'ep';
    releaseYear?: string;
    imageUrl?: string;
    spotifyUrl?: string;
    appleUrl?: string;
    visible: boolean;
  }
  
  export interface LinkItem {
    id: string;
    title: string;
    url: string;
    type: 'social' | 'merch' | 'event' | 'custom';
    icon?: string;
  }
  
  export interface ThemeOption {
    id: string;
    name: string;
    previewImageUrl: string;
    layout: 'default' | 'pop' | 'acoustic' | 'psychedelic' | 'custom';
  }
  
  export interface ArtistProfile {
    id: string;
    name: string;
    bio?: string;
    avatarUrl: string;
    coverUrl?: string;
    selectedTheme: string;
    socialLinks: SocialLink[];
    musicItems: MusicItem[];
    linkItems: LinkItem[];
    customColors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
    };
  }
  