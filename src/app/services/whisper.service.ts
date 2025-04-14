import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WhisperService {
  private readonly apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
  private readonly apiKey = 'YOUR_OPENAI_API_KEY'; // Replace with your actual API key

  constructor(private http: HttpClient) {}

  transcribeVideo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');

    return this.http.post(this.apiUrl, formData, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }
} 