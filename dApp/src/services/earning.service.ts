import { APIRequest } from './api-request';

export class EarningService extends APIRequest {
  performerStarts(param?: any) {
    return this.get(this.buildUrl('/earning/performer/stats', param));
  }

  performerSearch(param?: any) {
    return this.get(this.buildUrl('/earning/performer/search', param));
  }

  userSearch(param?: any) {
    return this.get(this.buildUrl('/earning/user/search', param));
  }

  performerReferralSearch(param?: any) {
    return this.get(this.buildUrl('/earning/performerReferral/search', param));
  }
}

export const earningService = new EarningService();
