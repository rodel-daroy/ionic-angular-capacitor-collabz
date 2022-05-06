import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { GeneralService } from '../../services/general.service';

@Component({
  selector: 'app-phone-number-selector',
  templateUrl: './phone-number-selector.component.html',
  styleUrls: ['./phone-number-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PhoneNumberSelectorComponent,
      multi: true,
    },
  ]
})
export class PhoneNumberSelectorComponent implements OnInit {

  @Input() placeholder = '';

  @Output() phoneNumberChange = new EventEmitter();

  @ViewChild('selectorInput') selectorInput: ElementRef<HTMLInputElement>;

  defaultCountryCode$ = this.generalService.defaultCountryCode$;
  dialCode = '1';
  phoneNumberValue = '';

  constructor(
    private generalService: GeneralService,
  ) {}

  ngOnInit() {
    this.checkPrefix();
    this.setValue();
  }

  validateValue(event) {
    const regex: RegExp = new RegExp(/^[0-9]{1,}$/g);
    const specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowRight','ArrowLeft'];
    if (specialKeys.indexOf(event.key) !== -1) {
      return;
    } else {
      if (regex.test(event.key)) {
        return true;
      } else {
        return false;
      }
    }
  }

  onCountryChange(event) {
    this.dialCode = event.dialCode;
    this.setValue();
  }

  setValue() {
    if (!this.selectorInput || !this.selectorInput.nativeElement) {
      this.clearInput();
      return;
    }
    if (!this.selectorInput.nativeElement.value || this.selectorInput.nativeElement.value === '') {
      this.clearInput();
      return;
    }
    this.phoneNumberValue = `+${this.dialCode}${this.selectorInput.nativeElement.value}`;
    this.emitValue();
  }

  checkPrefix() {
    const prevValue = this.phoneNumberValue || '';
    if (prevValue && prevValue.indexOf('+') === 0) {
      return true;
    } else {
      this.phoneNumberValue = '+' + this.dialCode + (prevValue || '');
      this.emitValue();
    }
  }

  clearInput() {
    this.phoneNumberValue = '';
    this.emitValue();
  }

  emitValue() {
    this.phoneNumberChange.emit(this.phoneNumberValue);
  }

}
