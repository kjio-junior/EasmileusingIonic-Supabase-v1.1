import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  patient?: { id: string; first_name: string; last_name: string; profile_image: string | null };
  service?: { id: string; name: string };
  appointment?: { id: string; appointment_date: string };
}

export interface ReviewSummary {
  count: number;
  average: number;
  distribution: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class ReviewsApi {
  constructor(private http: HttpClient) {}

  listForService(serviceId: string): Promise<{ reviews: Review[]; summary: ReviewSummary }> {
    return firstValueFrom(
      this.http.get<{ reviews: Review[]; summary: ReviewSummary }>(
        `${environment.apiUrl}/reviews/service/${serviceId}`
      )
    );
  }

  listMine(): Promise<Review[]> {
    return firstValueFrom(
      this.http.get<{ reviews: Review[] }>(`${environment.apiUrl}/reviews/my`)
    ).then(r => r.reviews);
  }

  create(payload: { appointment_id: string; rating: number; comment?: string }): Promise<Review> {
    return firstValueFrom(
      this.http.post<{ review: Review }>(`${environment.apiUrl}/reviews`, payload)
    ).then(r => r.review);
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/reviews/${id}`)
    ).then(() => undefined);
  }
}