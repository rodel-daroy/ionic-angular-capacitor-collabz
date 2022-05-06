import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser$ = new BehaviorSubject<any>(null);
  openProfile$ = new Subject<any>();

  private apiUrl = environment.api.url;

  onDestroy$ = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {}

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  getCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.currentUser$.value) {
        return resolve(this.currentUser$.value);
      }
      if (!this.storage.getLocal('token')) {
        return resolve(null);
      }
      this.http.get(this.apiUrl + '/users/userInfo').pipe(takeUntil(this.onDestroy$)).subscribe((user: any) => {
        this.currentUser$.next(user);
        return resolve(user);
      }, (err) => {
        return reject(err);
      });
    });
  }

  getPublicUserById(userId) {
    return this.http.get(this.apiUrl + '/users/' + userId + '/publicInfo');
  }

  refreshCurrentUser() {
    this.http.get(this.apiUrl + '/users/userInfo').pipe(takeUntil(this.onDestroy$)).subscribe((currentUser) => {
      this.currentUser$.next(currentUser);
    });
  }

  login(phoneNumber, recaptchaResponse) {
    return this.http.post(this.apiUrl + '/users/login', { phoneNumber, recaptchaResponse });
  }

  blockUser(blockUserId) {
    return this.http.put(this.apiUrl + '/users/block', { blockUserId }).pipe(tap(() => {
      const currentUser = this.currentUser$.value;
      if (currentUser) {
        if (!currentUser.blocks) {
          currentUser.blocks = [];
        }
        currentUser.blocks.push(blockUserId);
        this.currentUser$.next(currentUser);
      }
    }));
  }

  unblockUser(blockUserId) {
    return this.http.put(this.apiUrl + '/users/unblock', { blockUserId });
  }

  reportUser(reportUserId, reportComment?) {
    return this.http.put(this.apiUrl + '/users/report', { reportUserId, reportComment });
  }

  followUser(followUserId) {
    return this.http.put(this.apiUrl + '/users/follow', { followUserId });
  }

  unfollowUser(unfollowUserId) {
    return this.http.put(this.apiUrl + '/users/unfollow', { unfollowUserId });
  }

  updateImage(image) {
    return this.http.put(this.apiUrl + '/users/image', { image });
  }

  updateName(fullName) {
    return this.http.put(this.apiUrl + '/users/name', { fullName });
  }

  updateUserName(username) {
    return this.http.put(this.apiUrl + '/users/username', { username });
  }

  updateEmail(email) {
    return this.http.put(this.apiUrl + '/users/email', { email }).pipe(tap(() => {
      const currentUser = this.currentUser$.value;
      if (currentUser) {
        currentUser.email = email;
      }
      this.currentUser$.next(currentUser);
    }));
  }

  updateBio(bio) {
    return this.http.put(this.apiUrl + '/users/bio', { bio });
  }

  logout() {
    this.storage.clearLocal('token');
    this.currentUser$.next(null);
  }

  signup(phoneNumber, fullName, username, recaptchaResponse) {
    return this.http.post(this.apiUrl + '/users/signup', { phoneNumber, fullName, username, recaptchaResponse });
  }

  resendCode(userId) {
    return this.http.post(this.apiUrl + '/users/resendCode', { userId });
  }

  verifyCode(userId, verificationCode) {
    return this.http.post(this.apiUrl + '/users/verifyCode', { userId, verificationCode })
      .pipe(tap((result: any) => {
        const currentUser: any = result.currentUser;
        const token = result.token;
        if (token) {
          this.storage.setLocal('token', token);
          this.currentUser$.next(currentUser);
        }
      }));
  }

  getBlockedUsers() {
    return this.http.get(this.apiUrl + '/users/blocked');
  }

}
