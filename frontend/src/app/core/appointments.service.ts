import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Appointment {
  id: string;
  appointment_date: string;
  status: 'pending'|'confirmed'|'in-progress'|'completed'|'cancelled'|'no-show';
  notes: string | null;
  total_amount: number;
  payment_status: string;
  dentist: { id: string; first_name: string; last_name: string } | null;
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
}