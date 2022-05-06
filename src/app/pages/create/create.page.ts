import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/elements/services/loading.service';
import { RoomService } from 'src/app/elements/services/room.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {

  form: FormGroup;
  loadingMutex = false;

  constructor(
    private roomService: RoomService,
    private fb: FormBuilder,
    private router: Router,
    private loading: LoadingService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  async createRoom() {
    if (this.loadingMutex) {
      return;
    }
    this.loadingMutex = true;
    await this.loading.startLoading();

    try {
      const res = (await this.roomService.createRoom(this.form.value.name).toPromise()) as any;
      this.form.reset();
      this.router.navigate(['/'], { queryParams: { joinRoomId: res._id }} );
    } finally {
      await this.loading.stopLoading();
      this.loadingMutex = false;
    }
  }

}
