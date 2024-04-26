import { APIRequest } from './api-request';

export class TicketService extends APIRequest {
  createTicket(
    files: [{ fieldname: string; file: File }],
    payload: any,
    onProgress?: Function
  ) {
    return this.upload('/performer/performer-assets/tickets', files, {
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
    return this.upload(`/performer/performer-assets/tickets/${id}`, files, {
      onProgress,
      customData: payload,
      method: 'PUT'
    });
  }

  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/performer/performer-assets/tickets/search', query)
    );
  }

  userSearch(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/user/performer-assets/tickets/search', query)
    );
  }

  userView(ticketId: string, headers?: any) {
    return this.get(`/user/performer-assets/tickets/${ticketId}`, headers);
  }

  findById(id: string) {
    return this.get(`/performer/performer-assets/tickets/${id}/view`);
  }

  delete(id: string) {
    return this.del(`/performer/performer-assets/tickets/${id}`);
  }

  getBookmarked(payload) {
    return this.get(this.buildUrl('/reactions/tickets/bookmark', payload));
  }

  getPurchased(payload) {
    return this.get(this.buildUrl('/users/tickets/purchased', payload));
  }

  getPurchasedArtists(payload) {
    return this.get(this.buildUrl('/performers/tickets/purchased', payload));
  }

  hotEvents() {
    return this.get(this.buildUrl('/performer/performer-assets/tickets/hot'));
  }
}

export const ticketService = new TicketService();
