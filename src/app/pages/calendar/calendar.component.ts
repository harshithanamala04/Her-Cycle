import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { BottomNavbarComponent } from '../../components/bottom-navbar/bottom-navbar.component';
import { CycleSyncService } from '../../services/cycle-sync.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    BottomNavbarComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnDestroy {

  days: number[] = [];
  selectedPeriodDays: number[] = [];
  fertileDays: number[] = [];
  ovulationDay = 0;
  currentMonth = '';
  currentYear = 0;
  today = new Date();
  nextPeriod = '';
  fertileWindow = '';

  private syncService = inject(CycleSyncService);
  private syncSubscription!: Subscription;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    this.setMonthYear();
    this.generateDays();
    this.loadCycleData();

    // Active real-time subscription channel listens to cross-page state broadcasts
    this.syncSubscription = this.syncService.cycleUpdated$.subscribe(() => {
      this.loadCycleData();
    });
  }

  setMonthYear() {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    this.currentMonth = months[this.today.getMonth()];
    this.currentYear = this.today.getFullYear();
  }

  generateDays() {
    const year = this.today.getFullYear();
    const month = this.today.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    this.days = [];
    for (let i = 1; i <= totalDays; i++) {
      this.days.push(i);
    }
  }

  async loadCycleData() {
    const user = this.auth.currentUser;
    if (!user) return;

    const uid = user.uid;
    const docRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return;

    const cycleData = docSnap.data();
    const startDate = new Date(cycleData['lastPeriodDate']);
    const periodLength = Number(cycleData['periodLength']);
    const cycleLength = Number(cycleData['cycleLength']);

    // Map Period Tracking Highlighting Grid Points
    this.selectedPeriodDays = [];
    for (let i = 0; i < periodLength; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      if (date.getMonth() === this.today.getMonth()) {
        this.selectedPeriodDays.push(date.getDate());
      }
    }

    // Map Ovulation Day Grid Points
    const ovulation = new Date(startDate);
    ovulation.setDate(startDate.getDate() + (cycleLength - 14));
    this.ovulationDay = ovulation.getDate();

    // Map Fertile Window Highlighting Grid Boundaries
    this.fertileDays = [];
    const daysInMonth = new Date(this.currentYear, this.today.getMonth() + 1, 0).getDate();

    for (let i = -2; i <= 2; i++) {
      let fertileDay = this.ovulationDay + i;

      if (fertileDay < 1) {
        fertileDay = daysInMonth + fertileDay;
      }
      if (fertileDay > daysInMonth) {
        fertileDay = fertileDay - daysInMonth;
      }
      this.fertileDays.push(fertileDay);
    }

    this.fertileWindow = `${this.fertileDays[0]} - ${this.fertileDays[4]}`;

    const next = new Date(startDate);
    next.setDate(startDate.getDate() + cycleLength);
    this.nextPeriod = next.toDateString();
  }

  selectDay(day: number) {
    const index = this.selectedPeriodDays.indexOf(day);
    if (index > -1) {
      this.selectedPeriodDays.splice(index, 1);
    } else {
      this.selectedPeriodDays.push(day);
    }
  }

  isPeriodDay(day: number): boolean { return this.selectedPeriodDays.includes(day); }
  isFertileDay(day: number): boolean { return this.fertileDays.includes(day); }
  isOvulationDay(day: number): boolean { return day === this.ovulationDay; }
  isToday(day: number): boolean { return day === this.today.getDate(); }

  ngOnDestroy(): void {
    if (this.syncSubscription) {
      this.syncSubscription.unsubscribe();
    }
  }
}