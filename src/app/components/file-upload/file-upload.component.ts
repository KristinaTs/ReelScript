import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranscriptionService } from '../../services/transcription.service';
import { SubtitlePreviewComponent } from '../subtitle-preview/subtitle-preview.component';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, SubtitlePreviewComponent],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  selectedFile: File | null = null;
  videoUrl: string | null = null;
  srtContent: string = '';
  isProcessing: boolean = false;
  error: string | null = null;
  dragging: boolean = false;

  constructor(private transcriptionService: TranscriptionService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.error = null;
      
      // Create object URL for video preview
      this.videoUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.error = null;
      this.videoUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  onUpload() {
    if (!this.selectedFile) {
      this.error = 'Please select a file first';
      return;
    }

    this.isProcessing = true;
    this.error = null;

    this.transcriptionService.transcribeVideo(this.selectedFile).subscribe({
      next: (response) => {
        this.srtContent = this.transcriptionService.convertToSRT(response);
        this.isProcessing = false;
      },
      error: (err) => {
        this.error = 'Error processing video: ' + err.message;
        this.isProcessing = false;
      }
    });
  }

  removeFile() {
    this.selectedFile = null;
    this.videoUrl = null;
    this.srtContent = '';
    this.error = null;
  }
}
