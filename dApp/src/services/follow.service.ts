import { APIRequest } from "./api-request";

class FollowService extends APIRequest {
  create(id: string) {
    return this.post(`/follows/${id}`);
  }

  delete(id: string) {
    return this.del(`/follows/${id}`);
  }

  getFollowers(req) {
    return this.get(this.buildUrl("/follows/followers", req));
  }

  getFollowing(req) {
    return this.get(this.buildUrl("/follows/following", req));
  }

  getFollowersByPerformerId(id: string) {
    return this.get(`/follows/followers/${id}`);
  }

  getPerformerFollowers(req) {
    return this.get(this.buildUrl("/follows/performers/followers", req));
  }

  exportFollowerEmailsCSV(req) {
    return this.get(this.buildUrl("/follows/performers/followers/export-csv", req), { responseType: 'blob' }, 'blob');
  }
}

export const followService = new FollowService();
