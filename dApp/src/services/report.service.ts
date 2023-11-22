import { APIRequest } from './api-request';

export class ReportService extends APIRequest {
  create(payload: any) {
    return this.post('/reports', payload);
  }
}

export const reportService = new ReportService();
