import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnDestroy, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { RoomService } from '../../services/room.service';
import { UserService } from '../../services/user.service';
import { FollowsComponent, FollowsModule } from '../follows/follows.component';
import { UserAvatarModule } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss'],
})
export class PublicProfileComponent implements OnInit, OnDestroy {

  @Input() user: any;
  @Input() room: any;
  myUser$ = this.roomService.myUser$; // for determining role in active room
  activeRoom$ = this.roomService.activeRoom$;
  currentUser$ = this.userService.currentUser$;
  submitted = false;
  isFollowing = false;

  onDestroy$ = new Subject<boolean>();

  constructor(
    private modalController: ModalController,
    private roomService: RoomService,
    private userService: UserService
  ) { }

  ngOnInit() {
    const currentUser = this.userService.currentUser$.value;
    if (this.user && currentUser && currentUser.followingUsers && currentUser.followingUsers.indexOf(this.user._id) >= 0) {
      this.isFollowing = true;
    } else {
      this.isFollowing = false;
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  hide() {
    this.modalController.dismiss();
  }

  followUser() {
    const currentUser = this.userService.currentUser$.value;
    if (!currentUser) {
      return;
    }
    this.userService.followUser(this.user._id).toPromise();
    this.user.followers++;
    this.isFollowing = true;
    if (!currentUser.followingUsers) {
      currentUser.followingUsers = [];
    }
    currentUser.followingUsers.push(this.user._id);
    this.userService.currentUser$.next(currentUser);
  }

  unfollowUser() {
    const currentUser = this.userService.currentUser$.value;
    if (!currentUser) {
      return;
    }
    this.userService.unfollowUser(this.user._id).toPromise();
    let newFollowers = this.user.followers - 1;
    if (newFollowers < 0) {
      newFollowers = 0;
    }
    this.user.followers = newFollowers;
    this.isFollowing = false;
    if (!currentUser.followingUsers) {
      currentUser.followingUsers = [];
    }
    currentUser.followingUsers = currentUser.followingUsers.filter(u => u !== this.user._id);
    this.userService.currentUser$.next(currentUser);
  }

  async changeUserRole(role) {
    if (this.submitted || !this.room || !this.user) {
      return;
    }
    this.submitted = true;

    try {
      await this.roomService.changeUserRole(this.room._id, this.user._id, role).toPromise();

      this.submitted = false;
      this.hide();
    } catch(err) {
      console.log(err);
      this.submitted = false;
    }
  }

  async inviteUserRole(role) {
    if (this.submitted || !this.room || !this.user) {
      return;
    }
    this.submitted = true;

    try {
      await this.roomService.inviteRole(this.room._id, this.user._id, role).toPromise();

      this.submitted = false;
      this.hide();
    } catch(err) {
      console.log(err);
      this.submitted = false;
    }
  }

  async openFollowers() {
    const modal = await this.modalController.create({
      component: FollowsComponent,
      componentProps: {
        user: this.user,
        mode: 'followers'
      }
    });
    return await modal.present();
  }

  async openFollowing() {
    const modal = await this.modalController.create({
      component: FollowsComponent,
      componentProps: {
        user: this.user,
        mode: 'following'
      }
    });
    return await modal.present();
  }

}

@NgModule({
  declarations: [PublicProfileComponent],
  imports: [
    CommonModule,
    IonicModule,
    UserAvatarModule,
    FollowsModule
  ],
  exports: [PublicProfileComponent]
})
export class PublicProfileModule { }
