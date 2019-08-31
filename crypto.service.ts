import { Injectable } from '@angular/core';
import { AES, enc } from 'crypto-ts';
import { environment } from '@env/environment';


@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor(private auth: AuthService) { }


  getKey(keyType) {
   return environment.request_encode_key;
  }

  encode(data, keyType) {
    const encryptData = JSON.stringify(data);
    const encryptedMessage = AES.encrypt(encryptData, this.getKey(keyType)).toString();
    return encryptedMessage;
  }


  decode(data, keyType) {
    if (!data || data == null) {
      return data;
    }
    const bytes = AES.decrypt(data.toString(), this.getKey(keyType));
    const decryptedData = bytes.toString(enc.Utf8);
    if (decryptedData) {
      return JSON.parse(decryptedData);
    } else {
      return false;
    }
  }

  decodeByKey(data, key) {
    if (!data || data == null || !key || key == null) {
      return data;
    }
    const bytes = AES.decrypt(data.toString(), key);
    const decryptedData = bytes.toString(enc.Utf8);
    if (decryptedData) {
      return JSON.parse(decryptedData);
    } else {
      return false;
    }
  }
}
