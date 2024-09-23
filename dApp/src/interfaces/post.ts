import { ISearch } from './utils';

export interface IPostCreate {
  title: string;
  type: string;
  slug: string;
  content: string;
  shortDescription: string;
  categoryIds: string[];
  status: string;
}

export interface IPostUpdate {
  title: string;
  slug: string;
  content: string;
  shortDescription: string;
  categoryIds: string[];
  status: string;
}

export interface IPostSearch extends ISearch {
  status?: string;
}

export interface IPostResponse {
  title: string;
  slug: string;
  content: string;
}
