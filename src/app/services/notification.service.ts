import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  isEnabled = signal<boolean>(false);

  periodReminder = signal<boolean>(false);
  fertileReminder = signal<boolean>(false);
  ovulationReminder = signal<boolean>(false);
  waterReminder = signal<boolean>(false);

  private waterIntervalId: any = null;

  constructor() {
    this.isEnabled.set(localStorage.getItem('notifications-enabled') === 'true');
    this.periodReminder.set(localStorage.getItem('pref-period') === 'true');
    this.fertileReminder.set(localStorage.getItem('pref-fertile') === 'true');
    this.ovulationReminder.set(localStorage.getItem('pref-ovulation') === 'true');
    this.waterReminder.set(localStorage.getItem('pref-water') === 'true');

    if (this.waterReminder()) {
      this.startWaterTimer();
    }
  }

  async toggleNotifications(checked: boolean) {
    if (checked) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.isEnabled.set(true);
        localStorage.setItem('notifications-enabled', 'true');
        this.sendNotification('Calendar Tracker 🔔', 'Notifications successfully enabled!');
      } else {
        this.isEnabled.set(false);
        localStorage.setItem('notifications-enabled', 'false');
        alert('Please enable notifications in your browser settings.');
      }
    } else {
      this.isEnabled.set(false);
      localStorage.setItem('notifications-enabled', 'false');
      this.stopWaterTimer();
    }
  }

  async togglePreference(type: 'period' | 'fertile' | 'ovulation' | 'water', checked: boolean) {
    if (checked && !this.isEnabled()) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.isEnabled.set(true);
        localStorage.setItem('notifications-enabled', 'true');
      } else {
        alert('Notification permission is required to enable these reminders.');
        return;
      }
    }

    if (type === 'period') {
      this.periodReminder.set(checked);
      localStorage.setItem('pref-period', String(checked));
    } else if (type === 'fertile') {
      this.fertileReminder.set(checked);
      localStorage.setItem('pref-fertile', String(checked));
    } else if (type === 'ovulation') {
      this.ovulationReminder.set(checked);
      localStorage.setItem('pref-ovulation', String(checked));
    } else if (type === 'water') {
      this.waterReminder.set(checked);
      localStorage.setItem('pref-water', String(checked));
      
      if (checked) {
        this.startWaterTimer();
        this.sendNotification('Hydration Tracker 💧', 'Water reminders enabled. We will remind you to drink water every hour!');
      } else {
        this.stopWaterTimer();
      }
    }
  }

  private startWaterTimer() {
    this.stopWaterTimer();
    const oneHourInMs = 60 * 60 * 1000; 

    this.waterIntervalId = setInterval(() => {
      this.sendNotification('Drink Water! 💧', 'It has been an hour since your last glass. Stay hydrated!');
    }, oneHourInMs);
  }

  private stopWaterTimer() {
    if (this.waterIntervalId) {
      clearInterval(this.waterIntervalId);
      this.waterIntervalId = null;
    }
  }

  private sendNotification(title: string, message: string) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: 'assets/icons/icon-72x72.png'
      });
    }
  }
}