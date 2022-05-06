import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loading: HTMLIonLoadingElement;

  constructor(
    public loadingController: LoadingController
  ) { }

  async startLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'loading',
      spinner: 'dots'
    });
    this.loading.present();
  }

  async stopLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }
}
