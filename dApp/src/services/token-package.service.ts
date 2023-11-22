/* eslint-disable linebreak-style */
/* eslint-disable indent */
import { APIRequest } from './api-request';

export class TokenPackageService extends APIRequest {
    search(query) {
        return this.get(this.buildUrl('/package/token/search', query as any));
    }
}

export const tokenPackageService = new TokenPackageService();
