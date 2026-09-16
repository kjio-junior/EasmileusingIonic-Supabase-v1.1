import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'dentist' | 'staff' | 'patient' | 'guest';
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface AdminService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'preventive' | 'restorative' | 'cosmetic' | 'surgical' | 'diagnostic';
  duration_minutes: number;
  image_url: string | null;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportsSummary {
  stats: {
    total_revenue: number;
    completed_count: number;
    total_appointments: number;
    avg_ticket: number;
    total_patients: number;
  };
  status_counts: Record<string, number>;
  revenue_by_day: { date: string; revenue: number; count: number }[];
  top_services: { name: string; count: number; revenue: number }[];
}

export interface AdminAppointment {
  id: string;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes: string | null;
  total_amount: number;
  payment_status: string;
  created_at: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  } | null;
  dentist: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  items: {
    id: string;
    service_id: string;
    price: number;
    service: { id: string; name: string } | null;
  }[];
}

export interface AdminSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  category: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  constructor(private http: HttpClient) {}

  // ---------- USERS ----------

  listUsers(filters: { role?: string; q?: string } = {}): Promise<AdminUser[]> {
    const params: Record<string, string> = {};
    if (filters.role) params['role'] = filters.role;
    if (filters.q) params['q'] = filters.q;

    return firstValueFrom(
      this.http.get<{ users: AdminUser[] }>(`${environment.apiUrl}/admin/users`, { params })
    ).then(r => r.users);
  }

  createUser(payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }): Promise<AdminUser> {
    return firstValueFrom(
      this.http.post<{ user: AdminUser }>(`${environment.apiUrl}/admin/users`, payload)
    ).then(r => r.user);
  }

  updateUser(id: string, patch: { role?: string; is_active?: boolean }): Promise<AdminUser> {
    return firstValueFrom(
      this.http.put<{ user: AdminUser }>(`${environment.apiUrl}/admin/users/${id}`, patch)
    ).then(r => r.user);
  }

  // ---------- SERVICES ----------

  listServices(filters: { category?: string; q?: string } = {}): Promise<AdminService[]> {
    const params: Record<string, string> = {};
    if (filters.category) params['category'] = filters.category;
    if (filters.q) params['q'] = filters.q;

    return firstValueFrom(
      this.http.get<{ services: AdminService[] }>(`${environment.apiUrl}/admin/services`, { params })
    ).then(r => r.services);
  }

  createService(payload: Partial<AdminService>): Promise<AdminService> {
    return firstValueFrom(
      this.http.post<{ service: AdminService }>(`${environment.apiUrl}/admin/services`, payload)
    ).then(r => r.service);
  }

  updateService(id: string, patch: Partial<AdminService>): Promise<AdminService> {
    return firstValueFrom(
      this.http.put<{ service: AdminService }>(`${environment.apiUrl}/admin/services/${id}`, patch)
    ).then(r => r.service);
  }

  deleteService(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/admin/services/${id}`)
    ).then(() => undefined);
  }

  // ---------- APPOINTMENTS ----------

  listAppointments(filters: { status?: string; date?: string } = {}): Promise<AdminAppointment[]> {
    const params: Record<string, string> = {};
    if (filters.status) params['status'] = filters.status;
    if (filters.date) params['date'] = filters.date;

    return firstValueFrom(
      this.http.get<{ appointments: AdminAppointment[] }>(
        `${environment.apiUrl}/admin/appointments`, { params }
      )
    ).then(r => r.appointments);
  }

  updateAppointmentStatus(id: string, status: string): Promise<AdminAppointment> {
    return firstValueFrom(
      this.http.put<{ appointment: AdminAppointment }>(
        `${environment.apiUrl}/admin/appointments/${id}/status`, { status }
      )
    ).then(r => r.appointment);
  }

  getReportsSummary(): Promise<ReportsSummary> {
    return firstValueFrom(
      this.http.get<ReportsSummary>(`${environment.apiUrl}/admin/reports/summary`)
    );
  }

  // ---------- SETTINGS ----------

  listSettings(): Promise<AdminSetting[]> {
    return firstValueFrom(
      this.http.get<{ settings: AdminSetting[] }>(`${environment.apiUrl}/admin/settings`)
    ).then(r => r.settings);
  }

  upsertSetting(key: string, value: any): Promise<AdminSetting> {
    return firstValueFrom(
      this.http.put<{ setting: AdminSetting }>(
        `${environment.apiUrl}/admin/settings/${key}`, { value }
      )
    ).then(r => r.setting);
  }
}