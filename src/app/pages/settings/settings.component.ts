import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { ThemeService } from '../../services/theme.service';
import { BottomNavbarComponent } from '../../components/bottom-navbar/bottom-navbar.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BottomNavbarComponent
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  isDarkMode: boolean = false;
  userName: string = '';
  userEmail: string = '';
  uid: string = '';

  private router = inject(Router);
  private themeService = inject(ThemeService);
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  ngOnInit(): void {
    this.isDarkMode = this.themeService.getCurrentThemeStatus();

    this.auth.onAuthStateChanged(async (user) => {
      if (!user) {
        this.router.navigate(['/']);
        return;
      }
      this.uid = user.uid;
      this.userEmail = user.email || '';
      await this.fetchUserProfileData();
    });
  }

  async fetchUserProfileData() {
    try {
      const docRef = doc(this.firestore, 'users', this.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        this.userName = userData['name'] || userData['username'] || this.auth.currentUser?.displayName || 'User';
      } else {
        this.userName = this.auth.currentUser?.displayName || 'Cycle Tracker User';
      }
    } catch (error) {
      console.error('Error fetching user profile headers:', error);
      this.userName = 'Cycle Tracker User';
    }
  }

  /**
   * NAVIGATIONAL FIX: Returns user back to primary layout dashboard safely
   */
  goBackToToday(): void {
    this.router.navigate(['/today']);
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.getCurrentThemeStatus();
  }
}