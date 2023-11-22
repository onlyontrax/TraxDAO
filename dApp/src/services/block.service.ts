import { APIRequest } from './api-request';

export class BlockService extends APIRequest {
  blockCountries(payload: any) {
    return this.post('/performer-blocks/countries', payload);
  }

  blockUser(payload: any) {
    return this.post('/performer-blocks/user', payload);
  }

  unBlockUser(id: string) {
    this.del(`/performer-blocks/user/${id}`);
  }

  getBlockListUsers(query: any) {
    return this.get(this.buildUrl('/performer-blocks/users', query));
  }

  checkCountryBlock() {
    return this.get('/country-block/check');
  }
}

export const blockService = new BlockService();
