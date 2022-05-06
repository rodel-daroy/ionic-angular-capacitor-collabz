import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.scss'],
})
export class SettingsMenuComponent implements OnInit {

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

  hide() {
    this.modalController.dismiss({
      action: 'cancel',
    });
  }

  onClick(action) {
    this.modalController.dismiss({
      action,
    });
  }

}
