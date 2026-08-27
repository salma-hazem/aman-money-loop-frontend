import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificationService } from '../../../membership-application/services/verification.service';
import { CreateVerificationScheduleRequest } from '../../../membership-application/models/verification.model';

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

  formData = {
    applicationId: '',
    verificationRoundId: '',
    scheduledByUserId: '',
    scheduledDateTime: '', // Datetime-local binding compatibility for HTML template
    locationOrLink: '',
    sendCalendarInvite: false
  };

  isSubmitting = false;

  constructor(private verificationService: VerificationService) { }

  ngOnInit(): void { }

  onSubmit(): void {
    this.isSubmitting = true;

    // Parse scheduledDateTime (e.g., "2026-08-28T14:30") into date and time
    const dateTimeParts = this.formData.scheduledDateTime ? this.formData.scheduledDateTime.split('T') : ['', ''];
    const dateStr = dateTimeParts[0] || '';
    const timeStr = dateTimeParts[1] ? (dateTimeParts[1].length === 5 ? `${dateTimeParts[1]}:00` : dateTimeParts[1]) : '';

    const payload: CreateVerificationScheduleRequest = {
      applicationId: this.formData.applicationId,
      verificationRoundId: this.formData.verificationRoundId,
      scheduledByUserId: this.formData.scheduledByUserId,
      date: dateStr,
      time: timeStr,
      locationLink: this.formData.locationOrLink || null,
      sendCalendarInvite: this.formData.sendCalendarInvite
    };

    this.verificationService.createSchedule(payload).subscribe({
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
