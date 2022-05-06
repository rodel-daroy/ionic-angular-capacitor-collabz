import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FollowService {

  private apiUrl = environment.api.url;

  constructor(
    private http: HttpClient
  ) { }

  findFollowers(userId, limit?, skip?) {
    return this.http.get(this.apiUrl + '/follows/' + userId + '/followers', { params: { limit, skip } });
  }

  findFollowing(userId, limit?, skip?) {
    return this.http.get(this.apiUrl + '/follows/' + userId + '/following', { params: { limit, skip } });
  }
}
