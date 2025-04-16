import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface TranscriptionResponse {
  segments: TranscriptionSegment[];
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranscriptionService {
  private readonly apiUrl = 'http://localhost:3000/transcribe';

  constructor(private http: HttpClient) {}

  transcribeVideo(file: File): Observable<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');

    return this.http.post<TranscriptionResponse>(this.apiUrl, formData);
  }

  convertToSRT(transcription: TranscriptionResponse): string {
    return transcription.segments
      .map((segment, index) => {
        const startTime = this.formatTime(segment.start);
        const endTime = this.formatTime(segment.end);
        return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text.trim()}\n\n`;
      })
      .join('');
  }

  private formatTime(seconds: number): string {
    const date = new Date(seconds * 1000);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const secs = date.getUTCSeconds().toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
    return `${hours}:${minutes}:${secs},${ms}`;
  }
} 