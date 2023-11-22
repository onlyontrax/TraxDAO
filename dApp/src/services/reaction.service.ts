import { APIRequest } from './api-request';

export class ReactionService extends APIRequest {
  create(payload: any) {
    return this.post('/reactions', payload);
  }

  delete(payload: any) {
    return this.del('/reactions', payload);
  }

  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/reactions/search', query)
    );
  }
}

export const reactionService = new ReactionService();
