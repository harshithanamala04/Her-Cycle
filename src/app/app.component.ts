import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  // Injecting the service here forces the constructor to run and apply the theme to the <html> tag instantly
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    console.log('Global Theme Management Engine Engaged. Current dark mode state:', this.themeService.getCurrentThemeStatus());
  }
}