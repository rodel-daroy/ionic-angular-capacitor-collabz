import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private apiUrl = environment.api.url;

  constructor(
    private http: HttpClient
  ) { }

  getSignedUrl(queryParams) {
    return this.http.get(this.apiUrl + '/files/signedUrl', {
      params: {
        ...queryParams
      }
    });
  }

  uploadFileToS3(uploadUrl, file) {
    return this.http.put(uploadUrl, file, {
      headers: {
        'skip-authorization': '',
        'x-amz-acl': 'public-read',
        ContentType: file.type,
      }
    });
  }
}
