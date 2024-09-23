import { IPerformer } from 'src/interfaces';
import { APIRequest, IResponse } from './api-request';

export class PerformerService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/performers/user/search', query));
  }

  searchGenre(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/performers/user/searchGenre', query));
  }

  randomSearch(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/performers/search/random', query));
  }

  me(headers?: { [key: string]: string }): Promise<IResponse<IPerformer>> {
    return this.get('/performers/me', headers);
  }

  findOne(id: string, headers?: { [key: string]: string }) {
    return this.get(`/performers/${id}`, headers);
  }

  getAvatarUploadUrl() {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/performers/avatar/upload`;
  }

  getCoverUploadUrl() {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/performers/cover/upload`;
  }

  getVideoUploadUrl() {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/performers/welcome-video/upload`;
  }

  getDocumentUploadUrl() {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/performers/documents/upload`;
  }

  updateMe(id: string, payload: any) {
    return this.put(`/performers/${id}`, payload);
  }

  getTopPerformer(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/performers/top', query));
  }

  updateBanking(id: string, payload) {
    return this.put(`/performers/${id}/banking-settings`, payload);
  }

  updatePaymentGateway(id, payload) {
    return this.put(`/performers/${id}/payment-gateway-settings`, payload);
  }

  getBookmarked(payload) {
    return this.get(this.buildUrl('/reactions/performers/bookmark', payload));
  }

  uploadDocuments(documents: {
    file: File;
    fieldname: string;
  }[], onProgress?: Function) {
    return this.upload('/performers/documents/upload', documents, {
      onProgress
    });
  }

  setWalletPrincipal(data: any) {
    return this.put('/performers/setICPWallet', data);
  }

  disconnectWalletPrincipal() {
    return this.put('/performers/disconnectICPWallet');
  }

  getQRCode(id: string) {
    return this.get(`/performers/${id}/generateQRCode`);
  }

  enable2FA(id: string) {
    return this.put(`/performers/${id}/enableTwoFactorSecret`);
  }

  disable2FA(id: string) {
    return this.put(`/performers/${id}/disableTwoFactorSecret`);
  }

  verify2FA(id: string, payload: any) {
    return this.put(`/performers/${id}/verify2FATokenForUser`, payload);
  }

  getSMSCode(id: string) {
    return this.get(`/performers/${id}/generateSMSCode`);
  }

  enableSms(id: string) {
    return this.put(`/performers/${id}/enableSmsAuthSecret`);
  }

  disableSms(id: string) {
    return this.put(`/performers/${id}/disableSmsAuthSecret`);
  }

  verifySms(id: string, payload: any) {
    return this.put(`/performers/${id}/verifySMSTokenForUser`, payload);
  }
}

export const performerService = new PerformerService();
