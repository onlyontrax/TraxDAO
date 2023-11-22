import { APIRequest } from './api-request';

class StreamService extends APIRequest {
  updateStreamInfo(payload) {
    return this.put('/streaming/update', payload);
  }

  updateStreamDuration(payload) {
    return this.put('/streaming/set-duration', payload);
  }

  goLive(data) {
    return this.post('/streaming/live', data);
  }

  editLive(id, data) {
    return this.put(`/streaming/live/${id}`, data);
  }

  joinPublicChat(performerId: string, headers?: any) {
    return this.post(`/streaming/join/${performerId}`, headers);
  }

  fetchAgoraAppToken(data) {
    return this.post('/streaming/agora/token', data);
  }

  search(query: { [key: string]: any }) {
    return this.get(this.buildUrl('/streaming/user/search', query));
  }
}

export const streamService = new StreamService();
