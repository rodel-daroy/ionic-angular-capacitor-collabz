import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from './short-number.pipe';

const CUSTOM_PIPES = [
  ShortNumberPipe
];

const ANGULAR_PIPES = [];

@NgModule({
  declarations: [...CUSTOM_PIPES],
  providers: [...CUSTOM_PIPES, ...ANGULAR_PIPES],
  imports: [
    CommonModule
  ],
  exports: [...CUSTOM_PIPES, ...ANGULAR_PIPES],
})
export class SharedPipesModule { }
