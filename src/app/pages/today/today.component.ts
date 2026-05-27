import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { BottomNavbarComponent } from '../../components/bottom-navbar/bottom-navbar.component';
import { CycleSyncService } from '../../services/cycle-sync.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BottomNavbarComponent
  ],
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.css']
})
export class TodayComponent implements OnInit, OnDestroy {
  // Dynamic UI Data Bindings State Parameters
  daysLeftDisplay: string = 'Loading...';
  currentDayOfCycle: number = 1;
  nextPeriodDateFormatted: string = '-- --';
  nextOvulationDateFormatted: string = '-- --';

  // Modal Interactive Visibility States and Forms Input Parameters
  showLogModal: boolean = false;
  manualLogDate: string = '';
  manualCycleLength: number = 28; // 🌟 Bound parameter instance variable tracker built in directly

  private router = inject(Router);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private syncService = inject(CycleSyncService);
  private syncSubscription!: Subscription;

  monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  ngOnInit(): void {
    this.auth.onAuthStateChanged(async (user) => {
      if (!user) {
        this.router.navigate(['/']);
        return;
      }
      this.initializeDefaultDateInputValue();
      await this.calculateActiveCycleMetrics(user.uid);
    });

    // Real-time update observer system link subscription stream pipelines
    this.syncSubscription = this.syncService.cycleUpdated$.subscribe(async () => {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        await this.calculateActiveCycleMetrics(currentUser.uid);
      }
    });
  }

  initializeDefaultDateInputValue() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.manualLogDate = `${yyyy}-${mm}-${dd}`;
  }

  openLogModal() {
    this.showLogModal = true;
  }

  closeLogModal() {
    this.showLogModal = false;
  }

  async saveManualPeriodLog() {
    const user = this.auth.currentUser;
    if (!user || !this.manualLogDate || !this.manualCycleLength) return;

    try {
      const docRef = doc(this.firestore, 'users', user.uid);
      
      // 🌟 UPDATED: Saves both fields straight into the active document workspace node
      await updateDoc(docRef, {
        lastPeriodDate: this.manualLogDate,
        cycleLength: Number(this.manualCycleLength)
      });

      // Notify the application lifecycle thread to re-sync views instantly
      this.syncService.emitCycleUpdate();
      this.closeLogModal();
    } catch (error) {
      console.error('Error updating logging parameter metrics inside Firestore table rows:', error);
    }
  }

  async calculateActiveCycleMetrics(uid: string) {
    try {
      const docRef = doc(this.firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return;
      const cycleData = docSnap.data();

      const lastPeriodStr = cycleData['lastPeriodDate']; 
      const cycleLength = Number(cycleData['cycleLength'] || 28);
      const periodLength = Number(cycleData['periodLength'] || 5);

      // Pre-fill the model parameters tracking fields inside the template views
      this.manualCycleLength = cycleLength;

      if (!lastPeriodStr) {
        this.daysLeftDisplay = 'Set Details';
        return;
      }

      // Midnight normalization boundaries mapping configurations
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let loggedPeriodDate = new Date(lastPeriodStr);
      loggedPeriodDate.setHours(0, 0, 0, 0);

      // --- SMART LOGIC OVERRIDE FOR CURRENT WINDOWS ---
      let currentCycleStart = new Date(loggedPeriodDate);

      if (loggedPeriodDate.getTime() <= today.getTime()) {
        while (currentCycleStart.getTime() + (cycleLength * 24 * 60 * 60 * 1000) <= today.getTime()) {
          currentCycleStart.setDate(currentCycleStart.getDate() + cycleLength);
        }
      }

      // Calculate Cycle position index metrics
      const msPassed = today.getTime() - currentCycleStart.getTime();
      const calculatedCycleDay = Math.floor(msPassed / (1000 * 60 * 60 * 24)) + 1;

      // Ensure index bounds are safely validated inside core rules variables
      this.currentDayOfCycle = calculatedCycleDay > 0 ? calculatedCycleDay : 1;

      // Formulate predictive window outputs parameters
      let nextPeriodDate = new Date(currentCycleStart);
      if (loggedPeriodDate.getTime() > today.getTime()) {
        nextPeriodDate = new Date(loggedPeriodDate);
      } else {
        nextPeriodDate.setDate(currentCycleStart.getDate() + cycleLength);
      }

      const msUntilNextPeriod = nextPeriodDate.getTime() - today.getTime();
      const daysUntilNextPeriod = Math.ceil(msUntilNextPeriod / (1000 * 60 * 60 * 24));

      // Main header ring banner string display selection states matrix rule block
      if (loggedPeriodDate.getTime() === today.getTime()) {
        this.daysLeftDisplay = 'PERIOD: DAY 1';
        this.currentDayOfCycle = 1;
      } else if (calculatedCycleDay >= 1 && calculatedCycleDay <= periodLength) {
        this.daysLeftDisplay = `PERIOD: DAY ${this.currentDayOfCycle}`;
      } else if (daysUntilNextPeriod === 0) {
        this.daysLeftDisplay = 'STARTED TODAY';
      } else {
        this.daysLeftDisplay = `${daysUntilNextPeriod} DAYS LEFT`;
      }

      // Formulate date string layout outputs maps labels
      this.nextPeriodDateFormatted = `${this.monthsList[nextPeriodDate.getMonth()]} ${nextPeriodDate.getDate()}`;

      let ovulationDate = new Date(nextPeriodDate);
      ovulationDate.setDate(nextPeriodDate.getDate() - 14);
      this.nextOvulationDateFormatted = `${this.monthsList[ovulationDate.getMonth()]} ${ovulationDate.getDate()}`;

    } catch (error) {
      console.error('Error during calendar dashboard math parsing operations:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.syncSubscription) {
      this.syncSubscription.unsubscribe();
    }
  }
}