import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Use a BehaviorSubject to broadcast the current theme state live to any listening components
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    // When the app first boots up, check if the user previously selected dark mode
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    this.setTheme(shouldBeDark);
  }

  /**
   * Core function to switch the theme across the whole document root
   */
  setTheme(makeDark: boolean): void {
    this.isDarkModeSubject.next(makeDark);
    const root = document.documentElement;
    const body = document.body;

    if (makeDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkModeSubject.value);
  }

  getCurrentThemeStatus(): boolean {
    return this.isDarkModeSubject.value;
  }
}