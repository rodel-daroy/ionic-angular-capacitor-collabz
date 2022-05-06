import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FileService } from 'src/app/elements/services/file.service';
import { UserService } from 'src/app/elements/services/user.service';


@Component({
  selector: 'app-edit-profile-fields',
  templateUrl: './edit-profile-fields.component.html',
  styleUrls: ['./edit-profile-fields.component.scss'],
})
export class EditProfileFieldsComponent implements OnInit {

  @Input() user: any;
  @Input() fields: string[];

  @ViewChild('fileUpload') fileUpload: ElementRef<HTMLInputElement>;

  haveFields = false;
  newImage = null;
  plainTextImage: any;
  loading = false;
  isNewImage = true;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private modalController: ModalController,
    private fileService: FileService,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      fullName: [this.user.fullName || ''],
      username: [this.user.username || ''],
      bio: [this.user.bio || ''],
      email: [this.user.email || ''],
    });

    if (this.fields.indexOf('fullName') >= 0) {
      this.form.controls.fullName.setValidators([Validators.required]);
      this.haveFields = true;
    }

    if (this.fields.indexOf('username') >= 0) {
      this.form.controls.username.setValidators([Validators.required]);
      this.haveFields = true;
    }

    if (this.fields.indexOf('email') >= 0) {
      this.form.controls.email.setValidators([Validators.required, Validators.email]);
      this.haveFields = true;
    }

    if (this.fields.indexOf('bio') >= 0) {
      this.form.controls.bio.setValidators([Validators.required]);
      this.haveFields = true;
    }

    if (this.fields.indexOf('image') >= 0) {
      this.haveFields = true;
      this.isNewImage = false;
      this.plainTextImage = this.user.image;
    }
  }

  async update() {
    let request;

    if (this.fields.indexOf('fullName') >= 0) {
      request = this.userService.updateName(this.form.value.fullName);
      this.loading = true;
    }

    if (this.fields.indexOf('username') >= 0) {
      request = this.userService.updateUserName(this.form.value.username);
      this.loading = true;
    }

    if (this.fields.indexOf('email') >= 0) {
      request = this.userService.updateEmail(this.form.value.email);
      this.loading = true;
    }

    if (this.fields.indexOf('bio') >= 0) {
      request = this.userService.updateBio(this.form.value.bio);
      this.loading = true;
    }

    if (this.fields.indexOf('image') >= 0) {
      this.loading = true;

      if (this.plainTextImage) {
        request = this.userService.updateImage(this.plainTextImage);
        this.loading = false;
      } else {
        this.loading = false;
        return;
      }
    }

    if (request) {
      request.subscribe(async () => {
        this.loading = false;
        const userUpdated = await this.userService.getPublicUserById(this.user._id).toPromise();
        this.modalController.dismiss({
          action: 'updated',
          user: userUpdated,
        });
      }, async () => {
        this.loading = false;
      });
    }
  }

  hide() {
    this.modalController.dismiss({
      action: 'cancel',
    });
  }

  openImageSelector(event) {
    event.stopPropagation();
    event.preventDefault();
    this.fileUpload.nativeElement.click();
  }

  async fileNameChanged(event) {
    this.loading = true;
    if (!event || !event.target || !event.target.files) {
      this.loading = false;
      return;
    }

    if (event && event.target && event.target.files && event.target.files.length > 0) {
      this.newImage = event.target.files[0];
      this.isNewImage = true;
      const imageUrl = await this.uploadFile(this.newImage);
      this.plainTextImage = imageUrl;
      setTimeout(() => {
        this.loading = false;
      }, 400);
    } else {
      this.loading = false;
    }
  }

  async uploadFile(file) {
    if (!file) {
      this.loading = false;
      return;
    }
    const {name, type} = file;
    const contentType = type;

    try {
      const result = await this.fileService.getSignedUrl({name, contentType}).toPromise() as any;
      const signedUrl = result.url;
      if (!signedUrl) {
        throw new Error('Missing signed url');
      }
      await this.fileService.uploadFileToS3(signedUrl, file).toPromise();
      return result.publicUrl;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

}
