import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditProfileFieldsComponent } from './edit-profile-fields.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserAvatarModule } from 'src/app/elements/components/user-avatar/user-avatar.component';


@NgModule({
  declarations: [EditProfileFieldsComponent],
  exports: [EditProfileFieldsComponent],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    UserAvatarModule,
  ],
})
export class EditProfileFieldsModule { }
