import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonRefresher, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FollowService } from '../../services/follow.service';
import { UserService } from '../../services/user.service';
import { UserAvatarModule } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'app-follows',
  templateUrl: './follows.component.html',
  styleUrls: ['./follows.component.scss'],
})
export class FollowsComponent implements OnInit, OnDestroy {

  @ViewChild(IonRefresher, { static: false}) refresher: IonRefresher;
  @Input() user: any;
  @Input() mode: 'followers' | 'following' = 'followers';
  users: any[] = [];
  LIMIT = 30;
  currentUser: any;
  hasMore = true;
  loaded = false;

  onDestroy$ = new Subject<boolean>();

  constructor(
    private modalController: ModalController,
    private userService: UserService,
    private followService: FollowService
  ) { }

  ngOnInit() {
    this.userService.currentUser$.pipe(takeUntil(this.onDestroy$)).subscribe(currentUser => {
      this.currentUser = currentUser;
    });

    this.refreshFollows();
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  ionViewDidEnter() {
    this.refresher.disabled = false;
  }

  ionViewWillLeave() {
    this.refresher.disabled = true;
  }

  hide() {
    this.modalController.dismiss();
  }

  refreshFollows(event?) {
    this.users = [];
    this.loadMore(event);
  }

  async loadMore(event?) {
    if (!this.user) {
      return
    }
    try {
      if (this.mode === 'followers') {
        const follows = (await this.followService.findFollowers(this.user._id, this.LIMIT, this.users.length).toPromise()) as any[];
        this.hasMore = follows.length === this.LIMIT;
        const newUsers = follows.filter(u => u.follower && u.follower.username).map(u => u.follower);
        this.users = this.users.concat(newUsers);
      } else {
        const follows = (await this.followService.findFollowing(this.user._id, this.LIMIT, this.users.length).toPromise()) as any[];
        this.hasMore = follows.length === this.LIMIT;
        const newUsers = follows.filter(u => u.followee && u.followee.username).map(u => u.followee);
        this.users = this.users.concat(newUsers);
      }
      this.loaded = true;
    } finally {
      if (event) {
        event.target.complete();
      }
    }
  }

  followUser(user) {
    const currentUser = this.userService.currentUser$.value;
    if (!currentUser) {
      return;
    }
    this.userService.followUser(user._id).toPromise();
    user.isFollowing = true;
    if (!currentUser.followingUsers) {
      currentUser.followingUsers = [];
    }
    currentUser.followingUsers.push(user._id);
    this.userService.currentUser$.next(currentUser);
  }

  unfollowUser(user) {
    const currentUser = this.userService.currentUser$.value;
    if (!currentUser) {
      return;
    }
    this.userService.unfollowUser(user._id).toPromise();
    user.isFollowing = false;
    if (!currentUser.followingUsers) {
      currentUser.followingUsers = [];
    }
    currentUser.followingUsers = currentUser.followingUsers.filter(u => u !== user._id);
    this.userService.currentUser$.next(currentUser);
  }

  openPublicProfile(user) {
    this.userService.openProfile$.next(user);
  }

}

@NgModule({
  declarations: [FollowsComponent],
  imports: [
    CommonModule,
    IonicModule,
    UserAvatarModule
  ],
  exports: [FollowsComponent]
})
export class FollowsModule { }
