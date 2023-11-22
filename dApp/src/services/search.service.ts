import { APIRequest } from './api-request';

export class SearchService extends APIRequest {
  searchByKeyword(payload) {
    return this.post('/search/keywords', payload);
  }

  listByKeyword(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/search/list/keywords', query)
    );
  }
}

export const searchService = new SearchService();
