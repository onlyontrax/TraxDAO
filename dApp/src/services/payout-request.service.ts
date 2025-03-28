import { APIRequest } from './api-request';

class PayoutRequestService extends APIRequest {
  calculate() {
    return this.post('/payout-requests/account/calculate');
  }

  search(query: { [key: string]: any }) {
    return this.get(this.buildUrl('/payout-requests/account/search', query));
  }

  create(body: any) {
    return this.post('/payout-requests/account', body);
  }

  update(id: string, body: any) {
    return this.put(`/payout-requests/account/${id}`, body);
  }

  detail(
    id: string,
    headers: {
      [key: string]: string;
    }
  ): Promise<any> {
    return this.get(`/payout-requests/account/${id}/view`, headers);
  }
}

export const payoutRequestService = new PayoutRequestService();
