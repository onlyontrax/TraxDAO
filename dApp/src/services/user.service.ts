import { APIRequest } from './api-request';
import { setAccount } from '@redux/user/actions';
import { authService } from '@services/index';
import { Dispatch } from 'redux';

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

  setFIATCurrency(data: any){
    return this.put('/users/setFIATCurrency', data);
  }

  async reloadCurrentUser(dispatch: Dispatch) {
    //const { setAccount: handleUpdateUser } = this.props;
    const token = authService.getToken() || '';
    if (token) {
      // We are fetching account here not just user
      const user = await userService.me({
        Authorization: token
      });
      if (!user.data._id) {
        return;
      }
      dispatch(setAccount(user.data));
    }
  }
}

export const userService = new UserService();
