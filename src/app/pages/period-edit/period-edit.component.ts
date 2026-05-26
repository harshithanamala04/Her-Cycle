import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { CycleSyncService } from '../../services/cycle-sync.service';

@Component({
  selector: 'app-period-edit',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './period-edit.component.html',
  styleUrls: ['./period-edit.component.css']
})
export class PeriodEditComponent implements OnInit {
  days: number[] = [];
  selectedDays: number[] = [];
  
  // Range tracking boundary variables
  rangeStartDay: number | null = null;
  rangeEndDay: number | null = null;

  uid: string = '';
  currentMonthName: string = 'May';

  private router = inject(Router);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private syncService = inject(CycleSyncService);

  ngOnInit(): void {
    this.generateMonthDays();

    this.auth.onAuthStateChanged(async (user) => {
      if (!user) {
        this.router.navigate(['/']);
        return;
      }
      this.uid = user.uid;
      await this.loadUserPeriodData();
    });
  }

  generateMonthDays(): void {
    this.days = Array.from({ length: 31 }, (_, i) => i + 1);
  }

  async loadUserPeriodData() {
    try {
      const docRef = doc(this.firestore, 'users', this.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.selectedDays = data['selectedPeriodDays'] || [];
        
        // Reconstruct visual start/end ranges from stored data if present
        if (this.selectedDays.length > 0) {
          const sorted = [...this.selectedDays].sort((a, b) => a - b);
          this.rangeStartDay = sorted[0];
          this.rangeEndDay = sorted[sorted.length - 1];
        }
      }
    } catch (error) {
      console.error('Error loading period dates:', error);
    }
  }

  /**
   * SMART RANGE ENGINE: Builds continuous selections instead of scattered individual dots
   */
  handleDaySelection(day: number): void {
    // Case 1: No date picked yet, or both boundaries are already filled -> Set a brand new Start Point
    if (!this.rangeStartDay || (this.rangeStartDay && this.rangeEndDay)) {
      this.rangeStartDay = day;
      this.rangeEndDay = null;
      this.selectedDays = [day];
    } 
    // Case 2: Start Point exists and clicked date is before it -> Reset start day back to this new earlier point
    else if (day < this.rangeStartDay) {
      this.rangeStartDay = day;
      this.selectedDays = [day];
    } 
    // Case 3: Clicked date is after our Start Point -> Complete the range block and auto-fill intervening cells
    else {
      this.rangeEndDay = day;
      this.selectedDays = [];
      
      // Auto-fill all continuous intermediate consecutive range blocks seamlessly
      for (let i = this.rangeStartDay; i <= this.rangeEndDay; i++) {
        this.selectedDays.push(i);
      }
    }
  }

  isDaySelected(day: number): boolean {
    return this.selectedDays.includes(day);
  }

  goBackToToday(): void {
    this.router.navigate(['/today']);
  }

  /**
   * UPDATED SAVE BLOCK: Saves custom ranges and dynamically re-calculates periodLength parameters
   */
  async savePeriodChanges() {
    if (!this.uid || !this.rangeStartDay) {
      alert('Please select at least a period start date on the calendar matrix first!');
      return;
    }

    try {
      const docRef = doc(this.firestore, 'users', this.uid);
      
      // 1. Reconstruct a valid structural calendar Date object based on the chosen start day
      const todayDate = new Date();
      const updatedPeriodStartDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), this.rangeStartDay);
      
      // 2. Compute the dynamic length of the selected continuous range span block safely
      const dynamicPeriodLength = this.selectedDays.length;

      // Update the fields in Firestore so that your Today page gets the calculation metrics right
      await updateDoc(docRef, {
        selectedPeriodDays: this.selectedDays,
        lastPeriodDate: updatedPeriodStartDate.toISOString().split('T')[0], // Syncs base starting point field
        periodLength: dynamicPeriodLength // Overwrites old hardcoded lengths with the live selection total
      });

      // Notify cross-page active listeners to sync views
      this.syncService.notifyCycleChanged();

      alert('Period selection parameters updated successfully! ✨');
      this.router.navigate(['/today']);
    } catch (error) {
      console.error('Error saving period range structures:', error);
      alert('Failed to save changes. Please try again.');
    }
  }
}