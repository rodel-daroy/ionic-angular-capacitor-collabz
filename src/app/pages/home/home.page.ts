import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonRefresher } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoadingService } from 'src/app/elements/services/loading.service';
import { RoomService } from 'src/app/elements/services/room.service';
import { UserService } from 'src/app/elements/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  @ViewChild(IonRefresher, { static: false}) refresher: IonRefresher;
  rooms: any[] = [];
  loaded = false;
  currentUser: any;
  loadingMutex = false;

  onDestroy$ = new Subject<boolean>();

  constructor(
    private roomService: RoomService,
    private userService: UserService,
    private loading: LoadingService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe(async (queryParams) => {
      if (queryParams.joinRoomId) {
        try {
          this.refreshRooms();
          const room = (await this.roomService.getById(queryParams.joinRoomId).toPromise()) as any;
          await this.joinRoom(room);
        } finally {
          await this.router.navigate([], {queryParams: {joinRoomId: null}, queryParamsHandling: 'merge', replaceUrl: true});
        }
      }
    });

    this.userService.currentUser$.pipe(takeUntil(this.onDestroy$)).subscribe(currentUser => {
      this.currentUser = currentUser;
    });

    this.refreshRooms();
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

  async refreshRooms(event?) {
    try {
      const rooms = (await this.roomService.findRooms().toPromise()) as any[];
      for (const room of rooms) {
        const targetPreviewLength = Math.floor(Math.random() * 12) + 2;
        room.previewUsers = [];
        for (const host of room.hosts) {
          if (room.previewUsers.length < targetPreviewLength) {
            host.hasMic = true;
            room.previewUsers.push(host);
          }
        }
        for (const guest of room.guests) {
          if (room.previewUsers.length < targetPreviewLength) {
            guest.hasMic = true;
            room.previewUsers.push(guest);
          }
        }
        for (const queue of room.queue) {
          if (room.previewUsers.length < targetPreviewLength) {
            queue.hasMic = true;
            room.previewUsers.push(queue);
          }
        }
        for (const recentAudience of room.recentAudience) {
          if (room.previewUsers.length < targetPreviewLength) {
            room.previewUsers.push(recentAudience);
          }
        }
      }
      this.rooms = rooms;
      this.loaded = true;
    } finally {
      if (event) {
        event.target.complete();
      }
    }
  }

  async joinRoom(room) {
    if (this.loadingMutex) {
      return;
    }
    this.loadingMutex = true;
    if (!room) {
      this.loadingMutex = false;
      return;
    }
    const activeRoom = this.roomService.activeRoom$.value;
    if (activeRoom && room._id === activeRoom._id) {
      this.roomService.openActiveRoom$.next();
      this.loadingMutex = false;
      return;
    }

    let isBroadcasting = false;
    if (this.currentUser
      && (
        (room.hosts && room.hosts.map(u => u._id).indexOf(this.currentUser._id) >= 0)
        || (room.guests && room.guests.map(u => u._id).indexOf(this.currentUser._id) >= 0)
      )) {
      isBroadcasting = true;
    }

    await this.loading.startLoading();

    try {
      await this.roomService.joinRoom(room, false, isBroadcasting);
      this.refreshRooms();
    } finally {
      await this.loading.stopLoading();
      this.loadingMutex = false;
    }
  }


}
