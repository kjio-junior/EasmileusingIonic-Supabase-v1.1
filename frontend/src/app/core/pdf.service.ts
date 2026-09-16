import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PdfApi {
  constructor(private http: HttpClient) {}

  async downloadAppointmentPdf(appointmentId: string): Promise<void> {
    const blob = await firstValueFrom(
      this.http.get(
        `${environment.apiUrl}/appointments/${appointmentId}/pdf`,
        { responseType: 'blob' }
      )
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointment-${appointmentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async openAppointmentPdf(appointmentId: string): Promise<void> {
    const blob = await firstValueFrom(
      this.http.get(
        `${environment.apiUrl}/appointments/${appointmentId}/pdf`,
        { responseType: 'blob' }
      )
    );

    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
}