export interface IPhotoCreate {
  description?: string;
  title?: string;
  status?: string;
  performerId?: string;
  galleryId?: string;
  files?: any;
}

export interface IPhotoResponse {
  thumbnails?: string[];
  url?: string;
}

export interface IPhotos {
  performerId?: string;
  galleryId?: string;
  fileId?: string;
  type?: string;
  title?: string;
  description?: string;
  status?: string;
  processing?: boolean;
  price?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  _id?: string;
  isGalleryCover?: boolean;
  photo?: Partial<IPhotoResponse>;
}
