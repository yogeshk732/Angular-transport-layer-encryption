import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { environment } from '@env/environment';
import { CryptoService } from './crypto.service';
import { tap } from 'rxjs/operators';
import { outerUrl } from '@route/unautherized.route-url';

@Injectable()
export class TransportEncryptionInterceptor implements HttpInterceptor {

  requestObj;
  responseObj;

  encryption = environment.encryption;

  constructor(private crypto: CryptoService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    this.requestObj = req;

    /**
       * Check which encrpiton key need to use
       * KeyType (1 = secret key generated dynamically, 2 = key defined in environtment file)
       */
    let outerUrlPath = outerUrl;

    let filterUrl = req.url;

    let removeQueryStringFromFilterUrl = filterUrl.split('?');
    let getRequestedUrl;
    if (removeQueryStringFromFilterUrl && removeQueryStringFromFilterUrl.length > 0) {
      getRequestedUrl = removeQueryStringFromFilterUrl[0];
    }

    getRequestedUrl = getRequestedUrl.replace(/[^a-zA-Z0-9/. : _ - ]/g, '');

    outerUrlPath = outerUrlPath.filter(obj => {
      let url = environment.api_url + obj;
      url = url.replace(/[^a-zA-Z0-9/. : _ - ]/g, '');
      return url == getRequestedUrl;
    });

    let keyType = 2;
    if (!outerUrlPath || (outerUrlPath && outerUrlPath.length <= 0)) {
      keyType = 1;
    }


    if (this.encryption) {


      /**
       * check if request is get or delete
       */

      if (this.requestObj.method === 'GET' || this.requestObj.method === 'DELETE') {

        const url = req.urlWithParams;
        const splitededUrl = url.split('?');
        const baseUrl = splitededUrl[0];
        const params = splitededUrl[1];
        let pairs;
        if (params.indexOf('&') > -1) {
          pairs = params.split('&');
        } else {
          pairs = [params];
        }

        const result = {};
        pairs.forEach(function (pair) {
          const pairData = pair.split('=');
          result[pairData[0]] = decodeURIComponent(pairData[1] || '');
        });



        const encodedString = btoa(this.crypto.encode(result, keyType));

        this.requestObj.url = baseUrl + '?encoded=' + encodedString;
        this.requestObj.urlWithParams = baseUrl + '?encoded=' + encodedString;

      } else {

        if (this.requestObj.body.constructor === FormData) {
          const formData = this.requestObj.body;
          formData.set('data', this.crypto.encode(formData.get('data'), keyType));
          this.requestObj.body = formData;
        } else {
          this.requestObj['body'] = { encoded: this.crypto.encode(this.requestObj['body'], keyType) };
        }
      }


    }


    return next.handle(this.requestObj)
      .pipe(
        tap(event => {

          if (event instanceof HttpResponse) {

            this.responseObj = event;
            if (this.responseObj['body'] && this.responseObj['body'] !== null && this.encryption) {
              this.responseObj['body'] = this.crypto.decode(event['body'], keyType);
            }
            return this.responseObj;
          }
        }, error => {
          let errObj = error;
          if (error && error.error !== null && this.encryption) {
            errObj = this.crypto.decode(error.error, keyType);
          }
          return errObj;
        })
      );


  }
}
