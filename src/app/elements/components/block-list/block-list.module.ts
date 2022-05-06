import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockListComponent } from './block-list.component';
import { IonicModule } from '@ionic/angular';
import { UserAvatarModule } from '../user-avatar/user-avatar.component';


@NgModule({
  declarations: [BlockListComponent],
  exports: [BlockListComponent],
  imports: [
    CommonModule,
    IonicModule,
    UserAvatarModule,
  ]
})
export class BlockListModule { }
