import { APIRequest } from './api-request';

export class PaymentService extends APIRequest {
  subscribePerformer(payload: any) {
    return this.post('/payment/subscribe/performers', payload);
  }

  userSearch(payload) {
    return this.get(this.buildUrl('/transactions/user/search', payload));
  }

  addFunds(payload: any) {
    return this.post('/payment/wallet/top-up', payload);
  }

  applyCoupon(code: any) {
    return this.post(`/coupons/${code}/apply-coupon`);
  }

  connectStripeAccount() {
    return this.post('/stripe/accounts');
  }

  getStripeCards() {
    return this.get('/stripe/user/cards');
  }

  addStripeCard(payload) {
    return this.post('/stripe/user/cards', payload);
  }

  removeStripeCard(id) {
    return this.del(`/stripe/user/cards/${id}`);
  }

  retrieveStripeAccount() {
    return this.get('/stripe/accounts/me');
  }

  loginLink() {
    return this.get('/stripe/accounts/me/login-link');
  }
}

export const paymentService = new PaymentService();
