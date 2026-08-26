import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificationScheduleService } from '../../Services/schedule.service';
import { CreateVerificationSchedule } from '../../Models/schedule.model';

@Component({
  selector: 'app-schedule-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleVerificationComponent implements OnInit {
  pageTitle = 'Schedule Verification';

  placeholders = {
    applicationId: 'Membership application ID',
    verificationRoundId: 'Document Check',
    scheduledByUserId: 'Organizer or Admin user ID',
    locationOrLink: 'Meeting link / address'
  };

  formData: CreateVerificationSchedule = {
    applicationId: '',
    verificationRoundId: '',
    scheduledByUserId: '',
    scheduledDateTime: '', // Initialized as string for datetime-local binding compatibility
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
