import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  errorMessage = '';
  hasInputFieldError = false;
  isShaking = false;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  async handleLoginSubmit() {
    this.clearValidationState();

    if (!this.email || !this.password) {
      this.triggerWebsiteErrorState('Please fill in all fields.');
      return;
    }

    try {
      // Try logging in through the standard method first
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.router.navigate(['/today']);
    } catch (error: any) {
      console.log('Standard auth failed, checking database overrides...');
      
      try {
        // Look up the document directly by the email ID string
        const userDocRef = doc(this.firestore, 'users', this.email.trim().toLowerCase());
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          // Cross-reference the custom override value directly
          if (userData['resetPasswordOverride'] === this.password) {
            this.router.navigate(['/today']);
            return;
          }
        }
      } catch (dbError) {
        console.error('Database fallback trace error:', dbError);
      }

      let userFriendlyMessage = 'Invalid email or password. Please try again.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        userFriendlyMessage = 'Password is incorrect.';
      }
      this.triggerWebsiteErrorState(userFriendlyMessage);
    }
  }

  triggerWebsiteErrorState(message: string) {
    this.errorMessage = message;
    this.hasInputFieldError = true;
    this.isShaking = true;
    setTimeout(() => this.isShaking = false, 500);
  }

  clearValidationState() {
    this.errorMessage = '';
    this.hasInputFieldError = false;
    this.isShaking = false;
  }

  navigateToRegister() { this.router.navigate(['/register']); }
  navigateToForgotPassword() { this.router.navigate(['/forgot-password']); }
}