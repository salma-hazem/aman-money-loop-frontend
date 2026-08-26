import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificationScheduleService } from '../Services/schedule.service';
import { CreateVerificationSchedule } from '../Models/schedule.model';

@Component({
  selector: 'app-schedule-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification.component.html',
})
export class ScheduleVerificationComponent implements OnInit {
  formData: CreateVerificationSchedule = {
    applicationId: '',
    verificationRoundId: '',
    scheduledByUserId: '',
    scheduledDateTime: new Date(),
    locationOrLink: '',
    sendCalendarInvite: false
  };

  isSubmitting = false;

  constructor(private scheduleService: VerificationScheduleService) { }

  ngOnInit(): void { }

  onSubmit(): void {
    this.isSubmitting = true;
    this.scheduleService.scheduleVerification(this.formData).subscribe({
      next: (res) => {
        alert('Verification schedule created successfully!');
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error creating schedule:', err);
        this.isSubmitting = false;
      }
    });
  }
}
