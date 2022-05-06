import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VerificationSmsCodeComponent } from 'src/app/elements/components/verification-sms-code/verification-sms-code.component';
import { GeneralService } from 'src/app/elements/services/general.service';
import { UserService } from 'src/app/elements/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  currentUser: any;
  isLogin = false;
  form: FormGroup;
  isAndroid = false;
  submitted = false;
  dialCode = '+1';

  onDestroy$ = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    private toastController: ToastController,
    private generalService: GeneralService,
    private platform: Platform
  ) {
    this.isAndroid = !this.platform.is('ios');

    this.form = this.fb.group({
      phoneNumber: ['', Validators.required],
      username: '',
      fullName: ''
    });
  }

  ngOnInit() {
    this.userService.currentUser$.pipe(takeUntil(this.onDestroy$)).subscribe(currentUser => {
      this.currentUser = currentUser;
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  async login(formDirective) {
    if (this.submitted) {
      return;
    }
    if (!this.form.value.phoneNumber) {
      this.showToast('Please fill out all fields!');
      return;
    }
    this.submitted = true;

    this.userService
      .login(this.form.value.phoneNumber, '')
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(async (result: any) => {
        this.submitted = false;
        this.showVerificationSmsCode(result.userId);
      }, async () => {
        const phoneNumber = this.form.value.phoneNumber;
        this.form.reset();
        formDirective.resetForm();
        this.form.patchValue({ phoneNumber });
        this.submitted = false;
      });
  }

  async signup(formDirective) {
    if (this.submitted) {
      return;
    }
    if (!this.form.value.phoneNumber || !this.form.value.fullName || !this.form.value.username) {
      this.showToast('Please fill out all fields!');
      return;
    }
    if (!(/^\w+$/.test(this.form.value.username))) {
      this.showToast('Please just use letters, numbers, or underscores in your username.');
      return;
    }
    this.submitted = true;

    this.userService
    .signup(this.form.value.phoneNumber, this.form.value.fullName, this.form.value.username, '')
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(async (result: any) => {
      this.submitted = false;
      this.showVerificationSmsCode(result.userId);
    }, async () => {
      const fullName = this.form.value.fullName;
      const phoneNumber = this.form.value.phoneNumber;
      const username = this.form.value.username;
      this.form.reset();
      formDirective.resetForm();
      this.form.patchValue({ fullName, phoneNumber, username });
      this.submitted = false;
    });
  }

  async redirectAfterLogin() {
    await this.userService.getCurrentUser();
    let redirectUrl = this.route.snapshot.queryParams.redirect;
    redirectUrl = decodeURIComponent(redirectUrl);
    if (redirectUrl && redirectUrl !== '/profile') {
      this.router.navigateByUrl(redirectUrl);
    } else {
      this.router.navigate(['/']);
    }
  }

  logout() {
    this.userService.logout();
  }

  changeProfile(event) {
    if (event.action === 'logout') {
      this.logout();
    }
  }

  async showVerificationSmsCode(userId) {
    const modal = await this.modalController.create({
      component: VerificationSmsCodeComponent,
      componentProps: {
        userId,
        isLogin: this.isLogin,
      },
      cssClass: 'room-modal',
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.action === 'success') {
      this.form.reset();
      this.redirectAfterLogin();
    }
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

  setPhoneNumber(phoneNumber) {
    this.form.setValue({
      ...this.form.value,
      phoneNumber,
    });
  }

}
