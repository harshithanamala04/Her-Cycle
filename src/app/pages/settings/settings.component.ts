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
  
  // Dynamic User Template Profile States
  userName: string = '';
  userEmail: string = '';
  uid: string = '';

  private router = inject(Router);
  private themeService = inject(ThemeService);
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  ngOnInit(): void {
    // 1. Sync global template theme variable layout markers
    this.isDarkMode = this.themeService.getCurrentThemeStatus();

    // 2. Fetch authenticated profile data streams live from Firebase
    this.auth.onAuthStateChanged(async (user) => {
      if (!user) {
        // Redirect to login if user session doesn't exist
        this.router.navigate(['/']);
        return;
      }

      this.uid = user.uid;
      this.userEmail = user.email || '';
      
      // Load custom profile properties like the user's name from Firestore
      await this.fetchUserProfileData();
    });
  }

  async fetchUserProfileData() {
    try {
      const docRef = doc(this.firestore, 'users', this.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        // Fallback to name field, or displayName from auth if missing in document
        this.userName = userData['name'] || userData['username'] || this.auth.currentUser?.displayName || 'User';
      } else {
        // Fallback default metric markers if document doesn't exist yet
        this.userName = this.auth.currentUser?.displayName || 'Cycle Tracker User';
      }
    } catch (error) {
      console.error('Error fetching dynamic settings profile header:', error);
      this.userName = 'Cycle Tracker User';
    }
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.getCurrentThemeStatus();
  }
}