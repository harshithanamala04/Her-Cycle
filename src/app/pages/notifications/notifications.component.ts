import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { BottomNavbarComponent } from '../../components/bottom-navbar/bottom-navbar.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BottomNavbarComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  
  periodReminderEnabled: boolean = true;
  fertileReminderEnabled: boolean = true;
  ovulationReminderEnabled: boolean = true;
  waterReminderEnabled: boolean = true;

  private router = inject(Router);
  private auth = inject(Auth);

  ngOnInit(): void {
    this.auth.onAuthStateChanged((user) => {
      if (!user) {
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * NAVIGATIONAL ROUTER LINK: Navigates back cleanly to today's main dashboard layout
   */
  goBackToToday(): void {
    this.router.navigate(['/today']);
  }

  togglePeriodReminder(): void {
    this.periodReminderEnabled = !this.periodReminderEnabled;
  }

  toggleFertileReminder(): void {
    this.fertileReminderEnabled = !this.fertileReminderEnabled;
  }

  togglePageReminder(): void {
    this.ovulationReminderEnabled = !this.ovulationReminderEnabled;
  }

  toggleOvulationReminder(): void {
    this.ovulationReminderEnabled = !this.ovulationReminderEnabled;
  }

  toggleWaterReminder(): void {
    this.waterReminderEnabled = !this.waterReminderEnabled;
  }
}