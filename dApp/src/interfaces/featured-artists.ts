import { ISearch } from './utils';

export interface IFeaturedArtists {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  position?: string;
  photo?: { url: string; thumbnails: string[] };
}

export interface IFeaturedArtistsSearch extends ISearch {
  position?: string;
  status?: string;
}
