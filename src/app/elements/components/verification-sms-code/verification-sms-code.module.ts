import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerificationSmsCodeComponent } from './verification-sms-code.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [VerificationSmsCodeComponent],
  exports: [VerificationSmsCodeComponent],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
  ]
})
export class VerificationSmsCodeModule { }
