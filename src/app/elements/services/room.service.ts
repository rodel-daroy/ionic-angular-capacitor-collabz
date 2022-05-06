import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, interval, of, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AgoraService } from './agora/agora.service';
import { GeneralService } from './general.service';
import { UserService } from './user.service';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment-mini';

@Injectable({
  providedIn: 'root'
})
export class RoomService implements OnDestroy {

  activeRoom$ = new BehaviorSubject<any>(null);
  openActiveRoom$ = new Subject<any>();
  activeUsers$ = new BehaviorSubject<any[]>([]);
  activeHosts$ = new BehaviorSubject<any[]>([]);
  activeGuests$ = new BehaviorSubject<any[]>([]);
  activeQueue$ = new BehaviorSubject<any[]>([]);
  activeAudience$ = new BehaviorSubject<any[]>([]);
  myUser$ = new BehaviorSubject<any>(null);
  volumeIndicators$ = new BehaviorSubject<any[]>([]);
  remoteUserTracks$ = new BehaviorSubject<any[]>([]);
  audioOn$ = new BehaviorSubject<boolean>(true);
  claps$ = new BehaviorSubject<number>(0);

  private apiUrl = environment.api.url;

  onDestroy$ = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private agoraService: AgoraService,
    private userService: UserService,
    private router: Router,
    private generalService: GeneralService,
    private firestore: AngularFirestore
  ) {

    this.activeRoom$.pipe(
      switchMap(activeRoom => {
        if (!activeRoom) {
          return of(null);
        }
        return this.firestore.collection('rooms')
          .doc(activeRoom._id).valueChanges();
      }),
      takeUntil(this.onDestroy$)
    ).subscribe((activeRoom: any) => {
      const claps = this.claps$.value;
      if (activeRoom && activeRoom.claps && claps !== activeRoom.claps) {
        this.claps$.next(activeRoom.claps);
      } else if (claps !== 0) {
        this.claps$.next(0);
      }
    });

    this.activeRoom$.pipe(
      switchMap(activeRoom => {
        if (!activeRoom) {
          this.remoteUserTracks$.next([]);
          return of([]);
        }
        return combineLatest([
          this.volumeIndicators$,
          this.firestore.collection('rooms')
          .doc(activeRoom._id)
          .collection('users')
          .valueChanges()
        ])
      }),
      takeUntil(this.onDestroy$)
    ).subscribe((result: any[]) => {
      if (!result || result.length !== 2) {
        return this.activeUsers$.next([]);
      }
      const volumeIndicators = result[0] as any[];
      const activeUsers = result[1] as any[];
      for (const volumeIndicator of volumeIndicators) {
        const activeUser = activeUsers.find(a => a.numberId == volumeIndicator.uid);
        if (activeUser) {
          activeUser.volume = volumeIndicator.level;
          if (volumeIndicator.level > 5) {
            if (!activeUser.isTalking) {
              activeUser.talkStart = moment().format();
            }
            activeUser.isTalking = true;
            activeUser.talkDuration = moment().diff(moment(activeUser.talkStart));
          } else {
            activeUser.isTalking = false;
            activeUser.talkDuration = 0;
          }
        }
      }
      for (const activeUser of activeUsers) {
        if (!volumeIndicators.find(v => activeUser.numberId == v.uid)) {
          activeUser.isTalking = false;
          activeUser.talkDuration = 0;
        }
      }
      activeUsers.sort((a, b) => {
        if (a.isTalking && b.isTalking) {
          return a.talkDuration - b.talkDuration;
        } else if (a.isTalking && !b.isTalking) {
          return -1;
        } else if (!a.isTalking && b.isTalking) {
          return 1;
        }
        return a.created > b.created ? -1 : 1;
      });

      const activeHosts = [];
      const activeGuests = [];
      const activeQueue = [];
      const activeAudience = [];
      let myUser = null;
      const currentUser = this.userService.currentUser$.value;
      for (const activeUser of activeUsers) {
        if (!myUser && currentUser && activeUser._id === currentUser._id) {
          myUser = activeUser;
        }
        switch (activeUser.role) {
          case 'host':
            activeHosts.push(activeUser);
            break;
          case 'guest':
            activeGuests.push(activeUser);
            break;
          case 'queue':
            activeQueue.push(activeUser);
            break;
          case 'audience':
            activeAudience.push(activeUser);
            break;
          default:
            break;
        }
      }

      this.myUser$.next(myUser);
      this.activeUsers$.next(activeUsers);
      this.activeHosts$.next(activeHosts);
      this.activeGuests$.next(activeGuests);
      this.activeQueue$.next(activeQueue);
      this.activeAudience$.next(activeAudience);

    });

    interval(1000).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      const activeRoom = this.activeRoom$.value;
      if (!activeRoom) {
        return;
      }
      const audioOn = this.audioOn$.value;
      if (audioOn && activeRoom.audioTrack) {
        activeRoom.audioTrack.microphoneUnMute();
      } else if (activeRoom.audioTrack) {
        activeRoom.audioTrack.microphoneMute();
      }

      if (audioOn && activeRoom.videoTrack) {
        activeRoom.videoTrack.microphoneUnMute();
      } else if (activeRoom.videoTrack) {
        activeRoom.videoTrack.microphoneMute();
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  createRoom(name) {
    return this.http.post(this.apiUrl + '/rooms', { name });
  }

  async sendHeartbeat() {
    const activeRoom = this.activeRoom$.value;
    if (!activeRoom) {
      return;
    }
    return await this.http.put(this.apiUrl + '/rooms/' + activeRoom._id + '/heartbeat', { }, {
      headers: this.generalService.setSkipErrorInterceptor(true)
    }).toPromise();
  }

  findRooms(limit?, skip?) {
    return this.http.get(this.apiUrl + '/rooms', { params: { limit, skip } });
  }

  getById(roomId) {
    return this.http.get(this.apiUrl + '/rooms/' + roomId);
  }

  getToken(roomId, isNewJoin) {
    return this.http.get(this.apiUrl + '/rooms/' + roomId + '/token', { params: { isNewJoin }});
  }

  changeUserRole(roomId, userId, role) {
    return this.http.put(this.apiUrl + '/rooms/' + roomId + '/user/' + userId + '/role', { role });
  }

  inviteRole(roomId, userId, role) {
    return this.http.put(this.apiUrl + '/rooms/' + roomId + '/user/' + userId + '/role/invite', { role });
  }

  acceptRole(roomId) {
    return this.http.put(this.apiUrl + '/rooms/' + roomId + '/role/accept', { });
  }

  declineRole(roomId) {
    return this.http.put(this.apiUrl + '/rooms/' + roomId + '/role/decline', { });
  }

  audioOn(roomId) {
    return this.http.put(this.apiUrl + '/rooms/' + roomId + '/audio/on', { }, {
      headers: this.generalService.setSkipErrorInterceptor(true)
    });
  }

  clap(roomId) {
    return this.http.put(this.apiUrl + '/rooms/' + roomId + '/clap', { }, {
      headers: this.generalService.setSkipErrorInterceptor(true)
    });
  }

  audioOff(roomId) {
    return this.http.put(this.apiUrl + '/rooms/' + roomId + '/audio/off', { }, {
      headers: this.generalService.setSkipErrorInterceptor(true)
    });
  }

  async leaveRoom() {
    await this.agoraService.leave();

    const activeRoom = this.activeRoom$.value;
    if (activeRoom) {
      await this.http.put(this.apiUrl + '/rooms/' + activeRoom._id + '/leave', { }, {
        headers: this.generalService.setSkipErrorInterceptor(true)
      }).toPromise();
    }
    if (activeRoom && activeRoom.audioTrack) {
      activeRoom.audioTrack.stop();
    }
    if (activeRoom && activeRoom.videoTrack) {
      activeRoom.videoTrack.stop();
    }
    this.activeRoom$.next(null);
  }

  async joinRoom(room, videoOn, isBroadcasting) {
    const currentUser = this.userService.currentUser$.value;
    if (!currentUser) {
      return this.router.navigate(['/profile']);
    }
    if (!room) {
      return;
    }

    const activeRoom = this.activeRoom$.value;
    if (activeRoom) {
      await this.agoraService.leave();
      if (activeRoom && activeRoom.audioTrack) {
        activeRoom.audioTrack.stop();
      }
      if (activeRoom && activeRoom.videoTrack) {
        activeRoom.videoTrack.stop();
      }
    }

    const res = (await this.getToken(room._id, true).toPromise()) as any;
    const token = res.token;

    if (isBroadcasting) {
      this.agoraService.initializeClient({
        AppID: '4410442dbb174ca18502628fa3f86592',
        Video: { codec: 'vp8', mode: 'live', role: 'host' }
      });
    } else {
      this.agoraService.initializeClient({
        AppID: '4410442dbb174ca18502628fa3f86592',
        Video: { codec: 'vp8', mode: 'live', role: 'audience' }
      });
      room.audioTrack = await this.agoraService.join(room._id, token, currentUser.numberId).Apply();
      this.activeRoom$.next(room);
      return;
    }

    let mediaDevicesInfos = await this.agoraService.getDevices();
    console.log(mediaDevicesInfos);
    let audioInput = mediaDevicesInfos.find(m => m.kind === 'audioinput');
    let videoInput = mediaDevicesInfos.find(m => m.kind === 'videoinput');
    if (videoOn && videoInput) {
      room.videoTrack = await this.agoraService.join(room._id, token, currentUser.numberId).WithCameraAndMicrophone(audioInput.deviceId, videoInput.deviceId).Apply();
      this.audioOn$.next(true);
    } else if (audioInput) {
      room.audioTrack = await this.agoraService.joinAudio(room._id, token, currentUser.numberId).WithMicrophone(audioInput.deviceId).Apply();
      this.audioOn$.next(true);
      this.activeRoom$.next(room);
    } else {
      alert('Unable to find an audio input!');
    }
  }

  toggleMicrophone() {
    const activeRoom = this.activeRoom$.value;
    if (!activeRoom) {
      return;
    }
    let audioOn = this.audioOn$.value;
    audioOn = !audioOn;
    if (audioOn) {
      this.audioOn(activeRoom._id).toPromise();
    } else {
      this.audioOff(activeRoom._id).toPromise();
    }
    this.audioOn$.next(audioOn);
  }

  async toggleAudio(turnAudioOn) {
    const activeRoom = this.activeRoom$.value;
    const currentUser = this.userService.currentUser$.value;
    if (!activeRoom || !currentUser) {
      return;
    }

    if (activeRoom.audioTrack) {
      if (!turnAudioOn) {
        activeRoom.audioTrack.stop();
        this.audioOn$.next(false);
      }
      return;
    }

    const res = (await this.getToken(activeRoom._id, false).toPromise()) as any;

    const token = res.token;

    await this.agoraService.leave();

    this.agoraService.initializeClient({
      AppID: '4410442dbb174ca18502628fa3f86592',
      Video: { codec: 'h264', mode: 'live', role: 'host' }
    });

    let mediaDevicesInfos = await this.agoraService.getDevices();
    console.log(mediaDevicesInfos);
    let audioInput = mediaDevicesInfos.find(m => m.kind === 'audioinput');
    if (audioInput) {
      activeRoom.audioTrack = await this.agoraService.joinAudio(activeRoom._id, token, currentUser.numberId).WithMicrophone(audioInput.deviceId).Apply();
      this.audioOn$.next(true);
      this.activeRoom$.next(activeRoom);
    } else {
      alert('Unable to find an audio input!');
    }
  }

  async toggleVideo(turnVideoOn, videoElementId) {
    const activeRoom = this.activeRoom$.value;
    const currentUser = this.userService.currentUser$.value;
    if (!activeRoom || !currentUser) {
      return;
    }

    try {
      const res = (await this.getToken(activeRoom._id, false).toPromise()) as any;
      const token = res.token;
      let mediaDevicesInfos = await this.agoraService.getDevices();
      console.log('toggleVideo=', mediaDevicesInfos);

      if (turnVideoOn) {
        let videoInput = mediaDevicesInfos.find(m => m.kind === 'videoinput');
        let audioInput = mediaDevicesInfos.find(m => m.kind === 'audioinput');
        if (videoInput) {
          if (activeRoom.audioTrack) {
            activeRoom.audioTrack.stop();
            activeRoom.audioTrack = null;
          }
          this.remoteUserTracks$.next([]);
          await this.agoraService.leave();
          if (audioInput) {
            activeRoom.videoTrack = await this.agoraService.join(activeRoom._id, token, currentUser.numberId).WithCameraAndMicrophone(audioInput.deviceId, videoInput.deviceId).Apply();
          } else {
            activeRoom.videoTrack = await this.agoraService.joinVideo(activeRoom._id, token, currentUser.numberId).WithCamera(videoInput.deviceId).Apply();
          }

          setTimeout(() => {
            const el = document.getElementById(videoElementId);
            if (el) {
              activeRoom.videoTrack.playVideo(videoElementId, { fit: 'cover' });
              activeRoom.videoOn = true;
            }
          }, 500);
        } else {
          alert('Unable to find a video input!');
        }
      } else {
        if (activeRoom.videoTrack) {
          activeRoom.videoTrack.cameraOff();
          activeRoom.videoOn = false;
          const el = document.getElementById(videoElementId);
          if (el) { // remove the child video elements that agora added
            while (el.firstChild) {
              el.removeChild(el.lastChild);
            }
          }
        }
      }

    } finally {
      this.activeRoom$.next(activeRoom);
    }
  }

  initializeListeners() {
    this.agoraService.onRemoteVolumeIndicator().pipe(takeUntil(this.onDestroy$)).subscribe(volumeIndicators => {
      this.volumeIndicators$.next(volumeIndicators);
    });

    this.agoraService.onRemoteUsersStatusChange().pipe(takeUntil(this.onDestroy$)).subscribe(async (state) => {

      console.log('state=', state);

      const remoteUserTracks = this.remoteUserTracks$.value;

      switch (state.connectionState) {

        case 'CONNECTED': {

          let existingUser = remoteUserTracks.find(u => u.numberId == state.user.uid.toString());
          if (existingUser) {
            existingUser = {
              numberId: state.user.uid.toString(),
              audioTrack: state.user.hasAudio ? state.user.audioTrack : null,
              videoTrack: state.user.hasVideo ? state.user.videoTrack : null
            };
          } else {
            remoteUserTracks.push({
              numberId: state.user.uid.toString(),
              audioTrack: state.user.hasAudio ? state.user.audioTrack : null,
              videoTrack: state.user.hasVideo ? state.user.videoTrack : null
            });
          }

          if (state.mediaType === "video") {
            // skip video here. wait until room modal is open
          } else if (state.mediaType === "audio") {
            state.user.audioTrack?.play();
          }

          break;
        }
        case 'DISCONNECTED': {

          const index = remoteUserTracks.findIndex(u => u.numberId == state.user.uid.toString());
          if (index >= 0) {
            remoteUserTracks.splice(index, 1);
          }

          break;
        }

      }

      this.remoteUserTracks$.next(remoteUserTracks);
    });
  }
}
