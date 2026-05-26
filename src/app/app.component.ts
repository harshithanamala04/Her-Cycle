import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BottomNavbarComponent } from './components/bottom-navbar/bottom-navbar.component'; // <-- 1. Import it here

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    BottomNavbarComponent // <-- 2. Add it to your imports array here
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mycalendar-app';
}