import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';
import { adminGuard, adminGuestGuard } from './core/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'splash' },
  {
    path: 'splash',
    loadComponent: () => import('./features/splash/splash.page').then(m => m.SplashPage)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.page').then(m => m.OnboardingPage)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'ea-admin',
    pathMatch: 'full',
    redirectTo: 'ea-admin/login'
  },
  {
    path: 'ea-admin/login',
    canActivate: [adminGuestGuard],
    loadComponent: () => import('./features/admin/login/admin-login.page').then(m => m.AdminLoginPage)
  },
  {
    path: 'ea-admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.page').then(m => m.AdminDashboardPage) },
      // Placeholders for other pages — all point at dashboard until we build them
      { path: 'appointments', loadComponent: () => import('./features/admin/appointments/appointments.page').then(m => m.AdminAppointmentsPage) },
      { path: 'users', loadComponent: () => import('./features/admin/users/users.page').then(m => m.AdminUsersPage) },
      { path: 'patients', loadComponent: () => import('./features/admin/patients/patients.page').then(m => m.AdminPatientsPage) },
      { path: 'services', loadComponent: () => import('./features/admin/services/services.page').then(m => m.AdminServicesPage) },
      { path: 'inventory', loadComponent: () => import('./features/admin/inventory/inventory.page').then(m => m.AdminInventoryPage) },
      { path: 'reports', loadComponent: () => import('./features/admin/reports/reports.page').then(m => m.AdminReportsPage) },
      { path: 'settings', loadComponent: () => import('./features/admin/settings/settings.page').then(m => m.AdminSettingsPage) },
      { path: 'audit', loadComponent: () => import('./features/admin/audit/audit.page').then(m => m.AdminAuditPage) },
      { path: 'reviews', loadComponent: () => import('./features/admin/reviews/reviews.page').then(m => m.AdminReviewsPage) }
    ]
  },
  {
    path: 'welcome',
    loadComponent: () => import('./features/welcome/welcome.page').then(m => m.WelcomePage)
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./features/customer/customer-tabs.component').then(m => m.CustomerTabsComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./features/customer/home/home.page').then(m => m.HomePage) },
      // Placeholders — we'll build these next
      { path: 'services', loadComponent: () => import('./features/customer/services/services-list.page').then(m => m.ServicesListPage) },
      { path: 'services/:id', loadComponent: () => import('./features/customer/services/service-detail.page').then(m => m.ServiceDetailPage) },
      { path: 'book/:serviceId', loadComponent: () => import('./features/customer/booking/book.page').then(m => m.BookPage) },
      { path: 'appointments', loadComponent: () => import('./features/customer/appointments/appointments-list.page').then(m => m.AppointmentsListPage) },
      { path: 'profile', loadComponent: () => import('./features/customer/profile/profile.page').then(m => m.ProfilePage) }
    ]
  },
  { path: '**', redirectTo: 'splash' }
];