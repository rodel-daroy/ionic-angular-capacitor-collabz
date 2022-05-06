import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { GeneralService } from './general.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = environment.api.url;

  notifications$ = new BehaviorSubject([]);
  newNotifications$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private generalService: GeneralService
  ) { }

  findByUser(unreadOnly, markAsRead, limit?, skip?, skipErrorInterceptor?) {
    return this.http.get(this.apiUrl + '/notifications/user', {
      params: {
        unreadOnly,
        markAsRead,
        limit,
        skip
      },
      headers: skipErrorInterceptor ? this.generalService.setSkipErrorInterceptor(true) : undefined
    });
  }

  checkNotifications() {
    this.findByUser(true, false, 1, 0, true)
      .subscribe((notifications: any[]) => {
        this.newNotifications$.next(notifications.length > 0);
      });
  }

  markAsRead(notificationId) {
    return this.http.put(this.apiUrl + `/notifications/${notificationId}`, {});
  }
}
