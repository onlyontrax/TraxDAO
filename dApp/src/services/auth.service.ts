import cookie from 'js-cookie';
import {
  ILogin, IFanRegister, IForgot, IVerifyEmail
} from 'src/interfaces';
import { APIRequest, TOKEN } from './api-request';

export class AuthService extends APIRequest {
  public async login(data: ILogin) {
    return this.post('/auth/login', data);
  }

  public async loginTwitter() {
    return this.get(
      this.buildUrl('/auth/twitter/login')
    );
  }

  public async loginGoogle(data: any) {
    return this.post('/auth/google/login', data);
  }

  public async loginNFID(data: any) {
    return this.post('/auth/nfid/login', data);
  }

  public async callbackLoginTwitter(data) {
    return this.get(
      this.buildUrl('/auth/twitter/callback', data)
    );
  }

  public async verifyEmail(data: IVerifyEmail) {
    return this.post('/auth/email-verification', data);
  }

  public async verifyReferralCode(data: any) {
    return this.post('/auth/verifyReferralCode', data);
  }

  setToken(token: string, remember = true): void {
    const expired = { expires: !remember ? 1 : 365 };
    cookie.set(TOKEN, token, expired);
    this.setAuthHeaderToken(token);
  }

  getToken(): string {
    return cookie.get(TOKEN);
  }

  setTwitterToken(data: any, role: string) {
    cookie.set('oauthToken', data.oauthToken, { expires: 1 });
    cookie.set('oauthTokenSecret', data.oauthTokenSecret, { expires: 1 });
    cookie.set('role', role, { expires: 1 });
  }

  getTwitterToken() {
    const oauthToken = cookie.get('oauthToken');
    const oauthTokenSecret = cookie.get('oauthTokenSecret');
    const role = cookie.get('role');
    return { oauthToken, oauthTokenSecret, role };
  }

  removeToken(): void {
    cookie.remove(TOKEN);
  }

  updatePassword(password: string, source?: string) {
    return this.put('/auth/users/me/password', { password, source });
  }

  resetPassword(data: IForgot) {
    return this.post('/auth/users/forgot', data);
  }

  register(data: IFanRegister) {
    return this.post('/auth/users/register', data);
  }

  registerPerformer(data: any) {
    return this.post('/auth/performers/register', data);
  }

  registerCheckField(data: any) {
    return this.post('/auth/performers/check-field', data);
  }

  userSwitchToPerformer(userId: string) {
    return this.post(`/auth/users/${userId}/switch-to-performer`);
  }

  public async getSmsCode(data: ILogin) {
    return this.post('/auth/getSmsCode', data);
  }
}

export const authService = new AuthService();
