import { APIRequest } from './api-request';

class FollowService extends APIRequest {
  create(id: string) {
    return this.post(`/follows/${id}`);
  }

  delete(id: string) {
    return this.del(`/follows/${id}`);
  }

  getFollowers(req) {
    return this.get(this.buildUrl('/follows/followers', req));
  }

  getFollowing(req) {
    return this.get(this.buildUrl('/follows/following', req));
  }
}

export const followService = new FollowService();
