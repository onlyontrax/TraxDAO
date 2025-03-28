import { isUrl } from '@lib/string';
import fetch from 'isomorphic-unfetch';
import cookie from 'js-cookie';
import Router from 'next/router';
import { startTransition } from 'react';
import { getGlobalConfig } from './config';

export interface IResponse<T> {
  status: number;
  data: T | T[];
}

export const TOKEN = 'token';

export abstract class APIRequest {
  static token: string = '';
  static subaccount: string = '';

  setAuthHeaderToken(token: string) {
    APIRequest.token = token;
  }

  /**
   * Parses the JSON returned by a network request
   *
   * @param  {object} response A response from a network request
   *
   * @return {object}          The parsed JSON from the request
   */
  private parseJSON(response: Response) {
    if (response.status === 204 || response.status === 205) {
      return null;
    }
    return response.json();
  }

  /**
   * Checks if a network request came back fine, and throws an error if not
   *
   * @param  {object} response   A response from a network request
   *
   * @return {object|undefined} Returns either the response, or throws an error
   */
  private async checkStatus(response: Response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }

    if (response.status === 401) {
      if (process.browser) {
        Router.push('/login');
      }

      throw new Error('Please login!');
    }

    const errorData = await response.clone().json();
    throw errorData;

    //throw response.clone().json();
  }

  request(
    url: string,
    method: string = 'GET',
    body?: any,
    headers?: { [key: string]: string },
    responseType: string = 'json'
  ): Promise<any> {
    const verb = method.toUpperCase();

    const updatedHeader = {
      'Content-Type': responseType === 'json' ? 'application/json' : undefined,
      Authorization: APIRequest.token || cookie.get(TOKEN) || null,
      ...(headers || {})
    };

    return fetch(isUrl(url) ? url : `${process.env.API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT}${url}`, {
      method: verb,
      headers: updatedHeader,
      body: body ? JSON.stringify(body) : null
    })
      .then(this.checkStatus)
      .then((response) => {
        if (responseType === 'blob') {
          // For file downloads, return the blob
          return response.blob();
        } else {
          // For JSON, parse the response as JSON
          return response.json();
        }
      })
      .then((response) => {
        startTransition(() => {
          // Handle Redux store update or any other side effect here
          // TODO: replace `updateReduxStore` with the appropriate action
          // updateReduxStore(response.data);
        });
        return response;
      })
      .catch((error) => {
        throw error;
      });
  }

  /*request(
    url: string,
    method?: string,
    body?: any,
    headers?: { [key: string]: string }
  ): Promise<IResponse<any>> {
    const verb = (method || 'get').toUpperCase();
    const updatedHeader = {
      'Content-Type': 'application/json',
      // TODO - check me
      Authorization: APIRequest.token || cookie.get(TOKEN) || null,
      ...(headers || {})
    };
    return fetch(isUrl(url) ? url : `${process.env.API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT}${url}`, {
      method: verb,
      headers: updatedHeader,
      body: body ? JSON.stringify(body) : null
    })
      .then(this.checkStatus)
      .then(this.parseJSON)
      .then((response) => {
        startTransition(() => {
        // Update the Redux store with the response data
        // TODO: replace `updateReduxStore` with the appropriate action
        // updateReduxStore(response.data);
        });
        return response;
      })
      .catch((error) => {
        // Handle errors here
        throw error;
      });
  }*/

  buildUrl(baseUrl: string, params?: { [key: string]: any }) {
    if (!params) {
      return baseUrl;
    }

    const queryString = Object.keys(params)
      .map((k) => {
        if (Array.isArray(params[k])) {
          return params[k].map((param) => `${encodeURIComponent(k)}=${encodeURIComponent(param)}`)
            .join('&');
        }
        return `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`;
      })
      .join('&');
    return `${baseUrl}?${queryString}`;
  }

  get(url: string, headers?: { [key: string]: string }, responseType: string = 'json') {
    return this.request(url, 'get', null, headers, responseType);
  }

  post(url: string, data?: any, headers?: { [key: string]: string }) {
    return this.request(url, 'post', data, headers);
  }

  put(url: string, data?: any, headers?: { [key: string]: string }) {
    return this.request(url, 'put', data, headers);
  }

  del(url: string, data?: any, headers?: { [key: string]: string }) {
    return this.request(url, 'delete', data, headers);
  }

  upload(
    url: string,
    files: {
      file: File;
      fieldname: string;
    }[],
    options: {
      onProgress: Function;
      customData?: Record<any, any>;
      method?: string;
    } = {
      onProgress() { },
      method: 'POST'
    }
  ) {
    const uploadUrl = isUrl(url) ? url : `${process.env.API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT}${url}`;
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();

      req.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          options.onProgress({
            percentage: (event.loaded / event.total) * 100
          });
        }
      });

      req.addEventListener('load', () => {
        const success = req.status >= 200 && req.status < 300;
        const { response } = req;
        if (!success) {
          return reject(response);
        }
        return resolve(response);
      });

      req.upload.addEventListener('error', () => {
        reject(req.response);
      });

      const formData = new FormData();
      files.forEach((f) => formData.append(f.fieldname, f.file, f.file.name));
      options.customData
        && Object.keys(options.customData).forEach(
          (fieldname) => {
            if (typeof options.customData[fieldname] !== 'undefined' && !Array.isArray(options.customData[fieldname])) formData.append(fieldname, options.customData[fieldname]);
            if (typeof options.customData[fieldname] !== 'undefined' && Array.isArray(options.customData[fieldname])) {
              if (options.customData[fieldname].length) {
                for (let i = 0; i < options.customData[fieldname].length; i += 1) {
                  formData.append(fieldname, options.customData[fieldname][i]);
                }
              }
            }
          }
        );
      req.responseType = 'json';
      req.open(options.method || 'POST', uploadUrl);

      const token: any = APIRequest.token || cookie.get(TOKEN);
      req.setRequestHeader('Authorization', token || '');
      req.send(formData);
    });
  }
}
