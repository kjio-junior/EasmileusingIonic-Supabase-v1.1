import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Document {
  id: string;
  appointment_id: string | null;
  patient_id: string;
  uploader_id: string;
  filename: string;
  storage_path: string;
  url: string;
  mimetype: string;
  size_bytes: number;
  category: 'xray' | 'photo' | 'scan' | 'consent' | 'invoice' | 'other';
  notes: string | null;
  created_at: string;
  uploader?: { id: string; first_name: string; last_name: string; role: string };
}

@Injectable({ providedIn: 'root' })
export class DocumentsApi {
  constructor(private http: HttpClient) {}

  upload(
    file: File,
    options: {
      appointment_id?: string;
      patient_id?: string;
      category?: string;
      notes?: string;
    } = {}
  ): Promise<Document> {
    const form = new FormData();
    form.append('file', file);
    if (options.appointment_id) form.append('appointment_id', options.appointment_id);
    if (options.patient_id) form.append('patient_id', options.patient_id);
    if (options.category) form.append('category', options.category);
    if (options.notes) form.append('notes', options.notes);

    return firstValueFrom(
      this.http.post<{ document: Document }>(
        `${environment.apiUrl}/documents/upload`, form
      )
    ).then(r => r.document);
  }

  list(filters: { appointment_id?: string; patient_id?: string } = {}): Promise<Document[]> {
    const params: Record<string, string> = {};
    if (filters.appointment_id) params['appointment_id'] = filters.appointment_id;
    if (filters.patient_id) params['patient_id'] = filters.patient_id;

    return firstValueFrom(
      this.http.get<{ documents: Document[] }>(
        `${environment.apiUrl}/documents`, { params }
      )
    ).then(r => r.documents);
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/documents/${id}`)
    ).then(() => undefined);
  }
}