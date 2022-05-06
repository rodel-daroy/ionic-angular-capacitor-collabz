import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as moment from 'moment-mini';
import { StorageService } from '../../services/storage.service';
import { ToastController } from '@ionic/angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  lastConnectionAlert: string;

  constructor(
    private storage: StorageService,
    private router: Router,
    private toastController: ToastController,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let request: HttpRequest<any>;

    // append authorization token to api calls
    if (req.headers.has('skip-authorization')) {
      const headers = req.headers.delete('skip-authorization');
      request = (req.clone({ headers }));
    } else {
      const token = this.storage.getLocal('token');
      if (token) {

        const cloned = req.clone({
          headers: req.headers.set('Authorization', (token || ''))
        });
        request = (cloned);

      } else {
        request = (req);
      }
    }

    // remove undefined params
    let params = request.params;
    if (params) {
      for (const key of request.params.keys()) {
        if (params.get(key) === undefined) {
          params = params.delete(key, undefined);
        }
      }
    }
    request = request.clone({ params });

    return next.handle(request).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          // could be applied the general messages for error interception
          if (!request.headers.has('bypass-error-interceptor')) {

            if (err.status === 403) {
              this.router.navigate(['/profile']);
            } else if (err.status === 404) {
              this.router.navigate(['/404']);
            }

            try {
              this.showToast('Whoops! ' + err.error.error.message);
            } catch (e) {
              // prevent multiple lost connection alerts in a row. force the alert if its not a GET request
              if (['POST', 'PUT', 'PATCH', 'DELETE'].indexOf(request.method) >= 0
                || !this.lastConnectionAlert
                || moment(this.lastConnectionAlert).add(1, 'minute').isBefore(moment())) {

                this.lastConnectionAlert = moment().format();
                this.showToast('Whoops! We lost the connection. Please refresh to retry.');
              }
            }
          }
        }
        throw err;
      })
    );
  }

  private async showToast(message, header = '') {
    const toast = await this.toastController.create({
      header,
      message,
      buttons: [
        {
          text: 'Close',
        }
      ],
      duration: 5000
    });
    toast.present();
  }
}
