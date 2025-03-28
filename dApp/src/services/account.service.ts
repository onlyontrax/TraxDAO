import { APIRequest } from './api-request';
import { setAccount } from '@redux/user/actions';
import { authService } from '@services/index';
import { Dispatch } from 'redux';

export class AccountService extends APIRequest {
  me(headers?: { [key: string]: string }): Promise<any> {
    return this.get('/users/me', headers);
  }

  updateMe(payload: any) {
    return this.put('/accounts', payload);
  }

  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/accounts/search', query));
  }

  findById(id: string) {
    return this.get(`/accounts/view/${id}`);
  }

  setWalletPrincipal(data: any) {
    return this.put('/accounts/setICPWallet', data);
  }

  setFIATCurrency(data: any){
    return this.put('/accounts/setFIATCurrency', data);
  }

  disconnectWalletPrincipal() {
    return this.put('/accounts/disconnectICPWallet');
  }

  unsubscribe(data: any) {
    return this.put('/auth/unsubscribe', data);
  }

  getQRCode(id: string) {
    return this.get(`/accounts/${id}/generateQRCode`);
  }

  async enable2FA(id: string) {
    return this.put(`/accounts/${id}/enableTwoFactorSecret`);
  }

  disable2FA(id: string) {
    return this.put(`/accounts/${id}/disableTwoFactorSecret`);
  }

  verify2FA(id: string, payload: any) {
    return this.put(`/accounts/${id}/verify2FATokenForUser`, payload);
  }

  getSMSCode(id: string) {
    return this.get(`/accounts/${id}/generateSMSCode`);
  }

  async enableSms(id: string, payload: any) {
    return this.put(`/accounts/${id}/enableSmsAuthSecret`, payload);
  }

  disableSms(id: string) {
    return this.put(`/accounts/${id}/disableSmsAuthSecret`);
  }

  verifySms(id: string, payload: any) {
    return this.put(`/accounts/${id}/verifySMSTokenForUser`, payload);
  }

  async reloadCurrentUser(dispatch: Dispatch) {
    //const { setAccount: handleUpdateUser } = this.props;
    const token = authService.getToken() || '';
    if (token) {
      const user = await this.me({
        Authorization: token
      });
      if (!user.data._id) {
        return;
      }
      dispatch(setAccount(user.data));
    }
  }

  searchReferralList(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/accounts/searchReferralList', query));
  }

  delete(id: string) {
    return this.del(`/accounts/${id}/delete`);
  }
}

export const accountService = new AccountService();
