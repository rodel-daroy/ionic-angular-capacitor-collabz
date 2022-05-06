import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
})
export class UserAvatarComponent implements OnInit, OnChanges {

  @Input('userImage') userImage: string = null;
  @Input('userFullName') userFullName: string = null;
  @Input('fontSize') fontSize = '15px';
  @Input('minWidth') minWidth;

  userInitialA = '';
  userInitialB = '';
  imageStyles = {};

  constructor() { }

  ngOnInit() {
    this.fitImageSize();
    if (this.minWidth) {
      this.imageStyles = {'min-width': this.minWidth};
    }
    this.setInitials();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.userImage && changes.userImage.currentValue) {
      this.userImage = changes.userImage.currentValue;
      this.fitImageSize();
    }
    this.userFullName = (changes.userFullName && changes.userFullName.currentValue) ? changes.userFullName.currentValue : '';  
    this.setInitials();
  }

  setInitials() {
    if (this.userFullName) {
      const tokens = this.userFullName.split(' ');
      if (tokens.length > 0) {
        this.userInitialA = tokens[0].substring(0, 1).toUpperCase();
        if (tokens.length > 1) {
          this.userInitialB = tokens[1].substring(0, 1).toUpperCase();
        }
      }
    } else {
      this.userInitialA = '';
      this.userInitialB = '';
    }
  }

  fitImageSize() {
    if (this.userImage && this.userImage.indexOf('imgix') >= 0) {
      const tempUrl = this.userImage.split('?');
      const newImgUrl = `${tempUrl[0]}?crop=faces&fit=crop&h=200&w=200${tempUrl[1] ? '&' + tempUrl[1] : ''}`;
      this.userImage = newImgUrl;
    }
  }

}

@NgModule({
  declarations: [UserAvatarComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [UserAvatarComponent]
})
export class UserAvatarModule { }
