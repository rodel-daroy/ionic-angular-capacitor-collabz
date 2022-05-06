import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserService } from 'src/app/elements/services/user.service';
import { EditProfileFieldsComponent } from 'src/app/elements/components/edit-profile-fields/edit-profile-fields.component';
import { SettingsMenuComponent } from 'src/app/elements/components/settings-menu/settings-menu.component';
import { BlockListComponent } from '../block-list/block-list.component';


@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {

  @Input() user: any;

  @Output() fieldChange = new EventEmitter();

  constructor(
    private modalController: ModalController,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.user = { ...user };
    });
  }

  edit(fields: string[]) {
    this.presentModal(fields);
  }

  logout() {
    this.fieldChange.emit({
      action: 'logout',
    });
  }

  async presentModal(fields: string[]) {
    const modal = await this.modalController.create({
      cssClass: 'room-modal',
      component: EditProfileFieldsComponent,
      componentProps: {
        user: this.user,
        fields,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.action === 'updated') {
      this.user = {
        ...this.user,
        ...data.user,
      };
    }
  }

  async openSettingsMenu() {
    const modal = await this.modalController.create({
      component: SettingsMenuComponent,
      cssClass: 'room-modal',
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.action === 'logout') {
      this.logout();
    } else if (data && data.action === 'edit-email') {
      this.presentModal(['email']);
    } else if (data && data.action === 'edit-block-list') {
      this.showBlockListModal();
    }
  }

  async showBlockListModal() {
    const modal = await this.modalController.create({
      cssClass: 'room-modal',
      component: BlockListComponent,
      componentProps: {
        user: this.user,
      },
    });
    await modal.present();
  }

}
