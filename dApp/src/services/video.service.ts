import { APIRequest } from './api-request';
import cookie from 'js-cookie';

export const TOKEN = 'token';

export class VideoService extends APIRequest {
  hotTracks() {
    return this.get(this.buildUrl('/performer/performer-assets/videos/hot'));
  }

  trendingTracks() {
    return this.get(this.buildUrl('/performer/performer-assets/videos/trending'));
  }

  newReleases() {
    return this.get(this.buildUrl('/performer/performer-assets/videos/recent'));
  }

  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/performer/performer-assets/videos/search', query)
    );
  }

  userSearch(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/user/performer-assets/videos/search', query)
    );
  }

  homePageSearch(query?: { [key: string]: any }) {
    query.token = APIRequest.token || cookie.get(TOKEN);
    return this.get(
      this.buildUrl('/user/performer-assets/videos/homePageSearch', query)
    );
  }

  delete(id: string) {
    return this.del(`/performer/performer-assets/videos/${id}`);
  }

  findById(id: string, headers?: { [key: string]: string }) {
    return this.get(`/performer/performer-assets/videos/${id}/view`, headers);
  }

  findOne(id: string, headers?: { [key: string]: string }) {
    return this.get(`/user/performer-assets/videos/${id}`, headers);
  }

  update(id: string, files: [{ fieldname: string; file: File }], payload: any, onProgress?: Function) {
    if (typeof payload.status === 'boolean') {
      payload.status = payload.status ? 'active' : 'inactive';
    }
    return this.upload(`/performer/performer-assets/videos/edit/${id}`, files, {
      onProgress,
      customData: payload,
      method: 'PUT'
    });
  }

  deleteFile(id: string, type: string) {
    return this.del(`/performer/performer-assets/videos/remove-file/${id}`, { type });
  }

  uploadVideo(
    files: [{ fieldname: string; file: File }],
    payload: any,
    onProgress?: Function
  ) {
    if (typeof payload.status === 'boolean') {
      // Set status to "active" or "inactive" based on its boolean value
      payload.status = payload.status ? 'active' : 'inactive';
    }
    return this.upload('/performer/performer-assets/videos/upload', files, {
      onProgress,
      customData: payload
    });
  }

  getBookmarks(payload) {
    return this.get(this.buildUrl('/reactions/videos/bookmark', payload));
  }

  getLikes(payload) {
    return this.get(this.buildUrl('/reactions/videos/like', payload));
  }

  getPurchased(payload) {
    return this.get(this.buildUrl('/users/videos/purchased', payload));
  }

  downloadLinkFromICP(id) {
    return `${process.env.API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT}/files/downloadFromICP?key=${id}`;
  }

  downloadFromICP(id) {
    return this.get(this.downloadLinkFromICP(id));
  }
}

export const videoService = new VideoService();
