import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { PublicProfileComponent } from './elements/components/public-profile/public-profile.component';
import { GeneralService } from './elements/services/general.service';
import { NotificationService } from './elements/services/notification.service';
import { RoomService } from './elements/services/room.service';
import { UserService } from './elements/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

  activeRoom: any;
  newNotifications$ = this.notificationService.newNotifications$.asObservable();

  onDestroy$ = new Subject<boolean>();

  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private generalService: GeneralService,
    private modalController: ModalController,
    private notificationService: NotificationService,
  ) {}

  async ngOnInit() {

    const currentUser = await this.userService.getCurrentUser();
    if (!currentUser) {
      this.generalService.refreshDefaultCountryCode(); // for login/signup
    }

    this.roomService.activeRoom$.pipe(takeUntil(this.onDestroy$)).subscribe(activeRoom => {
      this.activeRoom = activeRoom;
    });

    this.roomService.initializeListeners();

    timer(0, 60000).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      this.notificationService.checkNotifications();
    });

    timer(30000, 60000).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      this.roomService.sendHeartbeat();
    });

    this.userService.openProfile$.pipe(takeUntil(this.onDestroy$)).subscribe(async (user) => {
      const modal = await this.modalController.create({
        component: PublicProfileComponent,
        componentProps: {
          user
        }
      });
      await modal.present();
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }
}
