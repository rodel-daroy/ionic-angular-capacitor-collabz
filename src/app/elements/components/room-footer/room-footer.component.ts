import { CommonModule } from '@angular/common';
import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedPipesModule } from '../../pipes/shared-pipes.module';
import { LoadingService } from '../../services/loading.service';
import { RoomService } from '../../services/room.service';
import { RoomModalComponent, RoomModalModule } from '../room-modal/room-modal.component';
import { UserAvatarModule } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'app-room-footer',
  templateUrl: './room-footer.component.html',
  styleUrls: ['./room-footer.component.scss'],
})
export class RoomFooterComponent implements OnInit, OnDestroy {

  myUser: any;
  activeRoom: any;
  inviteRole: string;
  activeHosts: any[] = [];
  activeUsers: any[] = [];
  audioOn$ = this.roomService.audioOn$;
  loadingMutex = false;

  onDestroy$ = new Subject<boolean>();

  constructor(
    private roomService: RoomService,
    private modalController: ModalController,
    private loading: LoadingService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.roomService.myUser$.pipe(takeUntil(this.onDestroy$)).subscribe(myUser => {
      this.myUser = myUser;

      if (myUser && myUser.inviteRole && myUser.inviteFullName && !this.inviteRole) {
        this.inviteRole = myUser.inviteRole;
        this.askInviteRole(myUser.inviteRole, myUser.inviteFullName);
      }
    });

    this.roomService.activeRoom$.pipe(takeUntil(this.onDestroy$)).subscribe(activeRoom => {
      if ((!this.activeRoom && activeRoom) || (this.activeRoom && activeRoom && this.activeRoom._id !== activeRoom._id)) {
        this.activeRoom = activeRoom;
        this.openRoomModal();
      } else {
        this.activeRoom = activeRoom;
      }
    });

    this.roomService.openActiveRoom$.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      if (this.activeRoom) {
        this.openRoomModal();
      }
    });

    this.roomService.activeHosts$.pipe(takeUntil(this.onDestroy$)).subscribe(activeHosts => {
      this.activeHosts = activeHosts;
    });
    this.roomService.activeUsers$.pipe(takeUntil(this.onDestroy$)).subscribe(activeUsers => {
      this.activeUsers = activeUsers;
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  toggleMicrophone() {
    this.roomService.toggleMicrophone();
  }

  async leaveRoom() {
    if (this.loadingMutex) {
      return;
    }
    this.loadingMutex = true;
    if (!this.activeRoom) {
      this.loadingMutex = false;
      return;
    }
    await this.loading.startLoading();

    try {
      await this.roomService.leaveRoom();
    } finally {
      await this.loading.stopLoading();
      this.loadingMutex = false;
    }
  }

  async openRoomModal() {
    const modal = await this.modalController.create({
      component: RoomModalComponent,
      cssClass: 'room-modal'
    });
    return await modal.present();
  }

  clap() {
    if (!this.activeRoom) {
      return;
    }
    this.roomService.clap(this.activeRoom._id).toPromise();
  }

  async askInviteRole(inviteRole, inviteFullName) {
    if (!inviteRole || !inviteFullName || !this.activeRoom) {
      return;
    }
    const alert = await this.alertController.create({
      message: inviteFullName + ' invited you to join as ' + inviteRole,
      buttons: [
        {
          text: 'No thanks',
          role: 'cancel',
          handler: async () => {
            await this.roomService.declineRole(this.activeRoom._id).toPromise();
            setTimeout(() => {
              this.inviteRole = null;
            }, 5000);
          }
        }, {
          text: 'Join as ' + inviteRole,
          handler: async () => {
            await this.roomService.acceptRole(this.activeRoom._id).toPromise();
            await this.roomService.toggleAudio(true);
            setTimeout(() => {
              this.inviteRole = null;
            }, 5000);
          }
        }
      ]
    });

    await alert.present();
  }

}

@NgModule({
  declarations: [RoomFooterComponent],
  imports: [
    CommonModule,
    IonicModule,
    UserAvatarModule,
    RoomModalModule,
    SharedPipesModule
  ],
  exports: [RoomFooterComponent]
})
export class RoomFooterModule { }