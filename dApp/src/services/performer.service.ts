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
    return this.put(`/accounts/${id}/payment-gateway-settings`, payload);
  }

  getBookmarked(payload) {
    return this.get(this.buildUrl('/reactions/performers/bookmark', payload));
  }

  getAnalytics(range?: string) {
    const url = this.buildUrl('/statistics/performer');
    if (range) {
      return this.get(`${url}?range=${range}`);
    }
    return this.get(url);
  }

  uploadDocuments(documents: {
    file: File;
    fieldname: string;
  }[], onProgress?: Function) {
    return this.upload('/performers/documents/upload', documents, {
      onProgress
    });
  }
}

export const performerService = new PerformerService();
