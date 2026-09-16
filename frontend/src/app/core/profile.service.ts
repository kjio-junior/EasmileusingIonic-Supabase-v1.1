import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string | null;
  role: string;
  profile_image: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileApi {
  constructor(private http: HttpClient) {}

  get(): Promise<Profile> {
    return firstValueFrom(
      this.http.get<{ user: Profile }>(`${environment.apiUrl}/auth/profile`)
    ).then(r => r.user);
  }

  update(patch: Partial<Pick<Profile, 'first_name'|'last_name'|'phone'|'address'>>): Promise<Profile> {
    return firstValueFrom(
      this.http.put<{ user: Profile }>(`${environment.apiUrl}/auth/profile`, patch)
    ).then(r => r.user);
  }

  uploadAvatar(file: File): Promise<Profile> {
    const form = new FormData();
    form.append('avatar', file);
    return firstValueFrom(
      this.http.post<{ user: Profile }>(
        `${environment.apiUrl}/auth/profile/avatar`, form
      )
    ).then(r => r.user);
  }
}