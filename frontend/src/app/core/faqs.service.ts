import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class FaqsApi {
  constructor(private http: HttpClient) {}

  listActive(category?: string): Promise<Faq[]> {
    const params: Record<string, string> = {};
    if (category) params['category'] = category;
    return firstValueFrom(
      this.http.get<{ faqs: Faq[] }>(`${environment.apiUrl}/faqs`, { params })
    ).then(r => r.faqs);
  }
}