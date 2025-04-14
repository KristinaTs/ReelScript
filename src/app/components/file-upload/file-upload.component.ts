import { Component } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  imports: [CommonModule]
})
export class FileUploadComponent {
  dragging = false;
  files: File[] = [];
  uploadProgress: { [key: string]: number } = {};
  uploadComplete: { [key: string]: boolean } = {};
  errorMessage: string = '';

  private readonly validVideoTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv'
  ];

  constructor(private uploadService: UploadService) {}

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
    this.uploadFiles(validFiles);
  }

  private isValidVideoFile(file: File): boolean {
    return this.validVideoTypes.includes(file.type);
  }

  private uploadFiles(files: File[]): void {
    files.forEach(file => {
      this.uploadProgress[file.name] = 0;
      this.uploadComplete[file.name] = false;

      this.uploadService.uploadFile(file).subscribe({
        next: (progress) => {
          this.uploadProgress[file.name] = progress.progress;
          this.uploadComplete[file.name] = progress.completed;
        },
        error: (error) => {
          console.error('Upload failed:', error);
          this.errorMessage = `Failed to upload ${file.name}: ${error.message}`;
        }
      });
    });
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }
}
