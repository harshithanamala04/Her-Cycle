import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import { CycleSyncService } from '../../services/cycle-sync.service';

@Component({
  selector: 'app-period-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './period-edit.component.html',
  styleUrls: ['./period-edit.component.css']
})
export class PeriodEditComponent implements OnInit {
  // Core Database Values
  lastPeriodDate: string = '';
  cycleLength: number = 28;
  periodLength: number = 5;

  // Custom Calendar-Picker View States Needed By Your Template
  currentMonthName: string = '';
  days: number[] = [];
  selectedDayNumber: number | null = null;
  currentYear: number = 0;
  currentMonthIndex: number = 0;

  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private router = inject(Router);
  private syncService = inject(CycleSyncService);

  monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  ngOnInit(): void {
    this.auth.onAuthStateChanged(async (user) => {
      if (!user) {
        this.router.navigate(['/']);
        return;
      }
      this.initializeCalendarView();
      await this.loadCurrentUserSettings(user.uid);
    });
  }

  initializeCalendarView() {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonthIndex = today.getMonth();
    this.currentMonthName = this.monthsList[this.currentMonthIndex];
    
    // Calculate total days in current month to generate array for *ngFor="let day of days"
    const totalDays = new Date(this.currentYear, this.currentMonthIndex + 1, 0).getDate();
    this.days = Array.from({ length: totalDays }, (_, i) => i + 1);
  }

  async loadCurrentUserSettings(uid: string) {
    try {
      const docRef = doc(this.firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.lastPeriodDate = data['lastPeriodDate'] || '';
        this.cycleLength = Number(data['cycleLength'] || 28);
        this.periodLength = Number(data['periodLength'] || 5);

        // Pre-select day highlight if date matches current active month view frame
        if (this.lastPeriodDate) {
          const parsedDate = new Date(this.lastPeriodDate);
          if (parsedDate.getFullYear() === this.currentYear && parsedDate.getMonth() === this.currentMonthIndex) {
            this.selectedDayNumber = parsedDate.getDate();
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile settings:', error);
    }
  }

  // TEMPLATE INTERACTIVE LINK: Handles selecting a day from your matrix grid
  handleDaySelection(day: number) {
    this.selectedDayNumber = day;
    // Format calendar selection into standard database string layout 'YYYY-MM-DD'
    const monthString = String(this.currentMonthIndex + 1).padStart(2, '0');
    const dayString = String(day).padStart(2, '0');
    this.lastPeriodDate = `${this.currentYear}-${monthString}-${dayString}`;
  }

  // TEMPLATE INTERACTIVE LINK: Handles active day cell theme class assignment highlights
  isDaySelected(day: number): boolean {
    return this.selectedDayNumber === day;
  }

  // TEMPLATE INTERACTIVE LINK: Action back navigation route controller handler
  goBackToToday() {
    this.router.navigate(['/today']);
  }

  // TEMPLATE INTERACTIVE LINK: Handles updating parameters and running state broadcasts
  async savePeriodChanges() {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(this.firestore, 'users', user.uid);
      
      // 1. Save data updates to Firestore
      await updateDoc(docRef, {
        lastPeriodDate: this.lastPeriodDate,
        cycleLength: this.cycleLength,
        periodLength: this.periodLength
      });

      // 2. Broadcast updates instantly down the application pipeline to the Today component
      this.syncService.emitCycleUpdate();

      // 3. Navigate user back safely to the centered metrics dashboard
      this.router.navigate(['/today']);
    } catch (error) {
      console.error('Database configuration update transaction error:', error);
    }
  }
}