import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/elements/services/notification.service';
import { UserService } from 'src/app/elements/services/user.service';
import * as moment from 'moment-mini';
import { Router } from '@angular/router';
import { IonRefresher } from '@ionic/angular';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit, OnDestroy {

  @ViewChild(IonRefresher, { static: false}) refresher: IonRefresher;
  notifications: any[] = [];
  LIMIT = 30;
  currentUser: any;
  hasMore = true;
  loaded = false;

  onDestroy$ = new Subject<boolean>();

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.userService.currentUser$.pipe(takeUntil(this.onDestroy$)).subscribe(currentUser => {
      this.currentUser = currentUser;
    });

    this.refreshNotifications();
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  ionViewDidEnter() {
    this.refresher.disabled = false;
  }

  ionViewWillLeave() {
    this.refresher.disabled = true;
  }

  calculateDuration(startDate) {
    const start = moment(startDate);
    return start.fromNow();
  }

  onClick(notification) {
    if (notification.type === 'room') {
      this.router.navigate(['/home'], { queryParams: { joinRoomId: notification.room._id }} );
    } else if (notification.type === 'follow') {
      this.openPublicProfile(notification.notifier);
    }
  }

  async loadMore(event?) {
    if (!this.currentUser) {
      return;
    }
    try {
      let notifications = (await this.notificationService.findByUser(false, true, this.LIMIT, this.notifications.length, false).toPromise()) as any[];
      this.hasMore = notifications.length === this.LIMIT;
      notifications = notifications.map(notification => {
        return {
          ...notification,
          duration: this.calculateDuration(notification.created),
        };
      });

      this.notifications = [
        ...this.notifications,
        ...notifications,
      ];
      this.loaded = true;
      this.notificationService.newNotifications$.next(false);
    } finally {
      if (event) {
        event.target.complete();
      }
    }
  }

  openPublicProfile(user) {
    this.userService.openProfile$.next(user);
  }

  refreshNotifications(event?) {
    this.notifications = [];
    this.loadMore(event);
  }

}
