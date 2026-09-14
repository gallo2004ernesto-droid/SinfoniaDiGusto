import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-hero-banner',
  styleUrl: './hero-banner.css',
  templateUrl: './hero-banner.html',
})
export class HeroBanner {
  //input dinamici configurabili con valori di default 
  title = input<string>('');
  subtitle = input<string>('');
  description = input<string>('');
  buttonText= input<string>('');
  buttonLink = input<string>('')
  bgImageUrl = input<string>('');
}
