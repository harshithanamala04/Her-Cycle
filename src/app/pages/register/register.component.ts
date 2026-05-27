import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';

  errorMessage = '';
  hasInputFieldError = false;
  isShaking = false;

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  async handleRegisterSubmit() {
    this.clearValidationState();

    if (!this.name || !this.email || !this.password) {
      this.triggerError('Please fill in all registration fields.');
      return;
    }

    try {
      // 1. Create baseline user inside Firebase Authentication
      await createUserWithEmailAndPassword(this.auth, this.email, this.password);

      // 2. FIXED ANCHOR: Save document inside Firestore using the email address directly as the Document ID!
      const userDocRef = doc(this.firestore, 'users', this.email.trim().toLowerCase());
      await setDoc(userDocRef, {
        name: this.name,
        email: this.email.trim().toLowerCase(),
        password: this.password, // Fallback property hook
        cycleLength: 28,  
        periodLength: 5,   
        lastPeriodDate: '' 
      });

      this.router.navigate(['/today']);
    } catch (error: any) {
      console.error('Registration failed:', error.code);
      let message = 'Registration failed. Please check details.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email address already exists.';
      }
      this.triggerError(message);
    }
  }

  triggerError(msg: string) {
    this.errorMessage = msg;
    this.hasInputFieldError = true;
    this.isShaking = true;
    setTimeout(() => this.isShaking = false, 500);
  }

  clearValidationState() {
    this.errorMessage = '';
    this.hasInputFieldError = false;
    this.isShaking = false;
  }
}