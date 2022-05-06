import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  defaultCountryCode$ = new BehaviorSubject<string>('us');

  private apiUrl = environment.api.url;

  constructor(
    private http: HttpClient,
    private title: Title,
    private meta: Meta
  ) { }

  async refreshDefaultCountryCode() {
    const result = (await this.http.get(this.apiUrl + '/general/country').toPromise()) as any;
    this.defaultCountryCode$.next(result.countryCode);
  }

  getRecaptchaSiteKey() {
    return this.http.get(this.apiUrl + '/general/recaptchaSiteKey');
  }

  submitContact(email, message) {
    const body = { email, message };
    return this.http.post(this.apiUrl + '/general/contact', body);
  }

  setSkipErrorInterceptor(bypassErrorInterceptor) {
    if (bypassErrorInterceptor) {
      return new HttpHeaders().set('bypass-error-interceptor', '');
    }
  }

  copyToClipboard(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '1';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    return val;
  }

  randomString(numChars: number) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < numChars; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  setPageTitle(title: string) {
    let newTitle = 'Collabz';
    if (title) {
      newTitle = `${title} | Collabz`;
    }
    this.meta.updateTag({ name: 'title', content: newTitle });
    this.meta.updateTag({ property: 'og:title', content: newTitle });
    this.meta.updateTag({ property: 'og:site_name', content: newTitle });
    this.meta.updateTag({ name: 'twitter:title', content: newTitle });
    this.meta.updateTag({ name: 'twitter:image:alt', content: newTitle });
    this.title.setTitle(newTitle);
  }

  setPageDescription(description: string) {
    let newDescription = 'Listen. Share. Learn.';
    if (description) {
      newDescription = description;
    }
    this.meta.updateTag({ name: 'description', content: newDescription });
    this.meta.updateTag({ property: 'og:description', content: newDescription });
    this.meta.updateTag({ name: 'twitter:description', content: newDescription });
  }

  setPageImage(image: string) {
    let newImage = 'https://d2zsrlno72yngj.cloudfront.net/logo.png';
    if (image) {
      newImage = image;
    }
    this.meta.updateTag({ name: 'twitter:image', content: newImage });
    this.meta.updateTag({ property: 'og:image', content: newImage });
  }

  setPageUrl(url: string) {
    this.meta.updateTag({ property: 'og:url', content: url });
  }

}
