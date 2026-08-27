export enum ScheduleStatus {
  Pending = 0,
  Scheduled = 1,
  Completed = 2,
  Cancelled = 3
}

export interface CreateVerificationSchedule {
  applicationId: string;
  verificationRoundId: string;
  date: string;       // Make sure date and time are present
  time: string;
  locationLink?: string | null;
  videoLink?: string | null;
  sendCalendarInvite: boolean;
}



export interface VerificationScheduleResponse {
  verificationScheduleId: string;
  applicationId: string;
  verificationRoundId: string;
  scheduledByUserId: string;
  scheduledDateTime: string | Date;
  locationOrLink?: string;
  status: ScheduleStatus | string;
}

export interface UpdateVerificationSchedule {
  status: ScheduleStatus | string;
}
