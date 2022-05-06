import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonRefresher, ModalController } from '@ionic/angular';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.scss'],
})
export class BlockListComponent implements OnInit {
  @ViewChild(IonRefresher, { static: false}) refresher: IonRefresher;
  blockedUsers: any[] = [];

  constructor(
    private modalController: ModalController,
    private userService: UserService,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.refreshBlockedUsers();
    });
  }

  ionViewDidEnter() {
    this.refresher.disabled = false;
  }

  ionViewWillLeave() {
    this.refresher.disabled = true;
  }

  async refreshBlockedUsers(event?) {
    try {
      const blockedUsers = (await this.userService.getBlockedUsers().toPromise()) as any[];
      for (const user of blockedUsers) {
        user.isBlocked = true;
      }
      this.blockedUsers = blockedUsers;
    } finally {
      if (event) {
        event.target.complete();
      }
    }
  }

  async confirmUnblockUser(userId) {
    const alert = await this.alertController.create({
      header: 'Confirm to unblock',
      message: 'Are you sure to unblock this user?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          handler: () => {
            this.unblockUser(userId);
          },
        },
      ]
    });
    alert.present();
  }

  async unblockUser(user) {
    await this.userService.unblockUser(user._id).toPromise();
    user.isBlocked = false;
  }

  async blockUser(user) {
    await this.userService.blockUser(user._id).toPromise();
    user.isBlocked = true;
  }

  hide(result?) {
    this.modalController.dismiss(result);
  }

}
