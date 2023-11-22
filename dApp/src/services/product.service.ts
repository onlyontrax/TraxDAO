import { APIRequest } from './api-request';

export class ProductService extends APIRequest {
  createProduct(
    files: [{ fieldname: string; file: File }],
    payload: any,
    onProgress?: Function
  ) {
    return this.upload('/performer/performer-assets/products', files, {
      onProgress,
      customData: payload
    });
  }

  update(
    id: string,
    files: [{ fieldname: string; file: File }],
    payload: any,
    onProgress?: Function
  ) {
    return this.upload(`/performer/performer-assets/products/${id}`, files, {
      onProgress,
      customData: payload,
      method: 'PUT'
    });
  }

  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/performer/performer-assets/products/search', query)
    );
  }

  userSearch(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/user/performer-assets/products/search', query)
    );
  }

  userView(productId: string, headers?: any) {
    return this.get(`/user/performer-assets/products/${productId}`, headers);
  }

  findById(id: string) {
    return this.get(`/performer/performer-assets/products/${id}/view`);
  }

  delete(id: string) {
    return this.del(`/performer/performer-assets/products/${id}`);
  }

  getBookmarked(payload) {
    return this.get(this.buildUrl('/reactions/products/bookmark', payload));
  }

  getPurchased(payload) {
    return this.get(this.buildUrl('/users/products/purchased', payload));
  }
}

export const productService = new ProductService();
