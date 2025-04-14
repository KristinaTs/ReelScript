import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = 'http://localhost:3000/upload'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<{ progress: number, completed: boolean }> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', this.apiUrl, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / (event.total || 1));
            return { progress, completed: false };
          case HttpEventType.Response:
            return { progress: 100, completed: true };
          default:
            return { progress: 0, completed: false };
        }
      })
    );
  }
} 