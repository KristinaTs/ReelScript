import { Component } from '@angular/core';
import { TranscriptionService } from '../../services/transcription.service';
import { HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface TranscriptionData {
  text: string;
  srt: string;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  imports: [CommonModule]
})
export class FileUploadComponent {
  dragging = false;
  files: File[] = [];
  transcriptions: { [key: string]: TranscriptionData } = {};
  errorMessage: string = '';
  progress: { [key: string]: number } = {};

  private readonly validVideoTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv'
  ];

  constructor(private transcriptionService: TranscriptionService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    this.errorMessage = '';
    const validFiles = files.filter(file => this.isValidVideoFile(file));
    
    if (validFiles.length !== files.length) {
      this.errorMessage = 'Some files were not valid video files. Only video files are accepted.';
    }

    this.files = [...this.files, ...validFiles];
    this.transcribeFiles(validFiles);
  }

  private isValidVideoFile(file: File): boolean {
    return this.validVideoTypes.includes(file.type);
  }

  private transcribeFiles(files: File[]): void {
    files.forEach(file => {
      this.progress[file.name] = 0;
      this.transcriptionService.transcribeVideo(file).subscribe({
        next: (response) => {
          const srt = this.transcriptionService.convertToSRT(response);
          this.transcriptions[file.name] = {
            text: response.text,
            srt: srt
          };
          this.progress[file.name] = 100;
        },
        error: (error) => {
          console.error('Transcription failed:', error);
          this.errorMessage = `Failed to transcribe ${file.name}: ${error.message}`;
          delete this.progress[file.name];
        }
      });
    });
  }

  removeFile(index: number): void {
    const file = this.files[index];
    delete this.transcriptions[file.name];
    delete this.progress[file.name];
    this.files.splice(index, 1);
  }

  downloadSRT(fileName: string): void {
    const transcription = this.transcriptions[fileName];
    if (transcription) {
      const blob = new Blob([transcription.srt], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.split('.')[0]}.srt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }
}
