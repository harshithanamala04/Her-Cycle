import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { SetupCycleComponent } from './pages/setup-cycle/setup-cycle.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ForgetPasswordComponent } from './pages/forget-password/forget-password.component'; // Added import

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    AppComponent
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth())
  ],
  bootstrap: [AppComponent],
  declarations: [
    SetupCycleComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ForgetPasswordComponent // Added declaration here
  ]
})
export class AppModule {}