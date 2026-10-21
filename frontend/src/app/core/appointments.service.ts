import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppointmentItem {
  id: string;
  price: number;
  service: { id: string; name: string } | null;
}

export interface Appointment {
  id: string;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes: string | null;
  treatment_notes: string | null;
  total_amount: number;
  payment_method: string | null;
  transaction_id: string | null;
  payment_status: string;
  created_at: string;
  reschedule_count?: number;
  dentist: { id: string; first_name: string; last_name: string } | null;
  items: AppointmentItem[];
}

@Injectable({ providedIn: 'root' })
export class AppointmentsApi {
  constructor(private http: HttpClient) {}

  async loadMine(): Promise<Appointment[]> {
    const res = await firstValueFrom(
      this.http.get<{ appointments: Appointment[] }>(
        `${environment.apiUrl}/appointments/my-appointments`
      )
    );
    return res.appointments;
  }

  async book(payload: { service_id: string; appointment_date: string; notes?: string }): Promise<Appointment> {
    const res = await firstValueFrom(
      this.http.post<{ appointment: Appointment }>(
        `${environment.apiUrl}/appointments/book`, payload
      )
    );
    return res.appointment;
  }

  async getBusySlots(date: string): Promise<string[]> {
    const res = await firstValueFrom(
      this.http.get<{ busy: string[] }>(
        `${environment.apiUrl}/appointments/busy-slots`, { params: { date } }
      )
    );
    return res.busy;
  }

  async getOne(id: string): Promise<Appointment> {
    return firstValueFrom(
      this.http.get<{ appointment: Appointment }>(
        `${environment.apiUrl}/appointments/${id}`
      )
    ).then(r => r.appointment);
  }

  async pay(id: string, payload: {
    payment_method: 'card' | 'gcash' | 'qr' | 'cash';
    card_number?: string;
    card_name?: string;
    expiry?: string;
    cvc?: string;
  }): Promise<{ appointment: Appointment; transaction_id: string | null; method: string }> {
    return firstValueFrom(
      this.http.post<{ appointment: Appointment; transaction_id: string | null; method: string }>(
        `${environment.apiUrl}/appointments/${id}/pay`, payload
      )
    );
  }

  async reschedule(id: string, new_date: string): Promise<Appointment> {
    return firstValueFrom(
      this.http.put<{ appointment: Appointment }>(`${environment.apiUrl}/appointments/${id}/reschedule`, { new_date })
    ).then(r => r.appointment);
  }
}