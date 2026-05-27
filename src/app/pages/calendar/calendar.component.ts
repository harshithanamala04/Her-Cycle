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
  imports: [CommonModule, BottomNavbarComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnDestroy {

  prevMonthDays: number[] = [];
  currentMonthDays: number[] = [];
  nextMonthDays: number[] = [];

  prevMonthPadding: number[] = [];
  currentMonthPadding: number[] = [];
  nextMonthPadding: number[] = [];

  prevMonthName = ''; prevMonthYear = 0; prevMonthIndex = 0;
  currentMonthName = ''; currentMonthYear = 0; currentMonthIndex = 0;
  nextMonthName = ''; nextMonthYear = 0; nextMonthIndex = 0;

  periodDateStrings: string[] = [];
  fertileDateStrings: string[] = [];
  ovulationDateStrings: string[] = [];

  private syncService = inject(CycleSyncService);
  private syncSubscription!: Subscription;
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  ngOnInit(): void {
    this.calculateThreeMonthTimeline();
    this.loadCycleData();

    this.syncSubscription = this.syncService.cycleUpdated$.subscribe(() => {
      this.loadCycleData();
    });
  }

  calculateThreeMonthTimeline() {
    const today = new Date();
    
    this.currentMonthIndex = today.getMonth();
    this.currentMonthYear = today.getFullYear();
    this.currentMonthName = this.monthsList[this.currentMonthIndex];
    this.currentMonthDays = this.getDaysInMonth(this.currentMonthYear, this.currentMonthIndex);
    this.currentMonthPadding = this.getWeekdayPadding(this.currentMonthYear, this.currentMonthIndex);

    const prevDate = new Date(this.currentMonthYear, this.currentMonthIndex - 1, 1);
    this.prevMonthIndex = prevDate.getMonth();
    this.prevMonthYear = prevDate.getFullYear();
    this.prevMonthName = this.monthsList[this.prevMonthIndex];
    this.prevMonthDays = this.getDaysInMonth(this.prevMonthYear, this.prevMonthIndex);
    this.prevMonthPadding = this.getWeekdayPadding(this.prevMonthYear, this.prevMonthIndex);

    const nextDate = new Date(this.currentMonthYear, this.currentMonthIndex + 1, 1);
    this.nextMonthIndex = nextDate.getMonth();
    this.nextMonthYear = nextDate.getFullYear();
    this.nextMonthName = this.monthsList[this.nextMonthIndex];
    this.nextMonthDays = this.getDaysInMonth(this.nextMonthYear, this.nextMonthIndex);
    this.nextMonthPadding = this.getWeekdayPadding(this.nextMonthYear, this.nextMonthIndex);
  }

  getDaysInMonth(year: number, month: number): number[] {
    const count = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  getWeekdayPadding(year: number, month: number): number[] {
    const startDayOfWeek = new Date(year, month, 1).getDay();
    return Array.from({ length: startDayOfWeek }, (_, i) => i);
  }

  async loadCycleData() {
    const user = this.auth.currentUser;
    if (!user) return;

    const docRef = doc(this.firestore, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const cycleData = docSnap.data();
    const lastPeriodStr = cycleData['lastPeriodDate']; 
    const periodLength = Number(cycleData['periodLength'] || 5);
    const cycleLength = Number(cycleData['cycleLength'] || 28);

    if (!lastPeriodStr) return;

    this.periodDateStrings = [];
    this.fertileDateStrings = [];
    this.ovulationDateStrings = [];

    let currentCycleStart = new Date(lastPeriodStr);

    for (let iteration = 0; iteration < 4; iteration++) {
      for (let p = 0; p < periodLength; p++) {
        const d = new Date(currentCycleStart);
        d.setDate(currentCycleStart.getDate() + p);
        this.periodDateStrings.push(this.formatDateKey(d));
      }

      const ovulationDay = new Date(currentCycleStart);
      ovulationDay.setDate(currentCycleStart.getDate() + (cycleLength - 14));
      this.ovulationDateStrings.push(this.formatDateKey(ovulationDay));

      for (let f = -2; f <= 2; f++) {
        const fd = new Date(ovulationDay);
        fd.setDate(ovulationDay.getDate() + f);
        this.fertileDateStrings.push(this.formatDateKey(fd));
      }

      currentCycleStart.setDate(currentCycleStart.getDate() + cycleLength);
    }
  }

  formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  isPeriodDay(day: number, month: number, year: number): boolean {
    return this.periodDateStrings.includes(`${year}-${month}-${day}`);
  }

  isFertileDay(day: number, month: number, year: number): boolean {
    return this.fertileDateStrings.includes(`${year}-${month}-${day}`);
  }

  isOvulationDay(day: number, month: number, year: number): boolean {
    return this.ovulationDateStrings.includes(`${year}-${month}-${day}`);
  }

  isToday(day: number, month: number, year: number): boolean {
    const now = new Date();
    return now.getDate() === day && now.getMonth() === month && now.getFullYear() === year;
  }

  ngOnDestroy(): void {
    if (this.syncSubscription) {
      this.syncSubscription.unsubscribe();
    }
  }
}