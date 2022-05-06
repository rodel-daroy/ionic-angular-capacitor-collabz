import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneNumberSelectorComponent } from './phone-number-selector.component';
import { IonicModule } from '@ionic/angular';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [PhoneNumberSelectorComponent],
  exports: [PhoneNumberSelectorComponent],
  imports: [
    CommonModule,
    IonicModule,
    Ng2TelInputModule,
    ReactiveFormsModule,
  ]
})
export class PhoneNumberSelectorModule { }
