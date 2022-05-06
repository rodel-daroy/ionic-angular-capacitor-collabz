import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, ModalController } from '@ionic/angular';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-verification-sms-code',
  templateUrl: './verification-sms-code.component.html',
  styleUrls: ['./verification-sms-code.component.scss'],
})
export class VerificationSmsCodeComponent implements OnInit {
  @Input() userId: string;
  @Input() isLogin = false;
  form: FormGroup;
  isCapturingEmail = false;

  constructor(
    private modalController: ModalController,
    private userService: UserService,
    private fb: FormBuilder,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      code: ['', Validators.required],
      email: ['' , Validators.email],
    });
  }

  hide(result?: any) {
    this.modalController.dismiss(result);
  }

  clearVerificationCode() {
    this.form.setValue({
      ...this.form.value,
      code: ''
    });
  }

  resendCode() {
    this.clearVerificationCode();
    this.userService.resendCode(this.userId).subscribe(() => {
      this.showToast('Your new verification code has been sent!');
    });
  }

  verify() {
    const code = this.form.value.code;

    this.userService.verifyCode(this.userId, code).subscribe(() => {
      if (this.isLogin) {
        this.hide({
          action: 'success'
        });
      } else {
        this.isCapturingEmail = true;
      }
    }, () => {
      this.clearVerificationCode();
    });
  }

  updateEmail() {
    if (!this.form.value.email || String(this.form.value.email).trim() === '') {
      return;
    }
    if (!(/^[^\s@]+@[^\s@]+$/.test(this.form.value.email))) {
      this.showToast('Please enter a valid email.');
      return;
    }
    this.userService.updateEmail(this.form.value.email).subscribe(() => {
      this.hide({
        action: 'success'
      });
    });
  }

  async showToast(message, header = '') {
    const toast = await this.toastController.create({
      header,
      message,
      buttons: [
        {
          text: 'Close',
        }
      ],
      duration: 5000
    });
    toast.present();
  }

}
