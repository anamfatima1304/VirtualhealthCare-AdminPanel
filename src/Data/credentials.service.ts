import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DoctorCredential {
  id: number;
  doctorId: number;
  doctorName: string;
  username: string;
  hasPassword: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCredentialRequest {
  doctorId: number;
  username: string;
  password: string;
}

export interface UpdateCredentialRequest {
  username?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CredentialsService {
  private apiUrl = 'http://localhost:3000/api/credentials';

  constructor(private http: HttpClient) {}

  // Get all credentials
  getAllCredentials(): Observable<DoctorCredential[]> {
    return this.http.get<{ success: boolean; data: DoctorCredential[] }>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  // Get credentials by ID
  getCredentialsById(id: number): Observable<DoctorCredential> {
    return this.http.get<{ success: boolean; data: DoctorCredential }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  // Get credentials by doctor ID
  getCredentialsByDoctorId(doctorId: number): Observable<DoctorCredential> {
    return this.http.get<{ success: boolean; data: DoctorCredential }>(`${this.apiUrl}/doctor/${doctorId}`)
      .pipe(map(response => response.data));
  }

  // Create new credentials
  createCredentials(data: CreateCredentialRequest): Observable<DoctorCredential> {
    return this.http.post<{ success: boolean; data: DoctorCredential }>(this.apiUrl, data)
      .pipe(map(response => response.data));
  }

  // Update credentials
  updateCredentials(id: number, data: UpdateCredentialRequest): Observable<DoctorCredential> {
    return this.http.put<{ success: boolean; data: DoctorCredential }>(`${this.apiUrl}/${id}`, data)
      .pipe(map(response => response.data));
  }

  // Delete credentials
  deleteCredentials(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Verify login (for future use)
  verifyLogin(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-login`, { username, password });
  }
}