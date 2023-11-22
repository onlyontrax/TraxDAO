import { APIRequest } from './api-request';

export class OrderService extends APIRequest {
  performerSearch(payload) {
    return this.get(this.buildUrl('/orders/search', payload));
  }

  userSearch(payload) {
    return this.get(this.buildUrl('/orders/users/search', payload));
  }

  findById(id) {
    return this.get(`/orders/${id}`);
  }

  update(id, data) {
    return this.put(`/orders/${id}/update`, data);
  }

  updateDeliveryAddress(id, data) {
    return this.put(`/orders/${id}/update/delivery-address`, data);
  }

  getDownloadLinkDigital(productId: string) {
    return this.get(`/user/performer-assets/products/${productId}/download-link`);
  }
}

export const orderService = new OrderService();
