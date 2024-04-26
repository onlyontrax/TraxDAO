import { APIRequest } from './api-request';

export class UserService extends APIRequest {
  me(headers?: { [key: string]: string }): Promise<any> {
    return this.get('/users/me', headers);
  }

  updateMe(payload: any) {
    return this.put('/users', payload);
  }

  getAvatarUploadUrl(userId?: string) {
    if (userId) {
      return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/users/${userId}/avatar/upload`;
    }
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/users/avatar/upload`;
  }

  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/users/search', query));
  }

  findById(id: string) {
    return this.get(`/users/view/${id}`);
  }

  setWalletPrincipal(data: any) {
    return this.put('/users/setICPWallet', data);
  }

  disconnectWalletPrincipal() {
    return this.put('/users/disconnectICPWallet');
  }

  unsubscribe(data: any) {
    return this.put('/auth/unsubscribe', data);
  }
}

export const userService = new UserService();
