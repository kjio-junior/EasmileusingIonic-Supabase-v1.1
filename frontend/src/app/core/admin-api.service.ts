import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Banner } from './banners.service';
import { Faq } from './faqs.service';

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

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  changes: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_id: string | null;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  } | null;
}

export interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image: string | null;
  } | null;
  service: { id: string; name: string } | null;
  appointment: { id: string; appointment_date: string } | null;
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

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  updated_at: string;
  is_low: boolean;
}

export interface InventoryLog {
  id: string;
  previous_stock: number;
  new_stock: number;
  change_amount: number;
  reason: string;
  notes: string | null;
  reference_id: string | null;
  created_at: string;
  performed_by_user: { id: string; first_name: string; last_name: string } | null;
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
  treatment_notes: string | null;
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

export interface PatientListItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  profile_image: string | null;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface PatientSummary {
  total: number;
  completed: number;
  upcoming: number;
}

export interface PatientHistoryAppointment {
  id: string;
  appointment_date: string;
  status: string;
  notes: string | null;
  treatment_notes: string | null;
  total_amount: number;
  payment_status: string;
  created_at: string;
  dentist: { id: string; first_name: string; last_name: string } | null;
  items: { id: string; price: number; service: { id: string; name: string } | null }[];
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

  // ---------- AUDIT LOGS ----------

  listAuditLogs(filters: { entity?: string; action?: string; user_id?: string } = {}): Promise<AuditLog[]> {
    const params: Record<string, string> = {};
    if (filters.entity) params['entity'] = filters.entity;
    if (filters.action) params['action'] = filters.action;
    if (filters.user_id) params['user_id'] = filters.user_id;

    return firstValueFrom(
      this.http.get<{ logs: AuditLog[] }>(`${environment.apiUrl}/admin/audit-logs`, { params })
    ).then(r => r.logs);
  }

  // ---------- REVIEWS ----------

  listReviews(filters: { rating?: number; min_rating?: number; service_id?: string } = {}): Promise<AdminReview[]> {
    const params: Record<string, string> = {};
    if (filters.rating) params['rating'] = String(filters.rating);
    if (filters.min_rating) params['min_rating'] = String(filters.min_rating);
    if (filters.service_id) params['service_id'] = filters.service_id;

    return firstValueFrom(
      this.http.get<{ reviews: AdminReview[] }>(`${environment.apiUrl}/admin/reviews`, { params })
    ).then(r => r.reviews);
  }

  toggleReviewVerified(id: string, is_verified: boolean): Promise<AdminReview> {
    return firstValueFrom(
      this.http.put<{ review: AdminReview }>(
        `${environment.apiUrl}/admin/reviews/${id}/verify`, { is_verified }
      )
    ).then(r => r.review);
  }

  deleteReview(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/admin/reviews/${id}`)
    ).then(() => undefined);
  }

  // ---------- BANNERS ----------

  listBanners(): Promise<Banner[]> {
    return firstValueFrom(
      this.http.get<{ banners: Banner[] }>(`${environment.apiUrl}/admin/banners`)
    ).then(r => r.banners);
  }

  createBanner(payload: Partial<Banner>): Promise<Banner> {
    return firstValueFrom(
      this.http.post<{ banner: Banner }>(`${environment.apiUrl}/admin/banners`, payload)
    ).then(r => r.banner);
  }

  updateBanner(id: string, patch: Partial<Banner>): Promise<Banner> {
    return firstValueFrom(
      this.http.put<{ banner: Banner }>(`${environment.apiUrl}/admin/banners/${id}`, patch)
    ).then(r => r.banner);
  }

  deleteBanner(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/admin/banners/${id}`)
    ).then(() => undefined);
  }

  // ---------- FAQS ----------

  listFaqs(): Promise<Faq[]> {
    return firstValueFrom(
      this.http.get<{ faqs: Faq[] }>(`${environment.apiUrl}/admin/faqs`)
    ).then(r => r.faqs);
  }

  createFaq(payload: Partial<Faq>): Promise<Faq> {
    return firstValueFrom(
      this.http.post<{ faq: Faq }>(`${environment.apiUrl}/admin/faqs`, payload)
    ).then(r => r.faq);
  }

  updateFaq(id: string, patch: Partial<Faq>): Promise<Faq> {
    return firstValueFrom(
      this.http.put<{ faq: Faq }>(`${environment.apiUrl}/admin/faqs/${id}`, patch)
    ).then(r => r.faq);
  }

  deleteFaq(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/admin/faqs/${id}`)
    ).then(() => undefined);
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

  // ---------- PATIENTS ----------

  listPatients(q?: string): Promise<PatientListItem[]> {
    const params: Record<string, string> = {};
    if (q) params['q'] = q;

    return firstValueFrom(
      this.http.get<{ patients: PatientListItem[] }>(
        `${environment.apiUrl}/admin/patients`, { params }
      )
    ).then(r => r.patients);
  }

  getPatient(id: string): Promise<{ patient: PatientListItem; summary: PatientSummary }> {
    return firstValueFrom(
      this.http.get<{ patient: PatientListItem; summary: PatientSummary }>(
        `${environment.apiUrl}/admin/patients/${id}`
      )
    );
  }

  getPatientHistory(id: string): Promise<PatientHistoryAppointment[]> {
    return firstValueFrom(
      this.http.get<{ history: PatientHistoryAppointment[] }>(
        `${environment.apiUrl}/admin/patients/${id}/history`
      )
    ).then(r => r.history);
  }

  addTreatmentNotes(appointmentId: string, treatment_notes: string): Promise<AdminAppointment> {
    return firstValueFrom(
      this.http.put<{ appointment: AdminAppointment }>(
        `${environment.apiUrl}/admin/appointments/${appointmentId}/treatment-notes`,
        { treatment_notes }
      )
    ).then(r => r.appointment);
  }

  // ---------- INVENTORY ----------

  listInventory(lowOnly = false): Promise<InventoryItem[]> {
    const params: Record<string, string> = {};
    if (lowOnly) params['low_only'] = 'true';

    return firstValueFrom(
      this.http.get<{ items: InventoryItem[] }>(
        `${environment.apiUrl}/admin/inventory`, { params }
      )
    ).then(r => r.items);
  }

  getInventoryHistory(serviceId: string): Promise<InventoryLog[]> {
    return firstValueFrom(
      this.http.get<{ history: InventoryLog[] }>(
        `${environment.apiUrl}/admin/inventory/${serviceId}/history`
      )
    ).then(r => r.history);
  }

  updateStock(
    serviceId: string,
    newStock: number,
    reason?: string,
    notes?: string
  ): Promise<{ item: InventoryItem; change: number }> {
    return firstValueFrom(
      this.http.put<{ item: InventoryItem; change: number }>(
        `${environment.apiUrl}/admin/inventory/${serviceId}/stock`,
        { new_stock: newStock, reason, notes }
      )
    );
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