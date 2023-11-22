import { ISearch } from './utils';

export interface IBanner {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  position?: string;
  photo?: { url: string; thumbnails: string[] };
}

export interface IBannerSearch extends ISearch {
  position?: string;
  status?: string;
}
