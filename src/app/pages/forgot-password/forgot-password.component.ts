import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Firestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  newPassword = '';

  errorMessage = '';
  successMessage = '';
  hasInputFieldError = false;
  isShaking = false;

  private firestore = inject(Firestore);
  private router = inject(Router);

  async handlePasswordResetSubmit() {
    this.clearValidationState();

    if (!this.email || !this.newPassword) {
      this.triggerError('Please fill in both fields.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.triggerError('Password must be at least 6 characters long.');
      return;
    }

    const cleanEmail = this.email.trim().toLowerCase();

    try {
      let targetUserDocRef = null;

      // STRATEGY A: Check if the document ID itself is named after the email address
      const directDocRef = doc(this.firestore, 'users', cleanEmail);
      const directSnap = await getDoc(directDocRef);

      if (directSnap.exists()) {
        targetUserDocRef = directDocRef;
      } else {
        // STRATEGY B: Fallback to searching the properties inside all documents
        console.log('Direct document match not found, running property collection query...');
        const usersCollectionRef = collection(this.firestore, 'users');
        const emailSearchQuery = query(usersCollectionRef, where('email', '==', cleanEmail));
        const querySnapshot = await getDocs(emailSearchQuery);

        if (!querySnapshot.empty) {
          const userDocument = querySnapshot.docs[0];
          targetUserDocRef = doc(this.firestore, 'users', userDocument.id);
        }
      }

      // If both search strategies fail, safely notify the user
      if (!targetUserDocRef) {
        this.triggerError('No account found with this email address.');
        return;
      }

      // Write the new password bypass field straight into the matching document profile
      await updateDoc(targetUserDocRef, {
        resetPasswordOverride: this.newPassword
      });

      this.successMessage = 'Password updated successfully! Redirecting...';

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2500);

    } catch (error) {
      console.error('Firestore password update bypass failed completely:', error);
      this.triggerError('Database connection error. Please try again.');
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
    this.successMessage = '';
    this.hasInputFieldError = false;
    this.isShaking = false;
  }
}