/* eslint-disable @typescript-eslint/ban-types */
import axios, { AxiosPromise, Method } from 'axios';

export interface ClientOptions {
  hostname: string;
  port: number;
  secure: boolean;
  auth?: {
    username: string;
    password: string;
  };
}

export class Client {
  private readonly options: ClientOptions;

  public constructor(options?: Partial<ClientOptions>) {
    this.options = {
      hostname: '0.0.0.0',
      port: 3000,
      secure: false,
      ...options,
    };
  }

  public getItem(key: string): Promise<Object|undefined> {
    return this.request('GET', key)
      .then((response) => {
        if (response.status !== 200) {
          return Promise.reject('Unable to retrieve item');
        }

        return Promise.resolve(response.data);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          return Promise.resolve(undefined);
        }

        return Promise.reject(err);
      });
  }

  public setItem(key: string, value: Object): Promise<void> {
    return this.request('POST', key, value)
      .then((response) => {
        if (response.status !== 201) {
          return Promise.reject(new Error('Unable to store item'));
        }

        return Promise.resolve(undefined);
      });
  }

  public removeItem(key: string): Promise<Object|undefined> {
    return this.request('DELETE', key)
      .then((response) => {
        if (response.status !== 201) {
          return Promise.reject(new Error('Unable to remove item'));
        }

        return Promise.resolve(response.data);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          return Promise.resolve(undefined);
        }

        return Promise.reject(err);
      });
  }

  public patchItem(key: string, value: Object): Promise<Object|undefined> {
    return this.request('PATCH', key, value)
      .then((response) => {
        if (response.status !== 201) {
          return Promise.reject(new Error('Unable to update item'));
        }

        return Promise.resolve(response.data);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          return Promise.resolve(undefined);
        }

        return Promise.reject(err);
      });
  }

  private request(method: Method, key: string, data?: Object): AxiosPromise {
    const { hostname, port, secure } = this.options;
    const url = `http${secure ? 's' : ''}://${hostname}:${port}/${key}`;

    return axios({
      auth: this.options.auth,
      data,
      method,
      url,
    });
  }
}
