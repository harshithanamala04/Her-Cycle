import { Routes } from '@angular/router';
import { SettingsComponent } from './pages/settings/settings.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { TodayComponent } from './pages/today/today.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { AddEntryComponent } from './pages/add-entry/add-entry.component';
import { SelfCareComponent } from './pages/self-care/self-care.component';
import { AnalysisComponent } from './pages/analysis/analysis.component';
import { PeriodEditComponent } from './pages/period-edit/period-edit.component';
import { LoginComponent } from './pages/login/login.component';
import { SetupCycleComponent } from './pages/setup-cycle/setup-cycle.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent }, // Added connection path
  { path: 'calendar', component: CalendarComponent },
  { path: 'add-entry', component: AddEntryComponent },
  { path: 'self-care', component: SelfCareComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'period-edit', component: PeriodEditComponent }, 
  { path: 'today', component: TodayComponent },
  { path: 'setup-cycle', component: SetupCycleComponent },
  { path: '**', redirectTo: '' }
];