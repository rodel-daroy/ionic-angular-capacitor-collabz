import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { GeneralService } from './general.service';
import { RoomService } from './room.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService implements OnDestroy{

  activeComments$ = new BehaviorSubject([]);

  private apiUrl = environment.api.url;

  onDestroy$ = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private generalService: GeneralService,
    private roomService: RoomService,
    private firestore: AngularFirestore
  ) {
    this.roomService.activeRoom$.pipe(
      switchMap(activeRoom => {
        if (!activeRoom) {
          return of([]);
        }
        return this.firestore.collection('rooms')
          .doc(activeRoom._id)
          .collection('comments')
          .valueChanges();
      }),
      takeUntil(this.onDestroy$)
    ).subscribe((comments: any[]) => {
      this.activeComments$.next(comments);
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  createComment(roomId, comment) {
    return this.http.post(this.apiUrl + '/comments', { roomId, comment }, {
      headers: this.generalService.setSkipErrorInterceptor(true)
    });
  }
}
