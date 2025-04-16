import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WhisperService {
  private readonly apiUrl = 'http://localhost:3000/transcribe';
 
  constructor(private http: HttpClient) {}

  transcribeVideo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ text: string }>(this.apiUrl, formData);
  }
} 