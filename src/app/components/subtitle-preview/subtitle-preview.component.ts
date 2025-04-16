import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Subtitle {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
}

@Component({
  selector: 'app-subtitle-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subtitle-preview.component.html',
  styleUrls: ['./subtitle-preview.component.css']
})
export class SubtitlePreviewComponent implements OnChanges {
  @Input() videoUrl: string = '';
  @Input() srtContent: string = '';
  subtitles: Subtitle[] = [];
  currentSubtitle: Subtitle | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['srtContent'] && this.srtContent) {
      this.parseSRT(this.srtContent);
    }
  }

  private parseSRT(content: string) {
    const blocks = content.trim().split('\n\n');
    this.subtitles = blocks.map(block => {
      const lines = block.split('\n');
      const [startTime, endTime] = lines[1].split(' --> ');
      return {
        id: parseInt(lines[0]),
        startTime,
        endTime,
        text: lines.slice(2).join('\n')
      };
    });
  }

  onTimeUpdate(event: Event) {
    const video = event.target as HTMLVideoElement;
    const currentTime = video.currentTime;
    
    // Find the current subtitle
    this.currentSubtitle = this.subtitles.find(sub => {
      const start = this.timeToSeconds(sub.startTime);
      const end = this.timeToSeconds(sub.endTime);
      return currentTime >= start && currentTime <= end;
    }) || null;
  }

  private timeToSeconds(timeStr: string): number {
    const [hms, ms] = timeStr.split(',');
    const [hours, minutes, seconds] = hms.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
  }
} 