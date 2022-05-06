import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgModule, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActionSheetController, IonicModule, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommentService } from '../../services/comment.service';
import { LoadingService } from '../../services/loading.service';
import { RoomService } from '../../services/room.service';
import { UserService } from '../../services/user.service';
import { PublicProfileComponent, PublicProfileModule } from '../public-profile/public-profile.component';
import { UserAvatarModule } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'app-room-modal',
  templateUrl: './room-modal.component.html',
  styleUrls: ['./room-modal.component.scss'],
})
export class RoomModalComponent implements OnInit, OnDestroy {

  @ViewChild('clapSpawn') clapSpawn: ElementRef;
  @ViewChild('topBar') topBar: ElementRef<HTMLDivElement>;
  @ViewChild('commentsStream') commentsStream: ElementRef<HTMLDivElement>;

  activeRoom: any;
  myUser$ = this.roomService.myUser$;
  remoteUserTracks: any[] = [];
  activeHosts: any[] = [];
  activeGuests: any[] = [];
  activeQueue$ = this.roomService.activeQueue$;
  activeAudience$ = this.roomService.activeAudience$;
  audioOn$ = this.roomService.audioOn$;
  currentUser: any;
  loadingVideo = false;
  submittedComment = false;
  newComment = '';
  activeComments$ = this.commentService.activeComments$;
  showComments = true;
  claps = 0;
  videoElement: any;
  isVideoBig = false;
  loadingMutex = false;

  commentsMaxOffset = window.innerHeight / 2;

  onDestroy$ = new Subject<boolean>();

  commentsPosY = 0;

  constructor(
    private modalController: ModalController,
    private roomService: RoomService,
    private userService: UserService,
    private loading: LoadingService,
    private commentService: CommentService,
    private actionSheetController: ActionSheetController
  ) { }

  ngOnInit() {
    this.activeComments$.subscribe((comments) => {
      if (comments?.length) {
        setTimeout(() => {
          const options: ScrollToOptions = {
            top: this.commentsStream.nativeElement.scrollHeight,
          };
          this.commentsStream.nativeElement.scrollTo(options);
        }, 100);
      }
    })
    this.userService.currentUser$.pipe(takeUntil(this.onDestroy$)).subscribe(currentUser => {
      this.currentUser = currentUser;
    });

    this.roomService.activeRoom$.pipe(takeUntil(this.onDestroy$)).subscribe(activeRoom => {
      if (this.activeRoom && !activeRoom) {
        return this.hide();
      }
      
      this.activeRoom = activeRoom;
    });

    // need to update local array manually in order to not cut off video elements
    this.roomService.activeHosts$.pipe(takeUntil(this.onDestroy$)).subscribe(activeHosts => {
      for (const activeHost of activeHosts) {
        if (!this.activeHosts.find(a => a._id === activeHost._id)) {
          this.activeHosts.push(activeHost);
        }
      }

      for (let i = 0; i < this.activeHosts.length; i++) {
        const activeHost = activeHosts.find(a => a._id === this.activeHosts[i]._id);
        if (activeHost) {
          this.activeHosts[i].isTalking = activeHost.isTalking;
          this.activeHosts[i].talkStart = activeHost.talkStart;
          this.activeHosts[i].talkDuration = activeHost.talkDuration;
          this.activeHosts[i].audioOn = activeHost.audioOn;
        } else {
          this.activeHosts.splice(i, 1);
        }
      }
      this.startVideoTracks();
    });

    this.roomService.activeGuests$.pipe(takeUntil(this.onDestroy$)).subscribe(activeGuests => {
      for (const activeGuest of activeGuests) {
        if (!this.activeGuests.find(a => a._id === activeGuest._id)) {
          this.activeGuests.push(activeGuest);
        }
      }

      for (let i = 0; i < this.activeGuests.length; i++) {
        const activeGuest = activeGuests.find(a => a._id === this.activeGuests[i]._id);
        if (activeGuest) {
          this.activeGuests[i].isTalking = activeGuest.isTalking;
          this.activeGuests[i].talkStart = activeGuest.talkStart;
          this.activeGuests[i].talkDuration = activeGuest.talkDuration;
          this.activeGuests[i].audioOn = activeGuest.audioOn;
        } else {
          this.activeGuests.splice(i, 1);
        }
      }
      this.startVideoTracks();
    });

    this.roomService.remoteUserTracks$.pipe(takeUntil(this.onDestroy$)).subscribe(remoteUserTracks => {
      this.remoteUserTracks = remoteUserTracks;
      this.startVideoTracks();
    });

    this.roomService.claps$.pipe(takeUntil(this.onDestroy$)).subscribe(claps => {
      if (this.claps === 0 && claps > 0) {
        this.claps = claps;
      } else if (this.claps > 0 && claps > 0) {
        this.claps = claps;

        setTimeout(() => {
          const el = document.createElement('div') as HTMLElement;
          el.style.position = 'absolute';
          el.style.bottom = '0';
          el.style.right = (Math.floor(30 + Math.random() * 30)) + 'px';
          el.style.transition = 'bottom 2s ease-in';
          el.style.fontSize = '20px';
          el.style.zIndex = '8';
          el.innerText = '👏🏽';
          (this.clapSpawn.nativeElement as HTMLElement).appendChild(el);
          setTimeout(() => {
            el.style.bottom = '400px';
            setTimeout(() => {
              el.remove();
            }, 2000);
          }, 500);
        });
      } else {
        this.claps = 0;
      }
    });
  }

  startVideoTracks() {
    for (const remoteUserTrack of this.remoteUserTracks) {
      if (remoteUserTrack.videoTrack) {
        setTimeout(() => {
          const el = document.getElementById('videoframe-' + remoteUserTrack.numberId);
          if (el && !remoteUserTrack.videoTrack.isPlaying) {
            remoteUserTrack.videoTrack.play('videoframe-' + remoteUserTrack.numberId, { fit: 'cover' });
            remoteUserTrack.videoTrack.isPlaying = true;
          }
        }, 500);
      }
    }
  }

  ngOnDestroy() {
    this.toggleVideo(false);
    for (const remoteUserTrack of this.remoteUserTracks) {
      if (remoteUserTrack.videoTrack) {
        remoteUserTrack.videoTrack.isPlaying = false;
      }
    }
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  hide() {
    this.modalController.dismiss();
  }

  async toggleVideo(turnVideoOn) {
    if (this.loadingVideo || !this.currentUser) {
      return;
    }
    this.loadingVideo = true;

    try {
      await this.roomService.toggleVideo(turnVideoOn, 'videoframe-' + this.currentUser.numberId);
      setTimeout(() => {
        this.startVideoTracks();
      }, 500);
    } finally {
      this.loadingVideo = false;
    }
  }

  toggleMicrophone() {
    this.roomService.toggleMicrophone();
  }

  clap() {
    if (!this.activeRoom) {
      return;
    }
    this.roomService.clap(this.activeRoom._id).toPromise();
  }

  async leaveRoom() {
    if (this.loadingMutex) {
      return;
    }
    this.loadingMutex = true;
    await this.loading.startLoading();

    try {
      await this.roomService.leaveRoom();
    } finally {
      await this.loading.stopLoading();
      this.loadingMutex = false;
    }
  }

  async openPublicProfile(user) {

    // if they have a video playing, zoom into it, instead of opening their profile
    const el = document.getElementById('videoframe-' + user.numberId);
    if (el && el.firstChild) {
      const roomLayout = document.getElementsByClassName('room-layout');
      if (roomLayout && roomLayout[0]) {
        this.videoElement = el.firstChild;
        this.videoElement.style.position = 'absolute';
        this.videoElement.style.width = '100%';
        this.videoElement.style.height = '90%';
        this.videoElement.style.top = '4px';
        this.videoElement.style.left = '0';
        this.videoElement.style.zIndex = '7';
        (this.videoElement as HTMLElement).onclick = () => {
          this.videoElement.style.position = '';
          this.videoElement.style.width = '';
          this.videoElement.style.height = '';
          this.videoElement.style.top = '';
          this.videoElement.style.left = '';
          this.videoElement.style.zIndex = '';
          el.appendChild(this.videoElement);
          this.isVideoBig = false;
        }
        roomLayout[0].appendChild(el.firstChild);
        this.isVideoBig = true;
        return;
      }
    }

    const modal = await this.modalController.create({
      component: PublicProfileComponent,
      cssClass: 'modal-full-height-public-profile',
      componentProps: {
        user,
        room: this.activeRoom
      }
    });
    return await modal.present();
  }

  openCommentUser(comment) {
    const activeUsers = this.roomService.activeUsers$.value;
    let role = '';
    if (activeUsers) {
      const activeUser = activeUsers.find(a => a._id === comment.userId);
      if (activeUser) {
        role = activeUser.role;
      }
    }
    return this.openPublicProfile({
      _id: comment.userId,
      username: comment.userUsername,
      fullName: comment.userFullName,
      image: comment.userImage,
      bio: comment.userBio,
      created: comment.userCreated,
      role
    });
  }

  async createComment() {
    if (this.newComment == '' || this.submittedComment || !this.activeRoom) {
      return;
    }
    this.submittedComment = true;

    try {
      await this.commentService.createComment(this.activeRoom._id, this.newComment).toPromise();
      this.newComment = '';
    } finally {
      this.submittedComment = false;
    }
  }

  async openRoomMenu() {
    const actionSheet = await this.actionSheetController.create({
      buttons: [
        {
          text: (this.showComments ? 'Hide' : 'Show') + ' Comments',
          handler: () => {
            this.showComments = !this.showComments
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async openCommentMenu(comment) {
    const actionSheet = await this.actionSheetController.create({
      buttons: [
        {
          text: 'Block ' + comment.userFullName,
          handler: () => {
            this.userService.blockUser(comment.userId).toPromise();
          }
        },
        {
          text: 'Report ' + comment.userFullName,
          handler: () => {
            this.userService.reportUser(comment.userId, comment.comment).toPromise();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

}

@NgModule({
  declarations: [RoomModalComponent],
  imports: [
    CommonModule,
    IonicModule,
    UserAvatarModule,
    FormsModule,
    PublicProfileModule
  ],
  exports: [RoomModalComponent]
})
export class RoomModalModule { }