import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditProfileComponent } from './edit-profile.component';
import { IonicModule } from '@ionic/angular';
import { UserAvatarModule } from 'src/app/elements/components/user-avatar/user-avatar.component';
import { EditProfileFieldsModule } from '../edit-profile-fields/edit-profile-fields.module';
import { SettingsMenuModule } from '../settings-menu/settings-menu.module';
import { BlockListModule } from '../block-list/block-list.module';

@NgModule({
  declarations: [
    EditProfileComponent
  ],
  exports: [
    EditProfileComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    UserAvatarModule,
    EditProfileFieldsModule,
    SettingsMenuModule,
    BlockListModule,
  ]
})
export class EditProfileModule { }
