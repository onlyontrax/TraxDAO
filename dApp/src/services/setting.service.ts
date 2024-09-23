import { APIRequest } from './api-request';

export class SettingService extends APIRequest {
  private _settings = {} as any;

  async all(group = '', forceReload = false) {
    const settingGroup = group || 'all';
    if (this._settings[settingGroup] && !forceReload) {
      return this._settings[settingGroup];
    }
    const resp = await this.get(this.buildUrl('/settings/public', { group }));
    this._settings[settingGroup] = resp;
    return resp;
  }

  contact(data) {
    return this.post('/contact', data);
  }
}

export const settingService = new SettingService();
