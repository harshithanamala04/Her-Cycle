import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service'; 

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  public themeService = inject(ThemeService);
  // Specifying the type explicitly here too
  public notificationService: NotificationService = inject(NotificationService);
  
  userEmail = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userEmail = this.auth.currentUser?.email || '';
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/']);
  }
}