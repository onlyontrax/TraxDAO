import { APIRequest } from './api-request';

export class EarningService extends APIRequest {
  accountStats(param?: any) {
    return this.get(this.buildUrl('/earning/account/stats', param));
  }

  accountSearch(param?: any) {
    return this.get(this.buildUrl('/earning/account/search', param));
  }

  userSearch(param?: any) {
    return this.get(this.buildUrl('/earning/account/search', param));
  }

  performerReferralSearch(param?: any) {
    return this.get(this.buildUrl('/earning/performerReferral/search', param));
  }
}

export const earningService = new EarningService();
