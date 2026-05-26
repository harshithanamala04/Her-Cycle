import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { BottomNavbarComponent } from '../../components/bottom-navbar/bottom-navbar.component';
import { CycleSyncService } from '../../services/cycle-sync.service';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BottomNavbarComponent // <-- Registered cleanly here
  ],
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.css']
})
export class TodayComponent implements OnInit {

  title = 'Period';
  periodDay = '';
  nextPeriod = '';
  cycleDay = 0;
  fertileDate = '';
  ovulationDate = ''; 
  periodLength = 0;
  uid = ''; 

  showLogModal = false;
  selectedLogDate = '';

  private router = inject(Router);
  private syncService = inject(CycleSyncService);

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    const today = new Date();
    this.selectedLogDate = today.toISOString().split('T')[0];
  }

  async ngOnInit() {
    this.auth.onAuthStateChanged(async (user) => {
      if (!user) {
        this.router.navigate(['/']);
        return;
      }

      this.uid = user.uid;
      this.calculateCycleData();
    });
  }

  async calculateCycleData() {
    const docRef = doc(this.firestore, 'users', this.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      this.router.navigate(['/setup-cycle']);
      return;
    }

    const cycleData = docSnap.data();
    const startDate = new Date(cycleData['lastPeriodDate']);
    this.periodLength = Number(cycleData['periodLength']);
    const cycleLength = Number(cycleData['cycleLength']);

    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();

    let daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (daysPassed < 0) daysPassed = 0;

    this.cycleDay = (daysPassed % cycleLength) + 1;

    if (this.cycleDay <= this.periodLength) {
      this.title = 'Period Phase';
      this.periodDay = `${this.cycleDay} Day`;
    } else {
      this.title = 'Period';
      const daysLeft = cycleLength - this.cycleDay + 1;
      this.periodDay = `${daysLeft} DAYS LEFT`;
    }

    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + cycleLength);
    this.nextPeriod = nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const fertile = new Date(startDate);
    fertile.setDate(startDate.getDate() + (cycleLength - 14));
    this.fertileDate = fertile.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const ovulation = new Date(startDate);
    ovulation.setDate(startDate.getDate() + (cycleLength - 14));
    this.ovulationDate = ovulation.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  toggleLogModal(status: boolean) {
    this.showLogModal = status;
  }

  onDateSelected(dateValue: string) {
    this.selectedLogDate = dateValue;
  }

  async savePeriodLog() {
    if (!this.uid) return;

    try {
      const userDocRef = doc(this.firestore, 'users', this.uid);
      
      await updateDoc(userDocRef, {
        lastPeriodDate: this.selectedLogDate
      });

      this.toggleLogModal(false);
      await this.calculateCycleData();
      
      // Notify other pages like the Calendar to reload Firestore snapshot structures
      this.syncService.notifyCycleChanged();
      
      alert('Cycle logged successfully! ✨');
    } catch (error) {
      console.error("Error logging cycle: ", error);
      alert('Could not update log. Please try again.');
    }
  }

  navigateToCalendar() {
    this.router.navigate(['/calendar']);
  }
}