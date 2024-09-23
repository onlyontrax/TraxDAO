import { IFeaturedArtistsSearch } from 'src/interfaces';
import { APIRequest } from './api-request';

export class FeaturedArtistsService extends APIRequest {
  search(query: IFeaturedArtistsSearch) {
    return this.get(this.buildUrl('/featured-artists/search', query as any));
  }
}

export const featuredArtistsService = new FeaturedArtistsService();
