import { Injectable } from '@angular/core';
import * as moment from 'moment-mini';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private localStorage = localStorage;

  constructor() {}

  getLocal(key: string) {
    let payloadString = `{"data": "", "key": "${key}", "expires": null}`;
    if (key && this.localStorage.getItem(key)) {
      payloadString = this.localStorage.getItem(key);
    }
    const value = JSON.parse(payloadString);
    if (value?.expires && moment().valueOf() > moment(value.expires).valueOf()) {
      this.setLocal(key, '');
      this.clearLocal(key);
      return null;
    } else {
      return value.data;
    }
  }

  setLocal(key: string, data: any, expires?: number) {
    const payload = {
      data,
      key,
      expires: expires || moment().add(10, 'years').valueOf()
    };
    this.localStorage.setItem(key, JSON.stringify(payload));
    return this.getLocal(key);
  }

  clearLocal(key: string) {
    try {
      this.localStorage.removeItem(key);
    } catch (localStorageException) {
      console.error(localStorageException);
    }
  }
}
