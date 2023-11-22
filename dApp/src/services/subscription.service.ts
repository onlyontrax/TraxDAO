import { APIRequest } from './api-request';

class SubscriptionService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/subscriptions/performer/search', query));
  }

  userSearch(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/subscriptions/user/search', query));
  }

  cancelSubscription(id: string, gateway: string) {
    return this.post(`/payment/${gateway}/cancel-subscription/${id}`);
  }
}
export const subscriptionService = new SubscriptionService();
