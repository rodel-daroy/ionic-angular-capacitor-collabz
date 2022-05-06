import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsMenuComponent } from './settings-menu.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [SettingsMenuComponent],
  exports: [SettingsMenuComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
  ]
})
export class SettingsMenuModule { }
