import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Using an Angular Signal to track if dark mode is active
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Check if the user previously chose a theme, otherwise default to light
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  toggleTheme() {
    if (this.isDarkMode()) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  private enableDarkMode() {
    this.isDarkMode.set(true);
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }

  private disableDarkMode() {
    this.isDarkMode.set(false);
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}