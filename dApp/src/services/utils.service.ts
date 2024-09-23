import { ICountry, ILangguges, IPhoneCodes } from 'src/interfaces';
import { APIRequest, IResponse } from './api-request';

export class UtilsService extends APIRequest {
  private _countries = [] as any;

  async countriesList(): Promise<IResponse<ICountry>> {
    if (this._countries.length) {
      return this._countries;
    }
    const resp = await this.get('/countries/list');
    this._countries = resp;
    return resp;
  }

  async statesList(countryCode: string) {
    return this.get(`/states/${countryCode}`);
  }

  async citiesList(countryCode: string, state: string) {
    return this.get(`/cities/${countryCode}/${state}`);
  }

  languagesList(): Promise<IResponse<ILangguges>> {
    return this.get('/languages/list');
  }

  phoneCodesList(): Promise<IResponse<IPhoneCodes>> {
    return this.get('/phone-codes/list');
  }

  musicInfo() {
    return this.get('/user-additional');
  }

  verifyRecaptcha(token: string) {
    return this.post('/re-captcha/verify', { token });
  }
}

export const utilsService = new UtilsService();
