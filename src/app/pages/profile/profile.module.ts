import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { EditProfileModule } from 'src/app/elements/components/edit-profile/edit-profile.module';
import { VerificationSmsCodeModule } from 'src/app/elements/components/verification-sms-code/verification-sms-code.module';
import { PhoneNumberSelectorModule } from 'src/app/elements/components/phone-number-selector/phone-number-selector.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    EditProfileModule,
    VerificationSmsCodeModule,
    PhoneNumberSelectorModule,
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
